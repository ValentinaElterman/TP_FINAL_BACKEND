const { query } = require('../config/db');

// Registra un evento en el historial del usuario (tabla actividad).
// Nunca debe romper la operación principal: si falla solo se loguea.
const registrarActividad = async ({
  usuarioId,
  tipo,
  cancionId = null,
  coleccionId = null,
  detalles = null,
}) => {
  try {
    await query(
      `INSERT INTO actividad (usuario_id, tipo, cancion_id, coleccion_id, detalles)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [usuarioId, tipo, cancionId, coleccionId, detalles ? JSON.stringify(detalles) : null]
    );
  } catch (error) {
    console.error('No se pudo registrar la actividad:', error.message);
  }
};

// Últimos eventos del usuario (para la sección "actividad" del perfil)
const obtenerActividad = async (usuarioId, { limite, pagina } = {}) => {
  const limiteNum = Math.min(Math.max(parseInt(limite, 10) || 20, 1), 100);
  const paginaNum = Math.max(parseInt(pagina, 10) || 1, 1);
  const offset = (paginaNum - 1) * limiteNum;

  const resultado = await query(
    `SELECT
       a.id,
       a.tipo,
       a.detalles,
       a.fecha,
       a.cancion_id,
       c.titulo AS cancion_titulo,
       c.foto AS cancion_foto,
       a.coleccion_id,
       col.nombre AS coleccion_nombre
     FROM actividad a
     LEFT JOIN canciones c ON c.id = a.cancion_id
     LEFT JOIN colecciones col ON col.id = a.coleccion_id
     WHERE a.usuario_id = $1
     ORDER BY a.fecha DESC, a.id DESC
     LIMIT $2 OFFSET $3`,
    [usuarioId, limiteNum, offset]
  );

  return resultado.rows;
};

module.exports = {
  registrarActividad,
  obtenerActividad,
};
