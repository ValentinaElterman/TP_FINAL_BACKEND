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

// Valida nombre y descripcion
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

// Garantiza que la colección exista Y sea del usuario
const buscarColeccionDelUsuario = async (usuarioId, coleccionId) => {
  if (!esIdValido(coleccionId)) {
    throw crearError(400, 'Id de colección inválido');
  }

  const resultado = await query(
    `SELECT id, nombre, descripcion, fecha_creacion, fecha_actualizacion
     FROM colecciones
     WHERE id = $1 AND usuario_id = $2`,
    [coleccionId, usuarioId]
  );

  if (!resultado.rows[0]) {
    throw crearError(404, 'Colección no encontrada');
  }

  return resultado.rows[0];
};

// Canciones de una colección, en el orden en que se agregaron
const buscarCancionesDeColeccion = async (coleccionId) => {
  const resultado = await query(
    `SELECT
       canciones.id AS cancion_id,
       canciones.titulo,
       canciones.foto,
       canciones.duracion,
       colecciones_canciones.posicion,
       colecciones_canciones.fecha_agregado
     FROM colecciones_canciones
     JOIN canciones ON canciones.id = colecciones_canciones.cancion_id
     WHERE colecciones_canciones.coleccion_id = $1
     ORDER BY colecciones_canciones.posicion, colecciones_canciones.fecha_agregado`,
    [coleccionId]
  );

  return resultado.rows;
};

// GET listado con cantidad de canciones y portadas de muestra (máximo 4)
const obtenerColeccionesUsuario = async (usuarioId) => {
  const colecciones = await query(
    `SELECT id, nombre, descripcion, fecha_creacion, fecha_actualizacion
     FROM colecciones
     WHERE usuario_id = $1
     ORDER BY fecha_actualizacion DESC, id DESC`,
    [usuarioId]
  );

  const lista = [];

  for (const coleccion of colecciones.rows) {
    const canciones = await buscarCancionesDeColeccion(coleccion.id);

    const portadas = [];
    for (const cancion of canciones) {
      if (cancion.foto && portadas.length < 4) {
        portadas.push(cancion.foto);
      }
    }

    lista.push({
      id: coleccion.id,
      nombre: coleccion.nombre,
      descripcion: coleccion.descripcion,
      fecha_creacion: coleccion.fecha_creacion,
      fecha_actualizacion: coleccion.fecha_actualizacion,
      total_canciones: canciones.length,
      portadas,
    });
  }

  return lista;
};

// GET /:id detalle con sus canciones
const obtenerDetalleColeccion = async (usuarioId, coleccionId) => {
  const coleccion = await buscarColeccionDelUsuario(usuarioId, coleccionId);
  const canciones = await buscarCancionesDeColeccion(coleccion.id);

  const listaCanciones = [];

  for (const cancion of canciones) {
    const artistas = await query(
      `SELECT artistas.id, artistas.nombre
       FROM cancion_artistas
       JOIN artistas ON artistas.id = cancion_artistas.artista_id
       WHERE cancion_artistas.cancion_id = $1
       ORDER BY artistas.nombre`,
      [cancion.cancion_id]
    );

    listaCanciones.push({
      cancion_id: cancion.cancion_id,
      titulo: cancion.titulo,
      foto: cancion.foto,
      duracion: cancion.duracion,
      posicion: cancion.posicion,
      fecha_agregado: cancion.fecha_agregado,
      artistas: artistas.rows,
    });
  }

  return {
    id: coleccion.id,
    nombre: coleccion.nombre,
    descripcion: coleccion.descripcion,
    fecha_creacion: coleccion.fecha_creacion,
    fecha_actualizacion: coleccion.fecha_actualizacion,
    total_canciones: listaCanciones.length,
    canciones: listaCanciones,
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

  return {
    id: coleccion.id,
    nombre: coleccion.nombre,
    descripcion: coleccion.descripcion,
    fecha_creacion: coleccion.fecha_creacion,
    fecha_actualizacion: coleccion.fecha_actualizacion,
    total_canciones: 0,
  };
};

// PUT /:id renombrar / cambiar descripción
const actualizarColeccionUsuario = async (usuarioId, coleccionId, datos = {}) => {
  const coleccion = await buscarColeccionDelUsuario(usuarioId, coleccionId);
  const cambios = validarDatosColeccion(datos, { parcial: true });

  if (cambios.nombre === undefined && cambios.descripcion === undefined) {
    throw crearError(400, 'No hay datos para actualizar');
  }

  // Si vino un valor nuevo se usa ese, si no se mantiene el que ya tenía
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

// DELETE /:id (las canciones NO se borran, solo la relación con el usuario y la coleccion)
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

// POST /:id/canciones body { cancionId | (artista + titulo) | mbid }
const agregarCancionAColeccion = async (usuarioId, coleccionId, datos = {}) => {
  const coleccion = await buscarColeccionDelUsuario(usuarioId, coleccionId);
  const cancion = await resolverCancion(datos);

  const existentes = await query(
    'SELECT cancion_id, posicion FROM colecciones_canciones WHERE coleccion_id = $1',
    [coleccion.id]
  );

  // Se fija si la canción ya está y busca la posición más alta para ponerla al final
  let ultimaPosicion = 0;
  for (const fila of existentes.rows) {
    if (fila.cancion_id === cancion.id) {
      throw crearError(409, 'La canción ya está en esta colección');
    }
    if (fila.posicion > ultimaPosicion) {
      ultimaPosicion = fila.posicion;
    }
  }

  try {
    await query(
      `INSERT INTO colecciones_canciones (coleccion_id, cancion_id, posicion)
       VALUES ($1, $2, $3)`,
      [coleccion.id, cancion.id, ultimaPosicion + 1]
    );
  } catch (error) {
    // Dos pedidos al mismo tiempo con la misma canción
    if (error.code === '23505') {
      throw crearError(409, 'La canción ya está en esta colección');
    }
    throw error;
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
    [coleccion.id, cancionId]
  );

  if (resultado.rows.length === 0) {
    throw crearError(404, 'La canción no está en esta colección');
  }

  await query('UPDATE colecciones SET fecha_actualizacion = NOW() WHERE id = $1', [coleccion.id]);

  await registrarActividad({
    usuarioId,
    tipo: 'coleccion_cancion_quitada',
    cancionId,
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