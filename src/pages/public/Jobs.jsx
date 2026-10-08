import { MapPin, Search, SearchX, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { JobCard, JobCardSkeleton } from '../../components/jobs/JobCard'
import { Button } from '../../components/ui/Button'
import { EmptyState, ErrorState } from '../../components/ui/Feedback'
import { Pagination } from '../../components/ui/Pagination'
import { useAsync } from '../../hooks/useAsync'
import { useDebounce } from '../../hooks/useDebounce'
import { jobService } from '../../services/jobService'
import { EMPLOYMENT_TYPES } from '../../utils/constants'

const FILTER_KEYS = ['search', 'location', 'employment_type', 'skill']

export default function Jobs() {
  const [params, setParams] = useSearchParams()
  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) ?? '']))
  const page = Number(params.get('page')) || 1

  // Text inputs update the URL after a short pause instead of on every keystroke.
  const [search, setSearch] = useState(filters.search)
  const [location, setLocation] = useState(filters.location)
  const debouncedSearch = useDebounce(search)
  const debouncedLocation = useDebounce(location)

  const update = (changes) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
      if (!('page' in changes)) next.delete('page')
      return next
    }, { replace: true })
  }

  useEffect(() => {
    if (debouncedSearch !== filters.search || debouncedLocation !== filters.location) {
      update({ search: debouncedSearch.trim(), location: debouncedLocation.trim() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, debouncedLocation])

  const query = params.toString()
  const { data, loading, error, reload } = useAsync(
    (signal) => jobService.list({ ...filters, page, per_page: 10 }, { signal }),
    [query],
  )

  const hasFilters = FILTER_KEYS.some((key) => filters[key])
  const clearAll = () => {
    setSearch('')
    setLocation('')
    setParams({}, { replace: true })
  }

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Find jobs</h1>
          <p className="mt-1.5 text-sm text-slate-500">Browse open roles and track the ones that fit.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_220px]" role="search">
            <label className="relative">
              <span className="sr-only">Search jobs</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title or keyword"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pr-3 pl-9 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 focus:outline-none"
              />
            </label>
            <label className="relative">
              <span className="sr-only">Location</span>
              <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pr-3 pl-9 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 focus:outline-none"
              />
            </label>
            <label className="sm:col-span-2 lg:col-span-1">
              <span className="sr-only">Employment type</span>
              <select
                value={filters.employment_type}
                onChange={(e) => update({ employment_type: e.target.value })}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 focus:outline-none"
              >
                <option value="">All employment types</option>
                {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex min-h-8 flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500" aria-live="polite">
            {loading ? 'Searching…' : data ? <><span className="font-medium text-slate-900">{data.meta.total}</span> {data.meta.total === 1 ? 'job' : 'jobs'} found</> : null}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {filters.skill && (
              <button type="button" onClick={() => update({ skill: '' })} className="inline-flex items-center gap-1 rounded-md bg-brand-700 px-2 py-1 text-xs font-medium text-white hover:bg-brand-800">
                Skill: {filters.skill} <X className="size-3.5" aria-label="Remove skill filter" />
              </button>
            )}
            {hasFilters && <Button variant="ghost" size="sm" onClick={clearAll}>Clear filters</Button>}
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-slate-200 bg-white"><ErrorState error={error} onRetry={reload} title="Couldn't load jobs" /></div>
        ) : loading && !data ? (
          <div className="space-y-3">{Array.from({ length: 5 }, (_, i) => <JobCardSkeleton key={i} />)}</div>
        ) : data.items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white">
            <EmptyState
              icon={SearchX}
              title="No jobs match your search"
              description="Try a different keyword, widen the location or remove a filter."
              action={hasFilters && <Button variant="secondary" onClick={clearAll}>Clear all filters</Button>}
            />
          </div>
        ) : (
          <>
            <div className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
              {data.items.map((job) => (
                <JobCard key={job.id} job={job} activeSkill={filters.skill} onSkillClick={(skill) => update({ skill: skill === filters.skill ? '' : skill })} />
              ))}
            </div>
            <Pagination meta={data.meta} onPageChange={(p) => { update({ page: String(p) }); window.scrollTo({ top: 0 }) }} className="mt-6" />
          </>
        )}
      </section>
    </>
  )
}
