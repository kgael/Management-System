// src/Pages/MovementForm.jsx - VERSIÓN COMPLETA
import { useEffect, useState } from "react";
import Field from "../components/Field";
import { useI18n } from "../hooks/useI18n";

export default function MovementForm({ items, onSubmit }) {
  const { t } = useI18n();
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
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-white p-3 sm:p-4 shadow-sm grid-cols-1 md:grid-cols-2">
      <div>
        <label className="text-xs text-gray-600">{t('medicine')}</label>
        <select value={f.itemId} onChange={(e) => setF({ ...f, itemId: e.target.value })} className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm">
          {items.map((i) => (
            <option key={i.id} value={i.id}>{i.nombre} ({t('stock')} {i.cantidad})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500">{t('movementType')}</label>
        <select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })} className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm">
          <option value="entrada">{t('input')}</option>
          <option value="salida">{t('output')}</option>
          <option value="descarte">{t('discard')}</option>
        </select>
      </div>
      <Field label={t('quantity')} type="number" value={f.cantidad} onChange={(v) => setF({ ...f, cantidad: Number(v) })} />
      <Field label={t('responsible')} value={f.responsable} onChange={(v) => setF({ ...f, responsable: v })} />
      <div className="md:col-span-2">
        <Field label={t('note')} value={f.nota} onChange={(v) => setF({ ...f, nota: v })} />
      </div>
      <div className="md:col-span-2">
        <button className="rounded-xl bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base" type="submit">
          {t('register')}
        </button>
      </div>
    </form>
  );
}