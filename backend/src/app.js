import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Importar rutas
import authRoutes from "./routes/auth.routes.js";
import itemsRoutes from "./routes/items.routes.js";
import movementsRoutes from "./routes/movements.routes.js";

// Importar middlewares
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { auth } from "./config/firebase.js";

// Cargar variables de entorno
dotenv.config();

// Crear app de Express
const app = express();

// ======================
// Middlewares Globales
// ======================

// Seguridad HTTP headers
app.use(helmet());

// CORS - Permitir frontend
// En backend/src/app.js, actualiza CORS:
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Desarrollo
      "http://localhost:3000", // Producción con serve
      "http://localhost:8080", // Otros puertos comunes
    ],
    credentials: true,
  })
);

// Parser de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple de requests (desarrollo)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ======================
// Rutas
// ======================

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// 🔥 NUEVO: Endpoint para probar Firebase Admin SDK
app.get("/api/test-firebase", async (req, res) => {
  try {
    console.log("🧪 Probando Firebase Admin SDK...");

    // Probar que Firebase Admin funciona creando y eliminando usuario temporal
    const testEmail = `test-${Date.now()}@clinica.com`;
    const testUser = await auth.createUser({
      email: testEmail,
      password: "123456",
      displayName: "Usuario Test",
    });

    console.log("✅ Usuario test creado:", testUser.uid);

    // Establecer custom claims
    await auth.setCustomUserClaims(testUser.uid, { role: "Admin" });
    console.log("✅ Custom claims establecidos");

    // Eliminar usuario test
    await auth.deleteUser(testUser.uid);
    console.log("✅ Usuario test eliminado");

    res.json({
      success: true,
      message: "Firebase Admin SDK funciona correctamente",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error Firebase Admin:", error);
    res.status(500).json({
      success: false,
      message: "Error con Firebase Admin SDK",
      error: error.message,
      code: error.code,
    });
  }
});

// 🔥 NUEVO: Endpoint público para crear usuario de prueba
app.post("/api/create-test-user", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y password requeridos",
      });
    }

    console.log("👤 Creando usuario de prueba:", email);

    const user = await auth.createUser({
      email,
      password,
      displayName: "Usuario Prueba",
    });

    // Establecer rol
    await auth.setCustomUserClaims(user.uid, { role: "Enfermería" });

    // Guardar en Firestore
    const { db } = await import("./config/firebase.js");
    await db.collection("users").doc(user.uid).set({
      email,
      name: "Usuario Prueba",
      role: "Enfermería",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Usuario creado:", user.uid);

    res.json({
      success: true,
      message: "Usuario de prueba creado exitosamente",
      user: {
        uid: user.uid,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Error creando usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error creando usuario",
      error: error.message,
    });
  }
});

// Agrega esto en tu app.js (antes de las otras rutas)
app.post("/api/debug-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token requerido",
      });
    }

    console.log("🔍 Debugging token:", token.substring(0, 50) + "...");

    // Verificar el token
    const decodedToken = await auth.verifyIdToken(token);

    res.json({
      success: true,
      message: "Token válido",
      decoded: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || "NO TIENE ROL",
        allClaims: decodedToken,
      },
    });
  } catch (error) {
    console.error("❌ Error verificando token:", error);
    res.status(401).json({
      success: false,
      message: "Token inválido",
      error: error.message,
    });
  }
});

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/movements", movementsRoutes);

// ======================
// Manejo de Errores
// ======================

// 404 - Ruta no encontrada
app.use(notFoundHandler);

// Manejador global de errores
app.use(errorHandler);

export default app;
