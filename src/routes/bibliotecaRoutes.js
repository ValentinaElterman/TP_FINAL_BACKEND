const express = require('express');
const {
  obtenerBiblioteca,
  actualizarBiblioteca,
  toggleFavorita,
  eliminarDeBiblioteca,
} = require('../controllers/bibliotecaController');
const { verificarToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// todo privado
router.use(verificarToken);

router.get('/', obtenerBiblioteca);
router.post('/', actualizarBiblioteca);
router.put('/', actualizarBiblioteca);
router.patch('/:cancionId/favorita', toggleFavorita);
router.delete('/:cancionId', eliminarDeBiblioteca);

module.exports = router;