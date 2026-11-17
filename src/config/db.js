const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.on('error', (err) => console.error('Error inesperado en el pool:', err.message));

const query = (text, params) => pool.query(text, params);

const probarConexion = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa a PostgreSQL en:', res.rows[0].now);
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:', error.message);
  }
};

module.exports = {
  pool,
  query,
  probarConexion,
};