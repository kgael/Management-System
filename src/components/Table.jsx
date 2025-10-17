export default function Table({ headers, rows, empty }) {
  return (
    <div className="overflow-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="p-6 text-center text-gray-400">{empty}</td>
            </tr>
          ) : (
            rows.map((cols, i) => (
              <tr key={i} className={i % 2 ? "bg-gray-50/30" : "bg-white"}>
                {cols.map((c, j) => (
                  <td key={j} className="px-3 py-2 align-top">{c}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}