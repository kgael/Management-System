import Pill from "./Pill";

export default function Caducidad({ fecha, descartado, hoy, diasEntre }) {
  if (descartado) return <Pill className="bg-gray-100 text-gray-700">Descartado</Pill>;
  const exp = new Date(fecha) < new Date(hoy);
  if (exp)
    return (
      <div className="flex items-center gap-2">
        <Pill className="bg-rose-100 text-rose-600">Vencido</Pill>
        <span className="text-xs text-gray-500">{fecha}</span>
      </div>
    );
  const d = diasEntre(hoy, fecha);
  if (d <= 60)
    return (
      <div className="flex items-center gap-2">
        <Pill className="bg-amber-100 text-amber-700">Caduca en {d} días</Pill>
        <span className="text-xs text-gray-500">{fecha}</span>
      </div>
    );
  return <span className="text-sm">{fecha}</span>;
}
