const { query } = require('../config/db');

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
  const resultado = await query(
    `UPDATE perfiles
     SET nombre = $1, foto = $2, bio = $3, preferencias = $4
     WHERE usuario_id = $5
     RETURNING usuario_id, nombre, foto, bio, preferencias`,
    [nombre, foto, bio, JSON.stringify(preferencias), usuarioId]
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

module.exports = {
  obtenerPerfilPorUsuarioId,
  obtenerPerfilActual,
  actualizarPerfilUsuario,
  desactivarUsuario,
};
