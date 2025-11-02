import Button from "./Button";
import Estado from "./Estado";

export default function AlertList({ datos, onDescartar, hoy, diasEntre }) {
  if (!datos.length) return <div className="text-sm text-gray-400">Sin elementos</div>;
  return (
    <ul className="space-y-2 sm:space-y-3">
      {datos.map((x) => (
        <li key={x.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 rounded-xl border p-3">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm sm:text-base break-words">{x.nombre}</div>
            <div className="text-xs text-gray-500 mt-1 space-y-1">
              <div>Lote {x.lote}</div>
              <div>Caduca {x.caducidad}</div>
              <div>Stock {x.cantidad}</div>
            </div>
          </div>
          <div className="self-end sm:self-auto mt-2 sm:mt-0">
            {onDescartar ? (
              <Button danger onClick={() => onDescartar(x)}>Descartar</Button>
            ) : (
              <Estado r={x} hoy={hoy} diasEntre={diasEntre} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}