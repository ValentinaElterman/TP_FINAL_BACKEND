const axios = require('axios');
const {
  buscarCancionPorExternalId,
  buscarAlbumPorExternalId,
  crearAlbum,
  buscarArtistaPorExternalId,
  crearArtista,
  asociarCancionArtista,
  crearCancion,
  registrarEnBiblioteca,
  yaExisteReproduccion,
  crearReproduccion,
  registrarActividadImportacion,
} = require('../repositories/musicaRepository');

const spotifyTokenState = {
  accessToken: null,
  expirationTime: 0,
};

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
  const cancionExistente = await buscarCancionPorExternalId(externalTrackId);

  if (cancionExistente) {
    return cancionExistente;
  }

  const externalAlbumId = String(trackInfo.album.id);
  let albumId = null;
  const albumExistente = await buscarAlbumPorExternalId(externalAlbumId);

  if (albumExistente) {
    albumId = albumExistente.id;
  } else {
    albumId = await crearAlbum({
      externalId: externalAlbumId,
      titulo: trackInfo.album.name,
      foto: trackInfo.album.images?.[0]?.url || null,
      fechaLanzamiento: trackInfo.album.release_date || null,
    });
  }

  const fotoCancion = trackInfo.album.images?.[0]?.url || null;
  const duracionSegundos = Math.max(1, Math.round(trackInfo.duration_ms / 1000));
  const cancionGuardada = await crearCancion({
    externalId: externalTrackId,
    titulo: trackInfo.name,
    albumId,
    duracion: duracionSegundos,
    foto: fotoCancion,
    previewUrl: trackInfo.preview_url || null,
    fechaLanzamiento: trackInfo.album.release_date || null,
  });

  for (const artist of trackInfo.artists) {
    const externalArtistaId = String(artist.id);
    let artistaId = null;
    const artistaExistente = await buscarArtistaPorExternalId(externalArtistaId);

    if (artistaExistente) {
      artistaId = artistaExistente.id;
    } else {
      artistaId = await crearArtista({ externalId: externalArtistaId, nombre: artist.name });
    }

    await asociarCancionArtista({ cancionId: cancionGuardada.id, artistaId });
  }

  return cancionGuardada;
};

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

  return response.data;
};

const importarHistorialUsuarioSpotify = async (userAccessToken) => {
  const headers = { Authorization: `Bearer ${userAccessToken}` };

  const [recientesRes, topRes] = await Promise.all([
    axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      headers,
      params: { limit: 50 },
    }),
    axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers,
      params: { limit: 50, time_range: 'medium_term' },
    }),
  ]);

  const recientes = recientesRes.data.items || [];
  const topTracks = topRes.data.items || [];
  const cancionesProcesadas = [];
  const idsVistos = new Set();

  for (const item of recientes) {
    if (!item.track) continue;
    const cancionLocal = await guardarObtenerCancionLocal(item.track);
    cancionesProcesadas.push({ ...cancionLocal, escuchada_en: item.played_at });
    idsVistos.add(item.track.id);
  }

  for (const track of topTracks) {
    if (!track || idsVistos.has(track.id)) continue;
    const cancionLocal = await guardarObtenerCancionLocal(track);
    cancionesProcesadas.push({ ...cancionLocal, escuchada_en: null });
    idsVistos.add(track.id);
  }

  return cancionesProcesadas;
};

const registrarHistorialEnBiblioteca = async (usuarioId, cancionesImportadas) => {
  for (const item of cancionesImportadas) {
    const fechaEscucha = item.escuchada_en ? new Date(item.escuchada_en) : new Date();

    await registrarEnBiblioteca({
      usuarioId,
      cancionId: item.id,
      fechaEscucha,
    });

    const yaRegistrada = await yaExisteReproduccion({
      usuarioId,
      cancionId: item.id,
      fechaEscucha,
    });

    if (!yaRegistrada) {
      await crearReproduccion({
        usuarioId,
        cancionId: item.id,
        fechaEscucha,
        duracion: item.duracion,
      });
    }
  }

  if (cancionesImportadas.length > 0) {
    await registrarActividadImportacion({
      usuarioId,
      cantidad: cancionesImportadas.length,
    });
  }
};

module.exports = {
  buscarCancionesExterno,
  obtenerCancionExternaPorId,
  guardarObtenerCancionLocal,
  intercambiarCodigoUsuarioSpotify,
  importarHistorialUsuarioSpotify,
  registrarHistorialEnBiblioteca,
  obtenerSpotifyToken,
};
