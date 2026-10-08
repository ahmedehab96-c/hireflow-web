import { ArrowRight, CircleCheck, Flag, Send } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { interviewService } from '../../services/interviewService'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { AnswerFeedback } from './AnswerFeedback'
import { CategoryBadge } from './Badges'

const MAX = 5000

function Progress({ answered, total, position }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-900">Question {position} <span className="font-normal text-slate-400">/ {total}</span></span>
        <span className="text-slate-500 tabular-nums">{answered} answered</span>
      </div>
      <ol className="flex gap-1" aria-label={`${answered} of ${total} questions answered`}>
        {Array.from({ length: total }, (_, i) => (
          <li key={i} className={`h-1.5 flex-1 rounded-full ${i < answered ? 'bg-brand-600' : i === position - 1 ? 'bg-brand-200' : 'bg-slate-200'}`} />
        ))}
      </ol>
    </div>
  )
}

function EvaluatingSkeleton() {
  return (
    <div className="space-y-3 border-t border-slate-100 p-5 sm:p-6" role="status" aria-live="polite">
      <div className="flex gap-4">
        <div className="h-9 w-16 animate-pulse rounded-lg bg-slate-200/70" />
        <div className="flex-1 space-y-2"><div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-200/70" /><div className="h-3.5 w-full animate-pulse rounded bg-slate-200/70" /></div>
      </div>
      <div className="h-24 animate-pulse rounded-lg bg-slate-200/50" />
      <p className="text-center text-sm text-slate-500">Evaluating your answer… this usually takes 10–30 seconds.</p>
    </div>
  )
}

/**
 * One question at a time. After submitting, the evaluation is shown for the answered question
 * until the candidate moves on; the next question is only revealed after that.
 */
export function InterviewRunner({ interview, onChange, onComplete, completing }) {
  const toast = useToast()
  const questions = interview.questions
  const total = interview.progress.total
  const answered = interview.progress.answered
  const current = questions.find((q) => !q.answer)

  const [reviewId, setReviewId] = useState(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)

  const reviewing = questions.find((q) => q.id === reviewId && q.answer)
  const shown = reviewing ?? current
  const isLast = !current || (reviewing && answered === total)

  const submit = async (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (text.length < 3) {
      setError('Write your answer before submitting.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const result = await interviewService.answer(interview.id, current.id, text)
      setReviewId(current.id)
      setDraft('')
      onChange(result.interview)
    } catch (err) {
      setError(err.errors?.answer?.[0] ?? err.message)
      if (err.status === 409) toast.info('Interview updated', 'Reloading the latest state.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!shown) {
    return (
      <Card className="p-8 text-center">
        <CircleCheck className="mx-auto size-10 text-emerald-600" aria-hidden="true" />
        <h2 className="mt-3 text-base font-semibold text-slate-900">All questions answered</h2>
        <p className="mt-1 text-sm text-slate-500">Finish the interview to get your overall score and feedback.</p>
        <Button className="mt-5" icon={Flag} onClick={onComplete} loading={completing}>Finish interview</Button>
      </Card>
    )
  }

  const position = shown.order

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <Progress answered={answered} total={total} position={position} />
      </Card>

      <Card>
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <CategoryBadge category={shown.category} />
            {answered > 0 && !reviewing && (
              <button type="button" onClick={() => setConfirmFinish(true)} className="text-xs font-medium text-slate-500 hover:text-slate-800">
                Finish early
              </button>
            )}
          </div>
          <h2 className="mt-3 text-lg leading-snug font-semibold text-slate-900 sm:text-xl">{shown.question}</h2>
        </div>

        {reviewing ? (
          <>
            <div className="border-t border-slate-100 p-5 sm:p-6">
              <AnswerFeedback answer={reviewing.answer} showAnswer />
            </div>
            <div className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-6">
              {isLast ? (
                <Button icon={Flag} onClick={onComplete} loading={completing}>Finish interview</Button>
              ) : (
                <Button onClick={() => setReviewId(null)}>
                  Next question <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={submit} noValidate className="border-t border-slate-100">
            <div className="p-5 sm:p-6">
              <label htmlFor="answer" className="mb-1.5 block text-sm font-medium text-slate-700">Your answer</label>
              <textarea
                id="answer"
                rows={9}
                value={draft}
                maxLength={MAX}
                disabled={submitting}
                onChange={(e) => { setDraft(e.target.value); if (error) setError(null) }}
                placeholder={shown.category === 'behavioral' ? 'Tip: structure it as Situation, Task, Action, Result.' : 'Answer as you would in a real interview.'}
                aria-invalid={Boolean(error) || undefined}
                aria-describedby="answer-help"
                className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-sm leading-relaxed shadow-sm placeholder:text-slate-400 focus:ring-2 focus:outline-none disabled:bg-slate-50 ${
                  error ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-300 focus:border-brand-600 focus:ring-brand-600/15'
                }`}
              />
              <div id="answer-help" className="mt-1.5 flex justify-between gap-4 text-xs">
                {error ? <span className="text-rose-600" role="alert">{error}</span> : <span className="text-slate-500">Be specific — examples and results score higher.</span>}
                <span className="shrink-0 text-slate-400 tabular-nums">{draft.length}/{MAX}</span>
              </div>
            </div>
            {submitting ? <EvaluatingSkeleton /> : (
              <div className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-6">
                <Button type="submit" icon={Send} disabled={!draft.trim()}>Submit answer</Button>
              </div>
            )}
          </form>
        )}
      </Card>

      <ConfirmDialog
        open={confirmFinish}
        onClose={() => setConfirmFinish(false)}
        onConfirm={() => { setConfirmFinish(false); onComplete() }}
        title="Finish the interview now?"
        message={`You've answered ${answered} of ${total} questions. Unanswered questions count as 0 in your final score.`}
        confirmLabel="Finish interview"
      />
    </div>
  )
}
