import { Bookmark, ExternalLink, LogIn, Send, ShieldCheck } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { applicationService } from '../../services/applicationService'
import { formatDate } from '../../utils/format'
import { StatusBadge } from '../ui/Badge'
import { Button, buttonClasses } from '../ui/Button'
import { Skeleton } from '../ui/Feedback'

function ExternalApply({ url }) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: 'secondary', className: 'w-full' })}>
      <ExternalLink className="size-4" aria-hidden="true" /> Apply on company site
    </a>
  )
}

function CandidateActions({ job }) {
  const toast = useToast()
  const [pending, setPending] = useState(null)
  const { data: existing, loading, setData, reload } = useAsync(
    () => applicationService.all().then((items) => items.find((a) => a.job_id === job.id) ?? null),
    [job.id],
  )

  const track = async (status) => {
    setPending(status)
    try {
      const application = await applicationService.create({ job_id: job.id, status })
      setData(application)
      toast.success(status === 'applied' ? 'Marked as applied' : 'Job saved', 'You can track it from My applications.')
    } catch (error) {
      if (error.status === 422 && error.errors?.job_id) {
        toast.info('Already tracking this job', error.errors.job_id[0])
        reload()
      } else {
        toast.error('Could not save this job', error.message)
      }
    } finally {
      setPending(null)
    }
  }

  if (loading) return <Skeleton className="h-24 w-full" />

  if (existing) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-slate-50 p-3.5 ring-1 ring-slate-200 ring-inset">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-slate-600">You're tracking this job</span>
            <StatusBadge status={existing.status} />
          </div>
          {existing.applied_at && <p className="mt-1.5 text-xs text-slate-500">Applied {formatDate(existing.applied_at)}</p>}
        </div>
        <Button to={`/app/applications/${existing.id}`} className="w-full">View application</Button>
        <ExternalApply url={job.application_url} />
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      <Button icon={Send} className="w-full" loading={pending === 'applied'} disabled={Boolean(pending)} onClick={() => track('applied')}>
        I've applied — track it
      </Button>
      <Button variant="secondary" icon={Bookmark} className="w-full" loading={pending === 'saved'} disabled={Boolean(pending)} onClick={() => track('saved')}>
        Save for later
      </Button>
      <ExternalApply url={job.application_url} />
    </div>
  )
}

export function ApplyPanel({ job }) {
  const { user, isCandidate } = useAuth()
  const location = useLocation()

  if (!user) {
    return (
      <div className="space-y-2.5">
        <Button to="/login" state={{ from: location }} icon={LogIn} className="w-full">Sign in to apply</Button>
        <Button to="/register" variant="secondary" className="w-full">Create a free account</Button>
        <p className="pt-1 text-center text-xs text-slate-500">Track applications, interviews and offers in one place.</p>
      </div>
    )
  }

  if (!isCandidate) {
    return (
      <div className="space-y-3">
        <p className="flex items-start gap-2 text-sm text-slate-600">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
          You're signed in as an admin. Applications are available to candidate accounts.
        </p>
        <Button to="/admin/jobs" variant="secondary" className="w-full">Manage jobs</Button>
      </div>
    )
  }

  return <CandidateActions job={job} />
}
