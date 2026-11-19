const express = require('express');
const { registrar, login, logout, me, actualizar, eliminar } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// publicas
router.post('/registro', registrar);
router.post('/login', login);
router.post('/logout', logout);

// privadas
router.get('/me', verificarToken, me);
router.put('/actualizar', verificarToken, actualizar);
router.delete('/eliminar', verificarToken, eliminar);

module.exports = router;