import { ChevronRight, FileText, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { CompanyLogo, PageHeader } from '../../components/ui/Misc'
import { Pagination } from '../../components/ui/Pagination'
import { Table, Td } from '../../components/ui/Table'
import { useApplicationStats } from '../../hooks/useApplicationStats'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { applicationService } from '../../services/applicationService'
import { APPLICATION_STATUSES, STATUS_MAP } from '../../utils/constants'
import { formatDate, formatDateTime } from '../../utils/format'

const HEAD = [
  { label: 'Job' },
  { label: 'Status' },
  { label: 'Applied' },
  { label: 'Interview' },
  { label: 'Actions', srOnly: true, className: 'w-24' },
]

function StatusFilter({ value, counts, total, onChange }) {
  const tabs = [{ value: '', label: 'All', count: total }, ...APPLICATION_STATUSES.map((s) => ({ value: s.value, label: s.label, count: counts?.[s.value] }))]
  return (
    <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex w-max gap-1.5" role="tablist" aria-label="Filter by status">
        {tabs.map((tab) => {
          const active = value === tab.value
          return (
            <button
              key={tab.value || 'all'}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.value)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors ${
                active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 ring-inset hover:bg-slate-50'
              }`}
            >
              {tab.value && <span className={`size-1.5 rounded-full ${STATUS_MAP[tab.value].dot}`} aria-hidden="true" />}
              {tab.label}
              {tab.count != null && <span className={`text-xs tabular-nums ${active ? 'text-white/70' : 'text-slate-400'}`}>{tab.count}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Applications() {
  const toast = useToast()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const status = params.get('status') ?? ''
  const page = Number(params.get('page')) || 1
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const stats = useApplicationStats()
  const { data, loading, error, reload } = useAsync(
    (signal) => applicationService.list({ status, page, per_page: 10 }, { signal }),
    [status, page],
  )

  const setFilter = (next) => setParams(next ? { status: next } : {}, { replace: true })
  const setPage = (p) => setParams((prev) => { const n = new URLSearchParams(prev); n.set('page', p); return n })

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await applicationService.remove(toDelete.id)
      toast.success('Application removed')
      setToDelete(null)
      // Step back a page if we just removed its last row.
      if (data.items.length === 1 && page > 1) setPage(page - 1)
      else reload()
      stats.reload()
    } catch (err) {
      toast.error('Could not delete application', err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="My applications"
        description="Every job you've saved or applied to, with its current stage."
        actions={<Button to="/jobs" icon={Search}>Find jobs</Button>}
      />

      <StatusFilter value={status} counts={stats.data?.counts} total={stats.data?.total} onChange={setFilter} />

      <Card>
        {error ? (
          <ErrorState error={error} onRetry={reload} title="Couldn't load applications" />
        ) : loading && !data ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={status ? `No ${STATUS_MAP[status]?.label.toLowerCase()} applications` : 'No applications yet'}
            description={status ? 'Applications appear here when they reach this stage.' : 'Browse the job board and save or log the roles you apply to.'}
            action={status ? <Button variant="secondary" onClick={() => setFilter('')}>Show all</Button> : <Button to="/jobs" icon={Search}>Browse jobs</Button>}
          />
        ) : (
          <div className={loading ? 'opacity-60 transition-opacity' : ''}>
            {/* Desktop/tablet: table */}
            <div className="hidden md:block">
              <Table head={HEAD}>
                {data.items.map((a) => (
                  <tr key={a.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/app/applications/${a.id}`)}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <CompanyLogo company={a.job?.company} className="size-9 text-xs" />
                        <div className="min-w-0">
                          <Link to={`/app/applications/${a.id}`} onClick={(e) => e.stopPropagation()} className="block max-w-xs truncate font-medium text-slate-900 hover:text-brand-800">
                            {a.job?.title}
                          </Link>
                          <p className="truncate text-xs text-slate-500">{a.job?.company?.name}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><StatusBadge status={a.status} /></Td>
                    <Td className="whitespace-nowrap text-slate-600">{formatDate(a.applied_at)}</Td>
                    <Td className="whitespace-nowrap text-slate-600">{a.interview_at ? formatDateTime(a.interview_at) : '—'}</Td>
                    <Td className="text-right">
                      <Button
                        variant="danger-ghost"
                        size="icon"
                        icon={Trash2}
                        aria-label={`Delete application for ${a.job?.title}`}
                        onClick={(e) => { e.stopPropagation(); setToDelete(a) }}
                      />
                    </Td>
                  </tr>
                ))}
              </Table>
            </div>

            {/* Mobile: stacked list */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {data.items.map((a) => (
                <li key={a.id}>
                  <Link to={`/app/applications/${a.id}`} className="flex items-center gap-3 px-4 py-4">
                    <CompanyLogo company={a.job?.company} className="size-10 text-xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{a.job?.title}</p>
                      <p className="truncate text-xs text-slate-500">{a.job?.company?.name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={a.status} />
                        {a.applied_at && <span className="text-xs text-slate-400">Applied {formatDate(a.applied_at)}</span>}
                      </div>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-slate-300" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>

            <Pagination meta={data.meta} onPageChange={setPage} className="border-t border-slate-100 px-5 py-3" />
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this application?"
        message={`"${toDelete?.job?.title}" and its notes will be removed from your tracker. This can't be undone.`}
      />
    </>
  )
}
