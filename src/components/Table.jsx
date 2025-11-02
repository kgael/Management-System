export default function Table({ headers, rows, empty }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-3 text-left font-medium text-xs sm:text-sm whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="p-6 text-center text-gray-400 text-sm">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((cols, i) => (
              <tr key={i} className={i % 2 ? "bg-gray-50/30" : "bg-white"}>
                {cols.map((c, j) => (
                  <td key={j} className="px-3 py-3 align-top text-xs sm:text-sm">
                    {c}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}