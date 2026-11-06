Integrantes: Valentina Elterman, Ailin Severino, Sofia Zalucki, Alejo Campano y Santiago Schettini

Responsabilidades:

Tematica: Musica, Spotify Wrapped

Arquitectura:

Instalación Local: npm i

Variables Necesarias: PORT, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL

Comandos para Correr el Proyecto: npm i, node server.js // npm run dev

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

- habran mas proximamente!

Modelo de Datos:

Estrategia de Autenticación: 

Links de Despliegue: proximamente!