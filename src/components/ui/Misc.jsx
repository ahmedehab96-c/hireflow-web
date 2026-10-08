import { initials } from '../../utils/format'

export function PageHeader({ title, description, actions, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {children}
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, tone = 'bg-slate-100 text-slate-600', hint, loading }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <span className={`flex size-8 items-center justify-center rounded-lg ${tone}`}>
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-16 animate-pulse rounded-md bg-slate-200/70" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight text-slate-900 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-brand-700" />
        <path d="M11 9v14M21 9v14M11 16h10" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
      HireFlow
    </span>
  )
}

export function Avatar({ name, className = 'size-9 text-sm' }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800 ${className}`}>
      {initials(name)}
    </span>
  )
}

const LOGO_TONES = ['bg-sky-100 text-sky-800', 'bg-amber-100 text-amber-800', 'bg-violet-100 text-violet-800', 'bg-rose-100 text-rose-800', 'bg-teal-100 text-teal-800']

/** Uses the company logo if present, otherwise a stable coloured monogram. */
export function CompanyLogo({ company, className = 'size-11 text-sm' }) {
  if (company?.logo) {
    return <img src={company.logo} alt="" className={`shrink-0 rounded-lg border border-slate-200 bg-white object-contain ${className}`} />
  }
  const tone = LOGO_TONES[(company?.id ?? 0) % LOGO_TONES.length]
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-lg font-semibold ${tone} ${className}`} aria-hidden="true">
      {initials(company?.name ?? '?')}
    </span>
  )
}
