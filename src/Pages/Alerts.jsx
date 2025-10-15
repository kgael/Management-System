import Card from "../components/Card";
import AlertList from "../components/AlertList";


export default function Alerts({ vencidos, proximos, bajos, onDescartar, hoy, diasEntre }) {
return (
<section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
<Card title={`Vencidos (${vencidos.length})`} subtitle="Revisar y descartar">
<AlertList datos={vencidos} onDescartar={onDescartar} hoy={hoy} diasEntre={diasEntre} />
</Card>
<Card title={`Próximos a vencer (${proximos.length})`} subtitle="≤60 días">
<AlertList datos={proximos} hoy={hoy} diasEntre={diasEntre} />
</Card>
<Card title={`Bajo stock (${bajos.length})`} subtitle="Por debajo del mínimo">
<AlertList datos={bajos} hoy={hoy} diasEntre={diasEntre} />
</Card>
</section>
);
}