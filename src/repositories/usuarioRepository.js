const { query } = require('../config/db');

const buscarUsuarioPorEmail = async (email) => {
  const resultado = await query(
    'SELECT id, username, email, password, activo FROM usuarios WHERE email = $1',
    [email]
  );

  return resultado.rows[0] || null;
};

const buscarUsuarioPorUsername = async (username) => {
  const resultado = await query(
    'SELECT id, username, email FROM usuarios WHERE username = $1',
    [username]
  );

  return resultado.rows[0] || null;
};

const buscarUsuarioPorEmailOUsername = async (email, username) => {
  const resultado = await query(
    'SELECT 1 FROM usuarios WHERE email = $1 OR username = $2',
    [email, username]
  );

  return resultado.rows.length > 0;
};

const obtenerUsuarioPorId = async (id) => {
  const resultado = await query(
    `SELECT u.id, u.username, u.email, p.nombre, p.foto, p.bio, p.preferencias
     FROM usuarios u
     LEFT JOIN perfiles p ON p.usuario_id = u.id
     WHERE u.id = $1`,
    [id]
  );

  return resultado.rows[0] || null;
};

const crearUsuario = async ({ username, email, password }) => {
  await query('BEGIN');

  try {
    const resUsuario = await query(
      `INSERT INTO usuarios (username, email, password, activo)
       VALUES ($1, $2, $3, TRUE)
       RETURNING id, username, email`,
      [username, email, password]
    );

    const usuarioCreado = resUsuario.rows[0];

    await query(
      `INSERT INTO perfiles (usuario_id, nombre)
       VALUES ($1, $2)`,
      [usuarioCreado.id, usuarioCreado.username]
    );

    await query('COMMIT');
    return usuarioCreado;
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
};

const verificarUsuarioExistente = async (usuarioId, campo, valor) => {
  const queryText = campo === 'username'
    ? 'SELECT id FROM usuarios WHERE username = $1 AND id != $2'
    : 'SELECT id FROM usuarios WHERE email = $1 AND id != $2';

  const resultado = await query(queryText, [valor, usuarioId]);
  return resultado.rows.length > 0;
};

const actualizarUsuario = async ({ id, username, email, password }) => {
  const updates = [];
  const values = [];
  let index = 1;

  if (username !== undefined) {
    updates.push(`username = $${index}`);
    values.push(username);
    index += 1;
  }

  if (email !== undefined) {
    updates.push(`email = $${index}`);
    values.push(email);
    index += 1;
  }

  if (password !== undefined) {
    updates.push(`password = $${index}`);
    values.push(password);
    index += 1;
  }

  if (updates.length === 0) {
    return null;
  }

  values.push(id);
  const queryText = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${index} RETURNING id, username, email`;

  const resultado = await query(queryText, values);
  return resultado.rows[0] || null;
};

const eliminarUsuario = async (usuarioId) => {
  const resultado = await query(
    'DELETE FROM usuarios WHERE id = $1 RETURNING id',
    [usuarioId]
  );

  return resultado.rows[0] || null;
};

module.exports = {
  buscarUsuarioPorEmail,
  buscarUsuarioPorUsername,
  buscarUsuarioPorEmailOUsername,
  obtenerUsuarioPorId,
  crearUsuario,
  verificarUsuarioExistente,
  actualizarUsuario,
  eliminarUsuario,
};
