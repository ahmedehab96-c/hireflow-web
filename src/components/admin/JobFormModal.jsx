import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from '../../hooks/useForm'
import { useToast } from '../../hooks/useToast'
import { adminJobs } from '../../services/adminService'
import { EMPLOYMENT_TYPES, JOB_STATUSES } from '../../utils/constants'
import { rules } from '../../utils/validation'
import { Button } from '../ui/Button'
import { Input, Select, Textarea } from '../ui/Field'
import { Modal } from '../ui/Modal'

const EMPTY = {
  company_id: '', title: '', description: '', location: '', employment_type: '',
  salary_min: '', salary_max: '', currency: 'AED', status: 'active', application_url: '', skill_ids: [],
}

const schema = {
  company_id: [rules.required('Company')],
  title: [rules.required('Title'), rules.maxLength(255, 'Title')],
  description: [rules.required('Description'), rules.maxLength(20000, 'Description')],
  location: [rules.maxLength(255, 'Location')],
  salary_min: [rules.nonNegativeInt('Minimum salary')],
  salary_max: [
    rules.nonNegativeInt('Maximum salary'),
    (v, values) => (v !== '' && values.salary_min !== '' && Number(v) < Number(values.salary_min) ? 'Must be at least the minimum salary.' : null),
  ],
  currency: [rules.required('Currency'), (v) => (/^[A-Za-z]{3}$/.test(v) ? null : 'Use a 3-letter code, e.g. AED.')],
  status: [rules.required('Status')],
  application_url: [rules.url()],
}

const toValues = (job) =>
  job
    ? {
        company_id: String(job.company_id),
        title: job.title,
        description: job.description,
        location: job.location ?? '',
        employment_type: job.employment_type ?? '',
        salary_min: job.salary_min ?? '',
        salary_max: job.salary_max ?? '',
        currency: job.currency,
        status: job.status,
        application_url: job.application_url ?? '',
        skill_ids: (job.skills ?? []).map((s) => s.id),
      }
    : EMPTY

const toPayload = (v) => ({
  company_id: Number(v.company_id),
  title: v.title.trim(),
  description: v.description.trim(),
  location: v.location.trim() || null,
  employment_type: v.employment_type || null,
  salary_min: v.salary_min === '' ? null : Number(v.salary_min),
  salary_max: v.salary_max === '' ? null : Number(v.salary_max),
  currency: v.currency.trim().toUpperCase(),
  status: v.status,
  application_url: v.application_url.trim() || null,
  skill_ids: v.skill_ids,
})

function SkillPicker({ skills, selected, onChange, error }) {
  const [query, setQuery] = useState('')
  const visible = useMemo(
    () => skills.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase())),
    [skills, query],
  )
  const toggle = (id) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-slate-700">
        Skills <span className="font-normal text-slate-400">({selected.length} selected)</span>
      </legend>
      <div className="rounded-lg border border-slate-300 p-2.5">
        <label className="relative block">
          <span className="sr-only">Filter skills</span>
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter skills"
            className="h-8 w-full rounded-md bg-slate-50 pr-2 pl-8 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600/15"
          />
        </label>
        <div className="mt-2.5 flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
          {visible.map((skill) => {
            const active = selected.includes(skill.id)
            return (
              <button
                key={skill.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(skill.id)}
                className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors ${
                  active ? 'bg-brand-700 text-white ring-brand-700' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {skill.name}
              </button>
            )
          })}
          {visible.length === 0 && <p className="px-1 py-1 text-xs text-slate-400">No skills match.</p>}
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </fieldset>
  )
}

export function JobFormModal({ open, job, companies, skills, onClose, onSaved }) {
  const toast = useToast()
  const form = useForm(EMPTY, schema)
  const editing = Boolean(job)

  useEffect(() => {
    if (open) form.reset(toValues(job))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, job])

  const onSubmit = async (event) => {
    event.preventDefault()
    const { ok, error } = await form.submit((values) =>
      editing ? adminJobs.update(job.id, toPayload(values)) : adminJobs.create(toPayload(values)),
    )
    if (ok) {
      toast.success(editing ? 'Job updated' : 'Job published')
      onSaved()
    } else if (error && error.status !== 422) {
      toast.error('Could not save job', error.message)
    }
  }

  const skillError = Object.entries(form.errors).find(([key, msg]) => key.startsWith('skill_ids') && msg)?.[1]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit job' : 'New job'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={form.submitting}>Cancel</Button>
          <Button type="submit" form="job-form" loading={form.submitting}>{editing ? 'Save changes' : 'Create job'}</Button>
        </>
      }
    >
      <form id="job-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label="Job title" required className="sm:col-span-2" {...form.bind('title')} />
        <Select
          label="Company"
          required
          placeholder="Select a company"
          options={companies.map((c) => ({ value: String(c.id), label: c.name }))}
          {...form.bind('company_id')}
        />
        <Select label="Status" required options={JOB_STATUSES} hint="Only active jobs appear on the public board." {...form.bind('status')} />
        <Input label="Location" placeholder="e.g. Dubai, UAE (Hybrid)" {...form.bind('location')} />
        <Select label="Employment type" placeholder="Not specified" options={EMPLOYMENT_TYPES} {...form.bind('employment_type')} />
        <div className="grid grid-cols-[1fr_1fr_88px] gap-3 sm:col-span-2">
          <Input label="Min salary / mo" type="number" min="0" inputMode="numeric" {...form.bind('salary_min')} />
          <Input label="Max salary / mo" type="number" min="0" inputMode="numeric" {...form.bind('salary_max')} />
          <Input label="Currency" maxLength={3} {...form.bind('currency')} />
        </div>
        <Input label="External application URL" type="url" placeholder="https://" className="sm:col-span-2" {...form.bind('application_url')} />
        <Textarea
          label="Description"
          required
          rows={8}
          hint='Plain text. Lines starting with "- " become bullet points; short lines ending in ":" become headings.'
          className="sm:col-span-2"
          {...form.bind('description')}
        />
        <div className="sm:col-span-2">
          <SkillPicker skills={skills} selected={form.values.skill_ids} onChange={(ids) => form.setField('skill_ids', ids)} error={skillError} />
        </div>
      </form>
    </Modal>
  )
}
