const {
  obtenerPerfilPorUsuarioId,
  obtenerPerfilActual,
  actualizarPerfilUsuario,
  desactivarUsuario,
} = require('../repositories/perfilRepository');

const esObjetoPlano = (valor) =>
  valor !== null &&
  !Array.isArray(valor) &&
  Object.prototype.toString.call(valor) === '[object Object]';

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
    if (nombre.length < 5 || nombre.length > 20) {
      errores.push('El nombre debe tener entre 5 y 20 caracteres');
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
