import { ArrowLeft, ExternalLink, FileQuestion, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { StatusPipeline } from '../../components/applications/StatusPipeline'
import { JobMeta } from '../../components/jobs/JobMeta'
import { JobStatusBadge, StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Input, Select, Textarea } from '../../components/ui/Field'
import { CompanyLogo } from '../../components/ui/Misc'
import { useAsync } from '../../hooks/useAsync'
import { useForm } from '../../hooks/useForm'
import { useToast } from '../../hooks/useToast'
import { applicationService } from '../../services/applicationService'
import { APPLICATION_STATUSES } from '../../utils/constants'
import { formatDateTime, fromDateTimeInput, toDateTimeInput } from '../../utils/format'
import { rules } from '../../utils/validation'

const schema = {
  status: [rules.required('Status')],
  notes: [rules.maxLength(5000, 'Notes')],
}

const toFormValues = (a) => ({
  status: a.status,
  applied_at: toDateTimeInput(a.applied_at),
  interview_at: toDateTimeInput(a.interview_at),
  notes: a.notes ?? '',
})

function ApplicationForm({ application, onSaved }) {
  const toast = useToast()
  const form = useForm(toFormValues(application), schema)
  const initial = toFormValues(application)
  const dirty = Object.keys(initial).some((key) => initial[key] !== form.values[key])

  useEffect(() => {
    form.reset(toFormValues(application))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application])

  const onSubmit = async (event) => {
    event.preventDefault()
    const { ok, result, error } = await form.submit((values) =>
      applicationService.update(application.id, {
        status: values.status,
        applied_at: fromDateTimeInput(values.applied_at),
        interview_at: fromDateTimeInput(values.interview_at),
        notes: values.notes.trim() || null,
      }),
    )
    if (ok) {
      toast.success('Application updated')
      onSaved(result)
    } else if (error) {
      toast.error('Could not save changes', error.status === 422 ? 'Please fix the highlighted fields.' : error.message)
    }
  }

  const showInterview = ['interview', 'technical_interview'].includes(form.values.status) || form.values.interview_at

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <Select label="Status" options={APPLICATION_STATUSES} required className="sm:col-span-2" {...form.bind('status')} />
        <Input
          label="Applied on"
          type="datetime-local"
          hint={form.values.status !== 'saved' && !form.values.applied_at ? 'Filled in automatically when you save.' : undefined}
          {...form.bind('applied_at')}
        />
        {showInterview ? (
          <Input label="Interview date" type="datetime-local" {...form.bind('interview_at')} />
        ) : (
          <div className="hidden sm:block" />
        )}
        <Textarea
          label="Notes"
          rows={6}
          placeholder="Contacts, salary discussions, interview prep…"
          hint={`${form.values.notes.length}/5000`}
          className="sm:col-span-2"
          {...form.bind('notes')}
        />
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
        <Button variant="ghost" disabled={!dirty || form.submitting} onClick={() => form.reset(toFormValues(application))}>Discard</Button>
        <Button type="submit" loading={form.submitting} disabled={!dirty}>Save changes</Button>
      </div>
    </form>
  )
}

export default function ApplicationDetails() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { data: application, loading, error, reload, setData } = useAsync(() => applicationService.get(applicationId), [applicationId])

  const onDelete = async () => {
    setDeleting(true)
    try {
      await applicationService.remove(application.id)
      toast.success('Application removed')
      navigate('/app/applications', { replace: true })
    } catch (err) {
      toast.error('Could not delete application', err.message)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6" aria-hidden="true">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24" />
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]"><Skeleton className="h-96" /><Skeleton className="h-60" /></div>
      </div>
    )
  }

  if (error) {
    return error.status === 404 ? (
      <EmptyState
        icon={FileQuestion}
        title="Application not found"
        description="It may have been deleted, or it belongs to another account."
        action={<Button to="/app/applications">Back to applications</Button>}
      />
    ) : (
      <ErrorState error={error} onRetry={reload} title="Couldn't load this application" />
    )
  }

  const { job } = application
  // Merge so the job/company relations survive updates that return less data.
  const onSaved = (updated) => setData((prev) => ({ ...prev, ...updated, job: { ...prev.job, ...updated.job } }))

  return (
    <>
      <Link to="/app/applications" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden="true" /> My applications
      </Link>

      <Card className="mt-4 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-4">
            <CompanyLogo company={job?.company} className="size-12 text-sm" />
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">{job?.title}</h1>
              <p className="mt-0.5 text-sm text-slate-600">{job?.company?.name}</p>
            </div>
          </div>
          <StatusBadge status={application.status} />
        </div>
        <div className="mt-6"><StatusPipeline status={application.status} /></div>
      </Card>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader title="Track progress" description="Update the stage, dates and your private notes." />
          <ApplicationForm application={application} onSaved={onSaved} />
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Job" action={job && <JobStatusBadge status={job.status} />} />
            <div className="space-y-4 p-5">
              {job && <JobMeta job={job} className="flex-col items-start!" />}
              <div className="flex flex-col gap-2">
                {job?.status === 'active' && <Button variant="secondary" to={`/jobs/${job.id}`}>View job posting</Button>}
                {job?.application_url && (
                  <a href={job.application_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800">
                    Company application page <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Tracked since</dt><dd className="text-slate-900">{formatDateTime(application.created_at)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Last updated</dt><dd className="text-slate-900">{formatDateTime(application.updated_at)}</dd></div>
            </dl>
            <Button variant="danger-ghost" icon={Trash2} className="mt-4 w-full" onClick={() => setConfirming(true)}>Delete application</Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={onDelete}
        loading={deleting}
        title="Delete this application?"
        message="This removes the application and your notes from your tracker. This can't be undone."
      />
    </>
  )
}
