import React, { useEffect, useMemo, useState } from "react";
import { descargarJSON, diasEntre, hoyISO } from "./utils/helpers";
import {
  getUser,
  login as authLogin,
  logout as authLogout,
} from "./utils/auth";

// Importar las funciones de la API
import { 
  getItems, 
  createItem, 
  getMovements, 
  createMovement, 
  getAlerts 
} from "./utils/dataProvider";

import StatsBox from "./components/StatsBox";
import Inventory from "./pages/Inventory";
import Movements from "./pages/Movements";
import Alerts from "./pages/Alerts";
import NewItemForm from "./pages/NewItemForm";
import MovementForm from "./pages/MovementForm";
import Login from "./Pages/Login";

export default function App() {
  // ----- Estado principal -----
  const [user, setUser] = useState(getUser());
  const [items, setItems] = useState([]);
  const [moves, setMoves] = useState([]);
  const [tab, setTab] = useState("inventario");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  // ----- Cargar datos del backend -----
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setConnectionError(null);
      console.log("🔄 Cargando datos del backend...");
      
      const [itemsData, movesData] = await Promise.all([
        getItems(),
        getMovements()
      ]);
      
      console.log("✅ Datos cargados:", { items: itemsData.length, moves: movesData.length });
      setItems(itemsData);
      setMoves(movesData);
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      setConnectionError(`Error de conexión: ${error.message}. Verifica que el backend esté corriendo en http://localhost:5000`);
    } finally {
      setLoading(false);
    }
  }

  const hoy = hoyISO();

  // ----- Búsqueda en tiempo real -----
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    
    const q = query.trim().toLowerCase();
    return items.filter((x) => 
      x.nombre.toLowerCase().includes(q) ||
      x.lote.toLowerCase().includes(q) ||
      (x.unidad || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  // ----- Derivados para alertas -----
  const { vencidos, proximos, bajos } = useMemo(() => {
    const vencidos = items.filter(
      (x) => !x.descartado && new Date(x.caducidad) < new Date(hoy)
    );
    const proximos = items.filter(
      (x) =>
        !x.descartado &&
        new Date(x.caducidad) >= new Date(hoy) &&
        diasEntre(hoy, x.caducidad) <= 60
    );
    const bajos = items.filter((x) => !x.descartado && x.cantidad <= x.minimo);
    return { vencidos, proximos, bajos };
  }, [items, hoy]);

  // ----- Acciones con el backend -----
  async function crearMedicamento(data) {
    try {
      console.log("📝 Creando medicamento:", data);
      const nuevo = await createItem(data);
      setItems(prev => [nuevo, ...prev]);
      
      // Registrar movimiento de entrada automáticamente
      if (nuevo.cantidad > 0) {
        await crearMovimiento({
          itemId: nuevo.id,
          tipo: "entrada",
          cantidad: nuevo.cantidad,
          responsable: data.responsable || "—",
          nota: "Alta inicial",
        });
      }
      
      alert("✅ Medicamento creado exitosamente");
    } catch (error) {
      console.error('❌ Error creando medicamento:', error);
      alert('❌ Error al crear el medicamento: ' + error.message);
    }
  }

  async function crearMovimiento(movementData) {
    try {
      console.log("📦 Creando movimiento:", movementData);
      const mov = await createMovement(movementData);
      setMoves(prev => [mov, ...prev]);
      
      // Recargar items para obtener stock actualizado
      const itemsActualizados = await getItems();
      setItems(itemsActualizados);
      
      return mov;
    } catch (error) {
      console.error('❌ Error creando movimiento:', error);
      alert('❌ Error al registrar movimiento: ' + error.message);
      throw error;
    }
  }

  async function onDescarte(item) {
    if (!confirm("¿Marcar como descartado? Esto pondrá la cantidad en 0.")) return;
    
    const responsable = prompt("Responsable del descarte") || "—";
    try {
      await crearMovimiento({
        itemId: item.id,
        tipo: "descarte",
        cantidad: item.cantidad,
        responsable,
        nota: "Caducado/Descarte",
      });
      alert("✅ Medicamento descartado exitosamente");
    } catch (error) {
      // Error ya manejado en crearMovimiento
    }
  }

  async function onSalida(item) {
    const n = Number(prompt("Cantidad a registrar (salida)", "1") || 0);
    if (!n || n <= 0) return;
    if (n > item.cantidad) return alert("❌ No hay suficiente stock");
    
    const resp = prompt("Responsable") || "—";
    try {
      await crearMovimiento({
        itemId: item.id,
        tipo: "salida",
        cantidad: n,
        responsable: resp,
        nota: "Dispensación",
      });
      alert("✅ Salida registrada exitosamente");
    } catch (error) {
      // Error ya manejado en crearMovimiento
    }
  }

  async function onEntrada(item) {
    const n = Number(prompt("Cantidad a registrar (entrada)", "10") || 0);
    if (!n || n <= 0) return;
    
    const resp = prompt("Responsable") || "—";
    try {
      await crearMovimiento({
        itemId: item.id,
        tipo: "entrada",
        cantidad: n,
        responsable: resp,
        nota: "Reposición",
      });
      alert("✅ Entrada registrada exitosamente");
    } catch (error) {
      // Error ya manejado en crearMovimiento
    }
  }

  // ----- Login -----
  if (!user) {
    return (
      <Login
        onSuccess={(usr, pwd, setError) => {
          const u = authLogin(usr, pwd);
          if (!u) return setError("Usuario o contraseña incorrectos");
          setUser(u);
        }}
      />
    );
  }

  // ----- UI -----
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">🔄 Cargando datos del servidor...</div>
          <div className="text-sm text-gray-500">Conectando con http://localhost:5000</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto max-w-7xl p-4">
        {/* Header */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              🩺 Inventario — Clínica Santa Cruz
            </h1>
            <div className="text-sm text-gray-500">Sistema conectado al backend</div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline text-gray-500">
              {user.name} · {user.role}
            </span>
            <span className={navigator.onLine ? "text-green-700" : "text-amber-700"}>
              {navigator.onLine ? "✅ Conectado" : "⚠️ Sin conexión"}
            </span>
            <button
              onClick={() => descargarJSON("respaldo_inventario", { items, moves })}
              className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm hover:bg-amber-50"
            >
              📥 Descargar respaldo
            </button>
            <button
              onClick={() => {
                authLogout();
                setUser(null);
              }}
              className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-green-700"
            >
              🚪 Cerrar sesión
            </button>
          </div>
        </header>

        {/* Error de conexión */}
        {connectionError && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
            <div className="flex items-center">
              <div className="text-red-700">
                <strong>⚠️ Error de conexión:</strong> {connectionError}
                <div className="mt-2">
                  <button 
                    onClick={loadData}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <nav className="mt-4 flex flex-wrap gap-2">
          {[
            ["inventario", "📋 Inventario"],
            ["movs", "🔄 Movimientos"],
            ["alertas", "⚠️ Alertas"],
            ["nuevo", "➕ Nuevo Medicamento"],
            ["registrar", "📝 Registrar Movimiento"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-sm font-medium border shadow-sm ${
                tab === id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-amber-50"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Estadísticas */}
        <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatsBox label="Ítems" value={items.length} />
          <StatsBox label="Vencidos" value={vencidos.length} />
          <StatsBox label="≤60 días" value={proximos.length} />
          <StatsBox label="Bajo stock" value={bajos.length} />
        </section>

        {/* Contenido */}
        <main className="mt-6 space-y-4">
          {tab === "inventario" && (
            <Inventory
              items={filteredItems}
              query={query}
              setQuery={setQuery}
              hoy={hoy}
              diasEntre={diasEntre}
              onEntrada={onEntrada}
              onSalida={onSalida}
              onDescarte={onDescarte}
            />
          )}

          {tab === "movs" && <Movements items={items} moves={moves} />}

          {tab === "alertas" && (
            <Alerts
              vencidos={vencidos}
              proximos={proximos}
              bajos={bajos}
              onDescartar={onDescarte}
              hoy={hoy}
              diasEntre={diasEntre}
            />
          )}

          {tab === "nuevo" && <NewItemForm onSave={crearMedicamento} />}

          {tab === "registrar" && (
            <MovementForm
              items={items.filter(item => !item.descartado)}
              onSubmit={async (itemId, tipo, cantidad, responsable, nota) => {
                try {
                  await crearMovimiento({
                    itemId,
                    tipo,
                    cantidad,
                    responsable,
                    nota,
                  });
                  alert("✅ Movimiento registrado exitosamente");
                } catch (error) {
                  // Error ya manejado en crearMovimiento
                }
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}