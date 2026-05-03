interface AnalyticsCardProps {
  title: string
  columns: string[]
  rows: (string | number)[][]
}

export function AnalyticsCard({ title, columns, rows }: AnalyticsCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-800/50">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-amber-300">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-700/30">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-2 text-left text-xs font-semibold text-slate-300"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-white/5 hover:bg-slate-700/20">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-2 text-sm text-slate-200">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
