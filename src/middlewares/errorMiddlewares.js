const rutaNoEncontrada = (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

// error con (err) 
const manejadorErrores = (err, req, res, next) => {
  // JSON mal escrito en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El JSON enviado no es válido' });
  }

  // errores de PostgreSQL (traen un código en err)
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Se hace referencia a un dato que no existe' });
  }
  if (err.code === '23502' || err.code === '23514' || err.code === '22P02') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  // Errores de JWT
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'La sesión venció, volvé a iniciar sesión' });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  const status = err.status || 500;
  console.error(err);
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : err.message,
  });
};

module.exports = { rutaNoEncontrada, manejadorErrores };