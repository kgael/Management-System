export default function Button({ children, onClick, danger }) {
  const base = "rounded-lg border px-3 py-1 text-xs shadow-sm ";
  const cls = danger ? base + "bg-rose-600 text-white hover:bg-rose-700" : base + "bg-white hover:bg-gray-50";
  return (
    <button onClick={onClick} className={cls}>{children}</button>
  );
}