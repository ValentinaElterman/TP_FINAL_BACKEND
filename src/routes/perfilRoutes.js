const express = require('express');
const {
  obtenerPerfil,
  actualizarPerfil,
  desactivarCuenta,
  obtenerActividad,
} = require('../controllers/perfilController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// todo privado
router.use(verificarToken);

router.get('/', obtenerPerfil);
router.put('/', actualizarPerfil);
router.delete('/', desactivarCuenta);
router.get('/actividad', obtenerActividad);

module.exports = router;
