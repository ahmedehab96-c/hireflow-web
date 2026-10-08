import { BriefcaseBusiness, MapPin, Wallet } from 'lucide-react'
import { employmentLabel } from '../../utils/constants'
import { formatSalary } from '../../utils/format'

/** Location · type · salary row, shared by cards and detail pages. */
export function JobMeta({ job, className = '' }) {
  const salary = formatSalary(job.salary_min, job.salary_max, job.currency)
  const type = employmentLabel(job.employment_type)
  const items = [
    job.location && { icon: MapPin, text: job.location },
    type && { icon: BriefcaseBusiness, text: type },
    salary && { icon: Wallet, text: `${salary} / mo` },
  ].filter(Boolean)

  return (
    <ul className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500 ${className}`}>
      {items.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-1.5">
          <Icon className="size-4 text-slate-400" aria-hidden="true" />
          {text}
        </li>
      ))}
    </ul>
  )
}

export function SkillChip({ name, onClick, active = false }) {
  const classes = `inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors ${
    active ? 'bg-brand-700 text-white ring-brand-700' : 'bg-slate-50 text-slate-600 ring-slate-200'
  }`

  if (!onClick) return <span className={classes}>{name}</span>

  return (
    <button type="button" onClick={() => onClick(name)} className={`${classes} ${active ? '' : 'hover:bg-brand-50 hover:text-brand-800 hover:ring-brand-200'}`}>
      {name}
    </button>
  )
}
