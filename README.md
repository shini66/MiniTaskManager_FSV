# MiniTaskManager

Aplicación full-stack para gestionar tareas personales con autenticación, panel de trabajo y integración con WordPress.

Proyecto desarrollado por: Kelly Acosta

| Capa | Tecnología | Directorio |
|------|------------|------------|
| Frontend | React + Vite + Tailwind CSS | [`frontend/`](frontend/) |
| Backend | Express + MongoDB + Mongoose | [`backend/`](backend/) |
| API Spec | OpenAPI 3.1 | `openapi.yaml` |

---

## Descripción

MiniTaskManager es una app para crear, editar, completar y eliminar tareas diarias. Incorpora:

- registro e inicio de sesión con JWT
- rutas protegidas para usuarios autenticados
- dashboard con tareas, filtros y paginación
- integración con la API REST de WordPress para visualizar posts
- diseño visual moderno y femenino con una identidad propia

---

## Requisitos

- Node.js 20+
- npm 9+
- MongoDB 7+ (local o Atlas)
- WordPress opcional para la sección de posts

---

## Estructura del proyecto

```bash
MiniTaskManager_FSV/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── src/
│   ├── api/
│   ├── server.js
│   ├── package.json
│   └── README.md
├── .env
├── openapi.yaml
├── README.md
├── LICENSE
└── package-lock.json
```

---

## Instalación local

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Variables de entorno

Archivo raíz `.env`:

```env
HOST=localhost
PORT=3000
MONGODB_URI=mongodb://localhost:27017/minitask
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

Frontend:

```env
VITE_API_URL=http://localhost:3000
```

---

## Endpoints principales

### Autenticación

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Tareas

- POST `/api/tasks/create`
- GET `/api/tasks/me`
- PUT `/api/tasks/update/:id`
- PATCH `/api/tasks/toggle/:id`
- DELETE `/api/tasks/delete/:id`

---

## Objetivo del proyecto

Este proyecto fue desarrollado como una solución personal de gestión de tareas, con enfoque en organización, productividad y una interfaz amigable para uso diario.

---

## Licencia

Este proyecto se distribuye bajo la licencia MIT.

Copyright (c) 2026 Kelly Acosta

---

## Autor

Kelly Acosta
