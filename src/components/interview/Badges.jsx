import { Badge } from '../ui/Badge'
import { INTERVIEW_STATUSES, QUESTION_CATEGORIES, interviewTypeLabel, scoreBand } from '../../utils/constants'

export function CategoryBadge({ category }) {
  const meta = QUESTION_CATEGORIES[category]
  return meta ? <Badge className={meta.badge}>{meta.label}</Badge> : null
}

export function InterviewStatusBadge({ status }) {
  const meta = INTERVIEW_STATUSES[status]
  return meta ? <Badge className={meta.badge}>{meta.label}</Badge> : null
}

export function TypeBadge({ type }) {
  return <Badge>{interviewTypeLabel(type)}</Badge>
}

/** "8/10" pill coloured by the same bands as the other AI scores. */
export function AnswerScore({ score, className = '' }) {
  const band = scoreBand(score * 10, 'interview')
  return (
    <span className={`inline-flex items-baseline gap-0.5 rounded-lg px-2.5 py-1 font-semibold tabular-nums ring-1 ring-inset ${band.soft} ${className}`}>
      <span className="text-lg">{score}</span>
      <span className="text-xs opacity-70">/10</span>
    </span>
  )
}
