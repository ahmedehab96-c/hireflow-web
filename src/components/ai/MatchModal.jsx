import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { jobService } from '../../services/jobService'
import { Button } from '../ui/Button'
import { ErrorState } from '../ui/Feedback'
import { Modal } from '../ui/Modal'
import { AnalysisSkeleton } from './Insights'
import { MatchResult } from './MatchResult'
import { CvPicker, JobPicker } from './Pickers'

/**
 * "Analyze my match" flow. Pass `job` to pick a CV, or `cv` to pick a job.
 * select → analyzing → result (or error).
 */
export function MatchModal({ open, ...props }) {
  // Unmounted while closed, so every opening starts fresh at the "select" step.
  return open ? <MatchFlow {...props} /> : null
}

function MatchFlow({ onClose, job, cv }) {
  const [cvId, setCvId] = useState(cv?.id)
  const [targetJob, setTargetJob] = useState(job ?? null)
  const [state, setState] = useState({ step: 'select' })

  const run = async () => {
    setState({ step: 'loading' })
    try {
      setState({ step: 'result', result: await jobService.match(targetJob.id, cvId) })
    } catch (error) {
      setState({ step: 'error', error })
    }
  }

  const busy = state.step === 'loading'
  const title = job ? `Match: ${job.title}` : `Match ${cv?.original_filename ?? 'your CV'} with a job`

  const footer = {
    select: (
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={run} disabled={!cvId || !targetJob}>Analyze match</Button>
      </>
    ),
    loading: <Button variant="secondary" disabled>Analyzing…</Button>,
    result: (
      <>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => setState({ step: 'select' })}>{job ? 'Try another CV' : 'Try another job'}</Button>
        {!job && targetJob && <Button variant="secondary" to={`/jobs/${targetJob.id}`}>View job</Button>}
        <Button onClick={onClose}>Done</Button>
      </>
    ),
    error: (
      <>
        <Button variant="secondary" onClick={() => setState({ step: 'select' })}>Back</Button>
        <Button onClick={run}>Try again</Button>
      </>
    ),
  }[state.step]

  return (
    <Modal
      open
      onClose={busy ? () => {} : onClose}
      title={title}
      description={state.step === 'select' ? 'We compare your CV with the job description and required skills.' : undefined}
      size="lg"
      footer={footer}
    >
      {state.step === 'select' && (job ? <CvPicker selected={cvId} onSelect={setCvId} /> : <JobPicker selected={targetJob} onSelect={setTargetJob} />)}
      {state.step === 'loading' && <AnalysisSkeleton label="Comparing your CV with this role… this usually takes 20–60 seconds." />}
      {state.step === 'result' && <MatchResult result={state.result} />}
      {state.step === 'error' && <ErrorState error={state.error} title="Couldn't analyze this match" />}
    </Modal>
  )
}
