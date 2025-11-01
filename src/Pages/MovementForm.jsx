import { useEffect, useState } from "react";
import Field from "../components/Field";

export default function MovementForm({ items, onSubmit }) {
  const [f, setF] = useState({ itemId: items[0]?.id || "", tipo: "salida", cantidad: 1, responsable: "", nota: "" });

  useEffect(() => {
    if (!items.find((i) => i.id === f.itemId) && items[0]) setF((x) => ({ ...x, itemId: items[0].id }));
  }, [items]);

  function submit(e) {
    e.preventDefault();
    if (!f.itemId) return alert("Selecciona un medicamento");
    const cant = Number(f.cantidad);
    if (!cant || cant <= 0) return alert("Cantidad inválida");
    onSubmit(f.itemId, f.tipo, cant, f.responsable, f.nota);
    alert("Movimiento registrado");
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-2">
      <div>
        <label className="text-xs text-gray-600">Medicamento</label>
        <select value={f.itemId} onChange={(e) => setF({ ...f, itemId: e.target.value })} className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm">
          {items.map((i) => (
            <option key={i.id} value={i.id}>{i.nombre} (Stock {i.cantidad})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500">Tipo</label>
        <select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })} className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm">
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
          <option value="descarte">Descarte</option>
        </select>
      </div>
      <Field label="Cantidad" type="number" value={f.cantidad} onChange={(v) => setF({ ...f, cantidad: Number(v) })} />
      <Field label="Responsable" value={f.responsable} onChange={(v) => setF({ ...f, responsable: v })} />
      <div className="md:col-span-2">
        <Field label="Nota" value={f.nota} onChange={(v) => setF({ ...f, nota: v })} />
      </div>
      <div className="md:col-span-2">
        <button className="rounded-xl bg-pink-600 px-4 py-2 text-white shadow-sm hover:bg-pink-700" type="submit">Registrar</button>
      </div>
    </form>
  );
}
