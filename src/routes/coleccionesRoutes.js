const express = require('express');
const {
  obtenerColecciones,
  crearColeccion,
  actualizarColeccion,
  eliminarColeccion
} = require('../controllers/coleccionesController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// todo privado
router.use(verificarToken);

router.get('/', obtenerColecciones);
router.post('/', crearColeccion);
router.put('/:id', actualizarColeccion);
router.delete('/:id', eliminarColeccion);

module.exports = router;