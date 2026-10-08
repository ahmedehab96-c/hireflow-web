import { Link } from 'react-router-dom'
import { timeAgo } from '../../utils/format'
import { CompanyLogo } from '../ui/Misc'
import { JobMeta, SkillChip } from './JobMeta'

const MAX_SKILLS = 4

export function JobCard({ job, onSkillClick, activeSkill }) {
  const skills = job.skills ?? []
  const extra = skills.length - MAX_SKILLS

  return (
    <article className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex gap-4">
        <CompanyLogo company={job.company} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900">
                <Link to={`/jobs/${job.id}`} className="after:absolute after:inset-0 group-hover:text-brand-800">
                  {job.title}
                </Link>
              </h3>
              <p className="mt-0.5 text-sm text-slate-600">{job.company?.name}</p>
            </div>
            <span className="shrink-0 text-xs text-slate-400">{timeAgo(job.created_at)}</span>
          </div>

          <JobMeta job={job} className="mt-3" />

          {skills.length > 0 && (
            // Above the card link overlay so skill chips stay clickable.
            <div className="relative z-10 mt-4 flex flex-wrap gap-1.5">
              {skills.slice(0, MAX_SKILLS).map((skill) => (
                <SkillChip key={skill.id} name={skill.name} onClick={onSkillClick} active={activeSkill === skill.name} />
              ))}
              {extra > 0 && <span className="px-1 py-0.5 text-xs text-slate-400">+{extra} more</span>}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5" aria-hidden="true">
      <div className="flex gap-4">
        <div className="size-11 animate-pulse rounded-lg bg-slate-200/70" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200/70" />
          <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-200/70" />
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-200/70" />
          <div className="flex gap-1.5 pt-2">
            <div className="h-5 w-14 animate-pulse rounded bg-slate-200/70" />
            <div className="h-5 w-16 animate-pulse rounded bg-slate-200/70" />
            <div className="h-5 w-12 animate-pulse rounded bg-slate-200/70" />
          </div>
        </div>
      </div>
    </div>
  )
}
