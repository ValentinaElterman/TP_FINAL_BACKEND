const { query } = require('../config/db');
const { opcionesCookie } = require('./authController');

const esObjetoPlano = (valor) =>
  valor !== null &&
  !Array.isArray(valor) &&
  Object.prototype.toString.call(valor) === '[object Object]';

// GET /api/perfil 
const obtenerPerfil = async (req, res, next) => {
  try {
    const resultado = await query(
      `SELECT u.id, u.username, u.email, p.nombre, p.foto, p.bio, p.preferencias
       FROM usuarios u
       JOIN perfiles p ON p.usuario_id = u.id
       WHERE u.id = $1`,
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Perfil no encontrado' });
    }
    res.json({ ok: true, perfil: resultado.rows[0] });
  } catch (error) {
    next(error);
  }
};

// PUT /api/perfil  
const actualizarPerfil = async (req, res, next) => {
  try {
    const actual = await query(
      'SELECT nombre, foto, bio, preferencias FROM perfiles WHERE usuario_id = $1',
      [req.usuario.id]
    );
    if (actual.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Perfil no encontrado' });
    }

    let { nombre, foto, bio, preferencias } = actual.rows[0];
    const errores = [];

    if (req.body.nombre !== undefined) {
      nombre = String(req.body.nombre).trim();
      if (nombre.length < 5 || nombre.length > 20) {
        errores.push('El nombre debe tener entre 5 y 20 caracteres');
      }
    }

    if (req.body.foto !== undefined) {
      foto = String(req.body.foto || '').trim();
      if (foto === '') {
        foto = null;
      } else if (!/^https?:\/\/\S+$/i.test(foto) || foto.length > 500) {
        errores.push('La foto debe ser una URL válida');
      }
    }

    if (req.body.bio !== undefined) {
      bio = String(req.body.bio || '').trim();
      if (bio.length > 200) errores.push('La bio no puede superar los 200 caracteres');
      if (bio === '') bio = null;
    }

    if (req.body.preferencias !== undefined) {
      const pref = req.body.preferencias;
      if (!esObjetoPlano(pref)) {
        errores.push('Las preferencias deben ser un objeto');
      } else {
        preferencias = pref;
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
    }

    const resultado = await query(
      `UPDATE perfiles
       SET nombre = $1, foto = $2, bio = $3, preferencias = $4
       WHERE usuario_id = $5
       RETURNING usuario_id, nombre, foto, bio, preferencias`,
      [nombre, foto, bio, JSON.stringify(preferencias), req.usuario.id]
    );

    res.json({ ok: true, mensaje: 'Perfil actualizado', perfil: resultado.rows[0] });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/perfil
const desactivarCuenta = async (req, res, next) => {
  try {
    await query('UPDATE usuarios SET activo = FALSE WHERE id = $1', [req.usuario.id]);
    res.clearCookie('token', opcionesCookie());
    res.json({ ok: true, mensaje: 'Cuenta desactivada' });
  } catch (error) {
    next(error);
  }
};

module.exports = { obtenerPerfil, actualizarPerfil, desactivarCuenta };