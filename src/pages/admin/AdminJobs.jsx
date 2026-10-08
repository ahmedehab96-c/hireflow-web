import { BriefcaseBusiness, ExternalLink, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { JobFormModal } from '../../components/admin/JobFormModal'
import { JobStatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Input, Select } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/Misc'
import { Pagination } from '../../components/ui/Pagination'
import { Table, Td } from '../../components/ui/Table'
import { useAdminList } from '../../hooks/useAdminList'
import { useAsync } from '../../hooks/useAsync'
import { useDebounce } from '../../hooks/useDebounce'
import { useToast } from '../../hooks/useToast'
import { adminCompanies, adminJobs, adminSkills } from '../../services/adminService'
import { JOB_STATUSES, employmentLabel } from '../../utils/constants'
import { formatSalary, timeAgo } from '../../utils/format'

const HEAD = [
  { label: 'Job' },
  { label: 'Status' },
  { label: 'Type' },
  { label: 'Salary / mo' },
  { label: 'Applications', className: 'text-right' },
  { label: 'Updated' },
  { label: 'Actions', srOnly: true },
]

export default function AdminJobs() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [companyId, setCompanyId] = useState('')
  const debounced = useDebounce(search.trim())
  const list = useAdminList(adminJobs, { search: debounced, status, company_id: companyId }, { noun: 'Job' })
  const [editor, setEditor] = useState({ open: false, job: null })

  // Reference data for filters and the job form.
  const refs = useAsync(() => Promise.all([adminCompanies.all(), adminSkills.all({ per_page: 100 })]), [])
  const [companies, skills] = refs.data ?? [[], []]

  useEffect(() => {
    if (refs.error) toast.error('Could not load companies and skills', refs.error.message)
  }, [refs.error, toast])

  const openEditor = (job = null) => setEditor({ open: true, job })
  const closeEditor = () => setEditor((e) => ({ ...e, open: false }))

  // Support deep links like /admin/jobs?new=1 from the overview page.
  useEffect(() => {
    if (params.get('new') && refs.data) {
      openEditor()
      setParams({}, { replace: true })
    }
  }, [params, refs.data, setParams])

  const hasFilters = Boolean(debounced || status || companyId)

  const actions = (job) => (
    <div className="flex justify-end gap-1">
      {job.status === 'active' && (
        <Link to={`/jobs/${job.id}`} target="_blank" className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label={`View ${job.title} on the job board`}>
          <ExternalLink className="size-4" />
        </Link>
      )}
      <Button variant="ghost" size="icon" icon={Pencil} aria-label={`Edit ${job.title}`} onClick={() => openEditor(job)} disabled={!refs.data} />
      <Button variant="danger-ghost" size="icon" icon={Trash2} aria-label={`Delete ${job.title}`} onClick={() => list.deletion.ask(job)} />
    </div>
  )

  return (
    <>
      <PageHeader
        title="Jobs"
        description="All postings, including drafts and closed roles."
        actions={<Button icon={Plus} onClick={() => openEditor()} disabled={!refs.data} loading={refs.loading}>New job</Button>}
      />

      <Card>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[1fr_160px_200px]">
          <Input icon={Search} placeholder="Search title or description" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search jobs" />
          <Select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="All statuses" options={JOB_STATUSES} />
          <Select
            aria-label="Filter by company"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            placeholder="All companies"
            options={companies.map((c) => ({ value: String(c.id), label: c.name }))}
          />
        </div>

        {list.error ? (
          <ErrorState error={list.error} onRetry={list.reload} />
        ) : list.loading && !list.data ? (
          <div className="space-y-3 p-5">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-11" />)}</div>
        ) : list.data.items.length === 0 ? (
          <EmptyState
            icon={BriefcaseBusiness}
            title={hasFilters ? 'No jobs match these filters' : 'No jobs yet'}
            description={hasFilters ? 'Try clearing a filter.' : 'Publish your first job to populate the board.'}
            action={!hasFilters && <Button icon={Plus} onClick={() => openEditor()} disabled={!refs.data}>New job</Button>}
          />
        ) : (
          <div className={list.loading ? 'opacity-60 transition-opacity' : ''}>
            <div className="hidden lg:block">
              <Table head={HEAD}>
                {list.data.items.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/60">
                    <Td>
                      <p className="max-w-[260px] truncate font-medium text-slate-900">{job.title}</p>
                      <p className="max-w-[260px] truncate text-xs text-slate-500">{job.company?.name}{job.location ? ` · ${job.location}` : ''}</p>
                    </Td>
                    <Td><JobStatusBadge status={job.status} /></Td>
                    <Td className="whitespace-nowrap text-slate-600">{employmentLabel(job.employment_type) ?? '—'}</Td>
                    <Td className="whitespace-nowrap text-slate-600">{formatSalary(job.salary_min, job.salary_max, job.currency) ?? '—'}</Td>
                    <Td className="text-right text-slate-700 tabular-nums">{job.applications_count}</Td>
                    <Td className="whitespace-nowrap text-slate-500">{timeAgo(job.updated_at)}</Td>
                    <Td>{actions(job)}</Td>
                  </tr>
                ))}
              </Table>
            </div>
            <ul className="divide-y divide-slate-100 lg:hidden">
              {list.data.items.map((job) => (
                <li key={job.id} className="flex items-start gap-3 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{job.title}</p>
                    <p className="truncate text-xs text-slate-500">{job.company?.name}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <JobStatusBadge status={job.status} />
                      <span>{job.applications_count} applications</span>
                    </div>
                  </div>
                  {actions(job)}
                </li>
              ))}
            </ul>
            <Pagination meta={list.data.meta} onPageChange={list.setPage} className="border-t border-slate-100 px-5 py-3" />
          </div>
        )}
      </Card>

      <JobFormModal
        open={editor.open}
        job={editor.job}
        companies={companies}
        skills={skills}
        onClose={closeEditor}
        onSaved={() => { closeEditor(); list.reload() }}
      />

      <ConfirmDialog
        open={list.deletion.open}
        onClose={list.deletion.cancel}
        onConfirm={list.deletion.confirm}
        loading={list.deletion.loading}
        title="Delete job?"
        message={
          list.deletion.item?.applications_count
            ? `"${list.deletion.item.title}" has candidate applications, so it can't be deleted. Set its status to Closed instead.`
            : `"${list.deletion.item?.title}" will be permanently removed.`
        }
      />
    </>
  )
}
