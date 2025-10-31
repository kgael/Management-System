# 🏥 Backend - Sistema de Inventario Clínica Santa Cruz

Backend desarrollado con Node.js, Express y Firebase para el sistema de gestión de inventario de medicamentos.

## 🚀 Tecnologías

- **Node.js** v18+
- **Express.js** - Framework web
- **Firebase Admin SDK** - Base de datos y autenticación
- **Firestore** - Base de datos NoSQL
- **Firebase Authentication** - Gestión de usuarios

## 📦 Instalación

### 1. Clonar el repositorio e instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto (o usa uno existente)
3. Activa **Firestore Database** y **Authentication**
4. Ve a **Project Settings** → **Service Accounts**
5. Genera una nueva clave privada (archivo JSON)

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto backend:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Firebase:

```env
PORT=5000
NODE_ENV=development

# Datos del archivo JSON de Firebase
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com

FRONTEND_URL=http://localhost:5173
```

### 4. Crear usuarios iniciales en Firebase

Puedes crear usuarios desde Firebase Console o usando este script:

```javascript
// Ejecutar en Firebase Console o crear un script
// Los usuarios iniciales sugeridos son:
// - admin@clinica.com (Admin)
// - enfermeria@clinica.com (Enfermería)
// - farmacia@clinica.com (Farmacia)
```

## 🏃 Ejecutar el Servidor

### Modo desarrollo (con auto-reload)
```bash
npm run dev
```

### Modo producción
```bash
npm start
```

El servidor estará disponible en: `http://localhost:5000`

## 📡 Endpoints de la API

### Autenticación

| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/auth/me` | Usuario actual | Cualquiera |
| POST | `/api/auth/register` | Registrar usuario | Admin |
| GET | `/api/auth/users` | Listar usuarios | Admin |
| PUT | `/api/auth/users/:uid/role` | Cambiar rol | Admin |
| DELETE | `/api/auth/users/:uid` | Eliminar usuario | Admin |

### Items (Medicamentos)

| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/items` | Listar items | Cualquiera |
| GET | `/api/items/:id` | Obtener item | Cualquiera |
| GET | `/api/items/alerts` | Obtener alertas | Cualquiera |
| GET | `/api/items/search?q=term` | Buscar items | Cualquiera |
| POST | `/api/items` | Crear item | Admin, Farmacia |
| PUT | `/api/items/:id` | Actualizar item | Admin, Farmacia |
| DELETE | `/api/items/:id` | Eliminar item | Admin |

### Movimientos

| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/movements` | Listar movimientos | Cualquiera |
| GET | `/api/movements/:id` | Obtener movimiento | Cualquiera |
| GET | `/api/movements/item/:itemId` | Movimientos de un item | Cualquiera |
| GET | `/api/movements/stats` | Estadísticas | Cualquiera |
| POST | `/api/movements` | Registrar movimiento | Cualquiera |
| DELETE | `/api/movements/:id` | Eliminar movimiento | Admin |

## 🔐 Autenticación

La API usa Firebase Authentication con JWT tokens.

### Headers requeridos:
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

### Roles disponibles:
- **Admin** - Acceso total
- **Farmacia** - Gestión de items y movimientos
- **Enfermería** - Solo lectura y registro de movimientos

## 📊 Estructura de Datos

### Item (Medicamento)
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

### Movimiento
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

## 🧪 Pruebas

### Health Check
```bash
curl http://localhost:5000/health
```

### Probar con Postman/Thunder Client
1. Importa la colección de endpoints
2. Autentica en Firebase desde el frontend
3. Copia el token de Firebase
4. Úsalo en el header `Authorization: Bearer <token>`

## 🛠️ Scripts Disponibles

```json
{
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

## 📝 Notas Importantes

- ⚠️ Los tokens de Firebase expiran después de 1 hora
- 🔥 Firestore tiene límite de 1 escritura/segundo por documento
- 💾 Los datos borrados son "soft delete" (se marcan como descartados)
- 🔐 Los custom claims de roles se establecen al crear usuarios

## 🐛 Solución de Problemas

### Error: "Firebase Admin SDK not initialized"
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que el formato de `FIREBASE_PRIVATE_KEY` incluya `\n`

### Error: "Token inválido"
- El token debe venir del frontend después de autenticar con Firebase
- Los tokens expiran cada hora

### Error: "Permisos denegados"
- Verifica que el usuario tenga el rol correcto
- Revisa las reglas de seguridad en Firestore

## 📧 Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.

---

Desarrollado con ❤️ para Clínica Santa Cruz