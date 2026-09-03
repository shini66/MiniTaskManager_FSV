# MiniTaskManager FSV — Backend

API RESTful para gestion de tareas con autenticacion JWT. Construida con Express 5 y MongoDB.

---

## Tech Stack

| Herramienta | Version |
|-------------|---------|
| Node.js | 20+ |
| Express | ^5.2.1 |
| Mongoose | ^9.7.3 |
| MongoDB | 7+ |
| jsonwebtoken | ^9.0.3 |
| bcryptjs | ^3.0.3 |
| dotenv | ^17.4.2 |
| cors | ^2.8.6 |

---

## Arquitectura

Capas separadas con responsabilidades definidas:

```
server.js                        → Entry point local: conecta a Mongo y hace listen en env.HOST:env.PORT
src/
  app.js                         → Configura Express: cors({ origin: '*' }), express.json(),
                                   GET / health, montaje de /api, handler 404 y handler 500
  config/
    env.js                       → Variables de entorno, cargadas desde ../../../.env (el .env de la raiz).
                                   Defaults: PORT=3050, HOST='127.0.0.1',
                                   MONGODB_URI='mongodb://localhost:27017',
                                   JWT_SECRET='some_secret_key', JWT_EXPIRES_IN='24h'
    db.js                        → connectDB(): mongoose.connect(env.MONGODB_URI) tal cual.
                                   Logea exito/error y hace process.exit(1) si falla
  routes/
    index.js                     → Agregador: /auth + /tasks bajo el prefijo /api
    auth.routes.js               → POST /register, POST /login (publicas);
                                   POST /logout, GET /me (con JWT)
    task.routes.js               → POST /create, GET /me, PUT /update/:id,
                                   PATCH /toggle/:id, DELETE /delete/:id (todas con JWT)
  controllers/
    auth.controller.js           → register (201/400), login (200/401),
                                   getMe (200/400, devuelve req.user), logout (200, stateless)
    task.controller.js           → create (201/400), getTasks (200/400, parsea page/limit con
                                   parseInt(...) || fallback, order con || 1),
                                   update/delete/toggle con handleTaskError (404 si el mensaje
                                   incluye 'not found', 400 en otro caso)
  services/
    auth.service.js              → registerUser: rechaza si user o email existen;
                                   crea usuario, genera token y resuelve
                                   { user: { id, user, email }, token }.
                                   loginUser: busca por user, compara con comparePassword,
                                   rechaza con 'Invalid credentials' si falla
    task.service.js              → createTask, getTasksByUser (filtros search/status,
                                   paginacion page/limit, sort por createdAt segun order),
                                   updateTask (findOneAndUpdate por {_id, user}),
                                   deleteTask (findOneAndDelete por {_id, user}),
                                   toggleTask (invierte completed y guarda).
                                   Todos rechazan con 'Task not found or not authorized'
                                   si no hay coincidencia de id + usuario
  models/
    User.js                      → Schema { user (requerido, unico), email (requerido, unico),
                                   password (requerido) } + timestamps.
                                   pre('save'): hash bcrypt genSalt(10) solo si password modificado
    Task.js                      → Schema { title (requerido), description (opcional),
                                   completed (default false), user (ObjectId -> User, requerido) }
                                   + timestamps
  middlewares/
    auth.middleware.js           → protect: exige Authorization: Bearer <token>.
                                   Sin header o mal formato → 401 { message: "Not authorization" }.
                                   Token invalido / usuario inexistente → 401
                                   { message: "Not authorized" [, error] }.
                                   Exito: req.user = doc User sin password y next()
  utils/
    generateToken.js             → jwt.sign({ id: user._id, user: user.user },
                                   env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN }).
                                   Lanza Error("Error generating token") si falla
api/
  index.js                       → Entry point serverless (Vercel): handler con flag
                                   isConnected (conexion lazy, una sola vez) que delega en app
```

**Flujo tipico:** `Route → auth.middleware (si aplica) → Controller → Service → Model (Mongoose)`

---

## Endpoints

Base local por defecto: `http://127.0.0.1:3050` (ver Variables de Entorno; el `.env` actual usa `HOST=localhost`).

### Salud

| Metodo | Ruta | Auth | Respuesta |
|--------|------|------|-----------|
| GET | `/` | No | `200 { status: "API funcionando ✅" }` |

### Autenticacion (`/api/auth`)

| Metodo | Ruta | Auth | Exito | Errores |
|--------|------|------|-------|---------|
| POST | `/register` | No | `201 { user: { id, user, email }, token }` | `400 { message }` (usuario/email duplicado o validacion) |
| POST | `/login` | No | `200 { user: { id, user, email }, token }` | `401 { message: "Invalid credentials" }` |
| POST | `/logout` | JWT | `200 { message: "Logged out successfully" }` (stateless, no invalida el token) | `401 { message }` (sin token o invalido) |
| GET | `/me` | JWT | `200` documento User sin password (`_id, user, email, createdAt, updatedAt, __v`) | `401 { message }` / `400 { message }` |

Body esperados: `register { user, email, password }`, `login { user, password }`.

### Tareas (`/api/tasks`, todas con JWT)

| Metodo | Ruta | Exito | Errores |
|--------|------|-------|---------|
| POST | `/create` | `201` Task (`_id, title, description, completed, user, createdAt, updatedAt, __v`) | `400 { message }`, `401` |
| GET | `/me` | `200 { tasks, page, totalPages, totalTasks }` | `400 { message }` (`Invalid status filter`, etc.), `401` |
| PUT | `/update/:id` | `200` Task actualizada (solo `title`/`description`) | `404` si no existe o no es del usuario, `400` otro error, `401` |
| PATCH | `/toggle/:id` | `200` Task con `completed` invertido | `404` si no existe o no es del usuario, `400` otro error, `401` |
| DELETE | `/delete/:id` | `200 { message: "Task deleted successfully" }` | `404` si no existe o no es del usuario, `400` otro error, `401` |

Notas:

- `update` solo acepta `title`/`description` (el controlador ignora el resto; `completed` solo cambia via `toggle`).
- Todas las operaciones de tareas filtran por `{ _id: taskId, user: userId }`: un usuario nunca toca tareas ajenas.
- Respuestas de error de tareas usan `handleTaskError`: `404` si el mensaje contiene `not found`, `400` en caso contrario.

### Parametros de consulta — `GET /api/tasks/me`

| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `search` | string | - | Busqueda por titulo o descripcion (regex, case-insensitive) |
| `status` | `completed` / `pending` | - | Filtrar por estado. Otro valor → `400 { message: "Invalid status filter" }` |
| `page` | integer | `1` | Numero de pagina (`parseInt(query.page) \|\| 1`) |
| `limit` | integer | `10` | Tareas por pagina (`parseInt(query.limit) \|\| 10`) |
| `order` | `1` / `-1` | `1` | Orden por `createdAt`. El controlador usa `req.query.order \|\| 1` y el servicio normaliza con `Number(order)` y ordena con `.sort({ createdAt: sortOrder })` |

### Manejo global de errores (`src/app.js`)

- Ruta no coincidente → `404 { message: "Endpoint not found" }`.
- Excepcion no capturada → `500 { message: "Internal server error" }` (con `console.error`).
- Auth: ver mensajes literales en la seccion de Arquitectura (`"Not authorization"` vs `"Not authorized"`).

---

## Modelos de Datos

### User

```json
{
  "user": "String (requerido, unico)",
  "email": "String (requerido, unico)",
  "password": "String (hasheado con bcrypt)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Metodo de instancia: `comparePassword(candidate)` — compara password con hash.

### Task

```json
{
  "title": "String (requerido)",
  "description": "String (opcional)",
  "completed": "Boolean (default: false)",
  "user": "ObjectId -> User (requerido)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Variables de Entorno

`src/config/env.js` carga el `.env` de la **raiz del proyecto** (`path.resolve(__dirname, "../../../.env")`).

| Variable | Default en codigo | Valor actual en `.env` raiz |
|----------|-------------------|-----------------------------|
| `PORT` | `3050` | `3050` |
| `HOST` | `127.0.0.1` | `localhost` |
| `MONGODB_URI` | `mongodb://localhost:27017` | `mongodb://localhost:27017/minitask` |
| `JWT_SECRET` | `some_secret_key` | `some_secret_key` |
| `JWT_EXPIRES_IN` | `24h` | `24h` |

Ejemplo (`.env` en la raiz):

```
HOST=localhost
PORT=3050
MONGODB_URI=mongodb://localhost:27017/minitask
JWT_SECRET=some_secret_key
JWT_EXPIRES_IN=24h
```

---

## Instalacion y Ejecucion

```bash
# Instalar dependencias
npm install

# Desarrollo (con nodemon, ejecuta server.js)
npm run dev

# Produccion
npm start
```

Scripts (`package.json`, `type: module`):

- `npm start` → `node server.js`
- `npm run dev` → `nodemon server.js`
- `npm test` → placeholder (`echo "Error: no test specified" && exit 1`, falla a proposito)

Requisitos: Node.js 20+, MongoDB 7+ (local o Atlas).

## Despliegue en Vercel

- Entry point serverless: `api/index.js` (no `server.js`). Usa conexion lazy a MongoDB con flag `isConnected` para reutilizar la conexion entre invocaciones.
- No hay `vercel.json` en el repo actualmente; el despliegue usa la deteccion por defecto de Vercel para la funcion `api/index.js`.

---

## OpenAPI Spec

La especificacion completa OpenAPI 3.1 esta en `backend/openapi.yaml` (servidor `http://127.0.0.1:3050`). Puedes importarla en herramientas como Postman, Insomnia o Swagger UI. Incluye los schemas `RegisterRequest`, `LoginRequest`, `CreateTaskRequest`, `UpdateTaskRequest` (solo `title`/`description`), `AuthResponse`, `PublicUser`, `CurrentUser`, `Task`, `TaskListResponse` (`tasks, page, totalPages, totalTasks`), `MessageResponse` y `Error`, mas el parametro `order` (`1`/`-1`, default `1`) en `GET /api/tasks/me`.
