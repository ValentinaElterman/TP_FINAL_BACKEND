const express = require('express');
const {
  obtenerResenas,
  crearResena,
  actualizarResena,
  eliminarResena,
} = require('../controllers/resenasController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// todo privado
router.use(verificarToken);

router.get('/', obtenerResenas);
router.post('/', crearResena);
router.put('/:id', actualizarResena);
router.delete('/:id', eliminarResena);

module.exports = router;
