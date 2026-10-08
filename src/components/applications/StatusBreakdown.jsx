import { APPLICATION_STATUSES } from '../../utils/constants'

/** Dependency-free overview chart: a stacked bar plus a labelled bar per status. */
export function StatusBreakdown({ counts, total }) {
  const rows = APPLICATION_STATUSES.map((s) => ({ ...s, count: counts[s.value] ?? 0 }))
  const max = Math.max(1, ...rows.map((r) => r.count))

  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={rows.map((r) => `${r.label}: ${r.count}`).join(', ')}>
        {rows.filter((r) => r.count > 0).map((r) => (
          <div key={r.value} className={`${r.bar} h-full border-r-2 border-white last:border-r-0`} style={{ width: `${(r.count / total) * 100}%` }} />
        ))}
      </div>

      <ul className="mt-6 space-y-3">
        {rows.map((r) => (
          <li key={r.value} className="grid grid-cols-[150px_1fr_40px] items-center gap-3 text-sm">
            <span className="flex items-center gap-2 truncate text-slate-600">
              <span className={`size-2 shrink-0 rounded-full ${r.dot}`} aria-hidden="true" />
              {r.label}
            </span>
            <span className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              <span className={`block h-full rounded-full ${r.bar}`} style={{ width: `${(r.count / max) * 100}%` }} />
            </span>
            <span className="text-right font-medium text-slate-900 tabular-nums">{r.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
