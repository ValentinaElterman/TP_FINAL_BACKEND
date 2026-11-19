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

// Valida nombre/descripcion. En modo "parcial" solo valida lo que vino.
const validarDatosColeccion = ({ nombre, descripcion }, { parcial = false } = {}) => {
  const errores = [];
  const datos = {};

  if (nombre !== undefined || !parcial) {
    const nombreTrim = String(nombre ?? '').trim();
    if (nombreTrim.length < 1 || nombreTrim.length > 100) {
      errores.push('El nombre debe tener entre 1 y 100 caracteres');
    }
    datos.nombre = nombreTrim;
  }

  if (descripcion !== undefined) {
    const descTrim = String(descripcion ?? '').trim();
    if (descTrim.length > 500) {
      errores.push('La descripción no puede superar los 500 caracteres');
    }
    datos.descripcion = descTrim === '' ? null : descTrim;
  }

  if (errores.length > 0) {
    throw crearError(400, 'Datos inválidos', errores);
  }

  return datos;
};

// Garantiza que la colección exista Y sea del usuario (aislamiento entre cuentas)
const buscarColeccionDelUsuario = async (usuarioId, coleccionId) => {
  if (!esIdValido(coleccionId)) {
    throw crearError(400, 'Id de colección inválido');
  }

  const resultado = await query(
    `SELECT id, nombre, descripcion, fecha_creacion, fecha_actualizacion
     FROM colecciones
     WHERE id = $1 AND usuario_id = $2`,
    [Number(coleccionId), usuarioId]
  );

  if (!resultado.rows[0]) {
    throw crearError(404, 'Colección no encontrada');
  }

  return resultado.rows[0];
};

// GET /: listado con cantidad de canciones y portadas de muestra
const obtenerColeccionesUsuario = async (usuarioId) => {
  const resultado = await query(
    `SELECT
       col.id,
       col.nombre,
       col.descripcion,
       col.fecha_creacion,
       col.fecha_actualizacion,
       COUNT(cc.cancion_id)::int AS total_canciones,
       COALESCE(
         (ARRAY_AGG(c.foto ORDER BY cc.posicion NULLS LAST, cc.fecha_agregado)
            FILTER (WHERE c.foto IS NOT NULL))[1:4],
         ARRAY[]::varchar[]
       ) AS portadas
     FROM colecciones col
     LEFT JOIN colecciones_canciones cc ON cc.coleccion_id = col.id
     LEFT JOIN canciones c ON c.id = cc.cancion_id
     WHERE col.usuario_id = $1
     GROUP BY col.id
     ORDER BY col.fecha_actualizacion DESC, col.id DESC`,
    [usuarioId]
  );

  return resultado.rows;
};

// GET /:id: detalle con sus canciones
const obtenerDetalleColeccion = async (usuarioId, coleccionId) => {
  const coleccion = await buscarColeccionDelUsuario(usuarioId, coleccionId);

  const canciones = await query(
    `SELECT
       c.id AS cancion_id,
       c.titulo,
       c.foto,
       c.duracion,
       cc.posicion,
       cc.fecha_agregado,
       COALESCE((
         SELECT json_agg(json_build_object('id', a.id, 'nombre', a.nombre) ORDER BY a.nombre)
         FROM cancion_artistas ca JOIN artistas a ON a.id = ca.artista_id
         WHERE ca.cancion_id = c.id
       ), '[]'::json) AS artistas
     FROM colecciones_canciones cc
     JOIN canciones c ON c.id = cc.cancion_id
     WHERE cc.coleccion_id = $1
     ORDER BY cc.posicion NULLS LAST, cc.fecha_agregado`,
    [coleccion.id]
  );

  return {
    ...coleccion,
    total_canciones: canciones.rows.length,
    canciones: canciones.rows,
  };
};

// POST /
const crearColeccionUsuario = async (usuarioId, datos = {}) => {
  const { nombre, descripcion } = validarDatosColeccion(datos);

  const resultado = await query(
    `INSERT INTO colecciones (usuario_id, nombre, descripcion)
     VALUES ($1, $2, $3)
     RETURNING id, nombre, descripcion, fecha_creacion, fecha_actualizacion`,
    [usuarioId, nombre, descripcion ?? null]
  );

  const coleccion = resultado.rows[0];

  await registrarActividad({
    usuarioId,
    tipo: 'coleccion_creada',
    coleccionId: coleccion.id,
    detalles: { nombre: coleccion.nombre },
  });

  return { ...coleccion, total_canciones: 0 };
};

// PUT /:id: renombrar / cambiar descripción
const actualizarColeccionUsuario = async (usuarioId, coleccionId, datos = {}) => {
  const coleccion = await buscarColeccionDelUsuario(usuarioId, coleccionId);
  const cambios = validarDatosColeccion(datos, { parcial: true });

  if (Object.keys(cambios).length === 0) {
    throw crearError(400, 'No hay datos para actualizar');
  }

  const nombre = cambios.nombre !== undefined ? cambios.nombre : coleccion.nombre;
  const descripcion =
    cambios.descripcion !== undefined ? cambios.descripcion : coleccion.descripcion;

  const resultado = await query(
    `UPDATE colecciones
     SET nombre = $1, descripcion = $2, fecha_actualizacion = NOW()
     WHERE id = $3 AND usuario_id = $4
     RETURNING id, nombre, descripcion, fecha_creacion, fecha_actualizacion`,
    [nombre, descripcion, coleccion.id, usuarioId]
  );

  await registrarActividad({
    usuarioId,
    tipo: 'coleccion_actualizada',
    coleccionId: coleccion.id,
    detalles: { nombre },
  });

  return resultado.rows[0];
};

// DELETE /:id (las canciones del catálogo NO se borran, solo la relación)
const eliminarColeccionUsuario = async (usuarioId, coleccionId) => {
  const coleccion = await buscarColeccionDelUsuario(usuarioId, coleccionId);

  await query('DELETE FROM colecciones WHERE id = $1 AND usuario_id = $2', [
    coleccion.id,
    usuarioId,
  ]);

  // coleccion_id queda en NULL por el ON DELETE SET NULL; guardamos el nombre en detalles
  await registrarActividad({
    usuarioId,
    tipo: 'coleccion_eliminada',
    detalles: { nombre: coleccion.nombre },
  });

  return true;
};

// POST /:id/canciones: body { cancionId | (artista + titulo) | mbid }
const agregarCancionAColeccion = async (usuarioId, coleccionId, datos = {}) => {
  const coleccion = await buscarColeccionDelUsuario(usuarioId, coleccionId);
  const cancion = await resolverCancion(datos);

  const resultado = await query(
    `INSERT INTO colecciones_canciones (coleccion_id, cancion_id, posicion)
     VALUES (
       $1, $2,
       (SELECT COALESCE(MAX(posicion), 0) + 1 FROM colecciones_canciones WHERE coleccion_id = $1)
     )
     ON CONFLICT (coleccion_id, cancion_id) DO NOTHING
     RETURNING cancion_id`,
    [coleccion.id, cancion.id]
  );

  if (resultado.rows.length === 0) {
    throw crearError(409, 'La canción ya está en esta colección');
  }

  await query('UPDATE colecciones SET fecha_actualizacion = NOW() WHERE id = $1', [coleccion.id]);

  await registrarActividad({
    usuarioId,
    tipo: 'coleccion_cancion_agregada',
    cancionId: cancion.id,
    coleccionId: coleccion.id,
  });

  return obtenerDetalleColeccion(usuarioId, coleccion.id);
};

// DELETE /:id/canciones/:cancionId
const quitarCancionDeColeccion = async (usuarioId, coleccionId, cancionId) => {
  const coleccion = await buscarColeccionDelUsuario(usuarioId, coleccionId);

  if (!esIdValido(cancionId)) {
    throw crearError(400, 'Id de canción inválido');
  }

  const resultado = await query(
    `DELETE FROM colecciones_canciones
     WHERE coleccion_id = $1 AND cancion_id = $2
     RETURNING cancion_id`,
    [coleccion.id, Number(cancionId)]
  );

  if (resultado.rows.length === 0) {
    throw crearError(404, 'La canción no está en esta colección');
  }

  await query('UPDATE colecciones SET fecha_actualizacion = NOW() WHERE id = $1', [coleccion.id]);

  await registrarActividad({
    usuarioId,
    tipo: 'coleccion_cancion_quitada',
    cancionId: Number(cancionId),
    coleccionId: coleccion.id,
  });

  return obtenerDetalleColeccion(usuarioId, coleccion.id);
};

module.exports = {
  obtenerColeccionesUsuario,
  obtenerDetalleColeccion,
  crearColeccionUsuario,
  actualizarColeccionUsuario,
  eliminarColeccionUsuario,
  agregarCancionAColeccion,
  quitarCancionDeColeccion,
};
