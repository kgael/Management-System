import Table from "../components/Table";
import Pill from "../components/Pill";
import { useI18n } from "../hooks/useI18n";

function EtiquetaTipo({ tipo }) {
  const { t } = useI18n();
  const map = {
    entrada: "bg-green-100 text-green-700",
    salida: "bg-blue-100 text-blue-700",
    descarte: "bg-rose-100 text-rose-700",
  };
  
  const tipoTraducido = {
    entrada: t('input'),
    salida: t('output'),
    descarte: t('discard')
  };
  
  return (
    <Pill className={map[tipo] || "bg-gray-100 text-gray-700"}>
      {tipoTraducido[tipo] || tipo}
    </Pill>
  );
}

export default function Movements({ items, moves }) {
  const { t } = useI18n();
  
  return (
    <section>
      <Table
        headers={[
          t('today'),
          t('movementType'),
          t('medicine'),
          t('quantity'),
          t('responsible'),
          t('note'),
        ]}
        rows={moves.map((m) => [
          m.fecha,
          <EtiquetaTipo key={m.id} tipo={m.tipo} />,
          <span className="font-medium" key={m.id + "n"}>
            {m.itemNombre ||
              items.find((i) => i.id === m.itemId)?.nombre ||
              "—"}
          </span>,
          m.cantidad,
          m.responsable,
          m.nota,
        ])}
        empty={t('noMovements')}
      />
    </section>
  );
}