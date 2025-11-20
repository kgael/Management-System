import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(60));
  console.log("🏥 Sistema de Inventario - Clínica Santa Cruz");
  console.log("=".repeat(60));
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
  console.log(`📡 URL: http://0.0.0.0:${PORT}`);
  console.log(`💚 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(
    `🔧 Firebase Project: ${
      process.env.FIREBASE_PROJECT_ID || "No configurado"
    }`
  );
  console.log("=".repeat(60));

  // Mensaje importante para Railway
  if (process.env.NODE_ENV === "production") {
    console.log("✅ Backend listo para recibir requests en producción");
  }
});

// Manejo de errores no capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});
