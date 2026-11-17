const express = require('express');
const {
    obtenerBiblioteca,
    actualizarBiblioteca
} = require('../controllers/bibliotecaController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// todo privado
router.use(verificarToken);

router.get('/', obtenerBiblioteca);
router.put('/', actualizarBiblioteca);

module.exports = router;