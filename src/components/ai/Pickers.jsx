import { FileText, Search, Upload } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync'
import { useDebounce } from '../../hooks/useDebounce'
import { cvService } from '../../services/cvService'
import { jobService } from '../../services/jobService'
import { formatDate } from '../../utils/format'
import { Button } from '../ui/Button'
import { EmptyState, ErrorState, Skeleton } from '../ui/Feedback'

/** Radio-card used by the job and CV pickers. */
export function Choice({ name, checked, onSelect, title, meta, aside }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${checked ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600' : 'border-slate-200 hover:bg-slate-50'}`}>
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="size-4 accent-brand-700" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{title}</p>
        {meta && <p className="truncate text-xs text-slate-500">{meta}</p>}
      </div>
      {aside}
    </label>
  )
}

/**
 * Lists the candidate's CVs. `selected` is a CV id, `null` for "no CV" (optional mode only),
 * or `undefined` before a choice is made — in which case the newest CV is preselected.
 */
export function CvPicker({ selected, onSelect, optional = false }) {
  const name = useId()
  const { data: cvs, loading, error, reload } = useAsync((signal) => cvService.list({ signal }), [])

  useEffect(() => {
    if (selected === undefined && cvs) onSelect(cvs[0]?.id ?? (optional ? null : undefined))
  }, [cvs, selected, onSelect, optional])

  if (loading) return <div className="space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-14" />)}</div>
  if (error) return <ErrorState error={error} onRetry={reload} className="py-6" />

  if (!cvs.length) {
    return optional ? (
      <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
        You haven't uploaded a CV yet, so questions will be based on the job only.{' '}
        <Link to="/dashboard/cv" className="font-medium text-brand-700 hover:text-brand-800">Upload a CV</Link> for questions tailored to your experience.
      </p>
    ) : (
      <EmptyState
        icon={FileText}
        title="Upload a CV first"
        description="You need a CV on file to compare against this job."
        action={<Button to="/dashboard/cv" icon={Upload}>Upload CV</Button>}
        className="py-8"
      />
    )
  }

  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium text-slate-700">Choose a CV</legend>
      {cvs.map((cv) => (
        <Choice
          key={cv.id}
          name={name}
          checked={selected === cv.id}
          onSelect={() => onSelect(cv.id)}
          title={cv.original_filename}
          meta={`Uploaded ${formatDate(cv.created_at)}${cv.is_analyzed ? ' · analyzed' : ''}`}
          aside={cv.score != null && <span className="text-xs font-medium text-slate-500 tabular-nums">CV score {cv.score}</span>}
        />
      ))}
      {optional && <Choice name={name} checked={selected === null} onSelect={() => onSelect(null)} title="Don't use a CV" meta="Questions will be based on the job only" />}
    </fieldset>
  )
}

/** Searchable list of open jobs; `selected` is a job object. */
export function JobPicker({ selected, onSelect }) {
  const name = useId()
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search.trim())
  const { data, loading, error, reload } = useAsync((signal) => jobService.list({ search: debounced, per_page: 8 }, { signal }), [debounced])

  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-medium text-slate-700">Choose a job</legend>
      <label className="relative block">
        <span className="sr-only">Search jobs</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or keyword"
          className="h-10 w-full rounded-lg border border-slate-300 pr-3 pl-9 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 focus:outline-none"
        />
      </label>
      {error ? <ErrorState error={error} onRetry={reload} className="py-6" /> : loading && !data ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : data.items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">No jobs match "{debounced}".</p>
      ) : (
        <div className={`max-h-72 space-y-2 overflow-y-auto ${loading ? 'opacity-60' : ''}`}>
          {data.items.map((job) => (
            <Choice key={job.id} name={name} checked={selected?.id === job.id} onSelect={() => onSelect(job)} title={job.title} meta={[job.company?.name, job.location].filter(Boolean).join(' · ')} />
          ))}
        </div>
      )}
    </fieldset>
  )
}
