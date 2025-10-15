import Table from "../components/Table";
import Pill from "../components/Pill";


function EtiquetaTipo({ tipo }) {
const map = {
entrada: "bg-green-100 text-green-700",
salida: "bg-blue-100 text-blue-700",
descarte: "bg-rose-100 text-rose-700",
};
return <Pill className={map[tipo] || "bg-gray-100 text-gray-700"}>{tipo}</Pill>;
}


export default function Movements({ items, moves }) {
return (
<section>
<Table
headers={["Fecha", "Tipo", "Medicamento", "Cantidad", "Responsable", "Nota"]}
rows={moves.map((m) => [
m.fecha,
<EtiquetaTipo key={m.id} tipo={m.tipo} />,
<span className="font-medium" key={m.id+"n"}>{items.find(i => i.id === m.itemId)?.nombre || "—"}</span>,
m.cantidad,
m.responsable,
m.nota,
])}
empty="Sin movimientos"
/>
</section>
);
}