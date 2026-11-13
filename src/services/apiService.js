const axios = require('axios');
const { query } = require('../config/db');

const spotifyTokenState = {
  accessToken: null,
  expirationTime: 0,
};

// obtener o renovar el Access Token de Spotify
const obtenerSpotifyToken = async () => {
  const ahora = Date.now();
  if (spotifyTokenState.accessToken && ahora < spotifyTokenState.expirationTime) {
    return spotifyTokenState.accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Faltan SPOTIFY_CLIENT_ID o SPOTIFY_CLIENT_SECRET en el .env');
  }

  const credenciales = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credenciales}`,
      },
    }
  );

  spotifyTokenState.accessToken = response.data.access_token;
  spotifyTokenState.expirationTime = ahora + (response.data.expires_in - 60) * 1000;

  return spotifyTokenState.accessToken;
};

// consultas a la api
const buscarCancionesExterno = async (queryBusqueda) => {
  const token = await obtenerSpotifyToken();
  const response = await axios.get('https://api.spotify.com/v1/search', {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: queryBusqueda,
      type: 'track',
      limit: 20,
    },
  });

  return response.data.tracks?.items || [];
};

const obtenerCancionExternaPorId = async (externalId) => {
  const token = await obtenerSpotifyToken();
  const response = await axios.get(`https://api.spotify.com/v1/tracks/${externalId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

const guardarObtenerCancionLocal = async (trackInfo) => {
  const externalTrackId = String(trackInfo.id);

  const cancionExistente = await query(
    'SELECT * FROM canciones WHERE external_id = $1',
    [externalTrackId]
  );

  if (cancionExistente.rows.length > 0) {
    return cancionExistente.rows[0];
  }

  await query('BEGIN');
  try {
    const externalAlbumId = String(trackInfo.album.id);
    const albumRes = await query('SELECT id FROM albumes WHERE external_id = $1', [externalAlbumId]);

    let albumId;
    if (albumRes.rows.length === 0) {
      const fotoAlbum = trackInfo.album.images?.[0]?.url || null;
      const nuevoAlbum = await query(
        `INSERT INTO albumes (external_id, titulo, foto, fecha_lanzamiento)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          externalAlbumId,
          trackInfo.album.name,
          fotoAlbum,
          trackInfo.album.release_date || null,
        ]
      );
      albumId = nuevoAlbum.rows[0].id;
    } else {
      albumId = albumRes.rows[0].id;
    }

    const fotoCancion = trackInfo.album.images?.[0]?.url || null;
    const duracionSegundos = Math.max(1, Math.round(trackInfo.duration_ms / 1000));

    const nuevaCancion = await query(
      `INSERT INTO canciones (external_id, titulo, album_id, duracion, foto, preview_url, fecha_lanzamiento)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        externalTrackId,
        trackInfo.name,
        albumId,
        duracionSegundos,
        fotoCancion,
        trackInfo.preview_url || null,
        trackInfo.album.release_date || null,
      ]
    );
    const cancionGuardada = nuevaCancion.rows[0];

    for (const artist of trackInfo.artists) {
      const externalArtistaId = String(artist.id);
      const artistaRes = await query('SELECT id FROM artistas WHERE external_id = $1', [externalArtistaId]);

      let artistaId;
      if (artistaRes.rows.length === 0) {
        const nuevoArtista = await query(
          `INSERT INTO artistas (external_id, nombre)
           VALUES ($1, $2)
           RETURNING id`,
          [externalArtistaId, artist.name]
        );
        artistaId = nuevoArtista.rows[0].id;
      } else {
        artistaId = artistaRes.rows[0].id;
      }

      await query(
        `INSERT INTO cancion_artistas (cancion_id, artista_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [cancionGuardada.id, artistaId]
      );
    }

    await query('COMMIT');
    return cancionGuardada;
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
};

// Intercambiar el "code" que devuelve Spotify por el token personal del usuario
const intercambiarCodigoUsuarioSpotify = async (code) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  const credenciales = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    params.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credenciales}`,
      },
    }
  );

  return response.data; // devuelve { access_token, refresh_token, expires_in }
};

// Obtener historial reciente (últimas 50) y top canciones del usuario
const importarHistorialUsuarioSpotify = async (userAccessToken) => {
  const headers = { Authorization: `Bearer ${userAccessToken}` };

  // 1. Traer últimas 50 reproducciones reales
  const recientesRes = await axios.get(
    'https://api.spotify.com/v1/me/player/recently-played',
    { headers, params: { limit: 50 } }
  );

  // 2. Traer top 50 canciones más escuchadas (mediano plazo ~6 meses)
  const topRes = await axios.get(
    'https://api.spotify.com/v1/me/top/tracks',
    { headers, params: { limit: 50, time_range: 'medium_term' } }
  );

  const itemsRecientes = recientesRes.data.items || [];
  const itemsTop = topRes.data.items || [];

  const cancionesGuardadas = [];
  const idsProcesados = new Set();

  // Guardar historial reciente en la bd
  for (const item of itemsRecientes) {
    const track = item.track;
    if (track && !idsProcesados.has(track.id)) {
      idsProcesados.add(track.id);
      const local = await guardarObtenerCancionLocal(track);
      cancionesGuardadas.push({
        ...local,
        origen: 'reciente',
        escuchada_en: item.played_at,
      });
    }
  }

  // Guardar top tracks en la bd
  for (const track of itemsTop) {
    if (track && !idsProcesados.has(track.id)) {
      idsProcesados.add(track.id);
      const local = await guardarObtenerCancionLocal(track);
      cancionesGuardadas.push({
        ...local,
        origen: 'top',
      });
    }
  }

  return cancionesGuardadas;
};

const registrarHistorialEnBiblioteca = async (usuarioId, cancionesImportadas) => {
  for (const item of cancionesImportadas) {
    const fechaEscucha = item.escuchada_en ? new Date(item.escuchada_en) : new Date();

    // guardar o actualizar
    await query(
      `INSERT INTO biblioteca (usuario_id, cancion_id, estado, es_favorita, fecha_agregado, fecha_actualizacion)
       VALUES ($1, $2, 'escuchado', FALSE, $3, $3)
       ON CONFLICT (usuario_id, cancion_id)
       DO UPDATE SET
         estado = 'escuchado',
         fecha_actualizacion = GREATEST(biblioteca.fecha_actualizacion, EXCLUDED.fecha_actualizacion)`,
      [usuarioId, item.id, fechaEscucha]
    );

    const yaRegistrada = await query(
      `SELECT 1 FROM reproducciones
       WHERE usuario_id = $1 AND cancion_id = $2 AND fecha_inicio = $3`,
      [usuarioId, item.id, fechaEscucha]
    );

    if (yaRegistrada.rows.length === 0) {
      await query(
        `INSERT INTO reproducciones (usuario_id, cancion_id, fecha_inicio, segundos_escuchados, completada, fuente)
         VALUES ($1, $2, $3, $4, TRUE, 'spotify')`,
        [usuarioId, item.id, fechaEscucha, item.duracion]
      );
    }
  }

  if (cancionesImportadas.length > 0) {
    await query(
      `INSERT INTO actividad (usuario_id, tipo, detalles)
       VALUES ($1, 'importar_spotify', $2::jsonb)`,
      [usuarioId, JSON.stringify({ canciones_importadas: cancionesImportadas.length })]
    );
  }
};

module.exports = {
  buscarCancionesExterno,
  obtenerCancionExternaPorId,
  guardarObtenerCancionLocal,
  intercambiarCodigoUsuarioSpotify,
  importarHistorialUsuarioSpotify,
  registrarHistorialEnBiblioteca
};