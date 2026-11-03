const express = require('express');
const {
  obtenerEstadisticas
} = require('../controllers/estadisticasController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// todo privado
router.use(verificarToken);

router.get('/', obtenerEstadisticas);

module.exports = router;