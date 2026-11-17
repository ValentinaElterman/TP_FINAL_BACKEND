const express = require('express');
const {
  obtenerResenas,
  crearReseña,
  actualizarReseña,
  eliminarReseña
} = require('../controllers/resenasController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// todo privado
router.use(verificarToken);

router.get('/', obtenerResenas);
router.post('/', crearReseña);
router.put('/:id', actualizarReseña);
router.delete('/:id', eliminarReseña);

module.exports = router;