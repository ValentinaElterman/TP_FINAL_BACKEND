const express = require('express');
const {
  obtenerPerfil,
  actualizarPerfil,
  desactivarCuenta,
} = require('../controllers/perfilController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// todo privado
router.use(verificarToken);

router.get('/', obtenerPerfil);
router.put('/', actualizarPerfil);
router.delete('/', desactivarCuenta);

module.exports = router;