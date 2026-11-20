const {
  obtenerBibliotecaUsuario,
  guardarEnBiblioteca,
  alternarFavorita,
  quitarDeBiblioteca,
} = require('../services/bibliotecaService');

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

// GET /api/biblioteca?estado=&favorita=&genero=&q=&puntuacion=&orden=&dir=
// (los favoritos son GET /api/biblioteca?favorita=true)
const obtenerBiblioteca = async (req, res, next) => {
  try {
    const biblioteca = await obtenerBibliotecaUsuario(req.usuario.id, req.query);
    return res.json({ ok: true, ...biblioteca });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// POST /api/biblioteca  y  PUT /api/biblioteca
// body: { cancionId | artista + titulo | mbid, estado?, es_favorita? }
const actualizarBiblioteca = async (req, res, next) => {
  try {
    const { item, creado } = await guardarEnBiblioteca(req.usuario.id, req.body);
    return res.status(creado ? 201 : 200).json({
      ok: true,
      mensaje: creado ? 'Canción agregada a tu biblioteca' : 'Biblioteca actualizada',
      item,
    });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// PATCH /api/biblioteca/:cancionId/favorita   (body opcional: { es_favorita: true|false })
const toggleFavorita = async (req, res, next) => {
  try {
    const item = await alternarFavorita(
      req.usuario.id,
      req.params.cancionId,
      req.body ? req.body.es_favorita : undefined
    );
    return res.json({
      ok: true,
      mensaje: item.es_favorita ? 'Agregada a favoritos' : 'Quitada de favoritos',
      item,
    });
  } catch (error) {
    return responderError(error, res, next);
  }
};

// DELETE /api/biblioteca/:cancionId
const eliminarDeBiblioteca = async (req, res, next) => {
  try {
    await quitarDeBiblioteca(req.usuario.id, req.params.cancionId);
    return res.json({ ok: true, mensaje: 'Canción quitada de tu biblioteca' });
  } catch (error) {
    return responderError(error, res, next);
  }
};

module.exports = {
  obtenerBiblioteca,
  actualizarBiblioteca,
  toggleFavorita,
  eliminarDeBiblioteca,
};