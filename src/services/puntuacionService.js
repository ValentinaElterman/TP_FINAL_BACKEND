const { query } = require('../config/db');
const { resolverCancion } = require('./musicaService');
const { registrarActividad } = require('./actividadService');

const crearError = (statusCode, mensaje, errores) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  if (errores) error.errores = errores;
  return error;
};

const esIdValido = (valor) => Number.isInteger(Number(valor)) && Number(valor) > 0;

const validarValor = (valor) => {
  const numero = Number(valor);
  if (valor === undefined || valor === null || valor === '' || !Number.isInteger(numero) || numero < 1 || numero > 5) {
    throw crearError(400, 'Datos inválidos', ['La puntuación debe ser un entero entre 1 y 5']);
  }
  return numero;
};

const SELECT_PUNTUACION = `
  SELECT
    p.id,
    p.cancion_id,
    p.valor,
    p.fecha_creacion,
    p.fecha_actualizacion,
    c.titulo,
    c.foto
  FROM puntuaciones p
  JOIN canciones c ON c.id = p.cancion_id`;

// GET: todas las puntuaciones del usuario
const obtenerPuntuacionesUsuario = async (usuarioId, { cancionId } = {}) => {
  if (cancionId !== undefined && cancionId !== '') {
    if (!esIdValido(cancionId)) {
      throw crearError(400, 'cancionId inválido');
    }

    const deUnaCancion = await query(
      `${SELECT_PUNTUACION}
       WHERE p.usuario_id = $1 AND p.cancion_id = $2
       ORDER BY p.fecha_actualizacion DESC, p.id DESC`,
      [usuarioId, Number(cancionId)]
    );

    return deUnaCancion.rows;
  }

  const todas = await query(
    `${SELECT_PUNTUACION}
     WHERE p.usuario_id = $1
     ORDER BY p.fecha_actualizacion DESC, p.id DESC`,
    [usuarioId]
  );

  return todas.rows;
};

// POST: puntuar una canción (una sola puntuación por usuario y canción)
const crearPuntuacionUsuario = async (usuarioId, datos = {}) => {
  const valor = validarValor(datos.valor);
  const cancion = await resolverCancion(datos);

  let insertada;
  try {
    insertada = await query(
      `INSERT INTO puntuaciones (usuario_id, cancion_id, valor)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [usuarioId, cancion.id, valor]
    );
  } catch (error) {
    if (error.code === '23505') {
      throw crearError(409, 'Ya puntuaste esta canción, editá tu puntuación existente');
    }
    throw error;
  }

  await registrarActividad({
    usuarioId,
    tipo: 'puntuacion_creada',
    cancionId: cancion.id,
    detalles: { valor },
  });

  const resultado = await query(`${SELECT_PUNTUACION} WHERE p.id = $1`, [insertada.rows[0].id]);
  return resultado.rows[0];
};

// PUT /:id: cambiar el valor (solo si la puntuación es del usuario)
const actualizarPuntuacionUsuario = async (usuarioId, puntuacionId, datos = {}) => {
  if (!esIdValido(puntuacionId)) {
    throw crearError(400, 'Id de puntuación inválido');
  }

  const valor = validarValor(datos.valor);

  const resultado = await query(
    `UPDATE puntuaciones
     SET valor = $1, fecha_actualizacion = NOW()
     WHERE id = $2 AND usuario_id = $3
     RETURNING id, cancion_id`,
    [valor, Number(puntuacionId), usuarioId]
  );

  if (resultado.rows.length === 0) {
    throw crearError(404, 'Puntuación no encontrada');
  }

  await registrarActividad({
    usuarioId,
    tipo: 'puntuacion_actualizada',
    cancionId: resultado.rows[0].cancion_id,
    detalles: { valor },
  });

  const completa = await query(`${SELECT_PUNTUACION} WHERE p.id = $1`, [resultado.rows[0].id]);
  return completa.rows[0];
};

// DELETE /:id
const eliminarPuntuacionUsuario = async (usuarioId, puntuacionId) => {
  if (!esIdValido(puntuacionId)) {
    throw crearError(400, 'Id de puntuación inválido');
  }

  const resultado = await query(
    'DELETE FROM puntuaciones WHERE id = $1 AND usuario_id = $2 RETURNING cancion_id',
    [Number(puntuacionId), usuarioId]
  );

  if (resultado.rows.length === 0) {
    throw crearError(404, 'Puntuación no encontrada');
  }

  await registrarActividad({
    usuarioId,
    tipo: 'puntuacion_eliminada',
    cancionId: resultado.rows[0].cancion_id,
  });

  return true;
};

module.exports = {
  obtenerPuntuacionesUsuario,
  crearPuntuacionUsuario,
  actualizarPuntuacionUsuario,
  eliminarPuntuacionUsuario,
};