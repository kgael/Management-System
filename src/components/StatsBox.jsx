export default function StatsBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-3 sm:p-4 shadow-sm border">
      <div className="text-xs sm:text-sm text-gray-500">{label}</div>
      <div className="text-xl sm:text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}