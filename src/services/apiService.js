const axios = require('axios');
const https = require('https');
const { query } = require('../config/db');

const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
const TIMEOUT_MS = 10000;

// Hash de la imagen "placeholder" que Last.fm devuelve cuando no hay foto
const IMAGEN_PLACEHOLDER = '2a96cbd8b46e442fc41c2b86b821562f';

// Código de error de PostgreSQL para violación de UNIQUE (tuve problemas con esto haciendo la bd por si se jarea todo)
const PG_UNIQUE_VIOLATION = '23505';

const lastfmClient = axios.create({
  baseURL: LASTFM_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'User-Agent': 'VasasMusicApp/1.0 (http://localhost:3000)',
    Accept: 'application/json',
  },
  httpsAgent: new https.Agent({
    family: 4, // IPv4 para evitar timeouts en Windows
    // Solo en desarrollo se acepta cualquier certificado (proxy/red); en producción se valida
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  }),
});

// Last.fm devuelve la descripción con links HTML ("<a href=...>Read more</a>")
const limpiarDescripcion = (html) => {
  if (!html) return null;
  const texto = String(html)
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
  return texto || null;
};

const recortar = (valor, max) => String(valor || '').trim().slice(0, max);

const getApiKey = () => {
  const apiKey = process.env.LASTFM_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    const error = new Error('Falta LASTFM_API_KEY en el .env');
    error.statusCode = 500;
    throw error;
  }
  return apiKey.trim();
};

// Extrae la imagen de mayor calidad de las imágenes de Last.fm
const extraerImagen = (images = []) => {
  if (!Array.isArray(images)) return null;
  const prioridades = ['extralarge', 'large', 'medium', 'small'];
  for (const size of prioridades) {
    const img = images.find(
      (i) => i.size === size && i['#text'] && !i['#text'].includes(IMAGEN_PLACEHOLDER)
    );
    if (img) return img['#text'];
  }
  return null;
};

// ID estable aunque Last.fm devuelva el mbid vacío
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

const esViolacionUnica = (error) => error && error.code === PG_UNIQUE_VIOLATION;

// Last.fm responde HTTP 200 incluso con errores ({ error, message }),
// por eso se revisa el body además de capturar los errores de red.
const llamarLastfm = async (metodo, params) => {
  let response;

  try {
    response = await lastfmClient.get('', {
      params: { ...params, method: metodo, api_key: getApiKey(), format: 'json' },
    });
  } catch (err) {
    if (err.statusCode) throw err; // error propio (ej: falta la API key)

    console.error(
      `Fallo al consultar Last.fm (${metodo}):`,
      err.response?.status,
      err.response?.data || err.code || err.message
    );

    const timeout = err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT';
    const error = new Error(
      timeout ? 'Last.fm tardó demasiado en responder' : 'No se pudo conectar con Last.fm'
    );
    error.statusCode = timeout ? 504 : 502;
    throw error;
  }

  if (response.data?.error) {
    console.error('Error devuelto por Last.fm:', response.data);
    // 6 = "Track not found"
    const noEncontrada = response.data.error === 6;
    const error = new Error(
      noEncontrada ? 'Canción no encontrada' : response.data.message || 'Error en Last.fm'
    );
    error.statusCode = noEncontrada ? 404 : 502;
    throw error;
  }

  return response.data;
};

// Buscar canciones
const buscarCancionesExterno = async (queryBusqueda, limit = 20) => {
  const texto = String(queryBusqueda || '').trim();
  if (!texto) {
    const error = new Error('Ingresá un texto para buscar');
    error.statusCode = 400;
    throw error;
  }

  const limiteNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

  const data = await llamarLastfm('track.search', { track: texto, limit: limiteNum });

  const resultado = data?.results?.trackmatches?.track || [];
  const tracks = Array.isArray(resultado) ? resultado : [resultado];

  return tracks
    .filter((t) => t && t.name)
    .map((t) => ({
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
  const params = { autocorrect: 1 };

  if (mbid) {
    params.mbid = mbid;
  } else if (artista && titulo) {
    params.artist = artista;
    params.track = titulo;
  } else {
    const error = new Error('Falta el mbid o el artista y el título de la canción');
    error.statusCode = 400;
    throw error;
  }

  const data = await llamarLastfm('track.getInfo', params);

  if (!data.track) {
    const error = new Error('Canción no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return data.track;
};

const buscarCancionPorExternalIds = async (ids) => {
  const resultado = await query('SELECT * FROM canciones WHERE external_id = ANY($1)', [ids]);
  return resultado.rows[0] || null;
};

// Busca un registro; si no existe lo inserta y vuelve a buscarlo para obtener su id.
// Si otra request lo insertó en simultáneo (UNIQUE), simplemente lo recupera.
const obtenerIdOCrear = async ({ selectSql, selectParams, insertSql, insertParams }) => {
  const buscar = async () => {
    const res = await query(selectSql, selectParams);
    return res.rows.length > 0 ? res.rows[0].id : null;
  };

  const existente = await buscar();
  if (existente) return existente;

  try {
    await query(insertSql, insertParams);
  } catch (error) {
    if (!esViolacionUnica(error)) throw error;
  }

  return buscar();
};

const obtenerIdAlbum = ({ externalId, titulo, foto }) =>
  obtenerIdOCrear({
    selectSql: 'SELECT id FROM albumes WHERE external_id = $1',
    selectParams: [externalId],
    insertSql: 'INSERT INTO albumes (external_id, titulo, foto) VALUES ($1, $2, $3)',
    insertParams: [externalId, titulo, foto],
  });

const obtenerIdArtista = ({ externalId, nombre }) =>
  obtenerIdOCrear({
    selectSql: 'SELECT id FROM artistas WHERE external_id = $1',
    selectParams: [externalId],
    insertSql: 'INSERT INTO artistas (external_id, nombre) VALUES ($1, $2)',
    insertParams: [externalId, nombre],
  });

const obtenerIdGenero = (nombre) =>
  obtenerIdOCrear({
    selectSql: 'SELECT id FROM generos WHERE nombre = $1',
    selectParams: [nombre],
    insertSql: 'INSERT INTO generos (nombre) VALUES ($1)',
    insertParams: [nombre],
  });

// Guardar o recuperar la canción (y su artista, álbum y géneros) en PostgreSQL
const guardarObtenerCancionLocal = async (trackInfo) => {
  const nombreCancion = recortar(trackInfo?.name, 200);
  const nombreArtista = recortar(trackInfo?.artist?.name || trackInfo?.artist, 150);

  if (!nombreCancion) {
    const error = new Error('Canción inválida');
    error.statusCode = 400;
    throw error;
  }

  // Se revisa tanto el ID por mbid como el ID por slug (artista:título),
  // porque la búsqueda puede no traer mbid y el detalle sí.
  const externalTrackId = generarExternalId('track', trackInfo.mbid, nombreArtista, nombreCancion);
  const externalTrackIdSlug = generarExternalId('track', null, nombreArtista, nombreCancion);

  const existente = await buscarCancionPorExternalIds([externalTrackId, externalTrackIdSlug]);
  if (existente) return existente;

  // Álbum (opcional en Last.fm)
  let albumId = null;
  let fotoCancion = null;

  if (trackInfo.album && trackInfo.album.title) {
    const tituloAlbum = recortar(trackInfo.album.title, 200);
    const artistaAlbum = trackInfo.album.artist || nombreArtista;
    fotoCancion = extraerImagen(trackInfo.album.image);

    albumId = await obtenerIdAlbum({
      externalId: generarExternalId('album', trackInfo.album.mbid, artistaAlbum, tituloAlbum),
      titulo: tituloAlbum,
      foto: fotoCancion,
    });
  }

  // Artista
  let artistaId = null;
  if (nombreArtista) {
    artistaId = await obtenerIdArtista({
      externalId: generarExternalId('artist', trackInfo.artist?.mbid, nombreArtista),
      nombre: nombreArtista,
    });
  }

  // Géneros - Last.fm devuelve toptags.tag (sin repetidos)
  const tagsRaw = trackInfo.toptags?.tag || [];
  const tags = Array.isArray(tagsRaw) ? tagsRaw : [tagsRaw];
  const nombresGeneros = [
    ...new Set(
      tags
        .slice(0, 5)
        .map((tag) => recortar(tag?.name, 80).toLowerCase())
        .filter(Boolean)
    ),
  ];

  const generosIds = [];
  for (const nombreGenero of nombresGeneros) {
    generosIds.push(await obtenerIdGenero(nombreGenero));
  }

  // Canción - Last.fm devuelve duration en milisegundos como string
  const duracionSegundos = Math.max(0, Math.round((Number(trackInfo.duration) || 0) / 1000));
  const descripcion = limpiarDescripcion(trackInfo.wiki?.summary);

  try {
    await query(
      `INSERT INTO canciones (external_id, titulo, album_id, duracion, foto, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [externalTrackId, nombreCancion, albumId, duracionSegundos, fotoCancion, descripcion]
    );
  } catch (error) {
    // Otra request la guardó en simultáneo: devolvemos la existente
    if (esViolacionUnica(error)) {
      const guardadaPorOtra = await buscarCancionPorExternalIds([externalTrackId]);
      if (guardadaPorOtra) return guardadaPorOtra;
    }
    throw error;
  }

  const cancionGuardada = await buscarCancionPorExternalIds([externalTrackId]);

  try {
    if (artistaId) {
      await query('INSERT INTO cancion_artistas (cancion_id, artista_id) VALUES ($1, $2)', [
        cancionGuardada.id,
        artistaId,
      ]);
    }

    for (const generoId of generosIds) {
      await query('INSERT INTO cancion_generos (cancion_id, genero_id) VALUES ($1, $2)', [
        cancionGuardada.id,
        generoId,
      ]);
    }
  } catch (error) {
    try {
      await query('DELETE FROM canciones WHERE id = $1', [cancionGuardada.id]);
    } catch (errorLimpieza) {
      console.error('No se pudo limpiar la canción incompleta:', errorLimpieza.message);
    }
    throw error;
  }

  return cancionGuardada;
};

module.exports = {
  buscarCancionesExterno,
  obtenerCancionExterna,
  guardarObtenerCancionLocal,
};