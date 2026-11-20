const { calcularEstadisticasUsuario } = require('../services/estadisticasCalcular');

const obtenerEstadisticas = async (req, res, next) => {
  try {
    const estadisticas = await calcularEstadisticasUsuario(req.usuario.id);

    return res.json({
      ok: true,
      estadisticas,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        ok: false,
        mensaje: error.message,
      });
    }

    next(error);
  }
};

module.exports = {
  obtenerEstadisticas,
};