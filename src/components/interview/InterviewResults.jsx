import { ChevronDown, ClipboardCheck, Dumbbell, RotateCcw, Sparkles, ThumbsUp, TrendingUp } from 'lucide-react'
import { ScoreRing } from '../ai/ScoreRing'
import { SectionCard } from '../ai/Insights'
import { Button } from '../ui/Button'
import { scoreBand } from '../../utils/constants'
import { formatDateTime } from '../../utils/format'
import { AnswerFeedback } from './AnswerFeedback'
import { AnswerScore, CategoryBadge } from './Badges'

function DimensionCard({ label, value, hint }) {
  const band = scoreBand(value * 10, 'interview')
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
        {value}<span className="text-base font-normal text-slate-400">/10</span>
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div className={`h-full rounded-full ${band.bar}`} style={{ width: `${value * 10}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

function List({ items, empty }) {
  if (!items?.length) return <p className="text-sm text-slate-500">{empty}</p>
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export function InterviewResults({ interview, onTryAnother }) {
  const feedback = interview.feedback ?? {}
  const band = scoreBand(interview.total_score ?? 0, 'interview')
  const finishedEarly = feedback.answered != null && feedback.answered < feedback.total_questions

  return (
    <div className="space-y-6">
      <section className="flex flex-col items-center gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row">
        <ScoreRing score={interview.total_score ?? 0} kind="interview" size={132} />
        <div className="text-center sm:text-left">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Interview score</p>
          <p className={`mt-0.5 text-xl font-semibold ${band.text}`}>{band.label}</p>
          {feedback.summary && <p className="mt-2 text-sm leading-relaxed text-slate-600">{feedback.summary}</p>}
          <p className="mt-2 text-xs text-slate-400">
            Completed {formatDateTime(interview.completed_at)}
            {finishedEarly && ` · ${feedback.answered} of ${feedback.total_questions} questions answered (unanswered questions score 0)`}
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <DimensionCard label="Technical" value={feedback.technical ?? 0} hint="Role knowledge and problem solving" />
        <DimensionCard label="Communication" value={feedback.communication ?? 0} hint="Clarity, structure and conciseness" />
        <DimensionCard label="Relevance" value={feedback.relevance ?? 0} hint="How directly you answered" />
      </div>

      {feedback.recommendation && (
        <div className="flex gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-brand-900">Final recommendation</p>
            <p className="mt-0.5 text-sm leading-relaxed text-brand-900/80">{feedback.recommendation}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Strengths" icon={ThumbsUp}>
          <List items={feedback.strengths} empty="No strengths recorded." />
        </SectionCard>
        <SectionCard title="Areas to improve" icon={TrendingUp}>
          <List items={feedback.areas_to_improve} empty="Nothing major to improve." />
        </SectionCard>
      </div>

      <SectionCard title="Recommended practice" icon={Dumbbell}>
        <List items={feedback.recommended_practice} empty="Keep practising with new interviews." />
      </SectionCard>

      <SectionCard title="Question by question" description="Your answers with the feedback for each" icon={ClipboardCheck}>
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {interview.questions.map((q) => (
            <details key={q.id} className="group">
              <summary className="flex cursor-pointer list-none items-start gap-3 p-4 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                <span className="mt-0.5 w-6 shrink-0 text-xs font-medium text-slate-400 tabular-nums">Q{q.order}</span>
                <span className="min-w-0 flex-1">
                  <span className="mb-1 block"><CategoryBadge category={q.category} /></span>
                  <span className="block text-sm font-medium text-slate-900">{q.question}</span>
                </span>
                {q.answer ? <AnswerScore score={q.answer.score} /> : <span className="text-xs text-slate-400">Skipped</span>}
                <ChevronDown className="mt-1 size-4 shrink-0 text-slate-400 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="border-t border-slate-100 bg-slate-50/40 p-4 sm:pl-13">
                {q.answer ? <AnswerFeedback answer={q.answer} showAnswer /> : <p className="text-sm text-slate-500">You finished the interview before answering this question.</p>}
              </div>
            </details>
          ))}
        </div>
      </SectionCard>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" to="/dashboard/interviews">All interviews</Button>
        <Button icon={RotateCcw} onClick={onTryAnother}>Try another interview</Button>
      </div>
    </div>
  )
}
