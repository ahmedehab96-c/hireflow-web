import { ArrowRight, CalendarClock, CircleX, FileText, Gift, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ActivityTimeline } from '../../components/activity/ActivityTimeline'
import { StatusBreakdown } from '../../components/applications/StatusBreakdown'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { CompanyLogo, PageHeader, StatCard } from '../../components/ui/Misc'
import { useApplicationStats } from '../../hooks/useApplicationStats'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../hooks/useAuth'
import { applicationService } from '../../services/applicationService'
import { formatDateTime, timeAgo } from '../../utils/format'

function RecentApplications({ recent }) {
  if (recent.loading) {
    return <div className="space-y-3 p-5">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-12" />)}</div>
  }
  if (recent.error) return <ErrorState error={recent.error} onRetry={recent.reload} />
  if (recent.data.items.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No applications yet"
        description="Save jobs you're interested in or log ones you've applied to."
        action={<Button to="/jobs" icon={Search}>Browse jobs</Button>}
      />
    )
  }

  return (
    <ul className="divide-y divide-slate-100">
      {recent.data.items.map((application) => (
        <li key={application.id}>
          <Link to={`/app/applications/${application.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50">
            <CompanyLogo company={application.job?.company} className="size-9 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{application.job?.title}</p>
              <p className="truncate text-xs text-slate-500">{application.job?.company?.name} · updated {timeAgo(application.updated_at)}</p>
            </div>
            <StatusBadge status={application.status} />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const stats = useApplicationStats()
  const recent = useAsync((signal) => applicationService.list({ per_page: 5 }, { signal }), [])
  const counts = stats.data?.counts ?? {}

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name.split(' ')[0]}`}
        description="Here's where your job search stands today."
        actions={<Button to="/jobs" icon={Search}>Find jobs</Button>}
      />

      {stats.error ? (
        <Card className="mb-6"><ErrorState error={stats.error} onRetry={stats.reload} title="Couldn't load your stats" /></Card>
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard label="Total applications" value={stats.data?.total} icon={FileText} tone="bg-slate-100 text-slate-600" loading={stats.loading} />
          <StatCard label="Interviews" value={(counts.interview ?? 0) + (counts.technical_interview ?? 0)} icon={CalendarClock} tone="bg-amber-50 text-amber-700" loading={stats.loading} />
          <StatCard label="Offers" value={(counts.offer ?? 0) + (counts.hired ?? 0)} icon={Gift} tone="bg-teal-50 text-teal-700" hint={counts.hired ? `${counts.hired} accepted` : undefined} loading={stats.loading} />
          <StatCard label="Rejected" value={counts.rejected} icon={CircleX} tone="bg-rose-50 text-rose-600" loading={stats.loading} />
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Recent applications"
              action={<Link to="/app/applications" className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800">View all <ArrowRight className="size-4" aria-hidden="true" /></Link>}
            />
            <RecentApplications recent={recent} />
          </Card>
          <ActivityTimeline />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Pipeline overview" description="Applications by current status" />
            <div className="p-5">
              {stats.loading ? <Skeleton className="h-56" /> : stats.data?.total ? (
                <StatusBreakdown counts={counts} total={stats.data.total} />
              ) : (
                <p className="py-6 text-center text-sm text-slate-500">Your pipeline will appear here once you track a job.</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Upcoming interviews" />
            {stats.loading ? <div className="p-5"><Skeleton className="h-16" /></div> : stats.data?.upcoming.length ? (
              <ul className="divide-y divide-slate-100">
                {stats.data.upcoming.slice(0, 4).map((a) => (
                  <li key={a.id}>
                    <Link to={`/app/applications/${a.id}`} className="block px-5 py-3.5 hover:bg-slate-50">
                      <p className="truncate text-sm font-medium text-slate-900">{a.job?.title}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarClock className="size-3.5" aria-hidden="true" /> {formatDateTime(a.interview_at)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-center text-sm text-slate-500">No interviews scheduled.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
