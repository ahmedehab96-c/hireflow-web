import { GitCompareArrows, LogIn, MessagesSquare } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { MatchModal } from './MatchModal'

/** Job page entry point for the CV ↔ job match. Candidates only; guests are invited to sign in. */
export function MatchCard({ job }) {
  const { user, isCandidate } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  if (user && !isCandidate) return null

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <GitCompareArrows className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">How well do you match?</h2>
          <p className="mt-0.5 text-sm text-slate-500">Compare your CV with this role's requirements and see which skills you're missing.</p>
        </div>
      </div>
      {user ? (
        <>
          <Button icon={GitCompareArrows} className="mt-4 w-full" onClick={() => setOpen(true)}>Analyze my match</Button>
          <Button to={`/dashboard/interviews/new?job=${job.id}`} variant="secondary" icon={MessagesSquare} className="mt-2 w-full">Practice an interview</Button>
        </>
      ) : (
        <Button to="/login" state={{ from: location }} variant="secondary" icon={LogIn} className="mt-4 w-full">Sign in to analyze your match</Button>
      )}
      {user && <MatchModal open={open} job={job} onClose={() => setOpen(false)} />}
    </Card>
  )
}
