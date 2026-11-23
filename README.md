Integrantes: Valentina Elterman, Ailin Severino, Sofia Zalucki, Alejo Campano y Santiago Schettini

Responsabilidades:
Valentina Elterman: Desarrollar la base de datos, escribir el codigo de usuario y perfil en el backend (endpoints, los auth), rutas publicas y privadas. Perfil, biblioteca, colecciones.
Ailin Severino: Desarrollar la base de datos, estructurar el backend, validaciones y conexion a la base de datos. Estadisticas, correcciones posteriores de la base de datos.
Santiago Schettini: Estructurar frontend, view de registro e insertar endpoints login y registro.
Alejo Campano: Diseñar Figma, view de registro e insertar endpoints login y registro. Colecciones.
Sofia Zalucki: Componentes funcionales.

Tematica: Musica, Spotify Wrapped

Arquitectura: 
TP_FINAL_BACKEND 
|_Database: 
1. script bd.sql
2. schema.sql
|_src
  |_config:
    1. db.js
  |_controllers:
    1. authController.js
    2. bibliotecaController.js
    3. coleccionesController.js
    4. estadisticasController.js
    5. musicaController.js
    6. perfilController.js
    7. puntuacionesController.js
    8. reseñasController.js
  |_middlewares:
    1. authMiddlewares.js
    2. errorMiddlewares.js
  |_routes:
    1. authRoutes.js
    2. bibliotecaRoutes.js
    3. coleccionesRoutes.js
    4. estadisticasRoutes.js
    5. musicaRoutes.js
    6. perfilRoutes.js
    7. puntuacionesRoutes.js
    8. reseñasRoutes.js
  |_services:
    1. actividadService.js
    2. apiService.js
    3. authService.js
    4. bibliotecaService.js
    5. coleccionesService.js
    6. estadisticasCalcular.js
    7. musicaService.js
    8. perfilService.js
    9. puntuacionService.js
    10. resenasService.js
app.js |.env |.gitignore |_package-lock.json |_package.json |_README.md |_server.js


DAI-EFSI-FRONTEND/ ├── src/ │ ├── componentes/ │ │ ├── biblioteca/ │ │ │ ├── BotonFavorito/ │ │ │ │ ├── BotonFavorito.css │ │ │ │ └── BotonFavorito.tsx │ │ │ ├── FormularioPuntuacion/ │ │ │ │ ├── FormularioPuntuacion.css │ │ │ │ └── FormularioPuntuacion.tsx │ │ │ ├── FormularioReseña/ │ │ │ │ ├── FormularioReseña.css │ │ │ │ └── FormularioReseña.tsx │ │ │ └── SelectorEstado/ │ │ │ ├── SelectorEstado.css │ │ │ └── SelectorEstado.tsx │ │ ├── comunes/ │ │ │ ├── Buscador/ │ │ │ │ ├── Buscador.css │ │ │ │ └── Buscador.tsx │ │ │ ├── Filtros/ │ │ │ │ ├── Filtros.css │ │ │ │ └── Filtros.tsx │ │ │ ├── Loading/ │ │ │ │ ├── Loading.css │ │ │ │ └── Loading.tsx │ │ │ ├── MensajeError/ │ │ │ │ ├── MensajeError.css │ │ │ │ └── MensajeError.tsx │ │ │ └── Modal/ │ │ │ ├── Modal.css │ │ │ └── Modal.tsx │ │ ├── layout/ │ │ │ ├── MainLayout/ │ │ │ │ ├── MainLayout.css │ │ │ │ └── MainLayout.tsx │ │ │ ├── Navbar/ │ │ │ │ ├── Navbar.css │ │ │ │ └── Navbar.tsx │ │ │ └── Sidebar/ │ │ │ ├── Sidebar.css │ │ │ └── Sidebar.tsx │ │ ├── musica/ │ │ │ ├── AlbumCard/ │ │ │ │ ├── AlbumCard.css │ │ │ │ └── AlbumCard.tsx │ │ │ ├── ArtistaCard/ │ │ │ │ ├── ArtistaCard.css │ │ │ │ └── ArtistaCard.tsx │ │ │ ├── CancionCard/ │ │ │ │ ├── CancionCard.css │ │ │ │ └── CancionCard.tsx │ │ │ ├── ListaCanciones/ │ │ │ │ ├── ListaCanciones.css │ │ │ │ └── ListaCanciones.tsx │ │ │ └── Reproductor/ │ │ │ ├── Reproductor.css │ │ │ └── Reproductor.tsx │ │ └── playlists/ │ │ ├── FormularioPlaylist/ │ │ │ ├── FormularioPlaylist.css │ │ │ └── FormularioPlaylist.tsx │ │ └── PlaylistCard/ │ │ ├── PlaylistCard.css │ │ └── PlaylistCard.tsx │ ├── context/ │ │ ├── PlayerContext/ │ │ │ └── PlayerContext.tsx │ │ └── UserContext/ │ │ └── UserContext.tsx │ ├── hooks/ │ │ └── useMusica.js │ ├── pages/ │ │ ├── Biblioteca/ │ │ │ ├── Biblioteca.css │ │ │ └── Biblioteca.tsx │ │ ├── DetalleCancion/ │ │ │ ├── DetalleCancion.css │ │ │ └── DetalleCancion.tsx │ │ ├── DetallePlaylist/ │ │ │ ├── DetallePlaylist.css │ │ │ └── DetallePlaylist.tsx │ │ ├── Estadisticas/ │ │ │ ├── Estadisticas.css │ │ │ └── Estadisticas.tsx │ │ ├── Explorar/ │ │ │ ├── Explorar.css │ │ │ └── Explorar.tsx │ │ ├── Home/ │ │ │ ├── Home.css │ │ │ └── Home.tsx │ │ ├── Login/ │ │ │ ├── Login.css │ │ │ └── Login.tsx │ │ ├── Perfil/ │ │ │ ├── Perfil.css │ │ │ └── Perfil.tsx │ │ ├── Playlist/ │ │ │ ├── Playlist.css │ │ │ └── Playlist.tsx │ │ └── Registro/ │ │ ├── Registro.css │ │ └── Registro.tsx │ ├── services/ │ │ ├── api.js │ │ ├── authService.js │ │ ├── bibliotecaService.js │ │ ├── estadisticasService.js │ │ ├── musicaService.js │ │ ├── perfilService.js │ │ └── playlistService.js │ ├── styles/ │ │ ├── global.css │ │ └── variables.css │ ├── App.tsx │ └── main.tsx ├── .env ├── .gitignore ├── index.html ├── package-lock.json ├── package.json ├── README.md ├── tsconfig.json └── vite.config.js

Instalación Local: npm i

Variables Necesarias (.env): 
-Del backend: PORT DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME JWT_SECRET JWT_EXPIRES_IN FRONTEND_URL LASTFM_API_KEY LASTFM_SHARED_SECRET NODE_ENV COOKIE_SAMESITE
-Del frontend: VITE_API_URL

Comandos para Correr el Proyecto:
BACKEND: npm i, node server.js // npm run dev
FRONTEND: npm i, npm run dev

API Externa: 'https://ws.audioscrobbler.com/2.0/'

Endpoint del Backend:
Usuario:
POST /api/auth/registro (creamos el perfil junto con el usuario)
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
PUT /api/auth/actualizar
DELETE /api/auth/eliminar

Perfil:
GET /api/perfil
PUT /api/perfil
DELETE /api/perfil (desactivar cuenta)
GET /api/perfil/actividad

Música:
GET /api/musica (explorar en Last.fm)
POST /api/musica (importar/guardar canción)
GET /api/musica/:id (detalle de canción)
POST /api/musica/:id/reproducciones

Biblioteca:
GET /api/biblioteca
POST /api/biblioteca
PUT /api/biblioteca
PATCH /api/biblioteca/:cancionId/favorita
DELETE /api/biblioteca/:cancionId

Colecciones (Playlists):
GET /api/colecciones
POST /api/colecciones
GET /api/colecciones/:id
PUT /api/colecciones/:id
DELETE /api/colecciones/:id
POST /api/colecciones/:id/canciones
DELETE /api/colecciones/:id/canciones/:cancionId

Puntuaciones:
GET /api/puntuaciones
POST /api/puntuaciones
PUT /api/puntuaciones/:id
DELETE /api/puntuaciones/:id

Reseñas:
GET /api/resenas
POST /api/resenas
PUT /api/resenas/:id
DELETE /api/resenas/:id

Estadísticas:
GET /api/estadisticas

Modelo de Datos: La base de datos relacional (PostgreSQL) está estructurada en las siguientes entidades principales: Usuarios & Perfiles: usuarios, perfiles (relación 1 a 1). 

Catálogo Musical: canciones, artistas, albumes, generos (IDs vinculados a Last.fm). 

Biblioteca Personal: biblioteca (estado de escucha y favoritos). 

Organización & Opiniones: colecciones, colecciones_canciones, puntuaciones, reseñas. Historial: reproducciones y actividad.

Estrategia de Autenticación: utilizamos JWT, cookies HTTP-only y encriptamiento de la contraseña con hash con bycrypt.

Links de Despliegue: https://github.com/ValentinaElterman/TP_FINAL_BACKEND.git
https://github.com/santische/DAI-EFSI-FRONTEND.git



