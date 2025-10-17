// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { descargarJSON, diasEntre, hoyISO, uid } from "./utils/helpers";
import { loadItems, loadMoves, saveItems, saveMoves } from "./utils/storage";

import StatsBox from "./components/StatsBox";
import Inventory from "./pages/Inventory";
import Movements from "./pages/Movements";
import Alerts from "./pages/Alerts";
import NewItemForm from "./pages/NewItemForm";
import MovementForm from "./pages/MovementForm";
import "./App.css"

export default function App() {
  // ----- Estado principal -----
  const [items, setItems] = useState(loadItems());
  const [moves, setMoves] = useState(loadMoves());
  const [tab, setTab] = useState("inventario");
  const [query, setQuery] = useState("");

  // ----- Persistencia local -----
  useEffect(() => saveItems(items), [items]);
  useEffect(() => saveMoves(moves), [moves]);

  // Migración: completar itemNombre en movimientos antiguos (una sola vez)
  useEffect(() => {
    const fixed = moves.map((m) => {
      if (!m.itemNombre) {
        const it = items.find((i) => i.id === m.itemId);
        return { ...m, itemNombre: it?.nombre || "(desconocido)" };
      }
      return m;
    });
    if (JSON.stringify(fixed) !== JSON.stringify(moves)) {
      setMoves(fixed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hoy = hoyISO();

  // ----- Derivados -----
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

  // ----- Acciones -----
  function crearMedicamento(data) {
    const nuevo = {
      id: uid(),
      nombre: data.nombre,
      lote: data.lote,
      caducidad: data.caducidad,
      unidad: data.unidad || "",
      cantidad: Number(data.cantidad || 0),
      minimo: Number(data.minimo || 0),
      descartado: false,
      responsableUltimo: data.responsable || "—",
    };
    setItems([nuevo, ...items]);
    registrarMovimiento({
      itemId: nuevo.id,
      itemNombre: nuevo.nombre,
      tipo: "entrada",
      cantidad: nuevo.cantidad,
      responsable: nuevo.responsableUltimo,
      nota: "Alta inicial",
    });
  }

  // 👇 Firma nueva: recibe un objeto y siempre guarda itemNombre
  function registrarMovimiento({
    itemId,
    itemNombre,
    tipo,
    cantidad,
    responsable,
    nota,
  }) {
    const it = items.find((x) => x.id === itemId);
    const nombre = itemNombre || it?.nombre || "(desconocido)";

    const mov = {
      id: uid(),
      itemId,
      itemNombre: nombre,
      tipo,
      cantidad: Number(cantidad || 0),
      responsable: responsable || "—",
      fecha: hoyISO(),
      nota: nota || "",
    };
    setMoves([mov, ...moves]);

    if (it) {
      setItems(
        items.map((x) => {
          if (x.id !== itemId) return x;
          let next = { ...x, responsableUltimo: mov.responsable };
          if (tipo === "entrada") next.cantidad = x.cantidad + mov.cantidad;
          if (tipo === "salida")
            next.cantidad = Math.max(0, x.cantidad - mov.cantidad);
          if (tipo === "descarte") next = { ...next, cantidad: 0, descartado: true };
          return next;
        })
      );
    }
  }

  function onDescarte(item) {
    if (!confirm("¿Marcar como descartado? Esto pondrá la cantidad en 0.")) return;
    const responsable = prompt("Responsable del descarte") || "—";
    registrarMovimiento({
      itemId: item.id,
      itemNombre: item.nombre,
      tipo: "descarte",
      cantidad: item.cantidad,
      responsable,
      nota: "Caducado/Descarte",
    });
  }

  function onSalida(item) {
    const n = Number(prompt("Cantidad a registrar (salida)", "1") || 0);
    if (!n || n <= 0) return;
    if (n > item.cantidad) return alert("No hay suficiente stock");
    const resp = prompt("Responsable") || "—";
    registrarMovimiento({
      itemId: item.id,
      itemNombre: item.nombre,
      tipo: "salida",
      cantidad: n,
      responsable: resp,
      nota: "Dispensación",
    });
  }

  function onEntrada(item) {
    const n = Number(prompt("Cantidad a registrar (entrada)", "10") || 0);
    if (!n || n <= 0) return;
    const resp = prompt("Responsable") || "—";
    registrarMovimiento({
      itemId: item.id,
      itemNombre: item.nombre,
      tipo: "entrada",
      cantidad: n,
      responsable: resp,
      nota: "Reposición",
    });
  }

  // ----- UI -----
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto max-w-7xl p-4">
        {/* Header */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              🩺 Inventario — Clínica 
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={navigator.onLine ? "text-green-700" : "text-amber-700"}
            >
              {navigator.onLine ? "Conectado" : "Sin conexión"}
            </span>
            <button
              onClick={() =>
                descargarJSON("respaldo_inventario", { items, moves })
              }
              className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
            >
              Descargar respaldo
            </button>
          </div>
        </header>

        {/* Navegación */}
        <nav className="mt-4 flex flex-wrap gap-2">
          {[
            ["inventario", "Inventario"],
            ["movs", "Movimientos"],
            ["alertas", "Alertas"],
            ["nuevo", "Nuevo"],
            ["registrar", "Registrar"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-sm font-medium border shadow-sm ${
                tab === id
                  ? "bg-pink-600 text-white border-pink-600"
                  : "bg-white hover:bg-gray-50"
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
              items={items}
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
              items={items}
              onSubmit={(itemId, tipo, cantidad, responsable, nota) => {
                const it = items.find((i) => i.id === itemId);
                registrarMovimiento({
                  itemId,
                  itemNombre: it?.nombre,
                  tipo,
                  cantidad,
                  responsable,
                  nota,
                });
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
