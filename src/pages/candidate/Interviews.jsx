import { ArrowRight, MessagesSquare, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { InterviewStatusBadge, TypeBadge } from '../../components/interview/Badges'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { PageHeader, StatCard } from '../../components/ui/Misc'
import { Pagination } from '../../components/ui/Pagination'
import { Table, Td } from '../../components/ui/Table'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { interviewService } from '../../services/interviewService'
import { scoreBand } from '../../utils/constants'
import { formatDate } from '../../utils/format'

const HEAD = [
  { label: 'Job' },
  { label: 'Type' },
  { label: 'Status' },
  { label: 'Score' },
  { label: 'Date' },
  { label: 'Actions', srOnly: true },
]

const titleOf = (i) => i.job?.title ?? 'General interview'
const subtitleOf = (i) => i.job?.company ?? (i.cv ? `Based on ${i.cv.original_filename}` : '—')

function Score({ interview }) {
  if (interview.status === 'completed') {
    const band = scoreBand(interview.total_score ?? 0, 'interview')
    return <span className={`font-semibold tabular-nums ${band.text}`}>{interview.total_score}<span className="font-normal text-slate-400">/100</span></span>
  }
  if (interview.status === 'in_progress') {
    return <span className="text-slate-500 tabular-nums">{interview.progress.answered}/{interview.progress.total} answered</span>
  }
  return <span className="text-slate-400">—</span>
}

const actionLabel = { pending: 'Start', in_progress: 'Continue', completed: 'View results' }

export default function Interviews() {
  const toast = useToast()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const list = useAsync((signal) => interviewService.list({ page, per_page: 10 }, { signal }), [page])
  const stats = useAsync(async (signal) => {
    const completed = await interviewService.list({ status: 'completed', per_page: 50 }, { signal })
    const scores = completed.items.map((i) => i.total_score ?? 0)
    return {
      completed: completed.meta.total,
      average: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      best: scores.length ? Math.max(...scores) : null,
    }
  }, [])

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await interviewService.remove(toDelete.id)
      toast.success('Interview deleted')
      setToDelete(null)
      if (list.data?.items.length === 1 && page > 1) setPage(page - 1)
      else list.reload()
      stats.reload()
    } catch (err) {
      toast.error('Could not delete interview', err.message)
    } finally {
      setDeleting(false)
    }
  }

  const open = (i) => navigate(`/dashboard/interviews/${i.id}`)

  return (
    <>
      <PageHeader
        title="Interview Coach"
        description="Practise interviews for real roles and get feedback on every answer."
        actions={<Button to="/dashboard/interviews/new" icon={Plus}>New interview</Button>}
      />

      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Completed" value={stats.data?.completed ?? 0} loading={stats.loading} />
        <StatCard label="Average score" value={stats.data?.average != null ? `${stats.data.average}` : '—'} hint="Recent completed" loading={stats.loading} />
        <StatCard label="Best score" value={stats.data?.best ?? '—'} loading={stats.loading} />
      </div>

      <Card>
        {list.error ? (
          <ErrorState error={list.error} onRetry={list.reload} title="Couldn't load your interviews" />
        ) : list.loading && !list.data ? (
          <div className="space-y-3 p-5">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : list.data.items.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title="No interviews yet"
            description="Pick a job, choose a CV and an interview type, then answer questions one at a time with instant feedback."
            action={<Button to="/dashboard/interviews/new" icon={Plus}>Start your first interview</Button>}
          />
        ) : (
          <div className={list.loading ? 'opacity-60' : ''}>
            <div className="hidden md:block">
              <Table head={HEAD}>
                {list.data.items.map((i) => (
                  <tr key={i.id} className="cursor-pointer hover:bg-slate-50" onClick={() => open(i)}>
                    <Td>
                      <Link to={`/dashboard/interviews/${i.id}`} onClick={(e) => e.stopPropagation()} className="block max-w-xs truncate font-medium text-slate-900 hover:text-brand-800">{titleOf(i)}</Link>
                      <p className="max-w-xs truncate text-xs text-slate-500">{subtitleOf(i)}</p>
                    </Td>
                    <Td><TypeBadge type={i.type} /></Td>
                    <Td><InterviewStatusBadge status={i.status} /></Td>
                    <Td className="whitespace-nowrap"><Score interview={i} /></Td>
                    <Td className="whitespace-nowrap text-slate-600">{formatDate(i.completed_at ?? i.created_at)}</Td>
                    <Td className="text-right whitespace-nowrap">
                      <span className="mr-2 text-sm font-medium text-brand-700">{actionLabel[i.status]}</span>
                      <Button
                        variant="danger-ghost"
                        size="icon"
                        icon={Trash2}
                        aria-label={`Delete interview for ${titleOf(i)}`}
                        onClick={(e) => { e.stopPropagation(); setToDelete(i) }}
                      />
                    </Td>
                  </tr>
                ))}
              </Table>
            </div>
            <ul className="divide-y divide-slate-100 md:hidden">
              {list.data.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 px-4 py-4">
                  <Link to={`/dashboard/interviews/${i.id}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{titleOf(i)}</p>
                    <p className="truncate text-xs text-slate-500">{subtitleOf(i)} · {formatDate(i.created_at)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <TypeBadge type={i.type} />
                      <InterviewStatusBadge status={i.status} />
                      <Score interview={i} />
                    </div>
                  </Link>
                  <ArrowRight className="size-4 shrink-0 text-slate-300" aria-hidden="true" />
                </li>
              ))}
            </ul>
            <Pagination meta={list.data.meta} onPageChange={setPage} className="border-t border-slate-100 px-5 py-3" />
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this interview?"
        message="Its questions, your answers and the feedback will be permanently deleted."
      />
    </>
  )
}
