const {
  buscarMusica,
  importarMusica,
  obtenerDetalleMusica,
  registrarReproduccion: registrarReproduccionService,
} = require('../services/musicaService');

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

// GET /api/musica?q=&orden=relevancia|oyentes|titulo|artista&dir=asc|desc&artista=&minOyentes=&limite=
// Explorar: busca en Last.fm
const obtenerMusica = async (req, res, next) => {
  try {
    const resultados = await buscarMusica(req.usuario.id, req.query);
    return res.json({ ok: true, total: resultados.length, resultados });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// POST /api/musica   body: { artista, titulo } o { mbid }
// Trae la canción de Last.fm y la guarda en el catálogo (devuelve el id local para ir al detalle)
const crearMusica = async (req, res, next) => {
  try {
    const cancion = await importarMusica(req.body);
    return res.status(201).json({ ok: true, cancion });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// GET /api/musica/:id  -> detalle + lo que el usuario hizo con esa canción
const obtenerDetalleMusicaController = async (req, res, next) => {
  try {
    const cancion = await obtenerDetalleMusica(req.usuario.id, req.params.id);
    return res.json({ ok: true, cancion });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// POST /api/musica/:id/reproducciones   body: { segundos_escuchados?, completada?, fuente? }
const registrarReproduccion = async (req, res, next) => {
  try {
    const reproduccion = await registrarReproduccionService(
      req.usuario.id,
      req.params.id,
      req.body
    );
    return res.status(201).json({ ok: true, mensaje: 'Reproducción registrada', reproduccion });
  } catch (error) {
    return responderError(error, res, next);
  }
};

module.exports = {
  obtenerMusica,
  crearMusica,
  obtenerDetalleMusica: obtenerDetalleMusicaController,
  registrarReproduccion,
};
