const {
  obtenerPerfil: obtenerPerfilService,
  actualizarPerfil: actualizarPerfilService,
  desactivarCuenta: desactivarCuentaService,
} = require('../services/perfilService');
const { obtenerActividad: obtenerActividadService } = require('../services/actividadService');
const { opcionesCookie } = require('./authController');

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

// GET /api/perfil
const obtenerPerfil = async (req, res, next) => {
  try {
    const perfil = await obtenerPerfilService(req.usuario.id);
    return res.json({ ok: true, perfil });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// PUT /api/perfil
const actualizarPerfil = async (req, res, next) => {
  try {
    const perfilActualizado = await actualizarPerfilService(req.usuario.id, req.body);
    return res.json({ ok: true, mensaje: 'Perfil actualizado', perfil: perfilActualizado });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// DELETE /api/perfil (desactiva la cuenta)
const desactivarCuenta = async (req, res, next) => {
  try {
    await desactivarCuentaService(req.usuario.id);
    res.clearCookie('token', opcionesCookie());
    return res.json({ ok: true, mensaje: 'Cuenta desactivada' });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// GET /api/perfil/actividad?limite=20
const obtenerActividad = async (req, res, next) => {
  try {
    const actividad = await obtenerActividadService(req.usuario.id, req.query);
    return res.json({ ok: true, actividad });
  } catch (error) {
    return responderError(error, res, next);
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  desactivarCuenta,
  obtenerActividad,
};
