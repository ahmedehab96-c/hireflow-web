import { Check, CircleAlert, X } from 'lucide-react'

/** Small building blocks shared by the CV analysis and job match views. */

export function SectionCard({ title, description, icon: Icon, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs ${className}`}>
      <div className="mb-4 flex items-start gap-2.5">
        {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />}
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

const BADGE_TONES = {
  neutral: 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200',
  match: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/20',
  missing: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
  keyword: 'border border-dashed border-slate-300 bg-white text-slate-600',
}

export function SkillBadges({ items, tone = 'neutral', empty = 'None identified.' }) {
  if (!items?.length) return <p className="text-sm text-slate-500">{empty}</p>
  const Icon = tone === 'match' ? Check : tone === 'missing' ? X : null

  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${BADGE_TONES[tone]}`}>
          {Icon && <Icon className="size-3.5" aria-hidden="true" />}
          {item}
        </li>
      ))}
    </ul>
  )
}

export function PointList({ items, tone = 'positive', empty = 'Nothing to show.' }) {
  if (!items?.length) return <p className="text-sm text-slate-500">{empty}</p>
  const positive = tone === 'positive'

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
          <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {positive ? <Check className="size-3" aria-hidden="true" /> : <CircleAlert className="size-3" aria-hidden="true" />}
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

export function Recommendations({ items }) {
  if (!items?.length) return <p className="text-sm text-slate-500">No recommendations — nice work.</p>

  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-700 text-xs font-semibold text-white tabular-nums">{index + 1}</span>
          <p className="text-sm leading-relaxed text-slate-700">{item}</p>
        </li>
      ))}
    </ol>
  )
}

export function AnalysisSkeleton({ label }) {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <div className="flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-5">
        <div className="size-28 shrink-0 animate-pulse rounded-full bg-slate-200/70" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200/70" />
          <div className="h-3.5 w-full animate-pulse rounded bg-slate-200/70" />
          <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-200/70" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-xl bg-slate-200/50" />
        <div className="h-40 animate-pulse rounded-xl bg-slate-200/50" />
      </div>
      <p className="text-center text-sm text-slate-500">{label}</p>
    </div>
  )
}
