const { query } = require('../config/db');
const { resolverCancion } = require('./musicaService');
const { registrarActividad } = require('./actividadService');

const MAX_TEXTO = 2000;

const crearError = (statusCode, mensaje, errores) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  if (errores) error.errores = errores;
  return error;
};

const esIdValido = (valor) => Number.isInteger(Number(valor)) && Number(valor) > 0;

const validarTexto = (texto) => {
  const limpio = String(texto ?? '').trim();
  const errores = [];

  if (limpio.length === 0) {
    errores.push('La reseña no puede estar vacía');
  }
  if (limpio.length > MAX_TEXTO) {
    errores.push(`La reseña no puede superar los ${MAX_TEXTO} caracteres`);
  }

  if (errores.length > 0) {
    throw crearError(400, 'Datos inválidos', errores);
  }
  return limpio;
};

const SELECT_RESENA = `
  SELECT
    r.id,
    r.cancion_id,
    r.texto,
    r.fecha_creacion,
    r.fecha_actualizacion,
    c.titulo,
    c.foto
  FROM "reseñas" r
  JOIN canciones c ON c.id = r.cancion_id`;

// GET: reseñas del usuario (opcional ?cancionId=)
const obtenerResenasUsuario = async (usuarioId, { cancionId } = {}) => {
  if (cancionId !== undefined && cancionId !== '') {
    if (!esIdValido(cancionId)) {
      throw crearError(400, 'cancionId inválido');
    }

    const deUnaCancion = await query(
      `${SELECT_RESENA}
       WHERE r.usuario_id = $1 AND r.cancion_id = $2
       ORDER BY r.fecha_actualizacion DESC, r.id DESC`,
      [usuarioId, Number(cancionId)]
    );

    return deUnaCancion.rows;
  }

  const todas = await query(
    `${SELECT_RESENA}
     WHERE r.usuario_id = $1
     ORDER BY r.fecha_actualizacion DESC, r.id DESC`,
    [usuarioId]
  );

  return todas.rows;
};

// POST: una reseña por usuario y canción
const crearResenaUsuario = async (usuarioId, datos = {}) => {
  const texto = validarTexto(datos.texto);
  const cancion = await resolverCancion(datos);

  let insertada;
  try {
    insertada = await query(
      `INSERT INTO "reseñas" (usuario_id, cancion_id, texto)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [usuarioId, cancion.id, texto]
    );
  } catch (error) {
    if (error.code === '23505') {
      throw crearError(409, 'Ya escribiste una reseña de esta canción, editá la existente');
    }
    throw error;
  }

  await registrarActividad({ usuarioId, tipo: 'resena_creada', cancionId: cancion.id });

  const resultado = await query(`${SELECT_RESENA} WHERE r.id = $1`, [insertada.rows[0].id]);
  return resultado.rows[0];
};

// PUT /:id (solo si la reseña es del usuario)
const actualizarResenaUsuario = async (usuarioId, resenaId, datos = {}) => {
  if (!esIdValido(resenaId)) {
    throw crearError(400, 'Id de reseña inválido');
  }

  const texto = validarTexto(datos.texto);

  const resultado = await query(
    `UPDATE "reseñas"
     SET texto = $1, fecha_actualizacion = NOW()
     WHERE id = $2 AND usuario_id = $3
     RETURNING id, cancion_id`,
    [texto, Number(resenaId), usuarioId]
  );

  if (resultado.rows.length === 0) {
    throw crearError(404, 'Reseña no encontrada');
  }

  await registrarActividad({
    usuarioId,
    tipo: 'resena_actualizada',
    cancionId: resultado.rows[0].cancion_id,
  });

  const completa = await query(`${SELECT_RESENA} WHERE r.id = $1`, [resultado.rows[0].id]);
  return completa.rows[0];
};

// DELETE /:id
const eliminarResenaUsuario = async (usuarioId, resenaId) => {
  if (!esIdValido(resenaId)) {
    throw crearError(400, 'Id de reseña inválido');
  }

  const resultado = await query(
    'DELETE FROM "reseñas" WHERE id = $1 AND usuario_id = $2 RETURNING cancion_id',
    [Number(resenaId), usuarioId]
  );

  if (resultado.rows.length === 0) {
    throw crearError(404, 'Reseña no encontrada');
  }

  await registrarActividad({
    usuarioId,
    tipo: 'resena_eliminada',
    cancionId: resultado.rows[0].cancion_id,
  });

  return true;
};

module.exports = {
  obtenerResenasUsuario,
  crearResenaUsuario,
  actualizarResenaUsuario,
  eliminarResenaUsuario,
};