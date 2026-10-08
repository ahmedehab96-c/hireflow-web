import { useEffect } from 'react'
import { useForm } from '../../hooks/useForm'
import { useToast } from '../../hooks/useToast'
import { adminCompanies } from '../../services/adminService'
import { rules } from '../../utils/validation'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Field'
import { Modal } from '../ui/Modal'

const EMPTY = { name: '', website: '', logo: '', industry: '', location: '', description: '' }

const schema = {
  name: [rules.required('Company name'), rules.maxLength(255, 'Company name')],
  website: [rules.url()],
  logo: [rules.url()],
  industry: [rules.maxLength(100, 'Industry')],
  location: [rules.maxLength(255, 'Location')],
  description: [rules.maxLength(5000, 'Description')],
}

const toValues = (company) => (company ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, company[k] ?? ''])) : EMPTY)
const toPayload = (values) => Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim() || null]))

export function CompanyFormModal({ open, company, onClose, onSaved }) {
  const toast = useToast()
  const form = useForm(EMPTY, schema)
  const editing = Boolean(company)

  useEffect(() => {
    if (open) form.reset(toValues(company))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, company])

  const onSubmit = async (event) => {
    event.preventDefault()
    const { ok, error } = await form.submit((values) =>
      editing ? adminCompanies.update(company.id, toPayload(values)) : adminCompanies.create(toPayload(values)),
    )
    if (ok) {
      toast.success(editing ? 'Company updated' : 'Company created')
      onSaved()
    } else if (error && error.status !== 422) {
      toast.error('Could not save company', error.message)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit company' : 'New company'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={form.submitting}>Cancel</Button>
          <Button type="submit" form="company-form" loading={form.submitting}>{editing ? 'Save changes' : 'Create company'}</Button>
        </>
      }
    >
      <form id="company-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label="Company name" required className="sm:col-span-2" {...form.bind('name')} />
        <Input label="Industry" placeholder="e.g. Fintech" {...form.bind('industry')} />
        <Input label="Location" placeholder="e.g. Dubai, UAE" {...form.bind('location')} />
        <Input label="Website" type="url" placeholder="https://" {...form.bind('website')} />
        <Input label="Logo URL" type="url" placeholder="https://" hint="Optional. Square images work best." {...form.bind('logo')} />
        <Textarea label="Description" rows={4} className="sm:col-span-2" {...form.bind('description')} />
      </form>
    </Modal>
  )
}
