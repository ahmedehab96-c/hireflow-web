import { Search, Users as UsersIcon } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Input, Select } from '../../components/ui/Field'
import { Avatar, PageHeader } from '../../components/ui/Misc'
import { Pagination } from '../../components/ui/Pagination'
import { Table, Td } from '../../components/ui/Table'
import { useAsync } from '../../hooks/useAsync'
import { useDebounce } from '../../hooks/useDebounce'
import { adminUsers } from '../../services/adminService'
import { formatDate } from '../../utils/format'

const ROLES = [
  { value: 'candidate', label: 'Candidates' },
  { value: 'admin', label: 'Admins' },
]

const HEAD = [
  { label: 'User' },
  { label: 'Role' },
  { label: 'Applications', className: 'text-right' },
  { label: 'CVs', className: 'text-right' },
  { label: 'Interviews', className: 'text-right' },
  { label: 'Joined' },
]

function RoleBadge({ role }) {
  return role === 'admin'
    ? <Badge className="bg-slate-900 text-white ring-slate-900">Admin</Badge>
    : <Badge>Candidate</Badge>
}

/** Read-only directory: accounts and activity counts, never CV contents or answers. */
export default function Users() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebounce(search.trim())
  const filterKey = `${debounced}|${role}`
  const [lastKey, setLastKey] = useState(filterKey)
  if (filterKey !== lastKey) {
    setLastKey(filterKey)
    setPage(1)
  }

  const { data, loading, error, reload } = useAsync(
    (signal) => adminUsers.list({ search: debounced, role, page, per_page: 15 }, { signal }),
    [filterKey, page],
  )
  const filtered = Boolean(debounced || role)

  return (
    <>
      <PageHeader title="Users" description="Everyone with a HireFlow account. Read-only — users manage their own data." />

      <Card>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[1fr_200px]">
          <Input icon={Search} placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />
          <Select aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="All roles" options={ROLES} />
        </div>

        {error ? (
          <ErrorState error={error} onRetry={reload} title="Couldn't load users" />
        ) : loading && !data ? (
          <div className="space-y-3 p-5">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-11" />)}</div>
        ) : data.items.length === 0 ? (
          <EmptyState icon={UsersIcon} title={filtered ? 'No users match these filters' : 'No users yet'} description={filtered ? 'Try a different name, email or role.' : undefined} />
        ) : (
          <div className={loading ? 'opacity-60' : ''}>
            <div className="hidden md:block">
              <Table head={HEAD}>
                {data.items.map((u) => (
                  <tr key={u.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} className="size-9 text-xs" />
                        <div className="min-w-0">
                          <p className="max-w-xs truncate font-medium text-slate-900">{u.name}</p>
                          <p className="max-w-xs truncate text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><RoleBadge role={u.role} /></Td>
                    <Td className="text-right text-slate-700 tabular-nums">{u.applications_count}</Td>
                    <Td className="text-right text-slate-700 tabular-nums">{u.cvs_count}</Td>
                    <Td className="text-right text-slate-700 tabular-nums">{u.interviews_count}</Td>
                    <Td className="whitespace-nowrap text-slate-500">{formatDate(u.created_at)}</Td>
                  </tr>
                ))}
              </Table>
            </div>
            <ul className="divide-y divide-slate-100 md:hidden">
              {data.items.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-4 py-3.5">
                  <Avatar name={u.name} className="size-10 text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{u.name}</p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                    <p className="mt-1 text-xs text-slate-500">{u.applications_count} applications · {u.interviews_count} interviews</p>
                  </div>
                  <RoleBadge role={u.role} />
                </li>
              ))}
            </ul>
            <Pagination meta={data.meta} onPageChange={setPage} className="border-t border-slate-100 px-5 py-3" />
          </div>
        )}
      </Card>
    </>
  )
}
