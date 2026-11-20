const { query } = require('../config/db');

const calcularEstadisticasUsuario = async (usuarioId) => {
  const [
    resumenReproduccionesRes,
    bibliotecaEstadosRes,
    topArtistasRes,
    topCancionesRes,
    topGenerosRes,
    actividadSemanalRes,
    franjaHorariaRes,
    decadasRes,
    interaccionSocialRes,
    rachaDiasRes,
  ] = await Promise.all([
    // tiempo total escuchado, total de reproducciones y canciones distintas
    query(
      `SELECT
         COALESCE(SUM(segundos_escuchados), 0)::int AS segundos_totales,
         COUNT(*)::int AS total_reproducciones,
         COUNT(DISTINCT cancion_id)::int AS canciones_unicas,
         COUNT(*) FILTER (WHERE completada = TRUE)::int AS reproducciones_completadas
       FROM reproducciones
       WHERE usuario_id = $1`,
      [usuarioId]
    ),

    // biblioteca personal y favoritas
    query(
      `SELECT
         COUNT(*)::int AS total_canciones,
         COUNT(*) FILTER (WHERE es_favorita = TRUE)::int AS favoritas,
         COUNT(*) FILTER (WHERE estado = 'quiero_escuchar')::int AS quiero_escuchar,
         COUNT(*) FILTER (WHERE estado = 'escuchando')::int AS escuchando,
         COUNT(*) FILTER (WHERE estado = 'escuchado')::int AS escuchado
       FROM biblioteca
       WHERE usuario_id = $1`,
      [usuarioId]
    ),

    // top 5 Artistas más escuchados
    query(
      `SELECT
         a.id,
         a.nombre,
         a.foto,
         COUNT(r.id)::int AS reproducciones,
         COALESCE(SUM(r.segundos_escuchados), 0)::int AS segundos_escuchados
       FROM reproducciones r
       JOIN cancion_artistas ca ON r.cancion_id = ca.cancion_id
       JOIN artistas a ON ca.artista_id = a.id
       WHERE r.usuario_id = $1
       GROUP BY a.id, a.nombre, a.foto
       ORDER BY reproducciones DESC, segundos_escuchados DESC
       LIMIT 5`,
      [usuarioId]
    ),

    // top 5 Canciones más reproducidas
    query(
      `SELECT
         c.id,
         c.titulo,
         c.foto,
         COUNT(r.id)::int AS reproducciones,
         COALESCE(SUM(r.segundos_escuchados), 0)::int AS segundos_escuchados
       FROM reproducciones r
       JOIN canciones c ON r.cancion_id = c.id
       WHERE r.usuario_id = $1
       GROUP BY c.id, c.titulo, c.foto
       ORDER BY reproducciones DESC, segundos_escuchados DESC
       LIMIT 5`,
      [usuarioId]
    ),

    // top 5 Géneros más escuchados
    query(
      `SELECT
         g.id,
         g.nombre,
         COUNT(r.id)::int AS reproducciones
       FROM reproducciones r
       JOIN cancion_generos cg ON r.cancion_id = cg.cancion_id
       JOIN generos g ON cg.genero_id = g.id
       WHERE r.usuario_id = $1
       GROUP BY g.id, g.nombre
       ORDER BY reproducciones DESC
       LIMIT 5`,
      [usuarioId]
    ),

    // actividad por día de la semana (0 = domingo)
    query(
      `SELECT
         EXTRACT(DOW FROM fecha_inicio)::int AS dia_numero,
         COUNT(*)::int AS reproducciones,
         COALESCE(SUM(segundos_escuchados), 0)::int AS segundos
       FROM reproducciones
       WHERE usuario_id = $1 AND fecha_inicio IS NOT NULL
       GROUP BY dia_numero
       ORDER BY dia_numero`,
      [usuarioId]
    ),

    // distribuido por franja horaria
    query(
      `SELECT
         CASE
           WHEN EXTRACT(HOUR FROM fecha_inicio) BETWEEN 6 AND 11 THEN 'Mañana'
           WHEN EXTRACT(HOUR FROM fecha_inicio) BETWEEN 12 AND 18 THEN 'Tarde'
           WHEN EXTRACT(HOUR FROM fecha_inicio) BETWEEN 19 AND 23 THEN 'Noche'
           ELSE 'Madrugada'
         END AS franja,
         COUNT(*)::int AS reproducciones
       FROM reproducciones
       WHERE usuario_id = $1 AND fecha_inicio IS NOT NULL
       GROUP BY franja
       ORDER BY reproducciones DESC`,
      [usuarioId]
    ),

    // canciones escuchadas por década
    query(
      `SELECT
         (FLOOR(EXTRACT(YEAR FROM c.fecha_lanzamiento) / 10) * 10)::int || 's' AS decada,
         COUNT(*)::int AS reproducciones
       FROM reproducciones r
       JOIN canciones c ON r.cancion_id = c.id
       WHERE r.usuario_id = $1 AND c.fecha_lanzamiento IS NOT NULL
       GROUP BY decada
       ORDER BY decada ASC`,
      [usuarioId]
    ),

    // puntuaciones, reseñas y colecciones del usuario
    query(
      `SELECT
         (SELECT COUNT(*)::int FROM puntuaciones WHERE usuario_id = $1) AS total_puntuaciones,
         (SELECT COALESCE(ROUND(AVG(valor), 2), 0)::float FROM puntuaciones WHERE usuario_id = $1) AS promedio_puntuacion,
         (SELECT COUNT(*)::int FROM "reseñas" WHERE usuario_id = $1) AS total_resenas,
         (SELECT COUNT(*)::int FROM colecciones WHERE usuario_id = $1) AS total_colecciones`,
      [usuarioId]
    ),

    // fechas distintas de escucha para calcular la racha de días consecutivos
    query(
      `SELECT DISTINCT DATE(fecha_inicio) AS dia
       FROM reproducciones
       WHERE usuario_id = $1 AND fecha_inicio IS NOT NULL
       ORDER BY dia DESC`,
      [usuarioId]
    ),
  ]);

  const rep = resumenReproduccionesRes.rows[0];
  const bib = bibliotecaEstadosRes.rows[0];
  const social = interaccionSocialRes.rows[0];

  // calculo de tasa de exploración (% de temas únicos sobre total de reproducciones)
  const tasaExploracion =
    rep.total_reproducciones > 0
      ? Math.round((rep.canciones_unicas / rep.total_reproducciones) * 100)
      : 0;

  const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const mapaDias = new Map(actividadSemanalRes.rows.map((row) => [row.dia_numero, row]));
  const actividadPorDia = nombresDias.map((nombre, index) => ({
    dia_numero: index,
    dia: nombre,
    reproducciones: mapaDias.get(index)?.reproducciones || 0,
    minutos: Math.round((mapaDias.get(index)?.segundos || 0) / 60),
  }));

  // calculo de racha actual y racha máxima de días consecutivos escuchando música
  let rachaActual = 0;
  let rachaMaxima = 0;
  if (rachaDiasRes.rows.length > 0) {
    const dias = rachaDiasRes.rows.map((r) => new Date(r.dia).setHours(0, 0, 0, 0));
    const hoy = new Date().setHours(0, 0, 0, 0);
    const unDiaMs = 24 * 60 * 60 * 1000;

    // racha actual (cuenta si escuchó hoy o ayer)
    if (dias[0] === hoy || dias[0] === hoy - unDiaMs) {
      rachaActual = 1;
      for (let i = 1; i < dias.length; i++) {
        if (dias[i - 1] - dias[i] === unDiaMs) {
          rachaActual++;
        } else {
          break;
        }
      }
    }

    // racha máxima histórica
    let rachaTemp = 1;
    rachaMaxima = 1;
    for (let i = 1; i < dias.length; i++) {
      if (dias[i - 1] - dias[i] === unDiaMs) {
        rachaTemp++;
        if (rachaTemp > rachaMaxima) rachaMaxima = rachaTemp;
      } else {
        rachaTemp = 1;
      }
    }
  }

  // Wrapped 100% con los datos reales
  const artistaTop = topArtistasRes.rows[0]?.nombre || null;
  const cancionTop = topCancionesRes.rows[0]?.titulo || null;
  const franjaTop = franjaHorariaRes.rows[0]?.franja || null;
  const minutosTotales = Math.round(rep.segundos_totales / 60);

  let resumenPersonalizado = 'Todavía no registraste reproducciones. ¡Importá tu historial o escuchá canciones para ver tu resumen!';
  if (rep.total_reproducciones > 0) {
    resumenPersonalizado = `Acumulaste ${minutosTotales} minutos en ${rep.total_reproducciones} reproducciones.`;
    if (artistaTop) resumenPersonalizado += ` Tu artista más escuchado es ${artistaTop}.`;
    if (cancionTop) resumenPersonalizado += ` Tu canción favorita del momento es "${cancionTop}".`;
    if (franjaTop) resumenPersonalizado += ` Tu momento favorito para escuchar música es la ${franjaTop.toLowerCase()}.`;
  }

  return {
    resumenPersonalizado,
    indicadoresGenerales: {
      segundosTotales: rep.segundos_totales,
      minutosTotales,
      horasTotales: Number((rep.segundos_totales / 3600).toFixed(1)),
      totalReproducciones: rep.total_reproducciones,
      cancionesUnicas: rep.canciones_unicas,
      reproduccionesCompletadas: rep.reproducciones_completadas,
      tasaExploracion,
      rachaActualDias: rachaActual,
      rachaMaximaDias: rachaMaxima,
    },
    biblioteca: bib,
    interaccion: social,
    topArtistas: topArtistasRes.rows,
    topCanciones: topCancionesRes.rows,
    topGeneros: topGenerosRes.rows,
    actividadPorDia,
    distribucionHoraria: franjaHorariaRes.rows,
    porDecada: decadasRes.rows,
  };
};

module.exports = {
  calcularEstadisticasUsuario,
};