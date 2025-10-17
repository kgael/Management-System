import { useState } from "react";
import Field from "../components/Field";

export default function NewItemForm({ onSave }) {
  const [f, setF] = useState({ nombre: "", lote: "", caducidad: "", unidad: "", cantidad: 0, minimo: 0, responsable: "" });

  function submit(e) {
    e.preventDefault();
    if (!f.nombre || !f.lote || !f.caducidad) return alert("Faltan campos obligatorios");
    onSave(f);
    setF({ nombre: "", lote: "", caducidad: "", unidad: "", cantidad: 0, minimo: 0, responsable: "" });
    alert("Medicamento agregado");
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-2">
      <Field label="Nombre*" value={f.nombre} onChange={(v) => setF({ ...f, nombre: v })} />
      <Field label="Lote*" value={f.lote} onChange={(v) => setF({ ...f, lote: v })} />
      <Field label="Caducidad*" type="date" value={f.caducidad} onChange={(v) => setF({ ...f, caducidad: v })} />
      <Field label="Unidad" value={f.unidad} onChange={(v) => setF({ ...f, unidad: v })} />
      <Field label="Cantidad inicial" type="number" value={f.cantidad} onChange={(v) => setF({ ...f, cantidad: Number(v) })} />
      <Field label="Stock mínimo" type="number" value={f.minimo} onChange={(v) => setF({ ...f, minimo: Number(v) })} />
      <Field label="Responsable (alta)" value={f.responsable} onChange={(v) => setF({ ...f, responsable: v })} />
      <div className="md:col-span-2 flex items-center gap-2">
        <button className="rounded-xl bg-pink-600 px-4 py-2 text-white shadow-sm hover:bg-pink-700" type="submit">Guardar</button>
        <span className="text-xs text-gray-500">Los campos con * son obligatorios</span>
      </div>
    </form>
  );
}