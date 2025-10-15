import React, { useEffect, useMemo, useState } from "react";
import { diasEntre, hoyISO, uid } from "./utils/helpers";
import { loadItems, loadMoves, saveItems, saveMoves } from "./utils/storage";

import StatsBox from "./components/StatsBox";
import Inventory from "./Pages/Inventory";
import Movements from "./Pages/Movements";
import Alerts from "./Pages/Alerts";
import NewItemForm from "./Pages/NewItemForm";
import MovementForm from "./Pages/MovementForm";
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
    registrarMovimiento(
      nuevo.id,
      "entrada",
      nuevo.cantidad,
      nuevo.responsableUltimo,
      "Alta inicial"
    );
  }

  function registrarMovimiento(itemId, tipo, cantidad, responsable, nota) {
    const mov = {
      id: uid(),
      itemId,
      tipo,
      cantidad: Number(cantidad || 0),
      responsable: responsable || "—",
      fecha: hoyISO(),
      nota: nota || "",
    };
    setMoves([mov, ...moves]);
    setItems(
      items.map((it) => {
        if (it.id !== itemId) return it;
        let next = { ...it, responsableUltimo: mov.responsable };
        if (tipo === "entrada") next.cantidad = it.cantidad + mov.cantidad;
        if (tipo === "salida")
          next.cantidad = Math.max(0, it.cantidad - mov.cantidad);
        if (tipo === "descarte")
          next = { ...next, cantidad: 0, descartado: true };
        return next;
      })
    );
  }

  function onDescarte(item) {
    if (!confirm("¿Marcar como descartado? Esto pondrá la cantidad en 0."))
      return;
    const responsable = prompt("Responsable del descarte") || "—";
    registrarMovimiento(
      item.id,
      "descarte",
      item.cantidad,
      responsable,
      "Caducado/Descarte"
    );
  }

  function onSalida(item) {
    const n = Number(prompt("Cantidad a registrar (salida)", "1") || 0);
    if (!n || n <= 0) return;
    if (n > item.cantidad) return alert("No hay suficiente stock");
    const resp = prompt("Responsable") || "—";
    registrarMovimiento(item.id, "salida", n, resp, "Dispensación");
  }

  function onEntrada(item) {
    const n = Number(prompt("Cantidad a registrar (entrada)", "10") || 0);
    if (!n || n <= 0) return;
    const resp = prompt("Responsable") || "—";
    registrarMovimiento(item.id, "entrada", n, resp, "Reposición");
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
            <MovementForm items={items} onSubmit={registrarMovimiento} />
          )}
        </main>
      </div>
    </div>
  );
}
