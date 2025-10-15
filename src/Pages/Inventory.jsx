import Table from "../components/Table";
import Button from "../components/Button";
import Caducidad from "../components/Caducidad";
import Estado from "../components/Estado";

export default function Inventory({
  items,
  query,
  setQuery,
  hoy,
  diasEntre,
  onEntrada,
  onSalida,
  onDescarte,
}) {
  const lista = items.filter((x) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      x.nombre.toLowerCase().includes(q) ||
      x.lote.toLowerCase().includes(q) ||
      (x.unidad || "").toLowerCase().includes(q)
    );
  });

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, lote o unidad…"
          className="w-full sm:w-96 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm"
        />
        <div className="text-xs text-gray-500">Hoy: {hoy}</div>
      </div>

      <Table
        headers={["Medicamento", "Caducidad", "Stock", "Estado", "Acciones"]}
        rows={lista.map((r) => [
          <div className="font-medium" key={r.id}>
            {r.nombre}
            <div className="text-xs text-gray-500">
              Lote {r.lote} · {r.unidad || ""}
            </div>
          </div>,
          <Caducidad
            key={r.id + "c"}
            fecha={r.caducidad}
            descartado={r.descartado}
            hoy={hoy}
            diasEntre={diasEntre}
          />,
          <div key={r.id + "s"}>
            <div className="font-semibold">{r.cantidad}</div>
            <div className="text-xs text-gray-500">Mín. {r.minimo}</div>
          </div>,
          <Estado key={r.id + "e"} r={r} hoy={hoy} diasEntre={diasEntre} />,
          <div className="flex flex-wrap gap-2" key={r.id + "a"}>
            <Button onClick={() => onSalida(r)}>Salida</Button>
            <Button onClick={() => onEntrada(r)}>Entrada</Button>
            <Button danger onClick={() => onDescarte(r)}>
              Descartar
            </Button>
          </div>,
        ])}
        empty="Sin medicamentos. Agrega uno nuevo."
      />
    </section>
  );
}
