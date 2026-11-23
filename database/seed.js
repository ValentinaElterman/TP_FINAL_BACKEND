require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db'); // Ajustá a '../config/db' si tu carpeta config está en la raíz

//node database/seed.js para ejecutar

const DEMO_USER = {
  username: 'vasas_demo',
  email: 'demo@vasas.com',
  passwordPlano: 'Demo1234!',
  nombre: 'Valentina Demo',
  foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  bio: 'Amante del rock nacional, el indie de medianoche y descubrir discos enteros de principio a fin. Siempre armando playlists para estudiar.',
  preferencias: ['Rock', 'Indie', 'Pop', 'Electrónica', 'Alternativo'],
};

const GENEROS = ['Rock', 'Indie', 'Pop', 'Electrónica', 'Alternativo', 'Hip Hop'];

const CANCIONES_CATALOGO = [
  {
    external_id: 'demo:track:1',
    titulo: 'Crimen',
    artista: { external_id: 'demo:artist:1', nombre: 'Gustavo Cerati' },
    album: { external_id: 'demo:album:1', titulo: 'Ahí Vamos', fecha: '2006-04-04' },
    duracion: 232,
    foto: 'https://picsum.photos/seed/vasas_crimen/400/400',
    generos: ['Rock', 'Alternativo'],
    estado: 'escuchado',
    es_favorita: true,
    puntuacion: 5,
    resena: 'Una obra maestra de la melancolía. La producción de guitarras y la letra siguen sonando impecables casi veinte años después.',
  },
  {
    external_id: 'demo:track:2',
    titulo: 'Do I Wanna Know?',
    artista: { external_id: 'demo:artist:2', nombre: 'Arctic Monkeys' },
    album: { external_id: 'demo:album:2', titulo: 'AM', fecha: '2013-09-09' },
    duracion: 272,
    foto: 'https://picsum.photos/seed/vasas_am/400/400',
    generos: ['Rock', 'Indie'],
    estado: 'escuchado',
    es_favorita: true,
    puntuacion: 5,
    resena: 'El riff de entrada es instantáneamente reconocible. Ideal para escuchar de noche con auriculares.',
  },
  {
    external_id: 'demo:track:3',
    titulo: 'Let It Happen',
    artista: { external_id: 'demo:artist:3', nombre: 'Tame Impala' },
    album: { external_id: 'demo:album:3', titulo: 'Currents', fecha: '2015-07-17' },
    duracion: 466,
    foto: 'https://picsum.photos/seed/vasas_currents/400/400',
    generos: ['Indie', 'Electrónica'],
    estado: 'escuchado',
    es_favorita: true,
    puntuacion: 5,
    resena: 'Siete minutos que pasan volando. El quiebre en la mitad del tema es de lo mejor del synth-pop moderno.',
  },
  {
    external_id: 'demo:track:4',
    titulo: 'Instant Crush',
    artista: { external_id: 'demo:artist:4', nombre: 'Daft Punk' },
    album: { external_id: 'demo:album:4', titulo: 'Random Access Memories', fecha: '2013-05-17' },
    duracion: 337,
    foto: 'https://picsum.photos/seed/vasas_ram/400/400',
    generos: ['Electrónica', 'Pop'],
    estado: 'escuchado',
    es_favorita: true,
    puntuacion: 4,
    resena: 'La combinación de Daft Punk con la voz de Julian Casablancas tiene una vibra nostálgica única.',
  },
  {
    external_id: 'demo:track:5',
    titulo: 'De Música Ligera',
    artista: { external_id: 'demo:artist:5', nombre: 'Soda Stereo' },
    album: { external_id: 'demo:album:5', titulo: 'Canción Animal', fecha: '1990-08-07' },
    duracion: 212,
    foto: 'https://picsum.photos/seed/vasas_soda/400/400',
    generos: ['Rock'],
    estado: 'escuchado',
    es_favorita: true,
    puntuacion: 5,
    resena: null,
  },
  {
    external_id: 'demo:track:6',
    titulo: 'Midnight City',
    artista: { external_id: 'demo:artist:6', nombre: 'M83' },
    album: { external_id: 'demo:album:6', titulo: "Hurry Up, We're Dreaming", fecha: '2011-10-18' },
    duracion: 243,
    foto: 'https://picsum.photos/seed/vasas_m83/400/400',
    generos: ['Electrónica', 'Indie'],
    estado: 'escuchado',
    es_favorita: false,
    puntuacion: 4,
    resena: null,
  },
  {
    external_id: 'demo:track:7',
    titulo: 'Seguir Viviendo Sin Tu Amor',
    artista: { external_id: 'demo:artist:7', nombre: 'Luis Alberto Spinetta' },
    album: { external_id: 'demo:album:7', titulo: 'Pelusón of Milk', fecha: '1991-10-01' },
    duracion: 160,
    foto: 'https://picsum.photos/seed/vasas_spinetta/400/400',
    generos: ['Rock'],
    estado: 'escuchando',
    es_favorita: true,
    puntuacion: 5,
    resena: null,
  },
  {
    external_id: 'demo:track:8',
    titulo: 'Blinding Lights',
    artista: { external_id: 'demo:artist:8', nombre: 'The Weeknd' },
    album: { external_id: 'demo:album:8', titulo: 'After Hours', fecha: '2020-03-20' },
    duracion: 200,
    foto: 'https://picsum.photos/seed/vasas_weeknd/400/400',
    generos: ['Pop', 'Electrónica'],
    estado: 'escuchando',
    es_favorita: false,
    puntuacion: 4,
    resena: null,
  },
  {
    external_id: 'demo:track:9',
    titulo: 'Nude',
    artista: { external_id: 'demo:artist:9', nombre: 'Radiohead' },
    album: { external_id: 'demo:album:9', titulo: 'In Rainbows', fecha: '2007-10-10' },
    duracion: 255,
    foto: 'https://picsum.photos/seed/vasas_radiohead/400/400',
    generos: ['Alternativo', 'Indie'],
    estado: 'escuchando',
    es_favorita: false,
    puntuacion: null,
    resena: null,
  },
  {
    external_id: 'demo:track:10',
    titulo: 'The Less I Know The Better',
    artista: { external_id: 'demo:artist:3', nombre: 'Tame Impala' },
    album: { external_id: 'demo:album:3', titulo: 'Currents', fecha: '2015-07-17' },
    duracion: 216,
    foto: 'https://picsum.photos/seed/vasas_less/400/400',
    generos: ['Indie', 'Pop'],
    estado: 'quiero_escuchar',
    es_favorita: false,
    puntuacion: null,
    resena: null,
  },
  {
    external_id: 'demo:track:11',
    titulo: 'Starboy',
    artista: { external_id: 'demo:artist:8', nombre: 'The Weeknd' },
    album: { external_id: 'demo:album:10', titulo: 'Starboy', fecha: '2016-11-25' },
    duracion: 230,
    foto: 'https://picsum.photos/seed/vasas_starboy/400/400',
    generos: ['Pop', 'Hip Hop'],
    estado: 'quiero_escuchar',
    es_favorita: false,
    puntuacion: null,
    resena: null,
  },
  {
    external_id: 'demo:track:12',
    titulo: 'Rezo por Vos',
    artista: { external_id: 'demo:artist:10', nombre: 'Charly García' },
    album: { external_id: 'demo:album:11', titulo: 'Parte de la Religión', fecha: '1987-05-28' },
    duracion: 268,
    foto: 'https://picsum.photos/seed/vasas_charly/400/400',
    generos: ['Rock'],
    estado: 'quiero_escuchar',
    es_favorita: false,
    puntuacion: null,
    resena: null,
  },
];

async function seedDemo() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Limpiar usuario demo previo si existiera (CASCADE limpia perfil, biblioteca, colecciones, etc.)
    await client.query('DELETE FROM usuarios WHERE email = $1 OR username = $2', [
      DEMO_USER.email,
      DEMO_USER.username,
    ]);

    // 2. Crear usuario demo y su perfil completo (avatar, bio, preferencias)
    const passwordHash = await bcrypt.hash(DEMO_USER.passwordPlano, 10);
    const userRes = await client.query(
      `INSERT INTO usuarios (username, email, password, activo, fecha_registro)
       VALUES ($1, $2, $3, TRUE, NOW() - INTERVAL '30 days')
       RETURNING id`,
      [DEMO_USER.username, DEMO_USER.email, passwordHash]
    );
    const usuarioId = userRes.rows[0].id;

    await client.query(
      `INSERT INTO perfiles (usuario_id, nombre, foto, bio, preferencias)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [
        usuarioId,
        DEMO_USER.nombre,
        DEMO_USER.foto,
        DEMO_USER.bio,
        JSON.stringify(DEMO_USER.preferencias),
      ]
    );

    // 3. Insertar géneros
    const generoMap = new Map();
    for (const nombreGenero of GENEROS) {
      const gRes = await client.query(
        `INSERT INTO generos (nombre)
         VALUES ($1)
         ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
         RETURNING id`,
        [nombreGenero]
      );
      generoMap.set(nombreGenero, gRes.rows[0].id);
    }

    // 4. Insertar artistas, álbumes, canciones, biblioteca, puntuaciones y reseñas
    const cancionesIds = [];

    for (let i = 0; i < CANCIONES_CATALOGO.length; i++) {
      const item = CANCIONES_CATALOGO[i];
      const diasAtras = 20 - i;

      // Artista
      const artRes = await client.query(
        `INSERT INTO artistas (external_id, nombre, foto)
         VALUES ($1, $2, $3)
         ON CONFLICT (external_id) DO UPDATE SET nombre = EXCLUDED.nombre
         RETURNING id`,
        [item.artista.external_id, item.artista.nombre, item.foto]
      );
      const artistaId = artRes.rows[0].id;

      // Álbum
      const albRes = await client.query(
        `INSERT INTO albumes (external_id, titulo, foto, fecha_lanzamiento)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (external_id) DO UPDATE SET titulo = EXCLUDED.titulo
         RETURNING id`,
        [item.album.external_id, item.album.titulo, item.foto, item.album.fecha]
      );
      const albumId = albRes.rows[0].id;

      // Canción
      const canRes = await client.query(
        `INSERT INTO canciones (external_id, titulo, album_id, duracion, foto, fecha_lanzamiento)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (external_id) DO UPDATE SET titulo = EXCLUDED.titulo
         RETURNING id`,
        [item.external_id, item.titulo, albumId, item.duracion, item.foto, item.album.fecha]
      );
      const cancionId = canRes.rows[0].id;
      cancionesIds.push({ id: cancionId, ...item });

      // Relación canción <-> artista y canción <-> géneros
      await client.query(
        `INSERT INTO cancion_artistas (cancion_id, artista_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [cancionId, artistaId]
      );

      for (const genNombre of item.generos) {
        const genId = generoMap.get(genNombre);
        if (genId) {
          await client.query(
            `INSERT INTO cancion_generos (cancion_id, genero_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [cancionId, genId]
          );
        }
      }

      // Biblioteca (12 contenidos en 3 estados distintos, 6 favoritos)
      await client.query(
        `INSERT INTO biblioteca (usuario_id, cancion_id, estado, es_favorita, fecha_agregado, fecha_actualizacion)
         VALUES ($1, $2, $3, $4, NOW() - ($5 || ' days')::interval, NOW() - ($6 || ' days')::interval)`,
        [usuarioId, cancionId, item.estado, item.es_favorita, diasAtras, Math.max(0, diasAtras - 2)]
      );

      // Puntuaciones (8 puntuaciones)
      if (item.puntuacion) {
        await client.query(
          `INSERT INTO puntuaciones (usuario_id, cancion_id, valor, fecha_creacion, fecha_actualizacion)
           VALUES ($1, $2, $3, NOW() - ($4 || ' days')::interval, NOW() - ($4 || ' days')::interval)`,
          [usuarioId, cancionId, item.puntuacion, Math.max(1, diasAtras - 3)]
        );
      }

      // Reseñas (4 reseñas)
      if (item.resena) {
        await client.query(
          `INSERT INTO "reseñas" (usuario_id, cancion_id, texto, fecha_creacion, fecha_actualizacion)
           VALUES ($1, $2, $3, NOW() - ($4 || ' days')::interval, NOW() - ($4 || ' days')::interval)`,
          [usuarioId, cancionId, item.resena, Math.max(1, diasAtras - 4)]
        );
      }
    }

    // 5. Crear 3 colecciones / playlists con sus canciones ordenadas
    const playlistsData = [
      {
        nombre: 'Clásicos del Rock Nacional',
        descripcion: 'Himnos infaltables de Cerati, Soda, Spinetta y Charly.',
        indices: [0, 4, 6, 11],
      },
      {
        nombre: 'Noches de Estudio & Indie',
        descripcion: 'Sonidos atmosféricos y sintetizadores para concentrarse.',
        indices: [1, 2, 5, 8, 9],
      },
      {
        nombre: 'Para Arrancar el Día',
        descripcion: 'Temas con energía arriba para salir a caminar o entrenar.',
        indices: [3, 7, 10],
      },
    ];

    const coleccionesCreadas = [];
    for (let p = 0; p < playlistsData.length; p++) {
      const pl = playlistsData[p];
      const colRes = await client.query(
        `INSERT INTO colecciones (usuario_id, nombre, descripcion, fecha_creacion, fecha_actualizacion)
         VALUES ($1, $2, $3, NOW() - ($4 || ' days')::interval, NOW() - ($5 || ' days')::interval)
         RETURNING id, nombre`,
        [usuarioId, pl.nombre, pl.descripcion, 14 - p * 3, 2]
      );
      const col = colRes.rows[0];
      coleccionesCreadas.push(col);

      for (let pos = 0; pos < pl.indices.length; pos++) {
        const song = cancionesIds[pl.indices[pos]];
        await client.query(
          `INSERT INTO colecciones_canciones (coleccion_id, cancion_id, posicion, fecha_agregado)
           VALUES ($1, $2, $3, NOW() - ($4 || ' days')::interval)`,
          [col.id, song.id, pos + 1, 10 - p * 2]
        );
      }
    }

    // 6. Historial de reproducciones (para estadísticas en Home y Estadísticas)
    const historialReproducciones = [
      { idx: 0, dias: 0, horas: 2 },
      { idx: 2, dias: 0, horas: 5 },
      { idx: 1, dias: 1, horas: 3 },
      { idx: 0, dias: 1, horas: 18 },
      { idx: 3, dias: 2, horas: 4 },
      { idx: 4, dias: 2, horas: 14 },
      { idx: 2, dias: 3, horas: 6 },
      { idx: 6, dias: 3, horas: 20 },
      { idx: 7, dias: 4, horas: 9 },
      { idx: 1, dias: 5, horas: 11 },
      { idx: 5, dias: 5, horas: 21 },
      { idx: 8, dias: 6, horas: 15 },
      { idx: 0, dias: 6, horas: 19 },
      { idx: 3, dias: 7, horas: 12 },
    ];

    for (const rep of historialReproducciones) {
      const song = cancionesIds[rep.idx];
      await client.query(
        `INSERT INTO reproducciones (usuario_id, cancion_id, fecha_inicio, segundos_escuchados, completada, fuente)
         VALUES ($1, $2, NOW() - ($3 || ' days')::interval - ($4 || ' hours')::interval, $5, TRUE, 'web')`,
        [usuarioId, song.id, rep.dias, rep.horas, song.duracion]
      );
    }

    // 7. Actividad reciente variada (para Home y Perfil)
    const actividades = [
      { tipo: 'reproduccion', cancion_id: cancionesIds[0].id, coleccion_id: null, detalles: { titulo: cancionesIds[0].titulo }, minutos: 35 },
      { tipo: 'resena_creada', cancion_id: cancionesIds[2].id, coleccion_id: null, detalles: { titulo: cancionesIds[2].titulo }, minutos: 180 },
      { tipo: 'puntuar', cancion_id: cancionesIds[1].id, coleccion_id: null, detalles: { titulo: cancionesIds[1].titulo, valor: 5 }, minutos: 420 },
      { tipo: 'marcar_favorito', cancion_id: cancionesIds[6].id, coleccion_id: null, detalles: { titulo: cancionesIds[6].titulo }, minutos: 960 },
      { tipo: 'agregar_a_coleccion', cancion_id: cancionesIds[4].id, coleccion_id: coleccionesCreadas[0].id, detalles: { titulo: cancionesIds[4].titulo, nombre: coleccionesCreadas[0].nombre }, minutos: 1500 },
      { tipo: 'crear_coleccion', cancion_id: null, coleccion_id: coleccionesCreadas[2].id, detalles: { nombre: coleccionesCreadas[2].nombre }, minutos: 2880 },
      { tipo: 'biblioteca_actualizada', cancion_id: cancionesIds[7].id, coleccion_id: null, detalles: { titulo: cancionesIds[7].titulo, estado: 'escuchando' }, minutos: 4320 },
      { tipo: 'biblioteca_agregada', cancion_id: cancionesIds[11].id, coleccion_id: null, detalles: { titulo: cancionesIds[11].titulo, estado: 'quiero_escuchar' }, minutos: 5760 },
    ];

    for (const act of actividades) {
      await client.query(
        `INSERT INTO actividad (usuario_id, tipo, cancion_id, coleccion_id, detalles, fecha)
         VALUES ($1, $2, $3, $4, $5::jsonb, NOW() - ($6 || ' minutes')::interval)`,
        [usuarioId, act.tipo, act.cancion_id, act.coleccion_id, JSON.stringify(act.detalles), act.minutos]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Cuenta demo cargada correctamente:');
    console.log(`   Email:    ${DEMO_USER.email}`);
    console.log(`   Password: ${DEMO_USER.passwordPlano}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al ejecutar el seed demo:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDemo();