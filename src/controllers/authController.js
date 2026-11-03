const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const DURACION_SEGUNDOS = 60 * 60 * 2; // 2 horas
const DURACION_MS = DURACION_SEGUNDOS * 1000;

const opcionesCookie = () => {
  const produccion = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true, // protegida desde el navegador
    secure: produccion, //  https
    sameSite: produccion ? 'none' : 'lax', // 'none' si front y back están en dominios distintos
  };
};

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /api/auth/registro
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

module.exports = { registrar, login, logout, me, opcionesCookie };