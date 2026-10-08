import { Building2, Globe, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { CompanyFormModal } from '../../components/admin/CompanyFormModal'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Input } from '../../components/ui/Field'
import { CompanyLogo, PageHeader } from '../../components/ui/Misc'
import { Pagination } from '../../components/ui/Pagination'
import { Table, Td } from '../../components/ui/Table'
import { useAdminList } from '../../hooks/useAdminList'
import { useDebounce } from '../../hooks/useDebounce'
import { adminCompanies } from '../../services/adminService'
import { hostname } from '../../utils/format'

const HEAD = [
  { label: 'Company' },
  { label: 'Industry' },
  { label: 'Location' },
  { label: 'Jobs', className: 'text-right' },
  { label: 'Actions', srOnly: true },
]

export default function Companies() {
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search.trim())
  const list = useAdminList(adminCompanies, { search: debounced }, { noun: 'Company' })
  const [editor, setEditor] = useState({ open: false, company: null })

  const openEditor = (company = null) => setEditor({ open: true, company })
  const closeEditor = () => setEditor((e) => ({ ...e, open: false }))

  const actions = (company) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" icon={Pencil} aria-label={`Edit ${company.name}`} onClick={() => openEditor(company)} />
      <Button variant="danger-ghost" size="icon" icon={Trash2} aria-label={`Delete ${company.name}`} onClick={() => list.deletion.ask(company)} />
    </div>
  )

  return (
    <>
      <PageHeader title="Companies" description="Employers that can publish jobs." actions={<Button icon={Plus} onClick={() => openEditor()}>New company</Button>} />

      <Card>
        <div className="border-b border-slate-100 p-4">
          <Input icon={Search} placeholder="Search companies" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search companies" className="sm:max-w-xs" />
        </div>

        {list.error ? (
          <ErrorState error={list.error} onRetry={list.reload} />
        ) : list.loading && !list.data ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-11" />)}</div>
        ) : list.data.items.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={debounced ? 'No companies match your search' : 'No companies yet'}
            description={debounced ? 'Try a different name.' : 'Add a company before publishing jobs.'}
            action={!debounced && <Button icon={Plus} onClick={() => openEditor()}>Add company</Button>}
          />
        ) : (
          <div className={list.loading ? 'opacity-60 transition-opacity' : ''}>
            <div className="hidden md:block">
              <Table head={HEAD}>
                {list.data.items.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <Td>
                      <div className="flex items-center gap-3">
                        <CompanyLogo company={c} className="size-9 text-xs" />
                        <div className="min-w-0">
                          <p className="max-w-xs truncate font-medium text-slate-900">{c.name}</p>
                          {c.website && (
                            <a href={c.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-500 hover:text-brand-700">
                              <Globe className="size-3" aria-hidden="true" />{hostname(c.website)}
                            </a>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td className="text-slate-600">{c.industry || '—'}</Td>
                    <Td className="max-w-56 truncate text-slate-600">{c.location || '—'}</Td>
                    <Td className="text-right text-slate-700 tabular-nums">{c.jobs_count}</Td>
                    <Td>{actions(c)}</Td>
                  </tr>
                ))}
              </Table>
            </div>
            <ul className="divide-y divide-slate-100 md:hidden">
              {list.data.items.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-3.5">
                  <CompanyLogo company={c} className="size-10 text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{c.name}</p>
                    <p className="truncate text-xs text-slate-500">{[c.industry, `${c.jobs_count} jobs`].filter(Boolean).join(' · ')}</p>
                  </div>
                  {actions(c)}
                </li>
              ))}
            </ul>
            <Pagination meta={list.data.meta} onPageChange={list.setPage} className="border-t border-slate-100 px-5 py-3" />
          </div>
        )}
      </Card>

      <CompanyFormModal open={editor.open} company={editor.company} onClose={closeEditor} onSaved={() => { closeEditor(); list.reload() }} />

      <ConfirmDialog
        open={list.deletion.open}
        onClose={list.deletion.cancel}
        onConfirm={list.deletion.confirm}
        loading={list.deletion.loading}
        title="Delete company?"
        message={`"${list.deletion.item?.name}" will be permanently removed. Companies with jobs can't be deleted — remove or reassign their jobs first.`}
      />
    </>
  )
}
