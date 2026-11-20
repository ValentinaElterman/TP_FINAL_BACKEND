const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, pool } = require('../config/db');

const DURACION_SEGUNDOS = 60 * 60 * 2;

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const buscarUsuarioPorEmail = async (email) => {
  const resultado = await query(
    'SELECT id, username, email, password, activo FROM usuarios WHERE email = $1',
    [email]
  );

  return resultado.rows[0] || null;
};

const buscarUsuarioPorEmailOUsername = async (email, username) => {
  const resultado = await query(
    'SELECT 1 FROM usuarios WHERE email = $1 OR username = $2',
    [email, username]
  );

  return resultado.rows.length > 0;
};

const crearUsuario = async ({ username, email, password }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const resUsuario = await client.query(
      `INSERT INTO usuarios (username, email, password, activo)
       VALUES ($1, $2, $3, TRUE)
       RETURNING id, username, email`,
      [username, email, password]
    );

    const usuarioCreado = resUsuario.rows[0];

    await client.query(
      `INSERT INTO perfiles (usuario_id, nombre)
       VALUES ($1, $2)`,
      [usuarioCreado.id, usuarioCreado.username]
    );

    await client.query('COMMIT');
    return usuarioCreado;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const obtenerUsuarioPorId = async (id) => {
  const resultado = await query(
    `SELECT u.id, u.username, u.email, p.nombre, p.foto, p.bio, p.preferencias
     FROM usuarios u
     LEFT JOIN perfiles p ON p.usuario_id = u.id
     WHERE u.id = $1`,
    [id]
  );

  return resultado.rows[0] || null;
};

const verificarUsuarioExistente = async (usuarioId, campo, valor) => {
  const queryText = campo === 'username'
    ? 'SELECT id FROM usuarios WHERE username = $1 AND id != $2'
    : 'SELECT id FROM usuarios WHERE email = $1 AND id != $2';

  const resultado = await query(queryText, [valor, usuarioId]);
  return resultado.rows.length > 0;
};

const actualizarUsuarioDb = async ({ id, username, email, password }) => {
  const updates = [];
  const values = [];
  let index = 1;

  if (username !== undefined) {
    const usernameTrim = String(username).trim();
    updates.push(`username = $${index}`);
    values.push(usernameTrim);
    index += 1;
  }

  if (email !== undefined) {
    const emailTrim = String(email).trim().toLowerCase();
    updates.push(`email = $${index}`);
    values.push(emailTrim);
    index += 1;
  }

  if (password !== undefined) {
    updates.push(`password = $${index}`);
    values.push(password);
    index += 1;
  }

  if (updates.length === 0) {
    return null;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    values.push(id);
    const queryText = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${index} RETURNING id, username, email`;
    const resultado = await client.query(queryText, values);

    await client.query('COMMIT');
    return resultado.rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
const eliminarUsuario = async (usuarioId) => {
  const resultado = await query(
    'DELETE FROM usuarios WHERE id = $1 RETURNING id',
    [usuarioId]
  );

  return resultado.rows[0] || null;
};

const registrarUsuario = async ({ username, email, password, confirmarPassword }) => {
  const usernameTrim = String(username || '').trim();
  const emailTrim = String(email || '').trim().toLowerCase();
  const passwordTrim = String(password || '');
  const confirmarPasswordTrim = String(confirmarPassword || '');

  const errores = [];

  if (usernameTrim.length < 5 || usernameTrim.length > 15) {
    errores.push('El usuario debe tener entre 5 y 15 caracteres');
  }

  if (!emailValido(emailTrim)) {
    errores.push('El correo no es válido');
  }

  if (passwordTrim.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (passwordTrim !== confirmarPasswordTrim) {
    errores.push('Las contraseñas no coinciden');
  }

  if (errores.length > 0) {
    const error = new Error('Datos inválidos');
    error.errores = errores;
    error.statusCode = 400;
    throw error;
  }

  const existe = await buscarUsuarioPorEmailOUsername(emailTrim, usernameTrim);
  if (existe) {
    const error = new Error('El usuario o el correo ya están registrados');
    error.statusCode = 409;
    throw error;
  }

  const hash = await bcrypt.hash(passwordTrim, 10);
  const usuarioCreado = await crearUsuario({
    username: usernameTrim,
    email: emailTrim,
    password: hash,
  });

  return usuarioCreado;
};

const loginUsuario = async ({ email, password }, res) => {
  const emailTrim = String(email || '').trim().toLowerCase();
  const passwordTrim = String(password || '');

  if (!emailTrim || !passwordTrim) {
    const error = new Error('Ingresá correo y contraseña');
    error.statusCode = 400;
    throw error;
  }

  const usuario = await buscarUsuarioPorEmail(emailTrim);
  const coincide = usuario && (await bcrypt.compare(passwordTrim, usuario.password));

  if (!coincide) {
    const error = new Error('Correo o contraseña incorrectos');
    error.statusCode = 401;
    throw error;
  }

  if (!usuario.activo) {
    const error = new Error('La cuenta está desactivada, registrate');
    error.statusCode = 403;
    throw error;
  }

  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
    expiresIn: DURACION_SEGUNDOS,
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: DURACION_SEGUNDOS * 1000,
  });

  return {
    ok: true,
    mensaje: 'Sesión iniciada',
    usuario: { id: usuario.id, username: usuario.username, email: usuario.email },
  };
};

const obtenerMiPerfil = async (usuarioId) => {
  const usuario = await obtenerUsuarioPorId(usuarioId);

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return usuario;
};

const actualizarUsuario = async ({ usuarioId, username, email, password }) => {
  const errores = [];

  if (username !== undefined) {
    const usernameTrim = String(username).trim();
    if (usernameTrim.length < 5 || usernameTrim.length > 15) {
      errores.push('El usuario debe tener entre 5 y 15 caracteres');
    }
  }

  if (email !== undefined) {
    const emailTrim = String(email).trim().toLowerCase();
    if (!emailValido(emailTrim)) {
      errores.push('El correo no es válido');
    }
  }

  if (password !== undefined) {
    const passwordTrim = String(password);
    if (passwordTrim.length < 8) {
      errores.push('La contraseña debe tener al menos 8 caracteres');
    }
  }

  if (errores.length > 0) {
    const error = new Error('Datos inválidos');
    error.errores = errores;
    error.statusCode = 400;
    throw error;
  }

  const payload = {};

  if (username !== undefined) {
    const usernameTrim = String(username).trim();
    const existe = await verificarUsuarioExistente(usuarioId, 'username', usernameTrim);
    if (existe) {
      const error = new Error('El nombre de usuario ya está registrado');
      error.statusCode = 409;
      throw error;
    }
    payload.username = usernameTrim;
  }

  if (email !== undefined) {
    const emailTrim = String(email).trim().toLowerCase();
    const existe = await verificarUsuarioExistente(usuarioId, 'email', emailTrim);
    if (existe) {
      const error = new Error('El correo ya está registrado');
      error.statusCode = 409;
      throw error;
    }
    payload.email = emailTrim;
  }

  if (password !== undefined) {
    payload.password = await bcrypt.hash(String(password), 10);
  }

  const usuarioActualizado = await actualizarUsuarioDb({ id: usuarioId, ...payload });

  if (!usuarioActualizado) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return usuarioActualizado;
};

const eliminarUsuarioCuenta = async (usuarioId) => {
  const usuario = await eliminarUsuario(usuarioId);

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerMiPerfil,
  actualizarUsuario,
  eliminarUsuarioCuenta,
};