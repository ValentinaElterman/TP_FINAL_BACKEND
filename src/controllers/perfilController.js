const { obtenerPerfil, actualizarPerfil, desactivarCuenta } = require('../services/perfilService');
const { opcionesCookie } = require('./authController');

const obtenerPerfil = async (req, res, next) => {
  try {
    const perfil = await obtenerPerfil(req.usuario.id);
    return res.json({ ok: true, perfil });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ ok: false, mensaje: error.message });
    }

    return next(error);
  }
};

const actualizarPerfil = async (req, res, next) => {
  try {
    const perfilActualizado = await actualizarPerfil(req.usuario.id, req.body);
    return res.json({ ok: true, mensaje: 'Perfil actualizado', perfil: perfilActualizado });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        ok: false,
        mensaje: error.message,
        errores: error.errores || undefined,
      });
    }

    return next(error);
  }
};

const desactivarCuenta = async (req, res, next) => {
  try {
    await desactivarCuenta(req.usuario.id);
    res.clearCookie('token', opcionesCookie());
    return res.json({ ok: true, mensaje: 'Cuenta desactivada' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ ok: false, mensaje: error.message });
    }

    return next(error);
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  desactivarCuenta,
};