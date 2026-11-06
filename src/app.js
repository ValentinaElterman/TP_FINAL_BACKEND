const express = require('express');
const cors = require('cors');
const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/errorMiddlewares');

const app = express();
const cookieParser = require('cookie-parser');

const origenesPermitidos = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

app.use(
  cors({
    origin: origenesPermitidos,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser())

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'API de VASAS funcionando' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/perfil', require('./routes/perfilRoutes'));
app.use('/api/musica', require('./routes/musicaRoutes'));
app.use('/api/biblioteca', require('./routes/bibliotecaRoutes'));
app.use('/api/puntuaciones', require('./routes/puntuacionesRoutes'));
app.use('/api/resenas', require('./routes/reseñasRoutes'));
app.use('/api/colecciones', require('./routes/coleccionesRoutes'));
app.use('/api/estadisticas', require('./routes/estadisticasRoutes'));

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

module.exports = app;