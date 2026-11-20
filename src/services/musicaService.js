const { query } = require('../config/db');
const {
  buscarCancionesExterno,
  obtenerCancionExterna,
  guardarObtenerCancionLocal,
} = require('./apiService');
const { registrarActividad } = require('./actividadService');

const crearError = (statusCode, mensaje, errores) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  if (errores) error.errores = errores;
  return error;
};

const esIdValido = (valor) => Number.isInteger(Number(valor)) && Number(valor) > 0;

// Si Last.fm falla devolvemos 502 en vez de un 500 genérico
const conErrorExterno = async (fn) => {
  try {
    return await fn();
  } catch (error) {
    if (error.statusCode) throw error;
    console.error('Error consultando Last.fm:', error.message);
    throw crearError(502, 'No se pudo consultar Last.fm, intentá de nuevo en un momento');
  }
};

const ORDENES_VALIDOS = ['relevancia', 'oyentes', 'titulo', 'artista'];

// EXPLORAR: búsqueda por texto en Last.fm + filtros / orden
const buscarMusica = async (usuarioId, { q, orden, dir, artista, minOyentes, limite } = {}) => {
  const texto = String(q || '').trim();
  if (texto.length < 2) {
    throw crearError(400, 'Escribí al menos 2 caracteres para buscar');
  }

  const ordenElegido = orden ? String(orden).toLowerCase() : 'relevancia';
  if (!ORDENES_VALIDOS.includes(ordenElegido)) {
    throw crearError(400, `Orden inválido. Opciones: ${ORDENES_VALIDOS.join(', ')}`);
  }

  const limiteNum = Math.min(Math.max(parseInt(limite, 10) || 20, 1), 50);

  let resultados = await conErrorExterno(() => buscarCancionesExterno(texto, limiteNum));

  // Filtros
  const filtroArtista = String(artista || '').trim().toLowerCase();
  if (filtroArtista) {
    resultados = resultados.filter((t) => String(t.artista || '').toLowerCase().includes(filtroArtista));
  }

  const minimo = Number(minOyentes);
  if (minOyentes !== undefined && minOyentes !== '' && Number.isFinite(minimo) && minimo > 0) {
    resultados = resultados.filter((t) => t.oyentes >= minimo);
  }

  // Orden (por defecto: el que devuelve Last.fm = relevancia)
  if (ordenElegido !== 'relevancia') {
    // por defecto: oyentes descendente, titulo/artista ascendente
    const dirNorm = String(dir || '').toLowerCase();
    const ascendente = dirNorm ? dirNorm === 'asc' : ordenElegido !== 'oyentes';
    const factor = ascendente ? 1 : -1;

    resultados = [...resultados].sort((a, b) => {
      if (ordenElegido === 'oyentes') return (a.oyentes - b.oyentes) * factor;
      const campo = ordenElegido === 'titulo' ? 'titulo' : 'artista';
      return String(a[campo] || '').localeCompare(String(b[campo] || ''), 'es') * factor;
    });
  }

  // que resultados ya están en la biblioteca del usuario
  const bib = await query(
    `SELECT c.external_id, c.id AS cancion_id, b.estado, b.es_favorita
     FROM biblioteca b
     JOIN canciones c ON c.id = b.cancion_id
     WHERE b.usuario_id = $1`,
    [usuarioId]
  );
  const enBiblioteca = new Map(bib.rows.map((r) => [r.external_id, r]));

  return resultados.map((t) => {
    const registro = enBiblioteca.get(t.external_id);
    return {
      external_id: t.external_id,
      mbid: t.mbid,
      titulo: t.titulo,
      artista: t.artista,
      foto: t.foto,
      oyentes: t.oyentes,
      url: t.url,
      biblioteca: registro //si registro existe arma el objeto sino null
        ? {
            cancion_id: registro.cancion_id,
            estado: registro.estado,
            es_favorita: registro.es_favorita,
          }
        : null,
    };
  });
};

// Resolver una canción: por id local, o trayéndola de Last.fm y guardándola
// biblioteca, puntuaciones, reseñas y colecciones
const resolverCancion = async ({ cancionId, artista, titulo, mbid } = {}) => {
  if (cancionId !== undefined && cancionId !== null && cancionId !== '') {
    if (!esIdValido(cancionId)) {
      throw crearError(400, 'cancionId inválido');
    }

    const resultado = await query('SELECT * FROM canciones WHERE id = $1', [Number(cancionId)]);
    if (!resultado.rows[0]) {
      throw crearError(404, 'Canción no encontrada');
    }
    return resultado.rows[0];
  }

  const mbidTrim = String(mbid || '').trim();
  const artistaTrim = String(artista || '').trim();
  const tituloTrim = String(titulo || '').trim();

  if (!mbidTrim && !(artistaTrim && tituloTrim)) {
    throw crearError(400, 'Indicá cancionId, o bien artista y titulo (o mbid)');
  }

  const trackInfo = await conErrorExterno(() =>
    obtenerCancionExterna({ artista: artistaTrim, titulo: tituloTrim, mbid: mbidTrim })
  );

  return conErrorExterno(() => guardarObtenerCancionLocal(trackInfo));
};

// POST /api/musica guarda la canción (sin tocar la biblioteca)
const importarMusica = async (datos) =>
  resolverCancion({ artista: datos.artista, titulo: datos.titulo, mbid: datos.mbid });

// DETALLE: portada, título, descripción, categorías, metadatos + datos del usuario
const obtenerDetalleMusica = async (usuarioId, cancionId) => {
  if (!esIdValido(cancionId)) {
    throw crearError(400, 'Id de canción inválido');
  }

  const [cancionRes, bibliotecaRes, puntuacionRes, resenaRes, coleccionesRes] = await Promise.all([
    query(
      `SELECT
         c.id,
         c.external_id,
         c.titulo,
         c.descripcion,
         c.duracion,
         c.foto,
         c.fecha_lanzamiento,
         al.id AS album_id,
         al.titulo AS album_titulo,
         al.foto AS album_foto,
         (
           SELECT json_agg(json_build_object('id', a.id, 'nombre', a.nombre, 'foto', a.foto) ORDER BY a.nombre)
           FROM cancion_artistas ca JOIN artistas a ON a.id = ca.artista_id
           WHERE ca.cancion_id = c.id
         ) AS artistas,
         (
           SELECT json_agg(json_build_object('id', g.id, 'nombre', g.nombre) ORDER BY g.nombre)
           FROM cancion_generos cg JOIN generos g ON g.id = cg.genero_id
           WHERE cg.cancion_id = c.id
         ) AS generos
       FROM canciones c
       LEFT JOIN albumes al ON al.id = c.album_id
       WHERE c.id = $1`,
      [Number(cancionId)]
    ),
    query(
      `SELECT id, estado, es_favorita, fecha_agregado, fecha_actualizacion
       FROM biblioteca WHERE usuario_id = $1 AND cancion_id = $2`,
      [usuarioId, Number(cancionId)]
    ),
    query(
      `SELECT id, valor, fecha_creacion, fecha_actualizacion
       FROM puntuaciones WHERE usuario_id = $1 AND cancion_id = $2`,
      [usuarioId, Number(cancionId)]
    ),
    query(
      `SELECT id, texto, fecha_creacion, fecha_actualizacion
       FROM "reseñas" WHERE usuario_id = $1 AND cancion_id = $2`,
      [usuarioId, Number(cancionId)]
    ),
    query(
      `SELECT col.id, col.nombre
       FROM colecciones_canciones cc
       JOIN colecciones col ON col.id = cc.coleccion_id
       WHERE col.usuario_id = $1 AND cc.cancion_id = $2
       ORDER BY col.nombre`,
      [usuarioId, Number(cancionId)]
    ),
  ]);

  const cancion = cancionRes.rows[0];
  if (!cancion) {
    throw crearError(404, 'Canción no encontrada');
  }

  return {
    id: cancion.id,
    external_id: cancion.external_id,
    titulo: cancion.titulo,
    descripcion: cancion.descripcion,
    duracion: cancion.duracion,
    foto: cancion.foto,
    fecha_lanzamiento: cancion.fecha_lanzamiento,
    album_id: cancion.album_id,
    album_titulo: cancion.album_titulo,
    album_foto: cancion.album_foto,
    artistas: cancion.artistas || [],
    generos: cancion.generos || [],
    mi_biblioteca: bibliotecaRes.rows[0] || null,
    mi_puntuacion: puntuacionRes.rows[0] || null,
    mi_resena: resenaRes.rows[0] || null,
    mis_colecciones: coleccionesRes.rows,
  };
};

// REPRODUCCIONES (estadísticas)
const registrarReproduccion = async (usuarioId, cancionId, { segundos_escuchados, completada, fuente } = {}) => {
  if (!esIdValido(cancionId)) {
    throw crearError(400, 'Id de canción inválido');
  }

  const cancionRes = await query('SELECT id, duracion FROM canciones WHERE id = $1', [Number(cancionId)]);
  const cancion = cancionRes.rows[0];
  if (!cancion) {
    throw crearError(404, 'Canción no encontrada');
  }

  const errores = [];
  const estaCompleta = completada === true || completada === 'true';
  let segundos = segundos_escuchados === undefined ? undefined : Number(segundos_escuchados);

  if (segundos !== undefined && (!Number.isFinite(segundos) || segundos < 0)) {
    errores.push('segundos_escuchados debe ser un número mayor o igual a 0');
  }

  const fuenteTrim = fuente === undefined || fuente === null ? 'app' : String(fuente).trim();
  if (fuenteTrim.length > 50) {
    errores.push('La fuente no puede superar los 50 caracteres');
  }

  if (errores.length > 0) {
    throw crearError(400, 'Datos inválidos', errores);
  }

  // Si la marca como completada y no informó segundos, usamos la duración de la canción
  if (segundos === undefined) {
    segundos = estaCompleta ? cancion.duracion : 0;
  }

  const resultado = await query(
    `INSERT INTO reproducciones (usuario_id, cancion_id, segundos_escuchados, completada, fuente)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, cancion_id, fecha_inicio, segundos_escuchados, completada, fuente`,
    [usuarioId, cancion.id, Math.round(segundos), estaCompleta, fuenteTrim || 'app']
  );

  await registrarActividad({ usuarioId, tipo: 'reproduccion', cancionId: cancion.id });

  return resultado.rows[0];
};

module.exports = {
  buscarMusica,
  resolverCancion,
  importarMusica,
  obtenerDetalleMusica,
  registrarReproduccion,
};