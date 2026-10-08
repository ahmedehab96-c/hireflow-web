import { ArrowLeft, FileQuestion, Play } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnalysisSkeleton } from '../../components/ai/Insights'
import { InterviewStatusBadge, TypeBadge } from '../../components/interview/Badges'
import { InterviewResults } from '../../components/interview/InterviewResults'
import { InterviewRunner } from '../../components/interview/InterviewRunner'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { interviewService } from '../../services/interviewService'
import { INTERVIEW_TYPES } from '../../utils/constants'

function Header({ interview }) {
  return (
    <div className="mb-6">
      <Link to="/dashboard/interviews" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden="true" /> Interview Coach
      </Link>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{interview.job?.title ?? 'General interview'}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {[interview.job?.company, interview.cv && `CV: ${interview.cv.original_filename}`].filter(Boolean).join(' · ') || 'Practice interview'}
          </p>
        </div>
        <div className="flex gap-2">
          <TypeBadge type={interview.type} />
          <InterviewStatusBadge status={interview.status} />
        </div>
      </div>
    </div>
  )
}

/** pending → start screen, in_progress → question runner, completed → results. */
export default function InterviewSession() {
  const { interviewId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: interview, loading, error, reload, setData } = useAsync((signal) => interviewService.get(interviewId, { signal }), [interviewId])
  const [busy, setBusy] = useState(null) // 'starting' | 'completing'
  const [actionError, setActionError] = useState(null)

  const run = async (kind, request, successMessage) => {
    setBusy(kind)
    setActionError(null)
    try {
      setData(await request())
      if (successMessage) toast.success(successMessage)
    } catch (err) {
      setActionError(err)
      if (err.status === 409) reload()
    } finally {
      setBusy(null)
    }
  }

  const start = () => run('starting', () => interviewService.start(interview.id))
  const complete = () => run('completing', () => interviewService.complete(interview.id), 'Interview completed')
  const tryAnother = () => navigate(`/dashboard/interviews/new${interview.job ? `?job=${interview.job.id}` : ''}`)

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-16" /><Skeleton className="h-24" /><Skeleton className="h-72" /></div>
  }

  if (error) {
    return error.status === 404 ? (
      <EmptyState
        icon={FileQuestion}
        title="Interview not found"
        description="It may have been deleted, or it belongs to another account."
        action={<Button to="/dashboard/interviews">Back to interviews</Button>}
      />
    ) : (
      <ErrorState error={error} onRetry={reload} title="Couldn't load this interview" />
    )
  }

  const typeMeta = INTERVIEW_TYPES.find((t) => t.value === interview.type)

  return (
    <div className="mx-auto max-w-3xl">
      <Header interview={interview} />

      {actionError && (
        <Card className="mb-4">
          <ErrorState
            error={actionError}
            title={busy === null && interview.status === 'pending' ? "Couldn't prepare your questions" : 'Something went wrong'}
            onRetry={interview.status === 'pending' ? start : interview.status === 'in_progress' && actionError.status !== 409 ? complete : undefined}
            className="py-8"
          />
        </Card>
      )}

      {busy === 'starting' ? (
        <AnalysisSkeleton label="Preparing your interview questions… this usually takes 20–60 seconds." />
      ) : busy === 'completing' ? (
        <AnalysisSkeleton label="Reviewing your answers and preparing your final feedback…" />
      ) : interview.status === 'pending' ? (
        !actionError && (
          <Card>
            <EmptyState
              icon={Play}
              title="Ready when you are"
              description={`${typeMeta?.plan ?? '8 questions'}. Answer one question at a time — you'll get a score and feedback after each answer.`}
              action={<Button icon={Play} onClick={start}>Start interview</Button>}
            />
          </Card>
        )
      ) : interview.status === 'in_progress' ? (
        <InterviewRunner interview={interview} onChange={setData} onComplete={complete} completing={busy === 'completing'} />
      ) : (
        <InterviewResults interview={interview} onTryAnother={tryAnother} />
      )}
    </div>
  )
}
