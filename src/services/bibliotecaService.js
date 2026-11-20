const { query } = require('../config/db');
const { resolverCancion } = require('./musicaService');
const { registrarActividad } = require('./actividadService');

const ESTADOS_VALIDOS = ['quiero_escuchar', 'escuchando', 'escuchado'];

const ORDENES_VALIDOS = ['fecha', 'actualizacion', 'titulo', 'puntuacion'];

const crearError = (statusCode, mensaje, errores) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  if (errores) error.errores = errores;
  return error;
};

// Verificando el id. Un id válido es un texto que empieza con un dígito del 1 al 9 y sigue solo con dígitos. 
const esIdValido = (valor) => /^[1-9][0-9]*$/.test(String(valor));

// Verifica los valores y si son true or false.
const parsearBooleano = (valor, nombre) => {
  if (valor === undefined || valor === null || valor === '') return undefined;
  if (valor === true || valor === 'true' || valor === '1' || valor === 1) return true;
  if (valor === false || valor === 'false' || valor === '0' || valor === 0) return false;
  throw crearError(400, `${nombre} debe ser true o false`);
};

// Datos de cada canción de la biblioteca, junto con la puntuación y la reseña del mismo usuario.
const SELECT_ITEM = `
  SELECT
    biblioteca.id,
    biblioteca.cancion_id,
    biblioteca.estado,
    biblioteca.es_favorita,
    biblioteca.fecha_agregado,
    biblioteca.fecha_actualizacion,
    canciones.titulo,
    canciones.foto,
    canciones.duracion,
    puntuaciones.valor AS puntuacion,
    "reseñas".id AS resena_id
  FROM biblioteca
  JOIN canciones ON canciones.id = biblioteca.cancion_id
  LEFT JOIN puntuaciones
    ON puntuaciones.cancion_id = biblioteca.cancion_id
    AND puntuaciones.usuario_id = biblioteca.usuario_id
  LEFT JOIN "reseñas"
    ON "reseñas".cancion_id = biblioteca.cancion_id
    AND "reseñas".usuario_id = biblioteca.usuario_id`;

// Arma el objeto 
const armarItem = (fila, artistas, generos) => ({
  id: fila.id,
  cancion_id: fila.cancion_id,
  estado: fila.estado,
  es_favorita: fila.es_favorita,
  fecha_agregado: fila.fecha_agregado,
  fecha_actualizacion: fila.fecha_actualizacion,
  titulo: fila.titulo,
  foto: fila.foto,
  duracion: fila.duracion,
  puntuacion: fila.puntuacion,
  tiene_resena: fila.resena_id !== null,
  artistas,
  generos,
});

// Un solo item de la biblioteca del usuario (o null si esa canción no está en su biblioteca)
const obtenerItemBiblioteca = async (usuarioId, cancionId) => {
  const itemRes = await query(
    `${SELECT_ITEM}
     WHERE biblioteca.usuario_id = $1 AND biblioteca.cancion_id = $2`,
    [usuarioId, cancionId]
  );

  if (itemRes.rows.length === 0) {
    return null;
  }

  const artistasRes = await query(
    `SELECT artistas.id, artistas.nombre
     FROM cancion_artistas
     JOIN artistas ON artistas.id = cancion_artistas.artista_id
     WHERE cancion_artistas.cancion_id = $1
     ORDER BY artistas.nombre`,
    [cancionId]
  );

  const generosRes = await query(
    `SELECT generos.nombre
     FROM cancion_generos
     JOIN generos ON generos.id = cancion_generos.genero_id
     WHERE cancion_generos.cancion_id = $1
     ORDER BY generos.nombre`,
    [cancionId]
  );

  const generos = [];
  for (const fila of generosRes.rows) {
    generos.push(fila.nombre);
  }

  return armarItem(itemRes.rows[0], artistasRes.rows, generos);
};

// LISTAR con filtros: estado, favorita, genero, q (título o artista), puntuacion y orden (fecha, actualizacion, titulo, puntuacion) + dir (asc o desc)
const obtenerBibliotecaUsuario = async (usuarioId, filtros = {}) => {
  const { estado, favorita, genero, q, puntuacion, orden, dir } = filtros;

  // Validamos los filtros antes de consultar la bd
  if (estado !== undefined && estado !== '' && !ESTADOS_VALIDOS.includes(estado)) {
    throw crearError(400, `Estado inválido. Opciones: ${ESTADOS_VALIDOS.join(', ')}`);
  }

  const soloFavoritas = parsearBooleano(favorita, 'favorita');

  if (
    puntuacion !== undefined &&
    puntuacion !== '' &&
    !['1', '2', '3', '4', '5'].includes(String(puntuacion))
  ) {
    throw crearError(400, 'La puntuación a filtrar debe ser un entero entre 1 y 5');
  }

  const ordenElegido = orden || 'fecha';
  if (!ORDENES_VALIDOS.includes(ordenElegido)) {
    throw crearError(400, `Orden inválido. Opciones: ${ORDENES_VALIDOS.join(', ')}`);
  }

  // traemos toda la biblioteca de este usuario
  const itemsRes = await query(`${SELECT_ITEM} WHERE biblioteca.usuario_id = $1`, [usuarioId]);

  // traemos los artistas de todas esas canciones y los agrupamos por canción
  const artistasRes = await query(
    `SELECT cancion_artistas.cancion_id, artistas.id, artistas.nombre
     FROM biblioteca
     JOIN cancion_artistas ON cancion_artistas.cancion_id = biblioteca.cancion_id
     JOIN artistas ON artistas.id = cancion_artistas.artista_id
     WHERE biblioteca.usuario_id = $1
     ORDER BY artistas.nombre`,
    [usuarioId]
  );

  const artistasPorCancion = new Map();
  for (const fila of artistasRes.rows) {
    if (!artistasPorCancion.has(fila.cancion_id)) {
      artistasPorCancion.set(fila.cancion_id, []);
    }
    artistasPorCancion.get(fila.cancion_id).push({ id: fila.id, nombre: fila.nombre });
  }

  const generosRes = await query(
    `SELECT cancion_generos.cancion_id, generos.nombre
     FROM biblioteca
     JOIN cancion_generos ON cancion_generos.cancion_id = biblioteca.cancion_id
     JOIN generos ON generos.id = cancion_generos.genero_id
     WHERE biblioteca.usuario_id = $1
     ORDER BY generos.nombre`,
    [usuarioId]
  );

  const generosPorCancion = new Map();
  for (const fila of generosRes.rows) {
    if (!generosPorCancion.has(fila.cancion_id)) {
      generosPorCancion.set(fila.cancion_id, []);
    }
    generosPorCancion.get(fila.cancion_id).push(fila.nombre);
  }

  const generoBuscado = genero ? String(genero).trim().toLowerCase() : '';
  const textoBuscado = q ? String(q).trim().toLowerCase() : '';

  // armamos la lista y nos quedamos solo con los que cumplen todos los filtros
  const items = [];

  for (const fila of itemsRes.rows) {
    const artistas = artistasPorCancion.get(fila.cancion_id) || [];
    const generos = generosPorCancion.get(fila.cancion_id) || [];
    const item = armarItem(fila, artistas, generos);

    if (estado && item.estado !== estado) continue;

    if (soloFavoritas !== undefined && item.es_favorita !== soloFavoritas) continue;

    // String() a los dos lados para comparar texto con texto ("4" con 4)
    if (puntuacion && String(item.puntuacion) !== String(puntuacion)) continue;

    if (generoBuscado && !item.generos.includes(generoBuscado)) continue;

    if (textoBuscado) {
      // Coincide si el texto está en el título o en el nombre de algún artista
      let coincide = item.titulo.toLowerCase().includes(textoBuscado);
      for (const artista of item.artistas) {
        if (artista.nombre.toLowerCase().includes(textoBuscado)) {
          coincide = true;
        }
      }
      if (!coincide) continue;
    }

    items.push(item);
  }

  // 7) Ordenamos. Por defecto de más nuevo a más viejo; con dir=asc al revés.
  items.sort((a, b) => {
    let resultado = 0;

    if (ordenElegido === 'titulo') {
      resultado = a.titulo.localeCompare(b.titulo, 'es');
    } else if (ordenElegido === 'puntuacion') {
      // Las que no tienen puntuación cuentan como 0
      resultado = (a.puntuacion || 0) - (b.puntuacion || 0);
    } else if (ordenElegido === 'actualizacion') {
      resultado = a.fecha_actualizacion - b.fecha_actualizacion; // fechas: da la diferencia en ms
    } else {
      resultado = a.fecha_agregado - b.fecha_agregado;
    }

    // Si empatan, desempata por id para que el orden sea siempre el mismo
    if (resultado === 0) {
      resultado = a.id - b.id;
    }

    return String(dir).toLowerCase() === 'asc' ? resultado : -resultado;
  });

  return { total: items.length, items };
};

// ---------------------------------------------------------------------
// AGREGAR / ACTUALIZAR. Sirve para POST y PUT.
// body: { cancionId | (artista + titulo) | mbid, estado?, es_favorita? }
//
// - Si la canción NO estaba en la biblioteca: la agrega (estado "quiero_escuchar"
//   y no favorita, salvo que el body diga otra cosa).
// - Si YA estaba: actualiza solo lo que vino en el body y deja lo demás como estaba.
// ---------------------------------------------------------------------
const guardarEnBiblioteca = async (usuarioId, datos = {}) => {
  const { estado } = datos;

  // Aceptamos es_favorita (o esFavorita). Queda undefined si no vino.
  let valorFavorita = datos.es_favorita;
  if (valorFavorita === undefined) {
    valorFavorita = datos.esFavorita;
  }
  const esFavorita = parsearBooleano(valorFavorita, 'es_favorita');

  if (estado !== undefined && !ESTADOS_VALIDOS.includes(estado)) {
    throw crearError(400, `Estado inválido. Opciones: ${ESTADOS_VALIDOS.join(', ')}`);
  }

  // Busca la canción en nuestra base o la trae de Last.fm y la guarda
  const cancion = await resolverCancion(datos);

  // ¿Ya la tenía este usuario en su biblioteca?
  const previo = await query(
    'SELECT estado, es_favorita FROM biblioteca WHERE usuario_id = $1 AND cancion_id = $2',
    [usuarioId, cancion.id]
  );
  const existia = previo.rows.length > 0;

  let estadoFinal;
  let favoritaFinal;

  if (existia) {
    // Partimos de lo que ya tenía y pisamos solo lo que vino
    estadoFinal = previo.rows[0].estado;
    favoritaFinal = previo.rows[0].es_favorita;
    if (estado !== undefined) estadoFinal = estado;
    if (esFavorita !== undefined) favoritaFinal = esFavorita;

    await query(
      `UPDATE biblioteca
       SET estado = $1, es_favorita = $2, fecha_actualizacion = NOW()
       WHERE usuario_id = $3 AND cancion_id = $4`,
      [estadoFinal, favoritaFinal, usuarioId, cancion.id]
    );
  } else {
    // Valores por defecto de una canción nueva
    estadoFinal = 'quiero_escuchar';
    favoritaFinal = false;
    if (estado !== undefined) estadoFinal = estado;
    if (esFavorita !== undefined) favoritaFinal = esFavorita;

    try {
      await query(
        `INSERT INTO biblioteca (usuario_id, cancion_id, estado, es_favorita)
         VALUES ($1, $2, $3, $4)`,
        [usuarioId, cancion.id, estadoFinal, favoritaFinal]
      );
    } catch (error) {
      // 23505 = violación de UNIQUE: dos pedidos iguales llegaron al mismo tiempo
      if (error.code === '23505') {
        throw crearError(409, 'La canción ya está en tu biblioteca');
      }
      throw error;
    }
  }

  await registrarActividad({
    usuarioId,
    tipo: existia ? 'biblioteca_actualizada' : 'biblioteca_agregada',
    cancionId: cancion.id,
    detalles: { estado: estadoFinal, es_favorita: favoritaFinal },
  });

  const item = await obtenerItemBiblioteca(usuarioId, cancion.id);
  return { item, creado: !existia };
};

// ---------------------------------------------------------------------
// FAVORITA: alterna entre favorita y no favorita.
// Si el body trae es_favorita (true/false) se usa ese valor en vez de alternar.
// ---------------------------------------------------------------------
const alternarFavorita = async (usuarioId, cancionId, valorExplicito) => {
  if (!esIdValido(cancionId)) {
    throw crearError(400, 'Id de canción inválido');
  }

  const explicito = parsearBooleano(valorExplicito, 'es_favorita');
  const cancion = await resolverCancion({ cancionId });

  const previo = await query(
    'SELECT es_favorita FROM biblioteca WHERE usuario_id = $1 AND cancion_id = $2',
    [usuarioId, cancion.id]
  );
  const existia = previo.rows.length > 0;

  // Decidimos el nuevo valor:
  // - si vino explícito, ese
  // - si ya estaba en la biblioteca, lo contrario de lo que tenía
  // - si no estaba, entra como favorita
  let nuevoValor = true;
  if (explicito !== undefined) {
    nuevoValor = explicito;
  } else if (existia) {
    nuevoValor = !previo.rows[0].es_favorita;
  }

  if (existia) {
    await query(
      `UPDATE biblioteca
       SET es_favorita = $1, fecha_actualizacion = NOW()
       WHERE usuario_id = $2 AND cancion_id = $3`,
      [nuevoValor, usuarioId, cancion.id]
    );
  } else {
    try {
      await query(
        `INSERT INTO biblioteca (usuario_id, cancion_id, es_favorita)
         VALUES ($1, $2, $3)`,
        [usuarioId, cancion.id, nuevoValor]
      );
    } catch (error) {
      if (error.code === '23505') {
        throw crearError(409, 'La canción ya está en tu biblioteca');
      }
      throw error;
    }
  }

  await registrarActividad({
    usuarioId,
    tipo: nuevoValor ? 'favorita_agregada' : 'favorita_quitada',
    cancionId: cancion.id,
  });

  return obtenerItemBiblioteca(usuarioId, cancion.id);
};

// ---------------------------------------------------------------------
// QUITAR de la biblioteca (no borra la canción del catálogo compartido,
// solo la relación entre este usuario y la canción)
// ---------------------------------------------------------------------
const quitarDeBiblioteca = async (usuarioId, cancionId) => {
  if (!esIdValido(cancionId)) {
    throw crearError(400, 'Id de canción inválido');
  }

  // Primero comprobamos que esa canción esté en la biblioteca de este usuario
  const existe = await query(
    'SELECT id FROM biblioteca WHERE usuario_id = $1 AND cancion_id = $2',
    [usuarioId, cancionId]
  );

  if (existe.rows.length === 0) {
    throw crearError(404, 'La canción no está en tu biblioteca');
  }

  await query('DELETE FROM biblioteca WHERE usuario_id = $1 AND cancion_id = $2', [
    usuarioId,
    cancionId,
  ]);

  await registrarActividad({
    usuarioId,
    tipo: 'biblioteca_quitada',
    cancionId,
  });

  return true;
};

module.exports = {
  obtenerBibliotecaUsuario,
  guardarEnBiblioteca,
  alternarFavorita,
  quitarDeBiblioteca,
};