export default function StatsBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}