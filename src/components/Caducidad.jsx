import Pill from "./Pill";
import { useI18n } from "../hooks/useI18n";

export default function Caducidad({ fecha, descartado, hoy, diasEntre }) {
  const { t } = useI18n();

  if (descartado) return <Pill className="bg-gray-100 text-gray-700">{t('discarded')}</Pill>;
  
  const exp = new Date(fecha) < new Date(hoy);
  if (exp)
    return (
      <div className="flex items-center gap-2">
        <Pill className="bg-rose-100 text-rose-600">{t('expiredPill')}</Pill>
        <span className="text-xs text-gray-500">{fecha}</span>
      </div>
    );
  
  const d = diasEntre(hoy, fecha);
  if (d <= 60)
    return (
      <div className="flex items-center gap-2">
        <Pill className="bg-amber-100 text-amber-700">
          {t('expiringIn')} {d} {t('days')}
        </Pill>
        <span className="text-xs text-gray-500">{fecha}</span>
      </div>
    );
  
  return <span className="text-sm">{fecha}</span>;
}