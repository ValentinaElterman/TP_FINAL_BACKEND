const {
  registrarUsuario,
  loginUsuario,
  obtenerMiPerfil,
  actualizarUsuario,
  eliminarUsuarioCuenta,
} = require('../services/authService');

const opcionesCookie = () => {
  const produccion = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true, // protegida desde el navegador
    secure: produccion, // https
    sameSite: produccion ? 'none' : 'lax', // 'none' si front y back están en dominios distintos
  };
};

// POST /api/auth/registro (creamos el perfil junto con el usuario)
const registrar = async (req, res, next) => {
  try {
    const usuario = await registrarUsuario(req.body);
    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado',
      usuario,
    });
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 409) {
      return res.status(error.statusCode).json({
        ok: false,
        mensaje: error.message,
        errores: error.errores || undefined,
      });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        ok: false,
        mensaje: 'El usuario o el correo ya están registrados',
      });
    }

    return next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const respuesta = await loginUsuario(req.body, res);
    return res.json(respuesta);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        ok: false,
        mensaje: error.message,
      });
    }

    return next(error);
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  const token = req.cookies && req.cookies.token;

  res.clearCookie('token', opcionesCookie());

  if (!token) {
    return res.status(200).json({ ok: true, mensaje: 'No había sesión activa' });
  }

  return res.json({ ok: true, mensaje: 'Sesión cerrada' });
};

// GET /api/auth/me
const me = async (req, res, next) => {
  try {
    const usuario = await obtenerMiPerfil(req.usuario.id);
    return res.json({ ok: true, usuario });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ ok: false, mensaje: error.message });
    }

    return next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const usuarioActualizado = await actualizarUsuario({
      usuarioId: req.usuario.id,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    return res.json({
      ok: true,
      mensaje: 'Usuario actualizado correctamente',
      usuario: usuarioActualizado,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        ok: false,
        mensaje: error.message,
        errores: error.errores || undefined,
      });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        ok: false,
        mensaje: 'El usuario o el correo ya están registrados',
      });
    }

    return next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    await eliminarUsuarioCuenta(req.usuario.id);
    res.clearCookie('token', opcionesCookie());
    return res.json({ ok: true, mensaje: 'Cuenta eliminada correctamente' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ ok: false, mensaje: error.message });
    }

    return next(error);
  }
};

module.exports = {
  registrar,
  login,
  logout,
  me,
  actualizar,
  eliminar,
  opcionesCookie,
};