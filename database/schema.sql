-- =====================================================================
-- VASAS - Esquema de base de datos (PostgreSQL)
-- App de seguimiento musical estilo Spotify Wrapped
--
-- Uso:  psql -U postgres -d VASAS -f database/schema.sql
-- (primero crear la base:  CREATE DATABASE "VASAS";)
--
-- Este script es re-ejecutable: borra las tablas si ya existen y las
-- vuelve a crear. NO lo corras en producción si ya hay datos reales.
-- =====================================================================

DROP TABLE IF EXISTS actividad            CASCADE;
DROP TABLE IF EXISTS reproducciones       CASCADE;
DROP TABLE IF EXISTS "reseñas"            CASCADE;
DROP TABLE IF EXISTS puntuaciones         CASCADE;
DROP TABLE IF EXISTS colecciones_canciones CASCADE;
DROP TABLE IF EXISTS colecciones          CASCADE;
DROP TABLE IF EXISTS biblioteca           CASCADE;
DROP TABLE IF EXISTS cancion_generos      CASCADE;
DROP TABLE IF EXISTS cancion_artistas     CASCADE;
DROP TABLE IF EXISTS canciones            CASCADE;
DROP TABLE IF EXISTS albumes              CASCADE;
DROP TABLE IF EXISTS artistas             CASCADE;
DROP TABLE IF EXISTS generos              CASCADE;
DROP TABLE IF EXISTS perfiles             CASCADE;
DROP TABLE IF EXISTS usuarios             CASCADE;

-- ---------------------------------------------------------------------
-- 1. USUARIOS Y AUTENTICACIÓN
-- ---------------------------------------------------------------------

CREATE TABLE usuarios (
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username       VARCHAR(50)  NOT NULL UNIQUE,
    email          VARCHAR(100) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,          -- guarda el HASH de bcrypt, nunca la contraseña real
    activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Un perfil por usuario (relación 1 a 1)
CREATE TABLE perfiles (
    usuario_id   INTEGER PRIMARY KEY
                 REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
    nombre       VARCHAR(100) NOT NULL,
    foto         VARCHAR(500),                      -- URL del avatar
    bio          TEXT,
    preferencias JSONB NOT NULL DEFAULT '{}'::jsonb -- ej: {"generos_favoritos":["Rock","Pop"],"tema":"oscuro"}
);

-- ---------------------------------------------------------------------
-- 2. CATÁLOGO MUSICAL
-- external_id = ID estable de la API externa (Deezer, Spotify, etc.).
-- Sirve para no duplicar una canción cada vez que alguien la guarda.
-- ---------------------------------------------------------------------

CREATE TABLE generos (
    id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE artistas (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    external_id VARCHAR(100) NOT NULL UNIQUE,
    nombre      VARCHAR(150) NOT NULL,
    foto        VARCHAR(500)
);

CREATE TABLE albumes (
    id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    external_id       VARCHAR(100) NOT NULL UNIQUE,
    titulo            VARCHAR(200) NOT NULL,
    foto              VARCHAR(500),
    fecha_lanzamiento DATE
);

CREATE TABLE canciones (
    id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    external_id       VARCHAR(100) NOT NULL UNIQUE,
    titulo            VARCHAR(200) NOT NULL,
    album_id          INTEGER REFERENCES albumes(id) ON UPDATE CASCADE ON DELETE SET NULL,
    duracion          INTEGER NOT NULL CHECK (duracion > 0),  -- en segundos
    foto              VARCHAR(500),
    preview_url       VARCHAR(500),                            -- fragmento de audio de la API
    fecha_lanzamiento DATE
);

-- Una canción puede tener varios artistas y varios géneros (N a N)
CREATE TABLE cancion_artistas (
    cancion_id INTEGER NOT NULL REFERENCES canciones(id) ON UPDATE CASCADE ON DELETE CASCADE,
    artista_id INTEGER NOT NULL REFERENCES artistas(id)  ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (cancion_id, artista_id)
);

CREATE TABLE cancion_generos (
    cancion_id INTEGER NOT NULL REFERENCES canciones(id) ON UPDATE CASCADE ON DELETE CASCADE,
    genero_id  INTEGER NOT NULL REFERENCES generos(id)   ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (cancion_id, genero_id)
);

-- ---------------------------------------------------------------------
-- 3. BIBLIOTECA PERSONAL
-- Estados: quiero_escuchar | escuchando | escuchado
-- "Favorito" se guarda aparte en es_favorita (una canción puede estar
-- "escuchada" y a la vez ser favorita).
-- ---------------------------------------------------------------------

CREATE TABLE biblioteca (
    id                  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id          INTEGER NOT NULL REFERENCES usuarios(id)  ON UPDATE CASCADE ON DELETE CASCADE,
    cancion_id          INTEGER NOT NULL REFERENCES canciones(id) ON UPDATE CASCADE ON DELETE CASCADE,
    estado              VARCHAR(20) NOT NULL DEFAULT 'quiero_escuchar'
                        CHECK (estado IN ('quiero_escuchar', 'escuchando', 'escuchado')),
    es_favorita         BOOLEAN   NOT NULL DEFAULT FALSE,
    fecha_agregado      TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, cancion_id)   -- una canción solo una vez por usuario
);

-- ---------------------------------------------------------------------
-- 4. ORGANIZACIÓN: COLECCIONES / PLAYLISTS
-- ---------------------------------------------------------------------

CREATE TABLE colecciones (
    id                  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id          INTEGER NOT NULL REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         VARCHAR(500),
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE colecciones_canciones (
    coleccion_id   INTEGER NOT NULL REFERENCES colecciones(id) ON UPDATE CASCADE ON DELETE CASCADE,
    cancion_id     INTEGER NOT NULL REFERENCES canciones(id)   ON UPDATE CASCADE ON DELETE CASCADE,
    fecha_agregado TIMESTAMP NOT NULL DEFAULT NOW(),
    posicion       INTEGER,                                    -- orden dentro de la playlist
    PRIMARY KEY (coleccion_id, cancion_id)
);

-- ---------------------------------------------------------------------
-- 5. OPINIONES
-- ---------------------------------------------------------------------

CREATE TABLE puntuaciones (
    id                  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id          INTEGER NOT NULL REFERENCES usuarios(id)  ON UPDATE CASCADE ON DELETE CASCADE,
    cancion_id          INTEGER NOT NULL REFERENCES canciones(id) ON UPDATE CASCADE ON DELETE CASCADE,
    valor               INTEGER NOT NULL CHECK (valor BETWEEN 1 AND 5),
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, cancion_id)
);

CREATE TABLE "reseñas" (
    id                  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id          INTEGER NOT NULL REFERENCES usuarios(id)  ON UPDATE CASCADE ON DELETE CASCADE,
    cancion_id          INTEGER NOT NULL REFERENCES canciones(id) ON UPDATE CASCADE ON DELETE CASCADE,
    texto               TEXT NOT NULL CHECK (length(trim(texto)) > 0),
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, cancion_id)
);

-- ---------------------------------------------------------------------
-- 6. ACTIVIDAD E HISTORIAL
-- ---------------------------------------------------------------------

-- Cada vez que el usuario escucha una canción (base de las estadísticas:
-- artistas más escuchados, géneros, hábitos por horario, resumen anual).
CREATE TABLE reproducciones (
    id                  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id          INTEGER NOT NULL REFERENCES usuarios(id)  ON UPDATE CASCADE ON DELETE CASCADE,
    cancion_id          INTEGER NOT NULL REFERENCES canciones(id) ON UPDATE CASCADE ON DELETE CASCADE,
    fecha_inicio        TIMESTAMP NOT NULL DEFAULT NOW(),
    segundos_escuchados INTEGER   NOT NULL DEFAULT 0 CHECK (segundos_escuchados >= 0),
    completada          BOOLEAN   NOT NULL DEFAULT FALSE,
    fuente              VARCHAR(50)                          -- ej: 'biblioteca', 'busqueda', 'playlist'
);

-- Registro de acciones del usuario (para "actividad reciente").
-- Valores sugeridos para tipo:
--   agregar_biblioteca, cambiar_estado, marcar_favorito, quitar_favorito,
--   puntuar, crear_resena, editar_resena, crear_coleccion, agregar_a_coleccion
-- cancion_id y coleccion_id pueden ser NULL: no toda acción involucra ambos.
CREATE TABLE actividad (
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id   INTEGER NOT NULL REFERENCES usuarios(id)      ON UPDATE CASCADE ON DELETE CASCADE,
    tipo         VARCHAR(50) NOT NULL,
    cancion_id   INTEGER REFERENCES canciones(id)   ON UPDATE CASCADE ON DELETE SET NULL,
    coleccion_id INTEGER REFERENCES colecciones(id) ON UPDATE CASCADE ON DELETE SET NULL,
    detalles     JSONB,                                         -- ej: {"estado_anterior":"escuchando","estado_nuevo":"escuchado"}
    fecha        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- ÍNDICES (aceleran las consultas más frecuentes y las estadísticas)
-- ---------------------------------------------------------------------

CREATE INDEX idx_biblioteca_usuario_estado ON biblioteca (usuario_id, estado);
CREATE INDEX idx_biblioteca_favoritas      ON biblioteca (usuario_id) WHERE es_favorita;
CREATE INDEX idx_colecciones_usuario       ON colecciones (usuario_id);
CREATE INDEX idx_reproducciones_usuario    ON reproducciones (usuario_id, fecha_inicio);
CREATE INDEX idx_reproducciones_cancion    ON reproducciones (cancion_id);
CREATE INDEX idx_actividad_usuario_fecha   ON actividad (usuario_id, fecha DESC);
CREATE INDEX idx_cancion_artistas_artista  ON cancion_artistas (artista_id);
CREATE INDEX idx_cancion_generos_genero    ON cancion_generos (genero_id);