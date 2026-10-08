import { JOB_STATUSES, STATUS_MAP } from '../../utils/constants'

export function Badge({ className = 'bg-slate-100 text-slate-700 ring-slate-500/20', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${className}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status, withIcon = true }) {
  const meta = STATUS_MAP[status]
  if (!meta) return null
  const Icon = meta.icon
  return (
    <Badge className={meta.badge}>
      {withIcon && <Icon className="size-3.5" aria-hidden="true" />}
      {meta.label}
    </Badge>
  )
}

export function JobStatusBadge({ status }) {
  const meta = JOB_STATUSES.find((s) => s.value === status)
  return meta ? <Badge className={meta.badge}>{meta.label}</Badge> : null
}
