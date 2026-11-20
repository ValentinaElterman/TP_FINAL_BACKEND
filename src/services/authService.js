const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const DURACION_SEGUNDOS = 60 * 60 * 2;

// Hash falso para comparar igual cuando el correo no existe (evita revelar por tiempo de respuesta si el correo está registrado)
const HASH_FALSO = bcrypt.hashSync('contraseña-falsa-vasas', 10);

// Código de error de PostgreSQL para violación de UNIQUE (tuve problemas en la bd por esto por si acaso)
const PG_UNIQUE_VIOLATION = '23505';

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const esViolacionUnica = (error) => error && error.code === PG_UNIQUE_VIOLATION;

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
  await query(
    `INSERT INTO usuarios (username, email, password, activo)
     VALUES ($1, $2, $3, TRUE)`,
    [username, email, password]
  );

  const resUsuario = await query(
    'SELECT id, username, email FROM usuarios WHERE email = $1',
    [email]
  );
  const usuarioCreado = resUsuario.rows[0];

  try {
    await query(
      `INSERT INTO perfiles (usuario_id, nombre)
       VALUES ($1, $2)`,
      [usuarioCreado.id, usuarioCreado.username]
    );
  } catch (error) {
    try {
      await query('DELETE FROM usuarios WHERE id = $1', [usuarioCreado.id]);
    } catch (errorLimpieza) {
      console.error('No se pudo limpiar el usuario sin perfil:', errorLimpieza.message);
    }
    throw error;
  }

  return usuarioCreado;
};

const obtenerUsuarioPorId = async (id) => {
  const resultado = await query(
    `SELECT u.id, u.username, u.email, p.nombre, p.foto, p.bio, p.preferencias
     FROM usuarios u
     LEFT JOIN perfiles p ON p.usuario_id = u.id
     WHERE u.id = $1 AND u.activo = TRUE`,
    [id]
  );

  return resultado.rows[0] || null;
};

const verificarUsuarioExistente = async (usuarioId, campo, valor) => {
  const queryText = campo === 'username' ? 'SELECT id FROM usuarios WHERE username = $1 AND id != $2' : 'SELECT id FROM usuarios WHERE email = $1 AND id != $2';

  const resultado = await query(queryText, [valor, usuarioId]);
  return resultado.rows.length > 0;
};

const actualizarUsuarioDb = async ({ id, username, email, password }) => {
  const updates = [];
  const values = [];
  let index = 1;

  if (username !== undefined) {
    updates.push(`username = $${index}`);
    values.push(username);
    index += 1;
  }

  if (email !== undefined) {
    updates.push(`email = $${index}`);
    values.push(email);
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

  values.push(id);
  const resultado = await query(
    `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${index}`,
    values
  );

  if (resultado.rowCount === 0) {
    return null;
  }

  const actualizado = await query(
    'SELECT id, username, email FROM usuarios WHERE id = $1',
    [id]
  );

  return actualizado.rows[0] || null;
};

const eliminarUsuario = async (usuarioId) => {
  const existente = await query('SELECT id FROM usuarios WHERE id = $1', [usuarioId]);

  if (existente.rows.length === 0) {
    return null;
  }

  await query('DELETE FROM usuarios WHERE id = $1', [usuarioId]);
  return existente.rows[0];
};

const registrarUsuario = async ({ username, email, password, confirmarPassword }) => {
  const usernameTrim = String(username || '').trim();
  const emailTrim = String(email || '').trim().toLowerCase();
  const passwordStr = String(password || '');
  const confirmarPasswordStr = String(confirmarPassword || '');

  const errores = [];

  if (usernameTrim.length < 5 || usernameTrim.length > 15) {
    errores.push('El usuario debe tener entre 5 y 15 caracteres');
  }

  if (!emailValido(emailTrim) || emailTrim.length > 100) {
    errores.push('El correo no es válido');
  }

  if (passwordStr.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  } else if (Buffer.byteLength(passwordStr, 'utf8') > 72) {
    // bcrypt ignora todo lo que pase de 72 bytes
    errores.push('La contraseña es demasiado larga (máximo 72 caracteres)');
  }

  if (passwordStr !== confirmarPasswordStr) {
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

  const hash = await bcrypt.hash(passwordStr, 10);

  try {
    return await crearUsuario({
      username: usernameTrim,
      email: emailTrim,
      password: hash,
    });
  } catch (err) {
    // Otro registro con el mismo usuario/correo se coló entre el chequeo y el INSERT
    if (esViolacionUnica(err)) {
      const error = new Error('El usuario o el correo ya están registrados');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

const loginUsuario = async ({ email, password }) => {
  const emailTrim = String(email || '').trim().toLowerCase();
  const passwordStr = String(password || '');

  if (!emailTrim || !passwordStr) {
    const error = new Error('Ingresá correo y contraseña');
    error.statusCode = 400;
    throw error;
  }

  const usuario = await buscarUsuarioPorEmail(emailTrim);
  const hashComparar = usuario ? usuario.password : HASH_FALSO;
  const passwordCorrecta = await bcrypt.compare(passwordStr, hashComparar);
  const coincide = Boolean(usuario) && passwordCorrecta;

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

  if (!process.env.JWT_SECRET) {
    const error = new Error('Falta JWT_SECRET en el .env');
    error.statusCode = 500;
    throw error;
  }

  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
    expiresIn: DURACION_SEGUNDOS,
  });

  // La cookie la arma el controller (acá solo se genera el token)
  return {
    token,
    maxAgeMs: DURACION_SEGUNDOS * 1000,
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

  const usernameTrim = username !== undefined ? String(username).trim() : undefined;
  const emailTrim = email !== undefined ? String(email).trim().toLowerCase() : undefined;
  const passwordStr = password !== undefined ? String(password) : undefined;

  if (usernameTrim === undefined && emailTrim === undefined && passwordStr === undefined) {
    const error = new Error('No hay datos para actualizar');
    error.statusCode = 400;
    throw error;
  }

  if (usernameTrim !== undefined && (usernameTrim.length < 5 || usernameTrim.length > 15)) {
    errores.push('El usuario debe tener entre 5 y 15 caracteres');
  }

  if (emailTrim !== undefined && (!emailValido(emailTrim) || emailTrim.length > 100)) {
    errores.push('El correo no es válido');
  }

  if (passwordStr !== undefined) {
    if (passwordStr.length < 8) {
      errores.push('La contraseña debe tener al menos 8 caracteres');
    } else if (Buffer.byteLength(passwordStr, 'utf8') > 72) {
      errores.push('La contraseña es demasiado larga (máximo 72 caracteres)');
    }
  }

  if (errores.length > 0) {
    const error = new Error('Datos inválidos');
    error.errores = errores;
    error.statusCode = 400;
    throw error;
  }

  const payload = {};

  if (usernameTrim !== undefined) {
    const existe = await verificarUsuarioExistente(usuarioId, 'username', usernameTrim);
    if (existe) {
      const error = new Error('El nombre de usuario ya está registrado');
      error.statusCode = 409;
      throw error;
    }
    payload.username = usernameTrim;
  }

  if (emailTrim !== undefined) {
    const existe = await verificarUsuarioExistente(usuarioId, 'email', emailTrim);
    if (existe) {
      const error = new Error('El correo ya está registrado');
      error.statusCode = 409;
      throw error;
    }
    payload.email = emailTrim;
  }

  if (passwordStr !== undefined) {
    payload.password = await bcrypt.hash(passwordStr, 10);
  }

  let usuarioActualizado;
  try {
    usuarioActualizado = await actualizarUsuarioDb({ id: usuarioId, ...payload });
  } catch (err) {
    if (esViolacionUnica(err)) {
      const error = new Error('El usuario o el correo ya están registrados');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }

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