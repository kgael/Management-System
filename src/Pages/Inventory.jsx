import Table from "../components/Table";
import Button from "../components/Button";
import Caducidad from "../components/Caducidad";
import Estado from "../components/Estado";
import { useI18n } from "../hooks/useI18n";

export default function Inventory({ items, query, setQuery, hoy, diasEntre, onEntrada, onSalida, onDescarte }) {
  const { t } = useI18n();
  
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
          placeholder={t('searchPlaceholder')}
          className="w-full text-sm sm:text-base rounded-xl border bg-white px-3 py-2 shadow-sm"
        />
        <div className="text-xs sm:text-sm text-gray-500">{t('today')}: {hoy}</div>
      </div>

      <Table
        headers={[t('medicine'), t('expiration'), t('stock'), t('status'), t('actions')]}
        rows={lista.map((r) => [
          (
            <div className="min-w-[140px]" key={r.id}>
              <div className="font-medium text-sm sm:text-base break-words">{r.nombre}</div>
              <div className="text-xs text-gray-500 mt-1">{t('batch')} {r.lote}</div>
              <div className="text-xs text-gray-500">{r.unidad || ""}</div>
            </div>
          ),
          <div className="min-w-[120px]" key={r.id+"c"}>
            <Caducidad fecha={r.caducidad} descartado={r.descartado} hoy={hoy} diasEntre={diasEntre} />
          </div>,
          (
            <div key={r.id+"s"} className="min-w-[80px]">
              <div className="font-semibold text-sm sm:text-base">{r.cantidad}</div>
              <div className="text-xs text-gray-500">{t('minimumStock')} {r.minimo}</div>
            </div>
          ),
          <div className="min-w-[130px]" key={r.id+"e"}>
            <Estado r={r} hoy={hoy} diasEntre={diasEntre} />
          </div>,
          (
            <div className="flex flex-col gap-1 min-w-[100px]" key={r.id+"a"}>
              <Button onClick={() => onSalida(r)}>{t('output')}</Button>
              <Button onClick={() => onEntrada(r)}>{t('input')}</Button>
              <Button danger onClick={() => onDescarte(r)}>{t('discard')}</Button>
            </div>
          ),
        ])}
        empty={t('noItems')}
      />
    </section>
  );
}