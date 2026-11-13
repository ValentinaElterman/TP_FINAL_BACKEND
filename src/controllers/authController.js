const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

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

const { intercambiarCodigoUsuarioSpotify, importarHistorialUsuarioSpotify,} = require('../services/apiService');

// GET /api/auth/spotify/url -> Devuelve la URL de autorización a React
const obtenerUrlSpotify = (req, res) => {
  const scopes = [
    'user-read-recently-played',
    'user-top-read',
    'user-read-private',
  ].join(' ');

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

    // 1. Intercambiar el code por el token personal del usuario
    const tokenData = await intercambiarCodigoUsuarioSpotify(code);

    // 2. Descargar historial + top tracks y guardarlos en PostgreSQL
    const cancionesImportadas = await importarHistorialUsuarioSpotify(tokenData.access_token);

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

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /api/auth/registro (creamos el perfil junto con el usuario)
const registrar = async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const confirmarPassword = String(req.body.confirmarPassword || '');

    const errores = [];

    if (username.length < 5 || username.length > 10) {
      errores.push('El usuario debe tener entre 5 y 10 caracteres');
    }

    if (!emailValido(email)) {
      errores.push('El correo no es válido');
    }

    if (password.length < 8) {
      errores.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (password !== confirmarPassword) {
      errores.push('Las contraseñas no coinciden');
    }

    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Datos inválidos',
        errores,
      });
    }

    const existe = await query(
      'SELECT 1 FROM usuarios WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existe.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        mensaje: 'El usuario o el correo ya están registrados',
      });
    }

    const hash = await bcrypt.hash(password, 10);

    await query('BEGIN');

    try {
      const resUsuario = await query(
        `INSERT INTO usuarios (username, email, password, activo)
         VALUES ($1, $2, $3, TRUE)
         RETURNING id, username, email`,
        [username, email, hash]
      );

      const usuarioCreado = resUsuario.rows[0];

      await query(
        `INSERT INTO perfiles (usuario_id, nombre)
         VALUES ($1, $2)`,
        [usuarioCreado.id, usuarioCreado.username]
      );

      await query('COMMIT');

      return res.status(201).json({
        ok: true,
        mensaje: 'Usuario registrado',
        usuario: usuarioCreado,
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
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
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ ok: false, mensaje: 'Ingresá correo y contraseña' });
    }

    const resultado = await query(
      'SELECT id, username, email, password, activo FROM usuarios WHERE email = $1',
      [email]
    );
    const usuario = resultado.rows[0];

    const coincide = usuario && (await bcrypt.compare(password, usuario.password));
    if (!coincide) {
      return res.status(401).json({ ok: false, mensaje: 'Correo o contraseña incorrectos' });
    }
    if (!usuario.activo) {
      return res.status(403).json({ ok: false, mensaje: 'La cuenta está desactivada, registrate' });
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
      expiresIn: DURACION_SEGUNDOS,
    });

    res.cookie('token', token, { ...opcionesCookie(), maxAge: DURACION_MS });

    res.json({
      ok: true,
      mensaje: 'Sesión iniciada',
      usuario: { id: usuario.id, username: usuario.username, email: usuario.email },
    });
  } catch (error) {
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
    const resultado = await query(
      `SELECT u.id, u.username, u.email, p.nombre, p.foto, p.bio, p.preferencias
       FROM usuarios u
       LEFT JOIN perfiles p ON p.usuario_id = u.id
       WHERE u.id = $1`,
      [req.usuario.id]
    );

    const usuario = resultado.rows[0];
    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    res.json({ ok: true, usuario });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/actualizar
const actualizar = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const { username, email, password } = req.body;

    const errores = [];

    if (username !== undefined) {
      const usernameTrim = String(username).trim();
      if (usernameTrim.length < 5 || usernameTrim.length > 10) {
        errores.push('El usuario debe tener entre 5 y 10 caracteres');
      }
    }

    if (email !== undefined) {
      const emailTrim = String(email).trim().toLowerCase();
      if (!emailValido(emailTrim)) {
        errores.push('El correo no es válido');
      }
    }

    if (password !== undefined) {
      const passwordStr = String(password);
      if (passwordStr.length < 8) {
        errores.push('La contraseña debe tener al menos 8 caracteres');
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Datos inválidos',
        errores,
      });
    }

    if (username !== undefined) {
      const usernameTrim = String(username).trim();

      const existe = await query(
        'SELECT id FROM usuarios WHERE username = $1 AND id != $2',
        [usernameTrim, usuarioId]
      );
      if (existe.rows.length > 0) {
        return res.status(409).json({
          ok: false,
          mensaje: 'El nombre de usuario ya está registrado',
        });
      }

      await query(
        'UPDATE usuarios SET username = $1 WHERE id = $2',
        [usernameTrim, usuarioId]
      );
    }

    if (email !== undefined) {
      const emailTrim = String(email).trim().toLowerCase();

      const existe = await query(
        'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
        [emailTrim, usuarioId]
      );
      if (existe.rows.length > 0) {
        return res.status(409).json({
          ok: false,
          mensaje: 'El correo ya está registrado',
        });
      }

      await query(
        'UPDATE usuarios SET email = $1 WHERE id = $2',
        [emailTrim, usuarioId]
      );
    }

    if (password !== undefined) {
      const hash = await bcrypt.hash(String(password), 10);
      await query(
        'UPDATE usuarios SET password = $1 WHERE id = $2',
        [hash, usuarioId]
      );
    }

    const resultado = await query(
      'SELECT id, username, email FROM usuarios WHERE id = $1',
      [usuarioId]
    );

    return res.json({
      ok: true,
      mensaje: 'Usuario actualizado correctamente',
      usuario: resultado.rows[0],
    });
  } catch (error) {
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
    const usuarioId = req.usuario.id;

    const resultado = await query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id',
      [usuarioId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    res.clearCookie('token', opcionesCookie());

    return res.json({
      ok: true,
      mensaje: 'Cuenta eliminada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registrar, login, logout, me, actualizar, eliminar, opcionesCookie, obtenerUrlSpotify, importarSpotify };