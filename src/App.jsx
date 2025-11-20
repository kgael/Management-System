console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔧 MODE:', import.meta.env.MODE);
console.log('🔧 Todas las variables:', import.meta.env);

// src/App.jsx - VERSIÓN CORREGIDA SIN DUPLICACIÓN
import React, { useEffect, useMemo, useState } from "react";
import { diasEntre, hoyISO } from "./utils/helpers";
import {
  getUser,
  login as authLogin,
  logout as authLogout,
} from "./utils/auth";
import { useI18n } from "./hooks/useI18n";

// Importar las funciones de la API
import { 
  getItems, 
  createItem, 
  getMovements, 
  createMovement, 
  getAlerts 
} from "./utils/dataProvider";

// Importar el generador de PDF
import { generateInventoryPDF, generateAlertsPDF } from "./utils/pdfGenerator";

import StatsBox from "./components/StatsBox";
import Inventory from "./Pages/Inventory";
import Movements from "./Pages/Movements";
import Alerts from "./Pages/Alerts";
import NewItemForm from "./Pages/NewItemForm";
import MovementForm from "./Pages/MovementForm";
import Login from "./Pages/Login";
import LanguageSwitcher from "./components/LanguageSwitcher";

export default function App() {
  // ----- Estado principal -----
  const { t, locale } = useI18n();
  const [user, setUser] = useState(getUser());
  const [items, setItems] = useState([]);
  const [moves, setMoves] = useState([]);
  const [tab, setTab] = useState("inventario");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Estados para prevenir duplicación
  const [processingMovement, setProcessingMovement] = useState(false);
  const [lastMovement, setLastMovement] = useState(null);

  // ----- Monitorear estado de conexión -----
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionError(null);
      console.log('✅ Conexión restaurada');
      loadData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Modo offline activado');
      setConnectionError("Modo offline - Trabajando con datos locales");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ----- Cargar datos del backend -----
  useEffect(() => {
    loadData();
  }, []);

  // Cerrar sidebar al cambiar de tab en móviles
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [tab]);

  // Función para verificar movimiento duplicado
  const isDuplicateMovement = (movementData) => {
    if (!lastMovement) return false;
    
    return (
      lastMovement.itemId === movementData.itemId &&
      lastMovement.tipo === movementData.tipo &&
      lastMovement.cantidad === movementData.cantidad &&
      Date.now() - lastMovement.timestamp < 3000 // 3 segundos
    );
  };

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
      
      let errorMessage = `Error de conexión: ${error.message}`;
      
      if (error.message.includes('401') || error.message.includes('Token')) {
        errorMessage = `Error de autenticación: ${error.message}. El backend está esperando un token. Verifica que las rutas estén desprotegidas.`;
      } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        errorMessage = `Error de red: No se puede conectar al backend en http://localhost:5000. Asegúrate de que el servidor esté corriendo.`;
      }
      
      setConnectionError(errorMessage);
      
      // Cargar datos de ejemplo como fallback
      console.log("🔄 Cargando datos de ejemplo...");
      const sampleItems = [
        { id: '1', nombre: "Paracetamol 500mg", lote: "PCM-24-091", caducidad: "2024-12-31", unidad: "tab", cantidad: 120, minimo: 50, descartado: false },
        { id: '2', nombre: "Amoxicilina 500mg", lote: "AMX-24-201", caducidad: "2024-10-15", unidad: "cap", cantidad: 30, minimo: 20, descartado: false },
      ];
      setItems(sampleItems);
      setMoves([]);
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

  // ----- Funciones de descarga -----
  const descargarPDFCompleto = () => {
    try {
      console.log("📊 Generando PDF completo...");
      generateInventoryPDF(items, moves, 'Clínica Santa Cruz');
    } catch (error) {
      console.error('❌ Error generando PDF completo:', error);
      alert('Error al generar el PDF completo: ' + error.message);
    }
  };

  const descargarPDFAlertas = () => {
    try {
      console.log("⚠️ Generando PDF de alertas...");
      generateAlertsPDF(vencidos, proximos, bajos, 'Clínica Santa Cruz');
    } catch (error) {
      console.error('❌ Error generando PDF de alertas:', error);
      alert('Error al generar el PDF de alertas: ' + error.message);
    }
  };

  // 🔥 CORREGIDO: Función mejorada para crear movimientos
  async function crearMovimiento(movementData) {
    // Prevenir duplicación
    if (processingMovement) {
      console.log('⚠️ Ya hay un movimiento en proceso...');
      return null;
    }

    if (isDuplicateMovement(movementData)) {
      console.log('⚠️ Movimiento duplicado detectado, ignorando...');
      return null;
    }

    setProcessingMovement(true);
    try {
      console.log("📦 Creando movimiento:", movementData);
      const mov = await createMovement(movementData);
      
      // Registrar último movimiento para prevenir duplicados
      setLastMovement({
        ...movementData,
        timestamp: Date.now()
      });

      setMoves(prev => [mov, ...prev]);
      
      // Recargar items para obtener stock actualizado
      const itemsActualizados = await getItems();
      setItems(itemsActualizados);
      
      console.log("✅ Movimiento completado. Stock actualizado.");
      return mov;
    } catch (error) {
      console.error('❌ Error creando movimiento:', error);
      alert('❌ Error al registrar movimiento: ' + error.message);
      throw error;
    } finally {
      setProcessingMovement(false);
    }
  }

  // 🔥 CORREGIDO: Función para crear medicamento SIN duplicación
  async function crearMedicamento(data) {
    try {
      console.log("📝 Creando medicamento:", data);
      const nuevo = await createItem(data);
      setItems(prev => [nuevo, ...prev]);
      
      // ❌ ELIMINADO: No crear movimiento de entrada automático
      // Esto causaba que la cantidad se duplicara
      // La cantidad ya se establece correctamente al crear el medicamento
      
      alert("✅ Medicamento creado exitosamente");
    } catch (error) {
      console.error('❌ Error creando medicamento:', error);
      alert('❌ Error al crear el medicamento: ' + error.message);
    }
  }

  // Funciones mejoradas con protección
  async function onDescarte(item) {
    if (processingMovement) {
      alert('⏳ Ya hay un movimiento en proceso. Espere...');
      return;
    }
    
    if (!confirm(`¿Marcar "${item.nombre}" como descartado? Esto pondrá la cantidad en 0.`)) return;
    
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
    if (processingMovement) {
      alert('⏳ Ya hay un movimiento en proceso. Espere...');
      return;
    }
    
    const n = Number(prompt(`Cantidad a registrar como SALIDA para "${item.nombre}"`, "1") || 0);
    if (!n || n <= 0) return;
    if (n > item.cantidad) return alert(`❌ No hay suficiente stock. Disponible: ${item.cantidad}`);
    
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
    if (processingMovement) {
      alert('⏳ Ya hay un movimiento en proceso. Espere...');
      return;
    }
    
    const n = Number(prompt(`Cantidad a registrar como ENTRADA para "${item.nombre}"`, "10") || 0);
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

  // ----- Loading -----
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">🔄 {t('loading')}</div>
          <div className="text-sm text-gray-500">{t('connecting')}</div>
        </div>
      </div>
    );
  }

  // ----- UI -----
  return (
    <>
      {/* Estilos personalizados para el scroll */}
      <style>
        {`
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #2563eb;
          }

          * {
            scrollbar-width: thin;
            scrollbar-color: #3b82f6 #f1f1f1;
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-100 text-gray-900 flex">
        {/* Sidebar para móviles y tabletas */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full p-4 border-r">
            {/* Header del sidebar */}
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <h2 className="text-lg font-semibold text-blue-700">
                {t('navigation')}
              </h2>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Navegación */}
            <nav className="flex-1 space-y-2">
              {[
                ["inventario", "+", t('inventory')],
                ["movs", "+", t('movements')],
                ["alertas", "+", t('alerts')],
                ["nuevo", "+", t('newMedicine')],
                ["registrar", "+", t('registerMovement')],
              ].map(([id, icon, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                    tab === id
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>

            {/* Footer del sidebar */}
            <div className="pt-4 border-t border-gray-200">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700">{user.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                <div className={`text-xs mt-1 ${isOnline ? "text-green-600" : "text-amber-600"}`}>
                  {isOnline ? `✅ ${t('online')}` : `⚠️ ${t('offline')}`}
                </div>
                {processingMovement && (
                  <div className="text-xs text-blue-600 mt-1">
                    ⏳ Procesando movimiento...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay para móviles */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header superior */}
          <header className="bg-white shadow-sm border-b z-30">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Botón hamburguesa para móviles/tabletas */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-blue-700">
                      🩺 {t('appTitle')}
                    </h1>
                  </div>
                </div>

                {/* Botones de header para desktop */}
                <div className="flex items-center gap-3">
                  <LanguageSwitcher />
                  
                  {/* Menú desplegable para descargas */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                      className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm hover:bg-amber-50"
                    >
                      📥 {t('downloadBackup')} ▼
                    </button>
                    
                    {showDownloadOptions && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-50">
                        <button
                          onClick={() => {
                            descargarPDFCompleto();
                            setShowDownloadOptions(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                        >
                          📋 {t('fullReport')}
                        </button>
                        <button
                          onClick={() => {
                            descargarPDFAlertas();
                            setShowDownloadOptions(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                          disabled={vencidos.length === 0 && proximos.length === 0 && bajos.length === 0}
                        >
                          ⚠️ {t('downloadAlerts')}
                          {(vencidos.length === 0 && proximos.length === 0 && bajos.length === 0) && (
                            <span className="text-xs text-gray-400 ml-auto">No hay alertas</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                <button
  onClick={() => {
    authLogout();
    setUser(null);
  }}
  className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-blue-700"
>
   {t('logout')}
</button>
                </div>
              </div>
            </div>
          </header>

          {/* Contenido */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {/* Error de conexión */}
              {connectionError && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4">
                  <div className="flex items-center">
                    <div className="text-red-700">
                      <strong>⚠️ {t('connectionError')}:</strong> {connectionError}
                      <div className="mt-2">
                        <button 
                          onClick={loadData}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          {t('retry')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Indicador de estado offline */}
              {!isOnline && (
                <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <div className="flex items-center">
                    <div className="text-amber-700">
                      <strong>📴 {t('offline')}:</strong> Trabajando en modo offline. Los cambios se sincronizarán cuando se recupere la conexión.
                    </div>
                  </div>
                </div>
              )}

              {/* Indicador de movimiento en proceso */}
              {processingMovement && (
                <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <div className="flex items-center">
                    <div className="text-blue-700">
                      <strong>⏳ Procesando movimiento...</strong> Por favor espere.
                    </div>
                  </div>
                </div>
              )}

              {/* Estadísticas */}
              <section className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatsBox label={t('medicines')} value={items.length} />
                <StatsBox label={t('expired')} value={vencidos.length} />
                <StatsBox label={t('expiringSoon')} value={proximos.length} />
                <StatsBox label={t('lowStock')} value={bajos.length} />
              </section>

              {/* Contenido principal */}
              <main className="space-y-6">
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
        </div>
      </div>
    </>
  );
}