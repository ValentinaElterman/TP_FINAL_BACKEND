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

module.exports = {
  buscarCancionesExterno,
  obtenerCancionExternaPorId,
  guardarObtenerCancionLocal,
};