const express = require('express');
const { registrar, login, logout, me } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

//publicas
router.post('/registro', registrar);
router.post('/login', login);
router.post('/logout', logout);
//privada
router.get('/me', verificarToken, me);

module.exports = router;