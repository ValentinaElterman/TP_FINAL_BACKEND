const rutaNoEncontrada = (req, res, next) => {
  res.status(404).json({
    ok: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

const manejadorErrores = (err, req, res, next) => {
  console.error(err);

  // Los services lanzan errores con statusCode; body-parser/express usan status
  const status = err.statusCode || err.status || 500;

  res.status(status).json({
    ok: false,
    mensaje: status === 500 ? 'Error interno del servidor' : err.message,
    errores: status === 500 ? undefined : err.errores || undefined,
  });
};

module.exports = { rutaNoEncontrada, manejadorErrores };
