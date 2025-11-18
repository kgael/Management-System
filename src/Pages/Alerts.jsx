import Card from "../components/Card";
import AlertList from "../components/AlertList";
import { useI18n } from "../hooks/useI18n";

export default function Alerts({ vencidos, proximos, bajos, onDescartar, hoy, diasEntre }) {
  const { t } = useI18n();
  
  return (
    <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
      <Card 
        title={`${t('expired')} (${vencidos.length})`} 
        subtitle={t('reviewAndDiscard')}
      >
        <AlertList datos={vencidos} onDescartar={onDescartar} hoy={hoy} diasEntre={diasEntre} />
      </Card>
      <Card 
        title={`${t('expiringSoon')} (${proximos.length})`} 
        subtitle={`≤60 ${t('days')}`}
      >
        <AlertList datos={proximos} hoy={hoy} diasEntre={diasEntre} />
      </Card>
      <Card 
        title={`${t('lowStock')} (${bajos.length})`} 
        subtitle={t('belowMinimum')}
      >
        <AlertList datos={bajos} hoy={hoy} diasEntre={diasEntre} />
      </Card>
    </section>
  );
}