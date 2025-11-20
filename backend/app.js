import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Importar rutas
import authRoutes from "./src/routes/auth.routes.js";
import itemsRoutes from "./src/routes/items.routes.js";
import movementsRoutes from "./src/routes/movements.routes.js";

// Importar controladores directamente
import * as itemsController from "./src/controllers/items.controller.js";
import * as movementsController from "./src/controllers/movements.controller.js";

// Importar middlewares
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

// CORS - Configuración más permisiva
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://inventario-csc.netlify.app",
        "https://inventario-frontend-csc.netlify.app",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      // Permitir todos los orígenes en desarrollo
      if (process.env.NODE_ENV === "development" || !origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("🔒 Origen bloqueado por CORS:", origin);
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// Parser de JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logger simple de requests
app.use((req, res, next) => {
  console.log(
    `📨 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`
  );
  next();
});

// ======================
// Health Check y Debug
// ======================

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "🚀 API funcionando correctamente",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// Debug endpoint para verificar rutas
app.get("/debug-routes", (req, res) => {
  const routes = [];

  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods),
      });
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods),
          });
        }
      });
    }
  });

  res.json({
    success: true,
    routes: routes,
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

// Test endpoint para verificar Firebase
app.get("/test-db", async (req, res) => {
  try {
    const { db } = await import("./src/config/firebase.js");

    // Intentar leer una colección
    const itemsSnapshot = await db.collection("items").limit(1).get();
    const movementsSnapshot = await db.collection("movements").limit(1).get();

    res.json({
      success: true,
      message: "✅ Base de datos conectada correctamente",
      firebase: {
        items: itemsSnapshot.size,
        movements: movementsSnapshot.size,
      },
    });
  } catch (error) {
    console.error("❌ Error conectando a Firebase:", error);
    res.status(500).json({
      success: false,
      message: "❌ Error conectando a la base de datos",
      error: error.message,
    });
  }
});

// ======================
// Rutas de la API con /api
// ======================

app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/movements", movementsRoutes);

// ======================
// Rutas SIN /api para compatibilidad con frontend actual
// ======================

// Items routes sin /api
app.get("/items", itemsController.getAllItems);
app.get("/items/alerts", itemsController.getAlerts);
app.get("/items/search", itemsController.searchItems);
app.get("/items/:id", itemsController.getItemById);
app.post("/items", itemsController.createItem);
app.put("/items/:id", itemsController.updateItem);
app.delete("/items/:id", itemsController.deleteItem);

// Movements routes sin /api
app.get("/movements", movementsController.getAllMovements);
app.get("/movements/stats", movementsController.getMovementsStats);
app.get("/movements/item/:itemId", movementsController.getMovementsByItem);
app.get("/movements/:id", movementsController.getMovementById);
app.post("/movements", movementsController.createMovement);
app.delete("/movements/:id", movementsController.deleteMovement);

// ======================
// Manejo de Errores
// ======================

// 404 - Ruta no encontrada
app.use(notFoundHandler);

// Manejador global de errores
app.use(errorHandler);

export default app;
