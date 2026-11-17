const { query } = require('../config/db');

const buscarCancionPorExternalId = async (externalId) => {
  const resultado = await query(
    'SELECT * FROM canciones WHERE external_id = $1',
    [externalId]
  );

  return resultado.rows[0] || null;
};

const buscarAlbumPorExternalId = async (externalId) => {
  const resultado = await query(
    'SELECT id FROM albumes WHERE external_id = $1',
    [externalId]
  );

  return resultado.rows[0] || null;
};

const crearAlbum = async ({ externalId, titulo, foto, fechaLanzamiento }) => {
  const resultado = await query(
    `INSERT INTO albumes (external_id, titulo, foto, fecha_lanzamiento)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [externalId, titulo, foto, fechaLanzamiento]
  );

  return resultado.rows[0].id;
};

const buscarArtistaPorExternalId = async (externalId) => {
  const resultado = await query(
    'SELECT id FROM artistas WHERE external_id = $1',
    [externalId]
  );

  return resultado.rows[0] || null;
};

const crearArtista = async ({ externalId, nombre }) => {
  const resultado = await query(
    `INSERT INTO artistas (external_id, nombre)
     VALUES ($1, $2)
     RETURNING id`,
    [externalId, nombre]
  );

  return resultado.rows[0].id;
};

const asociarCancionArtista = async ({ cancionId, artistaId }) => {
  await query(
    `INSERT INTO cancion_artistas (cancion_id, artista_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [cancionId, artistaId]
  );
};

const crearCancion = async ({ externalId, titulo, albumId, duracion, foto, previewUrl, fechaLanzamiento }) => {
  const resultado = await query(
    `INSERT INTO canciones (external_id, titulo, album_id, duracion, foto, preview_url, fecha_lanzamiento)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [externalId, titulo, albumId, duracion, foto, previewUrl, fechaLanzamiento]
  );

  return resultado.rows[0];
};

const registrarEnBiblioteca = async ({ usuarioId, cancionId, fechaEscucha }) => {
  await query(
    `INSERT INTO biblioteca (usuario_id, cancion_id, estado, es_favorita, fecha_agregado, fecha_actualizacion)
     VALUES ($1, $2, 'escuchado', FALSE, $3, $3)
     ON CONFLICT (usuario_id, cancion_id)
     DO UPDATE SET
       estado = 'escuchado',
       fecha_actualizacion = GREATEST(biblioteca.fecha_actualizacion, EXCLUDED.fecha_actualizacion)`,
    [usuarioId, cancionId, fechaEscucha]
  );
};

const yaExisteReproduccion = async ({ usuarioId, cancionId, fechaEscucha }) => {
  const resultado = await query(
    `SELECT 1 FROM reproducciones
     WHERE usuario_id = $1 AND cancion_id = $2 AND fecha_inicio = $3`,
    [usuarioId, cancionId, fechaEscucha]
  );

  return resultado.rows.length > 0;
};

const crearReproduccion = async ({ usuarioId, cancionId, fechaEscucha, duracion }) => {
  await query(
    `INSERT INTO reproducciones (usuario_id, cancion_id, fecha_inicio, segundos_escuchados, completada, fuente)
     VALUES ($1, $2, $3, $4, TRUE, 'spotify')`,
    [usuarioId, cancionId, fechaEscucha, duracion]
  );
};

const registrarActividadImportacion = async ({ usuarioId, cantidad }) => {
  await query(
    `INSERT INTO actividad (usuario_id, tipo, detalles)
     VALUES ($1, 'importar_spotify', $2::jsonb)`,
    [usuarioId, JSON.stringify({ canciones_importadas: cantidad })]
  );
};

module.exports = {
  buscarCancionPorExternalId,
  buscarAlbumPorExternalId,
  crearAlbum,
  buscarArtistaPorExternalId,
  crearArtista,
  asociarCancionArtista,
  crearCancion,
  registrarEnBiblioteca,
  yaExisteReproduccion,
  crearReproduccion,
  registrarActividadImportacion,
};
