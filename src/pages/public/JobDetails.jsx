import { ArrowLeft, Building2, CalendarDays, ExternalLink, Globe, MapPin, SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { MatchCard } from '../../components/ai/MatchCard'
import { ApplyPanel } from '../../components/jobs/ApplyPanel'
import { JobDescription } from '../../components/jobs/JobDescription'
import { JobMeta, SkillChip } from '../../components/jobs/JobMeta'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { CompanyLogo } from '../../components/ui/Misc'
import { useAsync } from '../../hooks/useAsync'
import { jobService } from '../../services/jobService'
import { employmentLabel } from '../../utils/constants'
import { formatDate, formatSalary, hostname } from '../../utils/format'

function Fact({ label, value }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  )
}

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-hidden="true">
      <Skeleton className="h-4 w-24" />
      <div className="mt-6 flex gap-4"><Skeleton className="size-14" /><div className="flex-1 space-y-3"><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-1/3" /></div></div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]"><Skeleton className="h-96" /><Skeleton className="h-64" /></div>
    </div>
  )
}

export default function JobDetails() {
  const { jobId } = useParams()
  const { data: job, loading, error, reload } = useAsync(() => jobService.get(jobId), [jobId])

  if (loading) return <DetailsSkeleton />

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {error.status === 404 ? (
          <EmptyState
            icon={SearchX}
            title="This job is no longer available"
            description="It may have been filled or closed by the employer."
            action={<Button to="/jobs">Browse open jobs</Button>}
          />
        ) : (
          <ErrorState error={error} onRetry={reload} title="Couldn't load this job" />
        )}
      </div>
    )
  }

  const { company } = job

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden="true" /> All jobs
      </Link>

      <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
        <CompanyLogo company={company} className="size-14 text-base" />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{job.title}</h1>
          <p className="mt-1 text-slate-600">{company?.name}</p>
          <JobMeta job={job} className="mt-3" />
        </div>
      </header>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-7">
            <h2 className="mb-4 text-base font-semibold text-slate-900">About the role</h2>
            <JobDescription text={job.description} />
          </Card>

          {job.skills?.length > 0 && (
            <Card className="p-5 sm:p-7">
              <h2 className="mb-3 text-base font-semibold text-slate-900">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => <SkillChip key={skill.id} name={skill.name} />)}
              </div>
            </Card>
          )}

          {company && (
            <Card className="p-5 sm:p-7">
              <h2 className="mb-4 text-base font-semibold text-slate-900">About {company.name}</h2>
              {company.description && <p className="text-[15px] leading-relaxed text-slate-700">{company.description}</p>}
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                {company.industry && <li className="flex items-center gap-1.5"><Building2 className="size-4 text-slate-400" aria-hidden="true" />{company.industry}</li>}
                {company.location && <li className="flex items-center gap-1.5"><MapPin className="size-4 text-slate-400" aria-hidden="true" />{company.location}</li>}
                {company.website && (
                  <li>
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-medium text-brand-700 hover:text-brand-800">
                      <Globe className="size-4" aria-hidden="true" />{hostname(company.website)}<ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </li>
                )}
              </ul>
            </Card>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="p-5">
            <dl className="mb-5 divide-y divide-slate-100">
              <Fact label="Salary" value={formatSalary(job.salary_min, job.salary_max, job.currency) && `${formatSalary(job.salary_min, job.salary_max, job.currency)} / mo`} />
              <Fact label="Employment" value={employmentLabel(job.employment_type)} />
              <Fact label="Location" value={job.location} />
              <div className="flex justify-between gap-4 py-2.5 text-sm">
                <dt className="flex items-center gap-1.5 text-slate-500"><CalendarDays className="size-4 text-slate-400" aria-hidden="true" />Posted</dt>
                <dd className="font-medium text-slate-900">{formatDate(job.created_at)}</dd>
              </div>
            </dl>
            <ApplyPanel job={job} />
          </Card>
          <MatchCard job={job} />
        </aside>
      </div>
    </div>
  )
}
