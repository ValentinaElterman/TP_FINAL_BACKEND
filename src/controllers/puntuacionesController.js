const {
  obtenerPuntuacionesUsuario,
  crearPuntuacionUsuario,
  actualizarPuntuacionUsuario,
  eliminarPuntuacionUsuario,
} = require('../services/puntuacionService');

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

// GET /api/puntuaciones
const obtenerPuntuaciones = async (req, res, next) => {
  try {
    const puntuaciones = await obtenerPuntuacionesUsuario(req.usuario.id, req.query);
    return res.json({ ok: true, puntuaciones });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// POST /api/puntuaciones   body: { cancionId | artista + titulo | mbid, valor }
const crearPuntuacion = async (req, res, next) => {
  try {
    const puntuacion = await crearPuntuacionUsuario(req.usuario.id, req.body);
    return res.status(201).json({ ok: true, mensaje: 'Puntuación guardada', puntuacion });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// PUT /api/puntuaciones/:id   body: { valor }
const actualizarPuntuacion = async (req, res, next) => {
  try {
    const puntuacion = await actualizarPuntuacionUsuario(req.usuario.id, req.params.id, req.body);
    return res.json({ ok: true, mensaje: 'Puntuación actualizada', puntuacion });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// DELETE /api/puntuaciones/:id
const eliminarPuntuacion = async (req, res, next) => {
  try {
    await eliminarPuntuacionUsuario(req.usuario.id, req.params.id);
    return res.json({ ok: true, mensaje: 'Puntuación eliminada' });
  } catch (error) {
    return responderError(error, res, next);
  }
};

module.exports = {
  obtenerPuntuaciones,
  crearPuntuacion,
  actualizarPuntuacion,
  eliminarPuntuacion,
};
