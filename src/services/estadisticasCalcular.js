const { query } = require('../config/db');

const NOMBRES_DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const NOMBRES_FRANJAS = ['Mañana', 'Tarde', 'Noche', 'Madrugada'];
const UN_DIA_MS = 24 * 60 * 60 * 1000;

// Mayor a menor por reproducciones; si empatan, por segundos escuchados
const compararRanking = (a, b) => {
  if (b.reproducciones !== a.reproducciones) {
    return b.reproducciones - a.reproducciones;
  }
  return b.segundos_escuchados - a.segundos_escuchados;
};

const obtenerFranja = (hora) => {
  if (hora >= 6 && hora <= 11) return 'Mañana';
  if (hora >= 12 && hora <= 18) return 'Tarde';
  if (hora >= 19 && hora <= 23) return 'Noche';
  return 'Madrugada';
};

const calcularEstadisticasUsuario = async (usuarioId) => {
  // Reproducciones del usuario
  const reproduccionesRes = await query(
    `SELECT cancion_id, segundos_escuchados, completada, fecha_inicio
     FROM reproducciones
     WHERE usuario_id = $1`,
    [usuarioId]
  );
  const reproducciones = reproduccionesRes.rows;

  //empieza todo vacio o = 0
  let segundosTotales = 0;
  let reproduccionesCompletadas = 0;
  const cancionesVistas = new Set();

  const repPorDia = [0, 0, 0, 0, 0, 0, 0];
  const segundosPorDia = [0, 0, 0, 0, 0, 0, 0];
  const repPorFranja = { Mañana: 0, Tarde: 0, Noche: 0, Madrugada: 0 };
  const diasConEscucha = new Set();

  for (const rep of reproducciones) {
    const fecha = new Date(rep.fecha_inicio);

    segundosTotales += rep.segundos_escuchados;
    cancionesVistas.add(rep.cancion_id);
    if (rep.completada) {
      reproduccionesCompletadas += 1;
    }

    // getDay(): 0 = domingo
    repPorDia[fecha.getDay()] += 1;
    segundosPorDia[fecha.getDay()] += rep.segundos_escuchados;

    repPorFranja[obtenerFranja(fecha.getHours())] += 1;

    diasConEscucha.add(new Date(fecha).setHours(0, 0, 0, 0));
  }

  const totalReproducciones = reproducciones.length;
  const cancionesUnicas = cancionesVistas.size;
  const minutosTotales = Math.round(segundosTotales / 60);

  // tasa de exploración (% de temas únicos sobre total de reproducciones)
  let tasaExploracion = 0;
  if (totalReproducciones > 0) {
    tasaExploracion = Math.round((cancionesUnicas / totalReproducciones) * 100);
  }

  const actividadPorDia = [];
  for (let i = 0; i < NOMBRES_DIAS.length; i++) {
    actividadPorDia.push({
      dia_numero: i,
      dia: NOMBRES_DIAS[i],
      reproducciones: repPorDia[i],
      minutos: Math.round(segundosPorDia[i] / 60),
    });
  }

  // solo las franjas con reproducciones, de mayor a menor
  const distribucionHoraria = [];
  for (const franja of NOMBRES_FRANJAS) {
    if (repPorFranja[franja] > 0) {
      distribucionHoraria.push({ franja, reproducciones: repPorFranja[franja] });
    }
  }
  distribucionHoraria.sort((a, b) => b.reproducciones - a.reproducciones);

  // Racha actual y máxima de días consecutivos escuchando música
  const dias = Array.from(diasConEscucha).sort((a, b) => b - a); // del más nuevo al más viejo
  let rachaActual = 0;
  let rachaMaxima = 0;

  if (dias.length > 0) {
    const hoy = new Date().setHours(0, 0, 0, 0);

    // racha actual (cuenta si escuchó hoy o ayer)
    if (dias[0] === hoy || dias[0] === hoy - UN_DIA_MS) {
      rachaActual = 1;
      for (let i = 1; i < dias.length; i++) {
        if (dias[i - 1] - dias[i] === UN_DIA_MS) {
          rachaActual += 1;
        } else {
          break;
        }
      }
    }

    // racha máxima histórica
    let rachaTemp = 1;
    rachaMaxima = 1;
    for (let i = 1; i < dias.length; i++) {
      if (dias[i - 1] - dias[i] === UN_DIA_MS) {
        rachaTemp += 1;
        if (rachaTemp > rachaMaxima) rachaMaxima = rachaTemp;
      } else {
        rachaTemp = 1;
      }
    }
  }

  // Bibliotec
  const bibliotecaRes = await query(
    'SELECT estado, es_favorita FROM biblioteca WHERE usuario_id = $1',
    [usuarioId]
  );

  const biblioteca = {
    total_canciones: bibliotecaRes.rows.length,
    favoritas: 0,
    quiero_escuchar: 0,
    escuchando: 0,
    escuchado: 0,
  };
  for (const item of bibliotecaRes.rows) {
    if (item.es_favorita) biblioteca.favoritas += 1;
    if (item.estado === 'quiero_escuchar') biblioteca.quiero_escuchar += 1;
    if (item.estado === 'escuchando') biblioteca.escuchando += 1;
    if (item.estado === 'escuchado') biblioteca.escuchado += 1;
  }

  // Top 5 artistas
  const artistasRes = await query(
    `SELECT artistas.id, artistas.nombre, artistas.foto, reproducciones.segundos_escuchados
     FROM reproducciones
     JOIN cancion_artistas ON cancion_artistas.cancion_id = reproducciones.cancion_id
     JOIN artistas ON artistas.id = cancion_artistas.artista_id
     WHERE reproducciones.usuario_id = $1`,
    [usuarioId]
  );

  const mapaArtistas = new Map();
  for (const fila of artistasRes.rows) {
    let artista = mapaArtistas.get(fila.id);
    if (!artista) {
      artista = {
        id: fila.id,
        nombre: fila.nombre,
        foto: fila.foto,
        reproducciones: 0,
        segundos_escuchados: 0,
      };
      mapaArtistas.set(fila.id, artista);
    }
    artista.reproducciones += 1;
    artista.segundos_escuchados += fila.segundos_escuchados;
  }
  const topArtistas = Array.from(mapaArtistas.values()).sort(compararRanking).slice(0, 5);

  // Top 5 canciones
  const cancionesRes = await query(
    `SELECT canciones.id, canciones.titulo, canciones.foto, reproducciones.segundos_escuchados
     FROM reproducciones
     JOIN canciones ON canciones.id = reproducciones.cancion_id
     WHERE reproducciones.usuario_id = $1`,
    [usuarioId]
  );

  const mapaCanciones = new Map();
  for (const fila of cancionesRes.rows) {
    let cancion = mapaCanciones.get(fila.id);
    if (!cancion) {
      cancion = {
        id: fila.id,
        titulo: fila.titulo,
        foto: fila.foto,
        reproducciones: 0,
        segundos_escuchados: 0,
      };
      mapaCanciones.set(fila.id, cancion);
    }
    cancion.reproducciones += 1;
    cancion.segundos_escuchados += fila.segundos_escuchados;
  }
  const topCanciones = Array.from(mapaCanciones.values()).sort(compararRanking).slice(0, 5);

  // Top 5 géneros
  const generosRes = await query(
    `SELECT generos.id, generos.nombre
     FROM reproducciones
     JOIN cancion_generos ON cancion_generos.cancion_id = reproducciones.cancion_id
     JOIN generos ON generos.id = cancion_generos.genero_id
     WHERE reproducciones.usuario_id = $1`,
    [usuarioId]
  );

  const mapaGeneros = new Map();
  for (const fila of generosRes.rows) {
    let genero = mapaGeneros.get(fila.id);
    if (!genero) {
      genero = { id: fila.id, nombre: fila.nombre, reproducciones: 0 };
      mapaGeneros.set(fila.id, genero);
    }
    genero.reproducciones += 1;
  }
  const topGeneros = Array.from(mapaGeneros.values())
    .sort((a, b) => b.reproducciones - a.reproducciones)
    .slice(0, 5);

  // Puntuaciones, reseñas y colecciones
  const puntuacionesRes = await query('SELECT valor FROM puntuaciones WHERE usuario_id = $1', [
    usuarioId,
  ]);
  const resenasRes = await query('SELECT id FROM "reseñas" WHERE usuario_id = $1', [usuarioId]);
  const coleccionesRes = await query('SELECT id FROM colecciones WHERE usuario_id = $1', [
    usuarioId,
  ]);

  let sumaPuntuaciones = 0;
  for (const fila of puntuacionesRes.rows) {
    sumaPuntuaciones += fila.valor;
  }
  let promedioPuntuacion = 0;
  if (puntuacionesRes.rows.length > 0) {
    promedioPuntuacion = Number((sumaPuntuaciones / puntuacionesRes.rows.length).toFixed(2));
  }

  const interaccion = {
    total_puntuaciones: puntuacionesRes.rows.length,
    promedio_puntuacion: promedioPuntuacion,
    total_resenas: resenasRes.rows.length,
    total_colecciones: coleccionesRes.rows.length,
  };

  // Wrapped
  const artistaTop = topArtistas.length > 0 ? topArtistas[0].nombre : null;
  const cancionTop = topCanciones.length > 0 ? topCanciones[0].titulo : null;
  const franjaTop = distribucionHoraria.length > 0 ? distribucionHoraria[0].franja : null;

  let resumenPersonalizado =
    'Todavía no registraste reproducciones. ¡Importá tu historial o escuchá canciones para ver tu resumen!';
  if (totalReproducciones > 0) {
    resumenPersonalizado = `Acumulaste ${minutosTotales} minutos en ${totalReproducciones} reproducciones.`;
    if (artistaTop) resumenPersonalizado += ` Tu artista más escuchado es ${artistaTop}.`;
    if (cancionTop) resumenPersonalizado += ` Tu canción favorita del momento es "${cancionTop}".`;
    if (franjaTop) resumenPersonalizado += ` Tu momento favorito para escuchar música es la ${franjaTop.toLowerCase()}.`;
  }

  return {
    resumenPersonalizado,
    indicadoresGenerales: {
      segundosTotales,
      minutosTotales,
      horasTotales: Number((segundosTotales / 3600).toFixed(1)), //deja un solo decimal
      totalReproducciones,
      cancionesUnicas,
      reproduccionesCompletadas,
      tasaExploracion,
      rachaActualDias: rachaActual,
      rachaMaximaDias: rachaMaxima,
    },
    biblioteca,
    interaccion,
    topArtistas,
    topCanciones,
    topGeneros,
    actividadPorDia,
    distribucionHoraria,
  };
};

module.exports = {
  calcularEstadisticasUsuario,
};