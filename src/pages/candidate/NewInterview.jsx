import { ArrowLeft, Play } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AnalysisSkeleton } from '../../components/ai/Insights'
import { CvPicker, JobPicker } from '../../components/ai/Pickers'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { CompanyLogo, PageHeader } from '../../components/ui/Misc'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { interviewService } from '../../services/interviewService'
import { jobService } from '../../services/jobService'
import { INTERVIEW_TYPES } from '../../utils/constants'

function Step({ number, title, description, children }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">{number}</span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {children}
    </Card>
  )
}

function SelectedJob({ job, onChange }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-brand-600 bg-brand-50/60 p-3 ring-1 ring-brand-600">
      <CompanyLogo company={job.company} className="size-10 text-xs" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{job.title}</p>
        <p className="truncate text-xs text-slate-500">{[job.company?.name, job.location].filter(Boolean).join(' · ')}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onChange}>Change</Button>
    </div>
  )
}

export default function NewInterview() {
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const presetJobId = params.get('job')

  const [job, setJob] = useState(null)
  const [changingJob, setChangingJob] = useState(false)
  const [cvId, setCvId] = useState(undefined)
  const [type, setType] = useState('mixed')
  const [starting, setStarting] = useState(false)

  // A job passed in the URL (e.g. from a job page) is preselected.
  const preset = useAsync(() => (presetJobId ? jobService.get(presetJobId).catch(() => null) : Promise.resolve(null)), [presetJobId])
  const selectedJob = job ?? (changingJob ? null : preset.data)

  const start = async () => {
    setStarting(true)
    let interview
    try {
      interview = await interviewService.create({ job_id: selectedJob?.id ?? null, cv_id: cvId ?? null, type })
    } catch (err) {
      toast.error('Could not create the interview', err.errors ? Object.values(err.errors)[0]?.[0] : err.message)
      setStarting(false)
      return
    }

    try {
      await interviewService.start(interview.id)
    } catch (err) {
      // The interview exists but has no questions yet; the session page offers a retry.
      toast.error('Could not prepare your questions', err.message)
    }
    navigate(`/dashboard/interviews/${interview.id}`, { replace: true })
  }

  if (starting) {
    return (
      <div className="mx-auto max-w-2xl py-6">
        <AnalysisSkeleton label="Preparing your interview questions… this usually takes 20–60 seconds." />
      </div>
    )
  }

  const canStart = Boolean(selectedJob) || Boolean(cvId)

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/dashboard/interviews" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden="true" /> Interview Coach
      </Link>
      <PageHeader title="New interview" description="Set up a mock interview. You'll answer 8 questions one at a time and get feedback after each." />

      <div className="space-y-4">
        <Step number={1} title="Select a job" description="Questions are based on the job's description and required skills.">
          {preset.loading ? <div className="h-16 animate-pulse rounded-lg bg-slate-200/60" /> : selectedJob ? (
            <SelectedJob job={selectedJob} onChange={() => { setJob(null); setChangingJob(true) }} />
          ) : (
            <JobPicker selected={job} onSelect={(j) => { setJob(j); setChangingJob(false) }} />
          )}
        </Step>

        <Step number={2} title="Select a CV" description="Optional. With a CV, some questions are tailored to your experience.">
          <CvPicker selected={cvId} onSelect={setCvId} optional />
        </Step>

        <Step number={3} title="Choose the interview type">
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Interview type">
            {INTERVIEW_TYPES.map((t) => {
              const active = type === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setType(t.value)}
                  className={`rounded-lg border p-4 text-left transition-colors ${active ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">{t.label}</span>
                    {t.value === 'mixed' && <span className="text-[11px] font-medium text-brand-700">Recommended</span>}
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">{t.description}</span>
                  <span className="mt-2 block text-xs text-slate-400">{t.plan}</span>
                </button>
              )
            })}
          </div>
        </Step>

        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">4</span>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Start the interview</h2>
              <p className="mt-0.5 text-sm text-slate-500">{canStart ? 'Take your time — there is no timer.' : 'Select a job or a CV to continue.'}</p>
            </div>
          </div>
          <Button size="lg" icon={Play} onClick={start} disabled={!canStart}>Start interview</Button>
        </Card>
      </div>
    </div>
  )
}
