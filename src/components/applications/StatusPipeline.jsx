import { Check, CircleX } from 'lucide-react'
import { PIPELINE, STATUS_MAP } from '../../utils/constants'

/** Step indicator for an application's progress. Rejected is shown as a terminal state. */
export function StatusPipeline({ status }) {
  const rejected = status === 'rejected'
  const currentIndex = PIPELINE.indexOf(status)

  return (
    <div>
      <ol className="grid grid-cols-6 gap-1.5" aria-label="Application progress">
        {PIPELINE.map((step, index) => {
          const done = !rejected && index <= currentIndex
          const current = !rejected && index === currentIndex
          return (
            <li key={step} className="min-w-0">
              <div className={`h-1.5 rounded-full ${done ? (step === 'hired' && current ? 'bg-emerald-600' : 'bg-brand-600') : 'bg-slate-200'}`} />
              <p className={`mt-2 hidden truncate text-xs sm:block ${current ? 'font-semibold text-slate-900' : done ? 'text-slate-600' : 'text-slate-400'}`}>
                {done && !current && <Check className="mr-0.5 inline size-3 text-brand-600" aria-hidden="true" />}
                {STATUS_MAP[step].label}
              </p>
              {current && <span className="sr-only">Current step: {STATUS_MAP[step].label}</span>}
            </li>
          )
        })}
      </ol>
      {rejected && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-rose-700">
          <CircleX className="size-4" aria-hidden="true" /> This application was closed as rejected.
        </p>
      )}
    </div>
  )
}
