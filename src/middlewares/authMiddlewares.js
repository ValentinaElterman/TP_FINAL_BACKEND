const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const verificarToken = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) {
      return res.status(401).json({ ok: false, mensaje: 'No autenticado' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      const vencido = error.name === 'TokenExpiredError';
      return res.status(401).json({
        ok: false,
        mensaje: vencido ? 'La sesión venció, iniciá sesión de nuevo' : 'Token inválido',
      });
    }

    const resultado = await query(
      'SELECT id, username, activo FROM usuarios WHERE id = $1',
      [payload.id]
    );
    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: 'Usuario no válido' });
    }

    if (!usuario.activo) {
      return res.status(401).json({ ok: false, mensaje: 'Usuario no válido' });
    }

    req.usuario = { id: usuario.id, username: usuario.username };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verificarToken };