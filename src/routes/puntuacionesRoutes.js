const express = require('express');
const {
  obtenerPuntuaciones,
  crearPuntuacion,
  actualizarPuntuacion,
  eliminarPuntuacion
} = require('../controllers/puntuacionesController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// todo privado
router.use(verificarToken);

router.get('/', obtenerPuntuaciones);
router.post('/', crearPuntuacion);
router.put('/:id', actualizarPuntuacion);
router.delete('/:id', eliminarPuntuacion);

module.exports = router;