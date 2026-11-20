const {
  obtenerResenasUsuario,
  crearResenaUsuario,
  actualizarResenaUsuario,
  eliminarResenaUsuario,
} = require('../services/resenasService');

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

// GET /api/resenas
const obtenerResenas = async (req, res, next) => {
  try {
    const resenas = await obtenerResenasUsuario(req.usuario.id, req.query);
    return res.json({ ok: true, resenas });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// POST /api/resenas   body: { cancionId | artista + titulo | mbid, texto }
const crearResena = async (req, res, next) => {
  try {
    const resena = await crearResenaUsuario(req.usuario.id, req.body);
    return res.status(201).json({ ok: true, mensaje: 'Reseña guardada', resena });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// PUT /api/resenas/:id   body: { texto }
const actualizarResena = async (req, res, next) => {
  try {
    const resena = await actualizarResenaUsuario(req.usuario.id, req.params.id, req.body);
    return res.json({ ok: true, mensaje: 'Reseña actualizada', resena });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// DELETE /api/resenas/:id
const eliminarResena = async (req, res, next) => {
  try {
    await eliminarResenaUsuario(req.usuario.id, req.params.id);
    return res.json({ ok: true, mensaje: 'Reseña eliminada' });
  } catch (error) {
    return responderError(error, res, next);
  }
};

module.exports = {
  obtenerResenas,
  crearResena,
  actualizarResena,
  eliminarResena,
};
