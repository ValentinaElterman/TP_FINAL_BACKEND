const express = require('express');
const {
  obtenerMusica,
  crearMusica,
  actualizarMusica,
  eliminarMusica
} = require('../controllers/musicaController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// todo privado
router.use(verificarToken);

router.get('/', obtenerMusica);
router.post('/', crearMusica);
router.put('/:id', actualizarMusica);
router.delete('/:id', eliminarMusica);

module.exports = router;