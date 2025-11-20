# Manual Técnico — Sistema de Inventario (Clínica)

Última actualización: 20-11-2025

## Resumen

Este documento recopila la documentación técnica de la aplicación "Sistema de Inventario" (backend y frontend), explica su arquitectura, cómo instalarla y ejecutarla, describe los endpoints, modelos de datos, y recomendaciones de despliegue y solución de problemas.

---

**Índice**

- [Estructura del repositorio](#estructura-del-repositorio)
- [Tecnologías](#tecnologias)
- [Instalación y ejecución local](#instalacion-y-ejecucion-local)
- [Variables de entorno (backend)](#variables-de-entorno-backend)
- [Backend — Arquitectura y endpoints](#backend--arquitectura-y-endpoints)
- [Frontend — Arquitectura y componentes](#frontend--arquitectura-y-componentes)
- [Modelos de datos](#modelos-de-datos)
- [Comportamiento offline y sincronización](#comportamiento-offline-y-sincronizacion)
- [Generación de PDF / Exportes](#generacion-de-pdf--exportes)
- [Despliegue y recomendaciones](#despliegue-y-recomendaciones)
- [Solución de problemas comunes](#solucion-de-problemas-comunes)
- [Cómo contribuir / Extender](#como-contribuir--extender)

---

## Estructura del repositorio

Raíz (resumen):

- `backend/` — Código del servidor (Express + Firebase Admin)
  - `server.js`, `app.js` (puntos de entrada y configuración)
  - `src/config/firebase.js` (inicializa Firebase Admin)
  - `src/routes/`, `src/controllers/`, `src/services/`, `src/middleware/` (lógica de API)
  - `README.md`, `package.json`
- `src/` — Frontend React (Vite)
  - `main.jsx`, `App.jsx`
  - `Pages/` (Login, Inventory, Movements, NewItemForm, MovementForm, Alerts)
  - `components/` (Table, Field, Button, StatsBox, etc.)
  - `utils/` (dataProvider, auth, pdfGenerator, helpers, i18n)
- `public/` — assets estáticos (manifest, sw, icons)
- `package.json` — dependencias frontend

> Nota: varios módulos backend están dentro de `backend/src/` y la app principal importa rutas desde `./src/...` (ver `backend/app.js`).

---

## Tecnologías

- Backend: Node.js >= 18, Express.js, Firebase Admin SDK (Firestore + Auth), helmet, cors, express-validator
- Frontend: React (v19+), Vite, Tailwind CSS, i18next, jsPDF (+ autotable)
- Base de datos / Auth: Firebase (Firestore y Authentication)

---

## Instalación y ejecución local

Sigue estos pasos en Windows PowerShell (desde la carpeta del repo):

1) Backend

```powershell
cd backend
npm install
# Ejecutar en desarrollo (nodemon)
npm run dev
```

El backend por defecto escucha en el `PORT` de `.env` (por defecto `5000`). Health check: `http://localhost:5000/health`.

2) Frontend

```powershell
cd ..\  # volver a la raíz si estás en backend
cd src
npm install
npm run dev
```

El frontend corre con Vite (por defecto `http://localhost:5173`). El `src/main.jsx` importa `App.jsx`.

---

## Variables de entorno (backend)

El backend requiere variables en `.env`. Campos clave:

- `PORT` — puerto del servidor (e.g. 5000)
- `NODE_ENV` — `development` | `production`
- `FIREBASE_PROJECT_ID` — ID del proyecto Firebase
- `FIREBASE_PRIVATE_KEY` — clave privada del service account (asegúrate de escapar saltos de línea o usar `replace(/\\n/g,'\n')` como se hace en `src/config/firebase.js`)
- `FIREBASE_CLIENT_EMAIL` — email del service account
- `FRONTEND_URL` — URL permitida para CORS

Ejemplo (parcial):

```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com
FRONTEND_URL=http://localhost:5173
```

---

## Backend — Arquitectura y endpoints

Estructura básica del servidor:

- `backend/app.js` — configura middlewares (helmet, cors, body parsers), rutas y manejadores de error.
- `backend/server.js` — arranca el servidor y maneja eventos globales (uncaughtException, unhandledRejection).
- `backend/src/config/firebase.js` — inicializa `firebase-admin`, exporta `db` (Firestore) y `auth`.
- Rutas importadas en `app.js`: `./src/routes/auth.routes.js`, `./src/routes/items.routes.js`, `./src/routes/movements.routes.js`.

Middlewares relevantes:

- `auth` (firebase token verification) — protege rutas si se requiere Authorization header.
- `errorHandler` y `notFoundHandler` — manejo centralizado de errores y 404.

Endpoints principales (resumen)

Autenticación (`/api/auth`):

- `POST /api/auth/login` — (dependiendo de implementación) autenticar con Firebase o delegar al frontend.
- `GET /api/auth/me` — devuelve info del usuario basado en token.
- `POST /api/auth/register` — registrar usuario (roles via custom claims).
- `GET /api/auth/users` — listar usuarios (admin).

Items (`/api/items`):

- `GET /api/items` — listar medicamentos
- `GET /api/items/:id` — obtener un item
- `GET /api/items/alerts` — alertas (caducados, proximos, bajo stock)
- `GET /api/items/search?q=` — búsqueda por término
- `POST /api/items` — crear item (Admin/Farmacia)
- `PUT /api/items/:id` — actualizar item
- `DELETE /api/items/:id` — eliminar/descartar item

Movimientos (`/api/movements`):

- `GET /api/movements` — listar movimientos
- `GET /api/movements/:id` — obtener movimiento
- `GET /api/movements/item/:itemId` — movimientos por item
- `GET /api/movements/stats` — estadísticas
- `POST /api/movements` — registrar movimiento (entrada/salida/descarte)
- `DELETE /api/movements/:id` — eliminar movimiento (admin)

Headers importantes:

- `Authorization: Bearer <firebase_id_token>` para rutas protegidas
- `Content-Type: application/json`

---

## Frontend — Arquitectura y componentes

Punto de entrada:

- `src/main.jsx` — monta `App.jsx`.
- `src/App.jsx` — contiene la navegación principal, manejo de sesión y llamadas a `dataProvider`.

Páginas principales (`src/Pages/`):

- `Login.jsx` — formulario de autenticación.
- `Inventory.jsx` — lista de items, búsqueda y acciones (entrada/salida/descartar).
- `Movements.jsx` — tabla de movimientos.
- `NewItemForm.jsx` — crear nuevo medicamento.
- `MovementForm.jsx` — registrar movimiento.
- `Alerts.jsx` — visor de alertas (vencidos / por vencer / stock bajo).

Componentes reutilizables (`src/components/`):

- `Table.jsx` — tabla simple y responsiva.
- `Field.jsx` — input controlado.
- `Button.jsx`, `Pill.jsx`, `StatsBox.jsx`, `LanguageSwitcher.jsx`, etc.

Utilities (`src/utils/`):

- `dataProvider.js` — cliente para llamar a la API (`API_BASE_URL = http://localhost:5000/api`) y contiene lógica offline (cola `pendingSync`, backup local en `localStorage`).
- `auth.js` — helpers para login/logout y obtener usuario local.
- `pdfGenerator.js` — funciones para exportar inventario y alertas a PDF (jsPDF + autotable).
- `helpers.js` — utilidades como `diasEntre`, `hoyISO`.

Comportamiento notable del frontend:

- Protección contra duplicación de movimientos (debounce / check de último movimiento).
- Fallback offline: si no hay conexión, operaciones POST se almacenan en `localStorage` (`pendingSync`) y se simula respuesta para que UI no se bloquee.
- Sincronización en `online` event listener: `syncPendingRequests()` sencillo que puede extenderse.

---

## Modelos de datos (ejemplos)

Item (Medicamento):

```json
{
  "id": "abc123",
  "nombre": "Paracetamol 500mg",
  "lote": "PCM-24-091",
  "caducidad": "2025-12-31",
  "unidad": "tab",
  "cantidad": 120,
  "minimo": 50,
  "descartado": false,
  "responsableUltimo": "Juan Pérez",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "createdBy": "user_uid"
}
```

Movimiento:

```json
{
  "id": "mov123",
  "itemId": "abc123",
  "itemNombre": "Paracetamol 500mg",
  "tipo": "entrada",
  "cantidad": 50,
  "responsable": "María García",
  "fecha": "2024-01-15",
  "nota": "Reposición mensual",
  "createdAt": "2024-01-15T10:30:00Z",
  "createdBy": "user_uid"
}
```

---

## Comportamiento offline y sincronización

- `src/utils/dataProvider.js` incluye:
  - Guardado de `pendingSync` en `localStorage` para POSTs cuando el cliente está offline.
  - Guardado periódico de backup de inventario en `inventory_backup`.
  - Escucha de `online` para ejecutar `syncPendingRequests()`.
- Recomendación: convertir la cola en una estructura transaccional (reintentos, backoff exponencial, idempotencia en backend).

---

## Generación de PDF / Exportes

- Se usa `jsPDF` y `jspdf-autotable` (dependencias en `package.json` del frontend).
- Funciones expuestas en `src/utils/pdfGenerator.js`: `generateInventoryPDF`, `generateAlertsPDF`.
- En `App.jsx` hay botones para descargar reporte completo o sólo alertas.

---

## Despliegue y recomendaciones

- Node.js >= 18 en servidor.
- Proteger las variables de entorno: nunca subir `FIREBASE_PRIVATE_KEY` a repositorio público.
- Configurar `FRONTEND_URL` en `.env` para CORS.
- Configurar roles (custom claims) en Firebase para usuarios (Admin, Farmacia, Enfermería).
- Para producción: usar proceso PM2 o similar, configurar logs, monitoreo y backups de Firestore.

Despliegue mínimo recomendado:

1. Backend a un host que permita Node 18 (Railway, Render, Heroku, VPS).
2. Frontend: deploy estático (Netlify, Vercel, Surge) apuntando a build de Vite.
3. Asegurar HTTPS y variables de entorno en plataforma.

---

## Solución de problemas comunes

- Error: "Firebase Admin SDK not initialized"
  - Verifica `.env` y que `FIREBASE_PRIVATE_KEY` y `FIREBASE_CLIENT_EMAIL` estén presentes y correctamente formateadas.
  - `src/config/firebase.js` reemplaza `\\n` por saltos de línea reales.

- Error: Token inválido / 401
  - Asegúrate de que el token provenga de Firebase Auth y no de otro servicio.
  - El frontend debe obtener el `idToken` luego de autenticar con Firebase y enviarlo como `Authorization: Bearer <token>`.

- Error: CORS
  - Verifica `FRONTEND_URL` y las entradas permitidas en el middleware CORS de `backend/app.js`.

- Problemas de concurrencia (escrituras simultáneas en Firestore)
  - Firestore tiene límites por documento: considera desnormalizar o segmentar writes cuando haya alta concurrencia.

---

## Cómo contribuir / Extender

- Añadir validaciones adicionales en `backend/src/utils/validators.js` y usar `express-validator` en rutas críticas.
- Hacer la cola offline idempotente (añadir `clientRequestId` y verificar en backend).
- Añadir tests (jest / supertest) para endpoints críticos.

---

## Referencias a archivos clave

- Backend: `backend/app.js`, `backend/server.js`, `backend/src/config/firebase.js`, `backend/package.json`, `backend/README.md`
- Frontend: `src/main.jsx`, `src/App.jsx`, `src/utils/dataProvider.js`, `src/utils/pdfGenerator.js`, `src/Pages/*.jsx`, `src/components/*.jsx`

---

Si quieres, puedo:

- Generar una versión en inglés.
- Añadir una sección de diagramas (arquitectura) en ASCII o con Mermaid.
- Crear un archivo `docs/ARCHITECTURE.md` con diagramas y flujo detallado.

¿Qué prefieres que haga ahora?
