import { Check, Pencil, Plus, Search, Tags, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Input } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/Misc'
import { Pagination } from '../../components/ui/Pagination'
import { useAdminList } from '../../hooks/useAdminList'
import { useDebounce } from '../../hooks/useDebounce'
import { useForm } from '../../hooks/useForm'
import { useToast } from '../../hooks/useToast'
import { adminSkills } from '../../services/adminService'
import { rules } from '../../utils/validation'

const schema = { name: [rules.required('Skill name'), rules.maxLength(100, 'Skill name')] }

function AddSkillForm({ onAdded }) {
  const toast = useToast()
  const form = useForm({ name: '' }, schema)

  const onSubmit = async (event) => {
    event.preventDefault()
    const { ok, result } = await form.submit((values) => adminSkills.create({ name: values.name.trim() }))
    if (ok) {
      toast.success('Skill added', result.name)
      form.reset({ name: '' })
      onAdded()
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex items-start gap-2">
      <Input placeholder="Add a skill, e.g. GraphQL" aria-label="New skill name" className="flex-1" {...form.bind('name')} />
      <Button type="submit" icon={Plus} loading={form.submitting}>Add</Button>
    </form>
  )
}

function SkillRow({ skill, onSaved, onDelete }) {
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const form = useForm({ name: skill.name }, schema)

  const save = async (event) => {
    event.preventDefault()
    const { ok } = await form.submit((values) => adminSkills.update(skill.id, { name: values.name.trim() }))
    if (ok) {
      toast.success('Skill renamed')
      setEditing(false)
      onSaved()
    }
  }

  const cancel = () => {
    form.reset({ name: skill.name })
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="px-4 py-2.5 sm:px-5">
        <form onSubmit={save} noValidate className="flex items-start gap-2" onKeyDown={(e) => e.key === 'Escape' && cancel()}>
          <Input autoFocus aria-label="Skill name" className="flex-1" {...form.bind('name')} />
          <Button type="submit" size="icon" icon={Check} aria-label="Save" loading={form.submitting} />
          <Button variant="ghost" size="icon" icon={X} aria-label="Cancel" onClick={cancel} />
        </form>
      </li>
    )
  }

  return (
    <li className="group flex items-center gap-3 px-4 py-3 sm:px-5">
      <span className="flex-1 truncate text-sm font-medium text-slate-900">{skill.name}</span>
      <span className="text-xs whitespace-nowrap text-slate-500 tabular-nums">{skill.jobs_count} {skill.jobs_count === 1 ? 'job' : 'jobs'}</span>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" icon={Pencil} aria-label={`Rename ${skill.name}`} onClick={() => setEditing(true)} />
        <Button variant="danger-ghost" size="icon" icon={Trash2} aria-label={`Delete ${skill.name}`} onClick={() => onDelete(skill)} />
      </div>
    </li>
  )
}

export default function Skills() {
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search.trim())
  const list = useAdminList(adminSkills, { search: debounced }, { perPage: 25, noun: 'Skill' })

  return (
    <>
      <PageHeader title="Skills" description="Tags used to describe jobs and power skill filters." />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="border-b border-slate-100 p-4">
            <Input icon={Search} placeholder="Search skills" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search skills" className="sm:max-w-xs" />
          </div>
          {list.error ? (
            <ErrorState error={list.error} onRetry={list.reload} />
          ) : list.loading && !list.data ? (
            <div className="space-y-3 p-5">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-9" />)}</div>
          ) : list.data.items.length === 0 ? (
            <EmptyState icon={Tags} title={debounced ? 'No skills match your search' : 'No skills yet'} description={debounced ? undefined : 'Add your first skill using the form.'} />
          ) : (
            <div className={list.loading ? 'opacity-60 transition-opacity' : ''}>
              <ul className="divide-y divide-slate-100">
                {list.data.items.map((skill) => (
                  <SkillRow key={`${skill.id}-${skill.name}`} skill={skill} onSaved={list.reload} onDelete={list.deletion.ask} />
                ))}
              </ul>
              <Pagination meta={list.data.meta} onPageChange={list.setPage} className="border-t border-slate-100 px-5 py-3" />
            </div>
          )}
        </Card>

        <Card className="p-5 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold text-slate-900">New skill</h2>
          <p className="mt-1 mb-4 text-sm text-slate-500">Skill names must be unique.</p>
          <AddSkillForm onAdded={list.reload} />
        </Card>
      </div>

      <ConfirmDialog
        open={list.deletion.open}
        onClose={list.deletion.cancel}
        onConfirm={list.deletion.confirm}
        loading={list.deletion.loading}
        title="Delete skill?"
        message={`"${list.deletion.item?.name}" will be removed from ${list.deletion.item?.jobs_count ?? 0} job(s). This can't be undone.`}
      />
    </>
  )
}
