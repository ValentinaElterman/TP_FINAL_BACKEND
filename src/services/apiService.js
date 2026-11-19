const axios = require('axios');
const { query, pool } = require('../config/db');

const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
const TIMEOUT_MS = 10000;

// Last.fm devuelve la descripción con links HTML ("<a href=...>Read more</a>")
const limpiarDescripcion = (html) => {
  if (!html) return null;
  const texto = String(html)
    .replace(/<a\b[^>]*>.*?<\/a>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
  return texto || null;
};

const getApiKey = () => {
  const apiKey = process.env.LASTFM_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error('Falta LASTFM_API_KEY en el .env');
  }
  return apiKey;
};

// Extrae la imagen de mayor calidad de imágenes de Last.fm
const extraerImagen = (images = []) => {
  if (!Array.isArray(images)) return null;
  const prioridades = ['extralarge', 'large', 'medium', 'small'];
  for (const size of prioridades) {
    const img = images.find((i) => i.size === size && i['#text']);
    if (img && img['#text']) {
      return img['#text'];
    }
  }
  return null;
};

// ID aunque Last.fm devuelva vacío
const generarExternalId = (prefijo, mbid, ...partes) => {
  if (mbid && String(mbid).trim() !== '') {
    return String(mbid).trim();
  }
  const slug = partes
    .map((p) => String(p || '').trim().toLowerCase())
    .filter(Boolean)
    .join(':');
  return `lastfm:${prefijo}:${slug}`;
};

// Buscar canciones
const buscarCancionesExterno = async (queryBusqueda, limit = 20) => {
  const response = await axios.get(LASTFM_BASE_URL, {
    timeout: TIMEOUT_MS,
    params: {
      method: 'track.search',
      track: queryBusqueda,
      api_key: getApiKey(),
      format: 'json',
      limit,
    },
  });

  const resultado = response.data?.results?.trackmatches?.track || [];
  const tracks = Array.isArray(resultado) ? resultado : [resultado];

  return tracks.map((t) => ({
    external_id: generarExternalId('track', t.mbid, t.artist, t.name),
    mbid: t.mbid || null,
    titulo: t.name,
    artista: t.artist,
    foto: extraerImagen(t.image),
    oyentes: Number(t.listeners) || 0,
    url: t.url,
  }));
};

// Obtener detalle completo de una canción
const obtenerCancionExterna = async ({ artista, titulo, mbid }) => {
  const params = {
    method: 'track.getInfo',
    api_key: getApiKey(),
    format: 'json',
    autocorrect: 1,
  };

  if (mbid) {
    params.mbid = mbid;
  } else {
    params.artist = artista;
    params.track = titulo;
  }

  const response = await axios.get(LASTFM_BASE_URL, { params, timeout: TIMEOUT_MS });

  if (response.data?.error) {
    const error = new Error(response.data.message || 'Canción no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return response.data.track;
};

// Guardar o recuperar la canción (y su artista, álbum y géneros) en PostgreSQL
const guardarObtenerCancionLocal = async (trackInfo) => {
  const nombreCancion = trackInfo.name;
  const nombreArtista = trackInfo.artist?.name || trackInfo.artist;
  if (!nombreCancion) {
    const error = new Error('Canción inválida');
    error.statusCode = 400;
    throw error;
  }
  const externalTrackId = generarExternalId('track', trackInfo.mbid, nombreArtista, nombreCancion);

  const cancionExistente = await query(
    'SELECT * FROM canciones WHERE external_id = $1',
    [externalTrackId]
  );

  if (cancionExistente.rows.length > 0) {
    return cancionExistente.rows[0];
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Álbum (opcional en Last.fm)
    let albumId = null;
    let fotoCancion = null;

    if (trackInfo.album && trackInfo.album.title) {
      const tituloAlbum = trackInfo.album.title;
      const artistaAlbum = trackInfo.album.artist || nombreArtista;
      const externalAlbumId = generarExternalId(
        'album',
        trackInfo.album.mbid,
        artistaAlbum,
        tituloAlbum
      );
      fotoCancion = extraerImagen(trackInfo.album.image);

      const albumRes = await client.query('SELECT id FROM albumes WHERE external_id = $1', [
        externalAlbumId,
      ]);

      if (albumRes.rows.length === 0) {
        const nuevoAlbum = await client.query(
          `INSERT INTO albumes (external_id, titulo, foto)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [externalAlbumId, tituloAlbum, fotoCancion]
        );
        albumId = nuevoAlbum.rows[0].id;
      } else {
        albumId = albumRes.rows[0].id;
      }
    }

    // Canción - Last.fm devuelve duration en milisegundos como string
    const duracionSegundos = Math.max(0, Math.round((Number(trackInfo.duration) || 0) / 1000));

    const descripcion = limpiarDescripcion(trackInfo.wiki?.summary);

    const nuevaCancion = await client.query(
      `INSERT INTO canciones (external_id, titulo, album_id, duracion, foto, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (external_id) DO NOTHING
       RETURNING *`,
      [externalTrackId, nombreCancion, albumId, duracionSegundos, fotoCancion, descripcion]
    );

    // Otra request la guardó en simultáneo: devolvemos la existente
    if (nuevaCancion.rows.length === 0) {
      await client.query('ROLLBACK');
      const existente = await query('SELECT * FROM canciones WHERE external_id = $1', [
        externalTrackId,
      ]);
      return existente.rows[0];
    }

    const cancionGuardada = nuevaCancion.rows[0];

    // Artista
    if (nombreArtista) {
      const externalArtistaId = generarExternalId(
        'artist',
        trackInfo.artist?.mbid,
        nombreArtista
      );

      const artistaRes = await client.query('SELECT id FROM artistas WHERE external_id = $1', [
        externalArtistaId,
      ]);

      let artistaId;
      if (artistaRes.rows.length === 0) {
        const nuevoArtista = await client.query(
          `INSERT INTO artistas (external_id, nombre)
           VALUES ($1, $2)
           RETURNING id`,
          [externalArtistaId, nombreArtista]
        );
        artistaId = nuevoArtista.rows[0].id;
      } else {
        artistaId = artistaRes.rows[0].id;
      }

      await client.query(
        `INSERT INTO cancion_artistas (cancion_id, artista_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [cancionGuardada.id, artistaId]
      );
    }

    // Géneros - Last.fm devuelve toptags.tag
    const tagsRaw = trackInfo.toptags?.tag || [];
    const tags = Array.isArray(tagsRaw) ? tagsRaw : [tagsRaw];
    for (const tag of tags.slice(0, 5)) {
      if (!tag.name) continue;
      const nombreGenero = String(tag.name).trim().toLowerCase();

      const generoRes = await client.query(
        `INSERT INTO generos (nombre)
         VALUES ($1)
         ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
         RETURNING id`,
        [nombreGenero]
      );

      await client.query(
        `INSERT INTO cancion_generos (cancion_id, genero_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [cancionGuardada.id, generoRes.rows[0].id]
      );
    }

    await client.query('COMMIT');
    return cancionGuardada;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  buscarCancionesExterno,
  obtenerCancionExterna,
  guardarObtenerCancionLocal,
};