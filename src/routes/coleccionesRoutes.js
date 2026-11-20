const express = require('express');
const {
  obtenerColecciones,
  obtenerColeccion,
  crearColeccion,
  actualizarColeccion,
  eliminarColeccion,
  agregarCancion,
  quitarCancion,
} = require('../controllers/coleccionesController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// todo privado
router.use(verificarToken);

router.get('/', obtenerColecciones);
router.post('/', crearColeccion);
router.get('/:id', obtenerColeccion);
router.put('/:id', actualizarColeccion);
router.delete('/:id', eliminarColeccion);
router.post('/:id/canciones', agregarCancion);
router.delete('/:id/canciones/:cancionId', quitarCancion);

module.exports = router;