import { applicationService } from '../services/applicationService'
import { APPLICATION_STATUSES } from '../utils/constants'
import { useAsync } from './useAsync'

const INTERVIEW_STATUSES = ['interview', 'technical_interview']

/**
 * Per-status totals from the API's pagination meta (one light request per status),
 * plus the interview-stage applications themselves for the "upcoming" list.
 */
export function useApplicationStats() {
  return useAsync(async (signal) => {
    const results = await Promise.all(
      APPLICATION_STATUSES.map(({ value }) =>
        applicationService.list({ status: value, per_page: INTERVIEW_STATUSES.includes(value) ? 50 : 1 }, { signal }),
      ),
    )

    const counts = Object.fromEntries(APPLICATION_STATUSES.map(({ value }, i) => [value, results[i].meta.total]))
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0)
    const now = Date.now()
    const upcoming = APPLICATION_STATUSES
      .flatMap(({ value }, i) => (INTERVIEW_STATUSES.includes(value) ? results[i].items : []))
      .filter((a) => a.interview_at && new Date(a.interview_at).getTime() >= now)
      .sort((a, b) => new Date(a.interview_at) - new Date(b.interview_at))

    return { counts, total, upcoming }
  }, [])
}
