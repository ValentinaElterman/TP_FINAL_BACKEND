const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const {
  registrarUsuario,
  loginUsuario,
  obtenerMiPerfil,
  actualizarUsuario,
  eliminarUsuarioCuenta,
} = require('../services/authService');
const {
  intercambiarCodigoUsuarioSpotify,
  importarHistorialUsuarioSpotify,
  registrarHistorialEnBiblioteca,
} = require('../services/spotifyService');

const DURACION_SEGUNDOS = 60 * 60 * 2; // 2 horas
const DURACION_MS = DURACION_SEGUNDOS * 1000;

const opcionesCookie = () => {
  const produccion = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true, // protegida desde el navegador
    secure: produccion, // https
    sameSite: produccion ? 'none' : 'lax', // 'none' si front y back están en dominios distintos
  };
};

// GET /api/auth/spotify/url -> Devuelve la URL de autorización a React
const obtenerUrlSpotify = (req, res) => {
  const scopes = ['user-read-recently-played', 'user-top-read', 'user-read-private'].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });

  return res.json({
    ok: true,
    url: `https://accounts.spotify.com/authorize?${params.toString()}`,
  });
};

// POST /api/auth/spotify/importar -> Recibe el "code" desde Axios y guarda el historial
const importarSpotify = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ ok: false, mensaje: 'Falta el código de autorización de Spotify' });
    }

    const tokenData = await intercambiarCodigoUsuarioSpotify(code);
    const cancionesImportadas = await importarHistorialUsuarioSpotify(tokenData.access_token);

    if (cancionesImportadas.length > 0) {
      await registrarHistorialEnBiblioteca(req.usuario.id, cancionesImportadas);
    }

    return res.json({
      ok: true,
      mensaje: `Se importaron ${cancionesImportadas.length} canciones desde Spotify`,
      total: cancionesImportadas.length,
      canciones: cancionesImportadas,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/registro (creamos el perfil junto con el usuario)
const registrar = async (req, res, next) => {
  try {
    const usuario = await registrarUsuario(req.body);
    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado',
      usuario,
    });
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 409) {
      return res.status(error.statusCode).json({
        ok: false,
        mensaje: error.message,
        errores: error.errores || undefined,
      });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        ok: false,
        mensaje: 'El usuario o el correo ya están registrados',
      });
    }

    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const respuesta = await loginUsuario(req.body, res);
    return res.json(respuesta);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        ok: false,
        mensaje: error.message,
      });
    }

    next(error);
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  const token = req.cookies && req.cookies.token;

  res.clearCookie('token', opcionesCookie());

  if (!token) {
    return res.status(200).json({ ok: true, mensaje: 'No había sesión activa' });
  }

  return res.json({ ok: true, mensaje: 'Sesión cerrada' });
};

// GET /api/auth/me
const me = async (req, res, next) => {
  try {
    const usuario = await obtenerMiPerfil(req.usuario.id);
    return res.json({ ok: true, usuario });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ ok: false, mensaje: error.message });
    }

    next(error);
  }
};

// PUT /api/auth/actualizar
const actualizar = async (req, res, next) => {
  try {
    const usuarioActualizado = await actualizarUsuario({
      usuarioId: req.usuario.id,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    return res.json({
      ok: true,
      mensaje: 'Usuario actualizado correctamente',
      usuario: usuarioActualizado,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        ok: false,
        mensaje: error.message,
        errores: error.errores || undefined,
      });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        ok: false,
        mensaje: 'El usuario o el correo ya están registrados',
      });
    }

    next(error);
  }
};

// DELETE /api/auth/eliminar
const eliminar = async (req, res, next) => {
  try {
    await eliminarUsuarioCuenta(req.usuario.id);
    res.clearCookie('token', opcionesCookie());
    return res.json({ ok: true, mensaje: 'Cuenta eliminada correctamente' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ ok: false, mensaje: error.message });
    }

    next(error);
  }
};

module.exports = {
  registrar,
  login,
  logout,
  me,
  actualizar,
  eliminar,
  opcionesCookie,
  obtenerUrlSpotify,
  importarSpotify,
};