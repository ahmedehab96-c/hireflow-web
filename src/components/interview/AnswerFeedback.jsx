import { Lightbulb, MessageSquareText, ThumbsUp, TrendingUp } from 'lucide-react'
import { scoreBand } from '../../utils/constants'
import { AnswerScore } from './Badges'

function Block({ icon: Icon, title, children }) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        <Icon className="size-3.5" aria-hidden="true" /> {title}
      </h4>
      {children}
    </div>
  )
}

function Points({ items, empty }) {
  if (!items?.length) return <p className="text-sm text-slate-500">{empty}</p>
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm text-slate-700">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  )
}

/** Evaluation of one answer: score, feedback, strengths, improvements and a suggested answer. */
export function AnswerFeedback({ answer, showAnswer = false }) {
  const band = scoreBand(answer.score * 10, 'interview')

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <AnswerScore score={answer.score} />
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${band.text}`}>{band.label}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{answer.feedback}</p>
        </div>
      </div>

      {showAnswer && (
        <Block icon={MessageSquareText} title="Your answer">
          <p className="rounded-lg bg-slate-50 p-3 text-sm leading-relaxed whitespace-pre-line text-slate-700">{answer.answer}</p>
        </Block>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Block icon={ThumbsUp} title="Strengths">
          <Points items={answer.strengths} empty="No specific strengths noted." />
        </Block>
        <Block icon={TrendingUp} title="Improve">
          <Points items={answer.weaknesses} empty="Nothing major to improve." />
        </Block>
      </div>

      {answer.improved_answer && (
        <Block icon={Lightbulb} title="Suggested answer">
          <p className="rounded-lg border border-brand-100 bg-brand-50/50 p-3.5 text-sm leading-relaxed whitespace-pre-line text-slate-700">{answer.improved_answer}</p>
        </Block>
      )}
    </div>
  )
}
