import Button from "./Button";
import Estado from "./Estado";

export default function AlertList({ datos, onDescartar, hoy, diasEntre }) {
  if (!datos.length) return <div className="text-sm text-gray-500">Sin elementos</div>;
  return (
    <ul className="space-y-3">
      {datos.map((x) => (
        <li key={x.id} className="flex items-start justify-between gap-3 rounded-xl border p-3">
          <div>
            <div className="font-medium">{x.nombre}</div>
            <div className="text-xs text-gray-500">Lote {x.lote} · Caduca {x.caducidad} · Stock {x.cantidad}</div>
          </div>
          {onDescartar ? (
            <Button danger onClick={() => onDescartar(x)}>Descartar</Button>
          ) : (
            <Estado r={x} hoy={hoy} diasEntre={diasEntre} />
          )}
        </li>
      ))}
    </ul>
  );
}