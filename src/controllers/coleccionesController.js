const {
  obtenerColeccionesUsuario,
  obtenerDetalleColeccion,
  crearColeccionUsuario,
  actualizarColeccionUsuario,
  eliminarColeccionUsuario,
  agregarCancionAColeccion,
  quitarCancionDeColeccion,
} = require('../services/coleccionesService');

const responderError = (error, res, next) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      ok: false,
      mensaje: error.message,
      errores: error.errores || undefined,
    });
  }
  return next(error);
};

// GET /api/colecciones
const obtenerColecciones = async (req, res, next) => {
  try {
    const colecciones = await obtenerColeccionesUsuario(req.usuario.id);
    return res.json({ ok: true, colecciones });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// GET /api/colecciones/:id
const obtenerColeccion = async (req, res, next) => {
  try {
    const coleccion = await obtenerDetalleColeccion(req.usuario.id, req.params.id);
    return res.json({ ok: true, coleccion });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// POST /api/colecciones   body: { nombre, descripcion? } ? es que son opcionales
const crearColeccion = async (req, res, next) => {
  try {
    const coleccion = await crearColeccionUsuario(req.usuario.id, req.body);
    return res.status(201).json({ ok: true, mensaje: 'Colección creada', coleccion });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// PUT /api/colecciones/:id   body: { nombre?, descripcion? }
const actualizarColeccion = async (req, res, next) => {
  try {
    const coleccion = await actualizarColeccionUsuario(req.usuario.id, req.params.id, req.body);
    return res.json({ ok: true, mensaje: 'Colección actualizada', coleccion });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// DELETE /api/colecciones/:id
const eliminarColeccion = async (req, res, next) => {
  try {
    await eliminarColeccionUsuario(req.usuario.id, req.params.id);
    return res.json({ ok: true, mensaje: 'Colección eliminada' });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// POST /api/colecciones/:id/canciones   body: { cancionId | artista + titulo | mbid }
const agregarCancion = async (req, res, next) => {
  try {
    const coleccion = await agregarCancionAColeccion(req.usuario.id, req.params.id, req.body);
    return res.status(201).json({ ok: true, mensaje: 'Canción agregada a la colección', coleccion });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// DELETE /api/colecciones/:id/canciones/:cancionId
const quitarCancion = async (req, res, next) => {
  try {
    const coleccion = await quitarCancionDeColeccion(
      req.usuario.id,
      req.params.id,
      req.params.cancionId
    );
    return res.json({ ok: true, mensaje: 'Canción quitada de la colección', coleccion });
  } catch (error) {
    return responderError(error, res, next);
  }
};

module.exports = {
  obtenerColecciones,
  obtenerColeccion,
  crearColeccion,
  actualizarColeccion,
  eliminarColeccion,
  agregarCancion,
  quitarCancion,
};
