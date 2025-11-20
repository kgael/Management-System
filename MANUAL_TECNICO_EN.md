# Technical Manual — Inventory System (Clinic)

Last updated: 2025-11-20

## Summary

This document compiles the technical documentation for the "Inventory System" application (backend and frontend), explains its architecture, how to install and run it, describes endpoints, data models, and deployment recommendations and troubleshooting.

---

**Contents**

- [Repository Structure](#repository-structure)
- [Technologies](#technologies)
- [Local installation and run](#local-installation-and-run)
- [Environment variables (backend)](#environment-variables-backend)
- [Backend — Architecture and endpoints](#backend---architecture-and-endpoints)
- [Frontend — Architecture and components](#frontend---architecture-and-components)
- [Data models](#data-models)
- [Offline behavior and synchronization](#offline-behavior-and-synchronization)
- [PDF generation / exports](#pdf-generation--exports)
- [Deployment and recommendations](#deployment-and-recommendations)
- [Common troubleshooting](#common-troubleshooting)
- [How to contribute / Extend](#how-to-contribute--extend)

---

## Repository Structure

Root (summary):

- `backend/` — Server code (Express + Firebase Admin)
  - `server.js`, `app.js` (entry points and configuration)
  - `src/config/firebase.js` (initializes Firebase Admin)
  - `src/routes/`, `src/controllers/`, `src/services/`, `src/middleware/` (API logic)
  - `README.md`, `package.json`
- `src/` — React frontend (Vite)
  - `main.jsx`, `App.jsx`
  - `Pages/` (Login, Inventory, Movements, NewItemForm, MovementForm, Alerts)
  - `components/` (Table, Field, Button, StatsBox, etc.)
  - `utils/` (dataProvider, auth, pdfGenerator, helpers, i18n)
- `public/` — static assets (manifest, sw, icons)
- `package.json` — frontend dependencies

> Note: several backend modules are inside `backend/src/` and the main app imports routes from `./src/...` (see `backend/app.js`).

---

## Technologies

- Backend: Node.js >= 18, Express.js, Firebase Admin SDK (Firestore + Auth), helmet, cors, express-validator
- Frontend: React (v19+), Vite, Tailwind CSS, i18next, jsPDF (+ autotable)
- Database / Auth: Firebase (Firestore and Authentication)

---

## Local installation and run

Follow these steps in Windows PowerShell (from the repo folder):

1) Backend

```powershell
cd backend
npm install
# Run in development (nodemon)
npm run dev
```

The backend listens on the `PORT` from `.env` (default `5000`). Health check: `http://localhost:5000/health`.

2) Frontend

```powershell
cd ..\  # go back to root if you're inside backend
cd src
npm install
npm run dev
```

The frontend runs with Vite (default `http://localhost:5173`). `src/main.jsx` imports `App.jsx`.

---

## Environment variables (backend)

The backend requires environment variables in `.env`. Key fields:

- `PORT` — server port (e.g. 5000)
- `NODE_ENV` — `development` | `production`
- `FIREBASE_PROJECT_ID` — Firebase project ID
- `FIREBASE_PRIVATE_KEY` — service account private key (ensure line breaks are escaped or use `replace(/\\n/g,'\n')` as in `src/config/firebase.js`)
- `FIREBASE_CLIENT_EMAIL` — service account client email
- `FRONTEND_URL` — URL allowed for CORS

Example (partial):

```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FRONTEND_URL=http://localhost:5173
```

---

## Backend — Architecture and endpoints

Basic server structure:

- `backend/app.js` — configures middlewares (helmet, cors, body parsers), routes and error handlers.
- `backend/server.js` — starts the server and handles global events (uncaughtException, unhandledRejection).
- `backend/src/config/firebase.js` — initializes `firebase-admin`, exports `db` (Firestore) and `auth`.
- Routes imported in `app.js`: `./src/routes/auth.routes.js`, `./src/routes/items.routes.js`, `./src/routes/movements.routes.js`.

Relevant middlewares:

- `auth` (firebase token verification) — protects routes if Authorization header is required.
- `errorHandler` and `notFoundHandler` — centralized error and 404 handling.

Main endpoints (summary)

Authentication (`/api/auth`):

- `POST /api/auth/login` — (depending on implementation) authenticate with Firebase or delegate to the frontend.
- `GET /api/auth/me` — return user info based on token.
- `POST /api/auth/register` — register user (roles via custom claims).
- `GET /api/auth/users` — list users (admin).

Items (`/api/items`):

- `GET /api/items` — list medicines
- `GET /api/items/:id` — get an item
- `GET /api/items/alerts` — alerts (expired, soon to expire, low stock)
- `GET /api/items/search?q=` — search by term
- `POST /api/items` — create item (Admin/Pharmacy)
- `PUT /api/items/:id` — update item
- `DELETE /api/items/:id` — delete/discard item

Movements (`/api/movements`):

- `GET /api/movements` — list movements
- `GET /api/movements/:id` — get movement
- `GET /api/movements/item/:itemId` — movements for an item
- `GET /api/movements/stats` — statistics
- `POST /api/movements` — register movement (entry/exit/discard)
- `DELETE /api/movements/:id` — delete movement (admin)

Important headers:

- `Authorization: Bearer <firebase_id_token>` for protected routes
- `Content-Type: application/json`

---

## Frontend — Architecture and components

Entry points:

- `src/main.jsx` — mounts `App.jsx`.
- `src/App.jsx` — contains main navigation, session handling and calls to `dataProvider`.

Main pages (`src/Pages/`):

- `Login.jsx` — authentication form.
- `Inventory.jsx` — items list, search and actions (entry/exit/discard).
- `Movements.jsx` — movements table.
- `NewItemForm.jsx` — create new medicine.
- `MovementForm.jsx` — register movement.
- `Alerts.jsx` — alerts viewer (expired / expiring soon / low stock).

Reusable components (`src/components/`):

- `Table.jsx` — simple responsive table.
- `Field.jsx` — controlled input.
- `Button.jsx`, `Pill.jsx`, `StatsBox.jsx`, `LanguageSwitcher.jsx`, etc.

Utilities (`src/utils/`):

- `dataProvider.js` — client for calling the API (`API_BASE_URL = http://localhost:5000/api`) and contains offline logic (pendingSync queue, localStorage backup).
- `auth.js` — helpers for login/logout and retrieving local user.
- `pdfGenerator.js` — functions to export inventory and alerts to PDF (jsPDF + autotable).
- `helpers.js` — utilities such as `diasEntre`, `hoyISO`.

Notable frontend behavior:

- Protection against duplicate movements (debounce / last-movement check).
- Offline fallback: if no connection, POST operations are stored in `localStorage` (`pendingSync`) and a simulated response is returned so the UI doesn't block.
- Synchronization on `online` event listener: simple `syncPendingRequests()` that can be extended.

---

## Data models (examples)

Item (Medicine):

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

Movement:

```json
{
  "id": "mov123",
  "itemId": "abc123",
  "itemNombre": "Paracetamol 500mg",
  "tipo": "entrada",
  "cantidad": 50,
  "responsable": "María García",
  "fecha": "2024-01-15",
  "nota": "Monthly restock",
  "createdAt": "2024-01-15T10:30:00Z",
  "createdBy": "user_uid"
}
```

---

## Offline behavior and synchronization

- `src/utils/dataProvider.js` includes:
  - Saving `pendingSync` in `localStorage` for POSTs when the client is offline.
  - Periodic saving of an inventory backup in `inventory_backup`.
  - Listening to `online` to run `syncPendingRequests()`.
- Recommendation: make the queue transactional (retries, exponential backoff, idempotency on backend).

---

## PDF generation / exports

- Uses `jsPDF` and `jspdf-autotable` (frontend `package.json` dependencies).
- Functions exposed in `src/utils/pdfGenerator.js`: `generateInventoryPDF`, `generateAlertsPDF`.
- `App.jsx` contains buttons to download the full report or alerts only.

---

## Deployment and recommendations

- Node.js >= 18 on the server.
- Protect environment variables: never commit `FIREBASE_PRIVATE_KEY` to a public repo.
- Configure `FRONTEND_URL` in `.env` for CORS.
- Configure Firebase custom claims for user roles (Admin, Pharmacy, Nursing).
- For production: use PM2 or similar, set up logs, monitoring and Firestore backups.

Minimal recommended deployment:

1. Backend on a host that supports Node 18 (Railway, Render, Heroku, VPS).
2. Frontend: static deploy (Netlify, Vercel, Surge) serving Vite build.
3. Ensure HTTPS and secure environment variables in the platform.

---

## Common troubleshooting

- Error: "Firebase Admin SDK not initialized"
  - Verify `.env` and that `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL` exist and are formatted correctly.
  - `src/config/firebase.js` replaces `\\n` with real line breaks.

- Error: Invalid token / 401
  - Ensure the token is issued by Firebase Auth and not another service.
  - Frontend should retrieve the `idToken` after authenticating with Firebase and send it as `Authorization: Bearer <token>`.

- Error: CORS
  - Verify `FRONTEND_URL` and allowed origins in the CORS middleware in `backend/app.js`.

- Concurrency problems (simultaneous writes to Firestore)
  - Firestore has per-document write limits: consider denormalization or segmenting writes for high-concurrency scenarios.

---

## How to contribute / Extend

- Add additional validations in `backend/src/utils/validators.js` and use `express-validator` in critical routes.
- Make the offline queue idempotent (add `clientRequestId` and check it on the backend).
- Add tests (jest / supertest) for critical endpoints.

---

## References to key files

- Backend: `backend/app.js`, `backend/server.js`, `backend/src/config/firebase.js`, `backend/package.json`, `backend/README.md`
- Frontend: `src/main.jsx`, `src/App.jsx`, `src/utils/dataProvider.js`, `src/utils/pdfGenerator.js`, `src/Pages/*.jsx`, `src/components/*.jsx`

---

If you want, I can:

- Create a Spanish ↔ English parallel README that links both manuals.
- Add an ASCII or Mermaid architecture diagram.
- Export a Postman/Thunder Client collection with example requests.

Which would you like me to do next?
