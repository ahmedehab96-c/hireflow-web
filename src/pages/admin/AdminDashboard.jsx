import {
  ArrowRight, BriefcaseBusiness, Building2, CircleCheck, FileText, Gift, MessagesSquare, Plus, Trophy, UserRound, Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBreakdown } from '../../components/applications/StatusBreakdown'
import { JobStatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { PageHeader, StatCard } from '../../components/ui/Misc'
import { Table, Td } from '../../components/ui/Table'
import { useAsync } from '../../hooks/useAsync'
import { adminJobs, adminStats } from '../../services/adminService'
import { JOB_STATUSES } from '../../utils/constants'
import { timeAgo } from '../../utils/format'

const STATUS_BAR = { active: 'bg-emerald-500', draft: 'bg-slate-400', closed: 'bg-rose-400' }
const monthLabel = (ym) => new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(new Date(`${ym}-01T00:00:00`))

/** Grouped monthly bars (applications vs new candidates), built with plain CSS. */
function TrendChart({ trend }) {
  const max = Math.max(1, ...trend.flatMap((m) => [m.applications, m.users]))
  const summary = trend.map((m) => `${monthLabel(m.month)}: ${m.applications} applications, ${m.users} new candidates`).join('; ')

  return (
    <div>
      <div className="flex h-44 items-end gap-2 sm:gap-4" role="img" aria-label={summary}>
        {trend.map((m) => (
          <div key={m.month} className="flex h-full flex-1 flex-col justify-end">
            <div className="flex flex-1 items-end justify-center gap-1">
              <div className="w-full max-w-5 rounded-t bg-brand-600" style={{ height: `${(m.applications / max) * 100}%`, minHeight: m.applications ? 4 : 0 }} title={`${m.applications} applications`} />
              <div className="w-full max-w-5 rounded-t bg-slate-300" style={{ height: `${(m.users / max) * 100}%`, minHeight: m.users ? 4 : 0 }} title={`${m.users} new candidates`} />
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">{monthLabel(m.month)}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-brand-600" aria-hidden="true" /> Applications</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-slate-300" aria-hidden="true" /> New candidates</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const stats = useAsync((signal) => adminStats.get({ signal }), [])
  const recent = useAsync((signal) => adminJobs.list({ per_page: 6 }, { signal }), [])
  const s = stats.data

  if (stats.error) return <Card><ErrorState error={stats.error} onRetry={stats.reload} title="Couldn't load the overview" /></Card>

  const cards = [
    { label: 'Total users', value: s?.users.total, icon: Users, hint: s && `${s.users.new_this_month} new this month` },
    { label: 'Candidates', value: s?.users.candidates, icon: UserRound },
    { label: 'Companies', value: s?.companies, icon: Building2 },
    { label: 'Total jobs', value: s?.jobs.total, icon: BriefcaseBusiness },
    { label: 'Active jobs', value: s?.jobs.active, icon: CircleCheck, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Applications', value: s?.applications.total, icon: FileText, tone: 'bg-sky-50 text-sky-700' },
    { label: 'Interviews', value: s?.interviews.total, icon: MessagesSquare, tone: 'bg-violet-50 text-violet-700', hint: s && `${s.interviews.completed} completed${s.interviews.average_score != null ? ` · avg ${s.interviews.average_score}/100` : ''}` },
    { label: 'Offers', value: s?.offers, icon: Gift, tone: 'bg-teal-50 text-teal-700' },
    { label: 'Hired', value: s?.hired, icon: Trophy, tone: 'bg-amber-50 text-amber-700' },
  ]

  return (
    <>
      <PageHeader
        title="Overview"
        description="Platform activity across candidates, jobs and the hiring pipeline."
        actions={<Button to="/admin/jobs?new=1" icon={Plus}>New job</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {cards.map((c) => <StatCard key={c.label} {...c} loading={stats.loading} />)}
      </div>

      <div className="mb-6 grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Applications by status" description={s ? `${s.applications.total} applications tracked by candidates` : undefined} />
          <div className="p-5">
            {stats.loading ? <Skeleton className="h-56" /> : s.applications.total ? (
              <StatusBreakdown counts={s.applications.by_status} total={s.applications.total} />
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">No applications yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Last 6 months" description="New applications and candidate sign-ups per month" />
          <div className="p-5">{stats.loading ? <Skeleton className="h-52" /> : <TrendChart trend={s.trend} />}</div>
        </Card>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader
            title="Recently added jobs"
            action={<Link to="/admin/jobs" className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800">Manage <ArrowRight className="size-4" aria-hidden="true" /></Link>}
          />
          {recent.error ? (
            <ErrorState error={recent.error} onRetry={recent.reload} className="py-8" />
          ) : recent.loading ? (
            <div className="space-y-3 p-5">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : recent.data.items.length === 0 ? (
            <EmptyState icon={BriefcaseBusiness} title="No jobs yet" action={<Button to="/admin/jobs?new=1" icon={Plus}>Create the first job</Button>} />
          ) : (
            <Table head={[{ label: 'Job' }, { label: 'Status' }, { label: 'Applications', className: 'text-right' }, { label: 'Added' }]}>
              {recent.data.items.map((job) => (
                <tr key={job.id}>
                  <Td>
                    <p className="max-w-xs truncate font-medium text-slate-900">{job.title}</p>
                    <p className="truncate text-xs text-slate-500">{job.company?.name}</p>
                  </Td>
                  <Td><JobStatusBadge status={job.status} /></Td>
                  <Td className="text-right text-slate-700 tabular-nums">{job.applications_count}</Td>
                  <Td className="whitespace-nowrap text-slate-500">{timeAgo(job.created_at)}</Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Jobs by status" />
            <div className="space-y-4 p-5">
              {stats.loading ? <Skeleton className="h-28" /> : JOB_STATUSES.map((js) => {
                const count = s.jobs[js.value] ?? 0
                const pct = s.jobs.total ? Math.round((count / s.jobs.total) * 100) : 0
                return (
                  <div key={js.value}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-slate-600">{js.label}</span>
                      <span className="font-medium text-slate-900 tabular-nums">{count} <span className="font-normal text-slate-400">· {pct}%</span></span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${STATUS_BAR[js.value]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">AI usage</p>
            {stats.loading ? <Skeleton className="mt-3 h-12" /> : (
              <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-slate-500">CVs uploaded</dt><dd className="mt-0.5 text-xl font-semibold text-slate-900 tabular-nums">{s.cvs.total}</dd></div>
                <div><dt className="text-slate-500">CVs analyzed</dt><dd className="mt-0.5 text-xl font-semibold text-slate-900 tabular-nums">{s.cvs.analyzed}</dd></div>
              </dl>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
