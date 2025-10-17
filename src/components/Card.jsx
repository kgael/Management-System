export default function Card({ title, children, subtitle }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="text-lg font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}