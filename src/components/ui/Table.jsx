/** Horizontal-scroll wrapper so wide tables never break the page on small screens. */
export function Table({ head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50/80">
          <tr>
            {head.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-medium tracking-wide whitespace-nowrap text-slate-500 uppercase first:pl-5 last:pr-5 ${column.className ?? ''}`}
              >
                {column.srOnly ? <span className="sr-only">{column.label}</span> : column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  )
}

export function Td({ className = '', children, ...props }) {
  return <td className={`px-4 py-3 align-middle first:pl-5 last:pr-5 ${className}`} {...props}>{children}</td>
}
