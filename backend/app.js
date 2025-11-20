import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Importar rutas (actualizadas con ./src/)
import authRoutes from "./src/routes/auth.routes.js";
import itemsRoutes from "./src/routes/items.routes.js";
import movementsRoutes from "./src/routes/movements.routes.js";

// Importar middlewares (actualizadas con ./src/)
import {
  errorHandler,
  notFoundHandler,
} from "./src/middleware/errorHandler.js";
import { auth } from "./src/config/firebase.js";

// Cargar variables de entorno
dotenv.config();

// Crear app de Express
const app = express();

// ======================
// Middlewares Globales
// ======================

// Seguridad HTTP headers
app.use(helmet());

// CORS - Configuración para producción
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://inventario-csc.netlify.app/",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);

// Parser de JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logger simple de requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ======================
// Rutas
// ======================

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "🚀 API funcionando correctamente",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// Debug token endpoint
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
