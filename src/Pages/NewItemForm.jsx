// src/Pages/NewItemForm.jsx - VERSIÓN COMPLETA
import { useState } from "react";
import Field from "../components/Field";
import { useI18n } from "../hooks/useI18n";

export default function NewItemForm({ onSave }) {
  const { t } = useI18n();
  const [f, setF] = useState({ nombre: "", lote: "", caducidad: "", unidad: "", cantidad: 0, minimo: 0, responsable: "" });

  function submit(e) {
    e.preventDefault();
    if (!f.nombre || !f.lote || !f.caducidad) return alert("Faltan campos obligatorios");
    onSave(f);
    setF({ nombre: "", lote: "", caducidad: "", unidad: "", cantidad: 0, minimo: 0, responsable: "" });
    alert("Medicamento agregado");
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-white p-3 sm:p-4 shadow-sm grid-cols-1 md:grid-cols-2">
      <Field label={`${t('name')}*`} value={f.nombre} onChange={(v) => setF({ ...f, nombre: v })} />
      <Field label={`${t('batch')}*`} value={f.lote} onChange={(v) => setF({ ...f, lote: v })} />
      <Field label={`${t('expiration')}*`} type="date" value={f.caducidad} onChange={(v) => setF({ ...f, caducidad: v })} />
      <Field label={t('unit')} value={f.unidad} onChange={(v) => setF({ ...f, unidad: v })} />
      <Field label={t('quantity')} type="number" value={f.cantidad} onChange={(v) => setF({ ...f, cantidad: Number(v) })} />
      <Field label={t('minimumStock')} type="number" value={f.minimo} onChange={(v) => setF({ ...f, minimo: Number(v) })} />
      <Field label={t('responsible')} value={f.responsable} onChange={(v) => setF({ ...f, responsable: v })} />
      <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <button className="rounded-xl bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto" type="submit">
          {t('save')}
        </button>
        <span className="text-xs text-gray-500 mt-1 sm:mt-0">{t('requiredFields')}</span>
      </div>
    </form>
  );
}