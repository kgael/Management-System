import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Crear app de Express
const app = express();

// ======================
// Middlewares Globales
// ======================

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logger
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  next();
});

// ======================
// Datos de Prueba
// ======================

const sampleItems = [
  { 
    id: '1', 
    nombre: "Paracetamol 500mg", 
    lote: "PCM-24-091", 
    caducidad: "2024-12-31", 
    unidad: "tab", 
    cantidad: 120, 
    minimo: 50, 
    descartado: false,
    responsableUltimo: "Sistema",
    createdAt: new Date().toISOString()
  },
  { 
    id: '2', 
    nombre: "Amoxicilina 500mg", 
    lote: "AMX-24-201", 
    caducidad: "2024-10-15", 
    unidad: "cap", 
    cantidad: 30, 
    minimo: 20, 
    descartado: false,
    responsableUltimo: "Sistema",
    createdAt: new Date().toISOString()
  },
  { 
    id: '3', 
    nombre: "Ibuprofeno 400mg", 
    lote: "IBU-24-001", 
    caducidad: "2024-11-20", 
    unidad: "tab", 
    cantidad: 15, 
    minimo: 25, 
    descartado: false,
    responsableUltimo: "Sistema",
    createdAt: new Date().toISOString()
  }
];

const sampleMovements = [
  {
    id: '1',
    itemId: '1',
    itemNombre: 'Paracetamol 500mg',
    tipo: 'entrada',
    cantidad: 100,
    responsable: 'Sistema',
    fecha: '2024-10-01',
    nota: 'Stock inicial',
    stockAnterior: 0,
    stockNuevo: 100,
    createdAt: new Date()
  },
  {
    id: '2',
    itemId: '1',
    itemNombre: 'Paracetamol 500mg',
    tipo: 'entrada',
    cantidad: 20,
    responsable: 'Sistema',
    fecha: '2024-10-05',
    nota: 'Reposición',
    stockAnterior: 100,
    stockNuevo: 120,
    createdAt: new Date()
  }
];

// ======================
// Endpoints Básicos
// ======================

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "🚀 API funcionando correctamente (MODO PRUEBA)",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Items endpoints
app.get("/items", (req, res) => {
  const { search, descartado } = req.query;
  
  let items = sampleItems;
  
  if (search) {
    const term = search.toLowerCase();
    items = items.filter(item => 
      item.nombre.toLowerCase().includes(term) ||
      item.lote.toLowerCase().includes(term)
    );
  }
  
  if (descartado !== undefined) {
    items = items.filter(item => item.descartado === (descartado === 'true'));
  }
  
  res.json({
    success: true,
    message: `${items.length} medicamentos encontrados`,
    data: items
  });
});

app.get("/items/alerts", (req, res) => {
  const hoy = new Date().toISOString().slice(0, 10);
  
  const vencidos = sampleItems.filter(item => 
    !item.descartado && new Date(item.caducidad) < new Date(hoy)
  );
  
  const proximos = sampleItems.filter(item => {
    if (item.descartado) return false;
    const dias = Math.ceil((new Date(item.caducidad) - new Date(hoy)) / (1000 * 60 * 60 * 24));
    return dias <= 60 && dias > 0;
  });
  
  const bajos = sampleItems.filter(item => 
    !item.descartado && item.cantidad <= item.minimo
  );
  
  res.json({
    success: true,
    message: "Alertas obtenidas",
    data: { vencidos, proximos, bajos }
  });
});

// CORREGIDO: Este endpoint ahora crea automáticamente un movimiento cuando se registra un nuevo medicamento
app.post("/items", (req, res) => {
  const { nombre, lote, caducidad, unidad, cantidad, minimo, responsable } = req.body;
  
  // Validar campos requeridos
  if (!nombre || !lote || !caducidad) {
    return res.status(400).json({
      success: false,
      message: "Faltan campos obligatorios: nombre, lote, caducidad"
    });
  }

  const newItem = {
    id: (sampleItems.length + 1).toString(),
    nombre,
    lote,
    caducidad,
    unidad: unidad || '',
    cantidad: Number(cantidad) || 0,
    minimo: Number(minimo) || 0,
    descartado: false,
    responsableUltimo: responsable || '—',
    createdAt: new Date().toISOString()
  };
  
  sampleItems.unshift(newItem);
  
  // CREAR MOVIMIENTO AUTOMÁTICAMENTE si la cantidad es mayor a 0
  if (newItem.cantidad > 0) {
    const newMovement = {
      id: (sampleMovements.length + 1).toString(),
      itemId: newItem.id,
      itemNombre: newItem.nombre,
      tipo: 'entrada',
      cantidad: newItem.cantidad,
      responsable: responsable || '—',
      nota: 'Alta inicial del medicamento',
      fecha: new Date().toISOString().slice(0, 10),
      stockAnterior: 0,
      stockNuevo: newItem.cantidad,
      createdAt: new Date()
    };
    
    sampleMovements.unshift(newMovement);
    
    console.log('📦 Movimiento de entrada creado automáticamente para:', newItem.nombre);
  }
  
  res.status(201).json({
    success: true,
    message: "Medicamento creado exitosamente" + (newItem.cantidad > 0 ? " con movimiento de entrada" : ""),
    data: newItem
  });
});

app.put("/items/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, lote, caducidad, unidad, minimo } = req.body;
  
  const itemIndex = sampleItems.findIndex(item => item.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Medicamento no encontrado"
    });
  }
  
  const item = sampleItems[itemIndex];
  
  // Actualizar campos permitidos
  if (nombre) item.nombre = nombre;
  if (lote) item.lote = lote;
  if (caducidad) item.caducidad = caducidad;
  if (unidad !== undefined) item.unidad = unidad;
  if (minimo !== undefined) item.minimo = Number(minimo);
  
  res.json({
    success: true,
    message: "Medicamento actualizado exitosamente",
    data: item
  });
});

app.delete("/items/:id", (req, res) => {
  const { id } = req.params;
  
  const itemIndex = sampleItems.findIndex(item => item.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Medicamento no encontrado"
    });
  }
  
  const item = sampleItems[itemIndex];
  item.descartado = true;
  item.cantidad = 0;
  
  res.json({
    success: true,
    message: "Medicamento descartado exitosamente",
    data: item
  });
});

// Movements endpoints
app.get("/movements", (req, res) => {
  console.log('📋 Movimientos solicitados. Total:', sampleMovements.length);
  console.log('📋 Últimos movimientos:', sampleMovements.slice(0, 3).map(m => ({
    id: m.id,
    item: m.itemNombre,
    tipo: m.tipo,
    cantidad: m.cantidad
  })));
  
  res.json({
    success: true,
    message: `${sampleMovements.length} movimientos encontrados`,
    data: { movements: sampleMovements }
  });
});

// CORREGIDO: Este endpoint maneja correctamente los movimientos y actualiza el stock
app.post("/movements", (req, res) => {
  const { itemId, tipo, cantidad, responsable, nota } = req.body;
  
  // Validaciones básicas
  if (!itemId || !tipo || !cantidad) {
    return res.status(400).json({
      success: false,
      message: "Faltan campos obligatorios: itemId, tipo, cantidad"
    });
  }
  
  // Encontrar el item
  const itemIndex = sampleItems.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Medicamento no encontrado"
    });
  }
  
  const item = sampleItems[itemIndex];
  
  if (item.descartado) {
    return res.status(400).json({
      success: false,
      message: "No se pueden hacer movimientos en medicamentos descartados"
    });
  }
  
  const cantidadNum = Number(cantidad);
  if (isNaN(cantidadNum) || cantidadNum <= 0) {
    return res.status(400).json({
      success: false,
      message: "La cantidad debe ser un número positivo"
    });
  }
  
  // Validar stock para salidas
  if (tipo === 'salida' && item.cantidad < cantidadNum) {
    return res.status(400).json({
      success: false,
      message: `Stock insuficiente. Disponible: ${item.cantidad}, Solicitado: ${cantidadNum}`
    });
  }
  
  // Calcular nuevo stock
  const stockAnterior = item.cantidad;
  let stockNuevo = stockAnterior;
  
  switch (tipo) {
    case 'entrada':
      stockNuevo = stockAnterior + cantidadNum;
      break;
    case 'salida':
      stockNuevo = stockAnterior - cantidadNum;
      break;
    case 'descarte':
      stockNuevo = 0;
      item.descartado = true;
      break;
    default:
      return res.status(400).json({
        success: false,
        message: "Tipo de movimiento inválido. Use: entrada, salida o descarte"
      });
  }
  
  // Actualizar stock del item
  item.cantidad = stockNuevo;
  item.responsableUltimo = responsable || '—';
  
  // Crear movimiento
  const newMovement = {
    id: (sampleMovements.length + 1).toString(),
    itemId,
    itemNombre: item.nombre,
    tipo,
    cantidad: cantidadNum,
    responsable: responsable || '—',
    nota: nota || '',
    fecha: new Date().toISOString().slice(0, 10),
    stockAnterior,
    stockNuevo,
    createdAt: new Date()
  };
  
  sampleMovements.unshift(newMovement);
  
  console.log(`📊 Movimiento registrado: ${item.nombre} - ${tipo} ${cantidadNum}`);
  
  res.status(201).json({
    success: true,
    message: "Movimiento registrado exitosamente",
    data: newMovement
  });
});

// Endpoint para resetear datos (solo desarrollo)
app.post("/reset-data", (req, res) => {
  // Restaurar datos de prueba originales
  sampleItems.length = 0;
  sampleItems.push(...[
    { 
      id: '1', 
      nombre: "Paracetamol 500mg", 
      lote: "PCM-24-091", 
      caducidad: "2024-12-31", 
      unidad: "tab", 
      cantidad: 120, 
      minimo: 50, 
      descartado: false,
      responsableUltimo: "Sistema",
      createdAt: new Date().toISOString()
    },
    { 
      id: '2', 
      nombre: "Amoxicilina 500mg", 
      lote: "AMX-24-201", 
      caducidad: "2024-10-15", 
      unidad: "cap", 
      cantidad: 30, 
      minimo: 20, 
      descartado: false,
      responsableUltimo: "Sistema", 
      createdAt: new Date().toISOString()
    },
    { 
      id: '3', 
      nombre: "Ibuprofeno 400mg", 
      lote: "IBU-24-001", 
      caducidad: "2024-11-20", 
      unidad: "tab", 
      cantidad: 15, 
      minimo: 25, 
      descartado: false,
      responsableUltimo: "Sistema",
      createdAt: new Date().toISOString()
    }
  ]);
  
  sampleMovements.length = 0;
  sampleMovements.push(...[
    {
      id: '1',
      itemId: '1',
      itemNombre: 'Paracetamol 500mg',
      tipo: 'entrada',
      cantidad: 100,
      responsable: 'Sistema',
      fecha: '2024-10-01',
      nota: 'Stock inicial',
      stockAnterior: 0,
      stockNuevo: 100,
      createdAt: new Date()
    },
    {
      id: '2',
      itemId: '1',
      itemNombre: 'Paracetamol 500mg',
      tipo: 'entrada',
      cantidad: 20,
      responsable: 'Sistema',
      fecha: '2024-10-05',
      nota: 'Reposición',
      stockAnterior: 100,
      stockNuevo: 120,
      createdAt: new Date()
    }
  ]);
  
  res.json({
    success: true,
    message: "Datos de prueba restaurados",
    items: sampleItems.length,
    movements: sampleMovements.length
  });
});

// ======================
// Manejo de Errores
// ======================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

// ======================
// Iniciar Servidor
// ======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(60));
  console.log("🏥 Sistema de Inventario - MODO PRUEBA");
  console.log("=".repeat(60));
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 URL: http://0.0.0.0:${PORT}`);
  console.log(`💚 Health: http://0.0.0.0:${PORT}/health`);
  console.log("📝 Usando datos de prueba (Firebase no disponible)");
  console.log("=".repeat(60));
});

export default app;