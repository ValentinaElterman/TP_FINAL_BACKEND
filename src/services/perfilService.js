const { query } = require('../config/db');

const esObjetoPlano = (valor) =>
  valor !== null &&
  !Array.isArray(valor) &&
  Object.prototype.toString.call(valor) === '[object Object]';

const obtenerPerfilPorUsuarioId = async (usuarioId) => {
  const resultado = await query(
    `SELECT u.id, u.username, u.email, p.nombre, p.foto, p.bio, p.preferencias
     FROM usuarios u
     JOIN perfiles p ON p.usuario_id = u.id
     WHERE u.id = $1`,
    [usuarioId]
  );

  return resultado.rows[0] || null;
};

const obtenerPerfilActual = async (usuarioId) => {
  const resultado = await query(
    'SELECT nombre, foto, bio, preferencias FROM perfiles WHERE usuario_id = $1',
    [usuarioId]
  );

  return resultado.rows[0] || null;
};

const actualizarPerfilUsuario = async ({ usuarioId, nombre, foto, bio, preferencias }) => {
  const preferenciasLimpias = esObjetoPlano(preferencias) ? preferencias : {};

  const resultado = await query(
    `UPDATE perfiles
     SET nombre = $1, foto = $2, bio = $3, preferencias = $4::jsonb
     WHERE usuario_id = $5
     RETURNING usuario_id, nombre, foto, bio, preferencias`,
    [nombre, foto, bio, JSON.stringify(preferenciasLimpias), usuarioId]
  );

  return resultado.rows[0] || null;
};

const desactivarUsuario = async (usuarioId) => {
  const resultado = await query(
    'UPDATE usuarios SET activo = FALSE WHERE id = $1 RETURNING id',
    [usuarioId]
  );

  return resultado.rows[0] || null;
};

const obtenerPerfil = async (usuarioId) => {
  const perfil = await obtenerPerfilPorUsuarioId(usuarioId);

  if (!perfil) {
    const error = new Error('Perfil no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return perfil;
};

const actualizarPerfil = async (usuarioId, cambios) => {
  const actual = await obtenerPerfilActual(usuarioId);

  if (!actual) {
    const error = new Error('Perfil no encontrado');
    error.statusCode = 404;
    throw error;
  }

  let { nombre, foto, bio, preferencias } = actual;
  const errores = [];

  if (cambios.nombre !== undefined) {
    nombre = String(cambios.nombre).trim();
    if (nombre.length < 5 || nombre.length > 15) {
      errores.push('El nombre debe tener entre 5 y 15 caracteres');
    }
  }

  if (cambios.foto !== undefined) {
    foto = String(cambios.foto || '').trim();
    if (foto === '') {
      foto = null;
    } else if (!/^https?:\/\/\S+$/i.test(foto) || foto.length > 500) {
      errores.push('La foto debe ser una URL válida');
    }
  }

  if (cambios.bio !== undefined) {
    bio = String(cambios.bio || '').trim();
    if (bio.length > 200) {
      errores.push('La bio no puede superar los 200 caracteres');
    }
    if (bio === '') bio = null;
  }

  if (cambios.preferencias !== undefined) {
    const pref = cambios.preferencias;
    if (!esObjetoPlano(pref)) {
      errores.push('Las preferencias deben ser un objeto');
    } else {
      preferencias = pref;
    }
  }

  if (errores.length > 0) {
    const error = new Error('Datos inválidos');
    error.statusCode = 400;
    error.errores = errores;
    throw error;
  }

  const perfilActualizado = await actualizarPerfilUsuario({
    usuarioId,
    nombre,
    foto,
    bio,
    preferencias,
  });

  if (!perfilActualizado) {
    const error = new Error('Perfil no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return perfilActualizado;
};

const desactivarCuenta = async (usuarioId) => {
  const usuario = await desactivarUsuario(usuarioId);

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  desactivarCuenta,
};