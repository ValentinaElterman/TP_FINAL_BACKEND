Integrantes: Valentina Elterman, Ailin Severino, Sofia Zalucki, Alejo Campano y Santiago Schettini

Responsabilidades:
- Valentina Elterman: Desarrollar la base de datos, escribir el codigo de usuario y perfil en el backend (endpoints, los auth), rutas publicas y privadas
- Ailin Severino: Desarrollar la base de datos, estructurar el backend, validaciones y conexion a la base de datos.
- Santiago Schettini: Estructurar frontend, view de registro e insertar endpoints login y registro.
- Alejo Campano: Diseñar Figma, view de registro e insertar endpoints login y registro.
- Sofia Zalucki:

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
      1. apiService.js
      2. estadisticasCalcular.js
  1. app.js
|_.env
|_.gitignore
|_package-lock.json
|_package.json
|_README.md
|_server.js

DAI-EFSI-FRONTEND/
├── src/
│   ├── componentes/
│   │   ├── biblioteca/
│   │   │   ├── BotonFavorito/
│   │   │   │   ├── BotonFavorito.css
│   │   │   │   └── BotonFavorito.tsx
│   │   │   ├── FormularioPuntuacion/
│   │   │   │   ├── FormularioPuntuacion.css
│   │   │   │   └── FormularioPuntuacion.tsx
│   │   │   ├── FormularioReseña/
│   │   │   │   ├── FormularioReseña.css
│   │   │   │   └── FormularioReseña.tsx
│   │   │   └── SelectorEstado/
│   │   │       ├── SelectorEstado.css
│   │   │       └── SelectorEstado.tsx
│   │   ├── comunes/
│   │   │   ├── Buscador/
│   │   │   │   ├── Buscador.css
│   │   │   │   └── Buscador.tsx
│   │   │   ├── Filtros/
│   │   │   │   ├── Filtros.css
│   │   │   │   └── Filtros.tsx
│   │   │   ├── Loading/
│   │   │   │   ├── Loading.css
│   │   │   │   └── Loading.tsx
│   │   │   ├── MensajeError/
│   │   │   │   ├── MensajeError.css
│   │   │   │   └── MensajeError.tsx
│   │   │   └── Modal/
│   │   │       ├── Modal.css
│   │   │       └── Modal.tsx
│   │   ├── layout/
│   │   │   ├── MainLayout/
│   │   │   │   ├── MainLayout.css
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── Navbar/
│   │   │   │   ├── Navbar.css
│   │   │   │   └── Navbar.tsx
│   │   │   └── Sidebar/
│   │   │       ├── Sidebar.css
│   │   │       └── Sidebar.tsx
│   │   ├── musica/
│   │   │   ├── AlbumCard/
│   │   │   │   ├── AlbumCard.css
│   │   │   │   └── AlbumCard.tsx
│   │   │   ├── ArtistaCard/
│   │   │   │   ├── ArtistaCard.css
│   │   │   │   └── ArtistaCard.tsx
│   │   │   ├── CancionCard/
│   │   │   │   ├── CancionCard.css
│   │   │   │   └── CancionCard.tsx
│   │   │   ├── ListaCanciones/
│   │   │   │   ├── ListaCanciones.css
│   │   │   │   └── ListaCanciones.tsx
│   │   │   └── Reproductor/
│   │   │       ├── Reproductor.css
│   │   │       └── Reproductor.tsx
│   │   └── playlists/
│   │       ├── FormularioPlaylist/
│   │       │   ├── FormularioPlaylist.css
│   │       │   └── FormularioPlaylist.tsx
│   │       └── PlaylistCard/
│   │           ├── PlaylistCard.css
│   │           └── PlaylistCard.tsx
│   ├── context/
│   │   ├── PlayerContext/
│   │   │   └── PlayerContext.tsx
│   │   └── UserContext/
│   │       └── UserContext.tsx
│   ├── hooks/
│   │   └── useMusica.js
│   ├── pages/
│   │   ├── Biblioteca/
│   │   │   ├── Biblioteca.css
│   │   │   └── Biblioteca.tsx
│   │   ├── DetalleCancion/
│   │   │   ├── DetalleCancion.css
│   │   │   └── DetalleCancion.tsx
│   │   ├── DetallePlaylist/
│   │   │   ├── DetallePlaylist.css
│   │   │   └── DetallePlaylist.tsx
│   │   ├── Estadisticas/
│   │   │   ├── Estadisticas.css
│   │   │   └── Estadisticas.tsx
│   │   ├── Explorar/
│   │   │   ├── Explorar.css
│   │   │   └── Explorar.tsx
│   │   ├── Home/
│   │   │   ├── Home.css
│   │   │   └── Home.tsx
│   │   ├── Login/
│   │   │   ├── Login.css
│   │   │   └── Login.tsx
│   │   ├── Perfil/
│   │   │   ├── Perfil.css
│   │   │   └── Perfil.tsx
│   │   ├── Playlist/
│   │   │   ├── Playlist.css
│   │   │   └── Playlist.tsx
│   │   └── Registro/
│   │       ├── Registro.css
│   │       └── Registro.tsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── bibliotecaService.js
│   │   ├── estadisticasService.js
│   │   ├── musicaService.js
│   │   ├── perfilService.js
│   │   └── playlistService.js
│   ├── styles/
│   │   ├── global.css
│   │   └── variables.css
│   ├── App.tsx
│   └── main.tsx
├── .env
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.js

Instalación Local: npm i

Variables Necesarias: PORT, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI

Comandos para Correr el Proyecto:
- BACKEND: npm i, node server.js // npm run dev
- FRONTEND: npm i, npm run dev

API Externa: https://developer.spotify.com/documentation/web-api

Endpoint del Backend:
- Usuario:
1. POST /api/auth/registro (creamos el perfil junto con el usuario)
2. POST /api/auth/login
3. POST /api/auth/logout
4. PUT /api/auth/actualizar
5. DELETE /api/auth/eliminar
6. GET /api/auth/me

- Perfil:
1. POST /api/auth/registro (creamos el perfil junto con el usuario)
2. GET /api/perfil
3. PUT /api/perfil
4. DELETE /api/perfil

- Spotify:
1. GET /api/auth/spotify/url
2. POST /api/auth/spotify/importar

- habran mas proximamente!

Modelo de Datos: ?

Estrategia de Autenticación: utilizamos JWT, cookies HTTP-only y encriptamiento de la contraseña con hash con bycrypt.

Links de Despliegue: proximamente!