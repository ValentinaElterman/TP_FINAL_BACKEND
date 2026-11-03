const express = require('express');
const {
  obtenerReseñas,
  crearReseña,
  actualizarReseña,
  eliminarReseña
} = require('../controllers/reseñasController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// todo privado
router.use(verificarToken);

router.get('/', obtenerReseñas);
router.post('/', crearReseña);
router.put('/:id', actualizarReseña);
router.delete('/:id', eliminarReseña);

module.exports = router;