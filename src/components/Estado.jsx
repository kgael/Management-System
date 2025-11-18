import Pill from "./Pill";
import { useI18n } from "../hooks/useI18n";

export default function Estado({ r, hoy, diasEntre }) {
  const { t } = useI18n();
  const exp = new Date(r.caducidad) < new Date(hoy);
  const d = diasEntre(hoy, r.caducidad);
  return (
    <div className="flex flex-wrap gap-2">
      {r.descartado && <Pill className="bg-gray-100 text-gray-700">{t('discarded')}</Pill>}
      {exp && <Pill className="bg-rose-100 text-rose-600">{t('expiredPill')}</Pill>}
      {!exp && d <= 60 && <Pill className="bg-amber-100 text-amber-700">{t('expiringPill')}</Pill>}
      {r.cantidad <= r.minimo && <Pill className="bg-blue-100 text-blue-700">{t('lowStockPill')}</Pill>}
    </div>
  );
}