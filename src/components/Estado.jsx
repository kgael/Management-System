import Pill from "./Pill";


export default function Estado({ r, hoy, diasEntre }) {
const exp = new Date(r.caducidad) < new Date(hoy);
const d = diasEntre(hoy, r.caducidad);
return (
<div className="flex flex-wrap gap-2">
{r.descartado && <Pill className="bg-gray-100 text-gray-700">Descartado</Pill>}
{exp && <Pill className="bg-rose-100 text-rose-700">Vencido</Pill>}
{!exp && d <= 60 && <Pill className="bg-amber-100 text-amber-700">Próx. a vencer</Pill>}
{r.cantidad <= r.minimo && <Pill className="bg-blue-100 text-blue-700">Bajo stock</Pill>}
</div>
);
}