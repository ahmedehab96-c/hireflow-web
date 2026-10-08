import { Bookmark, FileUp, GitCompareArrows, History, MessagesSquare, RefreshCw, ScanText, Send, Trophy } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync'
import { activityService, subjectPath } from '../../services/notificationService'
import { formatDateTime, timeAgo } from '../../utils/format'
import { Card, CardHeader } from '../ui/Card'
import { ErrorState, Skeleton } from '../ui/Feedback'

const ICONS = {
  application_created: { icon: Send, tone: 'bg-sky-50 text-sky-700' },
  application_status_changed: { icon: RefreshCw, tone: 'bg-amber-50 text-amber-700' },
  cv_uploaded: { icon: FileUp, tone: 'bg-slate-100 text-slate-600' },
  cv_analyzed: { icon: ScanText, tone: 'bg-brand-50 text-brand-700' },
  job_match_completed: { icon: GitCompareArrows, tone: 'bg-teal-50 text-teal-700' },
  interview_started: { icon: MessagesSquare, tone: 'bg-violet-50 text-violet-700' },
  interview_completed: { icon: Trophy, tone: 'bg-emerald-50 text-emerald-700' },
}

function detail(item) {
  const score = item.properties?.score
  if (score == null) return null
  if (item.type === 'cv_analyzed') return `CV score ${score}/100`
  if (item.type === 'job_match_completed') return `Match score ${score}/100`
  if (item.type === 'interview_completed') return `Interview score ${score}/100`
  return null
}

/** The candidate's recent actions, newest first, with "show more" paging. */
export function ActivityTimeline() {
  const [perPage, setPerPage] = useState(8)
  const { data, loading, error, reload } = useAsync((signal) => activityService.list({ per_page: perPage }, { signal }), [perPage])

  return (
    <Card>
      <CardHeader title="Recent activity" description="What you've done on HireFlow" />
      {error ? (
        <ErrorState error={error} onRetry={reload} className="py-8" />
      ) : loading && !data ? (
        <div className="space-y-4 p-5">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-10" />)}</div>
      ) : data.items.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <History className="size-6 text-slate-300" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-slate-700">No activity yet</p>
          <p className="mt-0.5 text-sm text-slate-500">Track a job, analyze your CV or practise an interview to get started.</p>
        </div>
      ) : (
        <>
          <ol className="px-5 py-4">
            {data.items.map((item, index) => {
              const meta = ICONS[item.type] ?? { icon: Bookmark, tone: 'bg-slate-100 text-slate-600' }
              const Icon = meta.icon
              const path = subjectPath(item.subject)
              const extra = detail(item)
              return (
                <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {index < data.items.length - 1 && <span className="absolute top-9 bottom-1 left-[15px] w-px bg-slate-200" aria-hidden="true" />}
                  <span className={`relative flex size-8 shrink-0 items-center justify-center rounded-full ${meta.tone}`}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    {path ? (
                      <Link to={path} className="text-sm font-medium text-slate-900 hover:text-brand-800">{item.description}</Link>
                    ) : (
                      <p className="text-sm font-medium text-slate-900">{item.description}</p>
                    )}
                    <p className="mt-0.5 text-xs text-slate-500">
                      <time dateTime={item.created_at} title={formatDateTime(item.created_at)}>{timeAgo(item.created_at)}</time>
                      {extra && ` · ${extra}`}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
          {data.meta.total > data.items.length && (
            <div className="border-t border-slate-100 px-5 py-3 text-center">
              <button type="button" onClick={() => setPerPage((n) => Math.min(n + 8, 50))} disabled={loading} className="text-sm font-medium text-brand-700 hover:text-brand-800 disabled:opacity-50">
                {loading ? 'Loading…' : 'Show more'}
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
