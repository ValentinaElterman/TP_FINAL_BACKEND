const { query } = require('../config/db');
const { resolverCancion } = require('./musicaService');
const { registrarActividad } = require('./actividadService');

const ESTADOS_VALIDOS = ['quiero_escuchar', 'escuchando', 'escuchado'];

const crearError = (statusCode, mensaje, errores) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  if (errores) error.errores = errores;
  return error;
};

const esIdValido = (valor) => Number.isInteger(Number(valor)) && Number(valor) > 0;

// Convierte "true"/"false"/true/false en booleano. Devuelve undefined si no vino.
const parsearBooleano = (valor, nombre) => {
  if (valor === undefined || valor === null || valor === '') return undefined;
  if (valor === true || valor === 'true' || valor === '1' || valor === 1) return true;
  if (valor === false || valor === 'false' || valor === '0' || valor === 0) return false;
  throw crearError(400, `${nombre} debe ser true o false`);
};

const ORDENES = {
  fecha: 'b.fecha_agregado',
  actualizacion: 'b.fecha_actualizacion',
  titulo: 'c.titulo',
  puntuacion: 'p.valor',
};

const SELECT_ITEM = `
  SELECT
    b.id,
    b.cancion_id,
    b.estado,
    b.es_favorita,
    b.fecha_agregado,
    b.fecha_actualizacion,
    c.titulo,
    c.foto,
    c.duracion,
    (
      SELECT json_agg(json_build_object('id', a.id, 'nombre', a.nombre) ORDER BY a.nombre)
      FROM cancion_artistas ca JOIN artistas a ON a.id = ca.artista_id
      WHERE ca.cancion_id = c.id
    ) AS artistas,
    (
      SELECT json_agg(g.nombre ORDER BY g.nombre)
      FROM cancion_generos cg JOIN generos g ON g.id = cg.genero_id
      WHERE cg.cancion_id = c.id
    ) AS generos,
    p.valor AS puntuacion,
    (r.id IS NOT NULL) AS tiene_resena`;

const FROM_ITEM = `
  FROM biblioteca b
  JOIN canciones c ON c.id = b.cancion_id
  LEFT JOIN puntuaciones p ON p.cancion_id = b.cancion_id AND p.usuario_id = b.usuario_id
  LEFT JOIN "reseñas" r ON r.cancion_id = b.cancion_id AND r.usuario_id = b.usuario_id`;

// json_agg devuelve NULL si no hay filas: lo normalizamos a lista vacía
const armarItem = (fila) => ({
  id: fila.id,
  cancion_id: fila.cancion_id,
  estado: fila.estado,
  es_favorita: fila.es_favorita,
  fecha_agregado: fila.fecha_agregado,
  fecha_actualizacion: fila.fecha_actualizacion,
  titulo: fila.titulo,
  foto: fila.foto,
  duracion: fila.duracion,
  artistas: fila.artistas || [],
  generos: fila.generos || [],
  puntuacion: fila.puntuacion,
  tiene_resena: fila.tiene_resena,
});

// ---------------------------------------------------------------------
// LISTAR con filtros: estado, favorita, genero, q (título/artista), puntuacion
// ---------------------------------------------------------------------
const obtenerBibliotecaUsuario = async (usuarioId, filtros = {}) => {
  const { estado, favorita, genero, q, puntuacion, orden, dir, limite, pagina } = filtros;

  const condiciones = ['b.usuario_id = $1'];
  const valores = [usuarioId];

  if (estado !== undefined && estado !== '') {
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw crearError(400, `Estado inválido. Opciones: ${ESTADOS_VALIDOS.join(', ')}`);
    }
    valores.push(estado);
    condiciones.push(`b.estado = $${valores.length}`);
  }

  const soloFavoritas = parsearBooleano(favorita, 'favorita');
  if (soloFavoritas !== undefined) {
    valores.push(soloFavoritas);
    condiciones.push(`b.es_favorita = $${valores.length}`);
  }

  if (genero) {
    valores.push(String(genero).trim().toLowerCase());
    condiciones.push(
      `EXISTS (
         SELECT 1 FROM cancion_generos cg JOIN generos g ON g.id = cg.genero_id
         WHERE cg.cancion_id = b.cancion_id AND g.nombre = $${valores.length}
       )`
    );
  }

  if (puntuacion !== undefined && puntuacion !== '') {
    const valor = Number(puntuacion);
    if (!Number.isInteger(valor) || valor < 1 || valor > 5) {
      throw crearError(400, 'La puntuación a filtrar debe ser un entero entre 1 y 5');
    }
    valores.push(valor);
    condiciones.push(`p.valor = $${valores.length}`);
  }

  if (q && String(q).trim()) {
    const patron = `%${String(q).trim().replace(/[%_\\]/g, '\\$&')}%`;
    valores.push(patron);
    condiciones.push(
      `(c.titulo ILIKE $${valores.length} OR EXISTS (
         SELECT 1 FROM cancion_artistas ca JOIN artistas a ON a.id = ca.artista_id
         WHERE ca.cancion_id = c.id AND a.nombre ILIKE $${valores.length}
       ))`
    );
  }

  const ordenElegido = orden || 'fecha';
  if (!ORDENES[ordenElegido]) {
    throw crearError(400, `Orden inválido. Opciones: ${Object.keys(ORDENES).join(', ')}`);
  }
  const direccion = String(dir || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const limiteNum = Math.min(Math.max(parseInt(limite, 10) || 50, 1), 100);
  const paginaNum = Math.max(parseInt(pagina, 10) || 1, 1);
  valores.push(limiteNum, (paginaNum - 1) * limiteNum);

  const resultado = await query(
    `${SELECT_ITEM},
       COUNT(*) OVER()::int AS total
     ${FROM_ITEM}
     WHERE ${condiciones.join(' AND ')}
     ORDER BY ${ORDENES[ordenElegido]} ${direccion} NULLS LAST, b.id DESC
     LIMIT $${valores.length - 1} OFFSET $${valores.length}`,
    valores
  );

  const total = resultado.rows[0]?.total || 0;
  const items = resultado.rows.map(armarItem);

  return { total, pagina: paginaNum, limite: limiteNum, items };
};

const obtenerItemBiblioteca = async (usuarioId, cancionId) => {
  const resultado = await query(
    `${SELECT_ITEM}
     ${FROM_ITEM}
     WHERE b.usuario_id = $1 AND b.cancion_id = $2`,
    [usuarioId, cancionId]
  );
  return resultado.rows[0] ? armarItem(resultado.rows[0]) : null;
};

// ---------------------------------------------------------------------
// AGREGAR / ACTUALIZAR (upsert). Sirve para POST y PUT.
// body: { cancionId | (artista + titulo) | mbid, estado?, es_favorita? }
// ---------------------------------------------------------------------
const guardarEnBiblioteca = async (usuarioId, datos = {}) => {
  const { estado } = datos;
  const esFavorita = parsearBooleano(datos.es_favorita ?? datos.esFavorita, 'es_favorita');

  if (estado !== undefined && !ESTADOS_VALIDOS.includes(estado)) {
    throw crearError(400, `Estado inválido. Opciones: ${ESTADOS_VALIDOS.join(', ')}`);
  }

  const cancion = await resolverCancion(datos);

  const previo = await query(
    'SELECT estado, es_favorita FROM biblioteca WHERE usuario_id = $1 AND cancion_id = $2',
    [usuarioId, cancion.id]
  );
  const existia = previo.rows.length > 0;

  await query(
    `INSERT INTO biblioteca (usuario_id, cancion_id, estado, es_favorita)
     VALUES ($1, $2, COALESCE($3::varchar, 'quiero_escuchar'), COALESCE($4::boolean, FALSE))
     ON CONFLICT (usuario_id, cancion_id) DO UPDATE SET
       estado = COALESCE($3::varchar, biblioteca.estado),
       es_favorita = COALESCE($4::boolean, biblioteca.es_favorita),
       fecha_actualizacion = NOW()`,
    [usuarioId, cancion.id, estado ?? null, esFavorita ?? null]
  );

  await registrarActividad({
    usuarioId,
    tipo: existia ? 'biblioteca_actualizada' : 'biblioteca_agregada',
    cancionId: cancion.id,
    detalles: { estado: estado ?? previo.rows[0]?.estado ?? 'quiero_escuchar', es_favorita: esFavorita },
  });

  const item = await obtenerItemBiblioteca(usuarioId, cancion.id);
  return { item, creado: !existia };
};

// ---------------------------------------------------------------------
// FAVORITA (toggle, o valor explícito si viene en el body)
// ---------------------------------------------------------------------
const alternarFavorita = async (usuarioId, cancionId, valorExplicito) => {
  if (!esIdValido(cancionId)) {
    throw crearError(400, 'Id de canción inválido');
  }

  const explicito = parsearBooleano(valorExplicito, 'es_favorita');
  const cancion = await resolverCancion({ cancionId });

  // Si todavía no estaba en la biblioteca, se agrega ya como favorita
  await query(
    `INSERT INTO biblioteca (usuario_id, cancion_id, es_favorita)
     VALUES ($1, $2, COALESCE($3::boolean, TRUE))
     ON CONFLICT (usuario_id, cancion_id) DO UPDATE SET
       es_favorita = COALESCE($3::boolean, NOT biblioteca.es_favorita),
       fecha_actualizacion = NOW()`,
    [usuarioId, cancion.id, explicito ?? null]
  );

  const item = await obtenerItemBiblioteca(usuarioId, cancion.id);

  await registrarActividad({
    usuarioId,
    tipo: item.es_favorita ? 'favorita_agregada' : 'favorita_quitada',
    cancionId: cancion.id,
  });

  return item;
};

// ---------------------------------------------------------------------
// QUITAR de la biblioteca (no borra la canción del catálogo compartido)
// ---------------------------------------------------------------------
const quitarDeBiblioteca = async (usuarioId, cancionId) => {
  if (!esIdValido(cancionId)) {
    throw crearError(400, 'Id de canción inválido');
  }

  const resultado = await query(
    'DELETE FROM biblioteca WHERE usuario_id = $1 AND cancion_id = $2 RETURNING cancion_id',
    [usuarioId, Number(cancionId)]
  );

  if (resultado.rows.length === 0) {
    throw crearError(404, 'La canción no está en tu biblioteca');
  }

  await registrarActividad({
    usuarioId,
    tipo: 'biblioteca_quitada',
    cancionId: Number(cancionId),
  });

  return true;
};

module.exports = {
  obtenerBibliotecaUsuario,
  guardarEnBiblioteca,
  alternarFavorita,
  quitarDeBiblioteca,
};