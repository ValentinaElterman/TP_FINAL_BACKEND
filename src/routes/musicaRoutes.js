const express = require('express');
const {
  obtenerMusica,
  crearMusica,
  obtenerDetalleMusica,
  registrarReproduccion,
} = require('../controllers/musicaController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// todo privado
router.use(verificarToken);

router.get('/', obtenerMusica);
router.post('/', crearMusica);
router.get('/:id', obtenerDetalleMusica);
router.post('/:id/reproducciones', registrarReproduccion);

module.exports = router;
