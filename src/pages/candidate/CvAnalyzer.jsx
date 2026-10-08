import { FileText, GitCompareArrows, RefreshCw, ScanText, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnalysisView } from '../../components/ai/AnalysisView'
import { CvDropzone } from '../../components/ai/CvDropzone'
import { AnalysisSkeleton } from '../../components/ai/Insights'
import { MatchModal } from '../../components/ai/MatchModal'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { PageHeader } from '../../components/ui/Misc'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { cvService } from '../../services/cvService'
import { scoreBand } from '../../utils/constants'
import { formatDate, timeAgo } from '../../utils/format'

function CvList({ cvs, selectedId, onSelect, onDelete }) {
  return (
    <ul className="space-y-1.5">
      {cvs.map((cv) => {
        const active = cv.id === selectedId
        const band = cv.score != null ? scoreBand(cv.score) : null
        return (
          <li key={cv.id} className="group relative">
            <button
              type="button"
              onClick={() => onSelect(cv.id)}
              aria-current={active || undefined}
              className={`flex w-full items-center gap-3 rounded-lg border py-2.5 pr-11 pl-3 text-left transition-colors ${
                active ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600' : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <FileText className={`size-5 shrink-0 ${active ? 'text-brand-700' : 'text-slate-400'}`} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-900">{cv.original_filename}</span>
                <span className="block text-xs text-slate-500">Uploaded {timeAgo(cv.created_at)}</span>
              </span>
              {band ? (
                <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset ${band.soft}`}>{cv.score}</span>
              ) : (
                <span className="text-[11px] text-slate-400">New</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onDelete(cv)}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              aria-label={`Delete ${cv.original_filename}`}
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function CvDetail({ cvId, onAnalyzed, onMatch }) {
  const toast = useToast()
  const { data: cv, loading, error, reload, setData } = useAsync((signal) => cvService.get(cvId, { signal }), [cvId])
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState(null)

  const analyze = async () => {
    setAnalyzing(true)
    setAnalyzeError(null)
    try {
      const updated = await cvService.analyze(cvId)
      setData(updated)
      onAnalyzed(updated)
      toast.success('Analysis complete', `Your CV scored ${updated.score}/100.`)
    } catch (err) {
      setAnalyzeError(err)
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-20" /><Skeleton className="h-64" /></div>
  if (error) return <Card><ErrorState error={error} onRetry={reload} title="Couldn't load this CV" /></Card>

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-slate-900">{cv.original_filename}</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Uploaded {formatDate(cv.created_at)} · {cv.text_length.toLocaleString()} characters extracted
            {cv.is_analyzed && ` · analyzed ${timeAgo(cv.updated_at)}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={GitCompareArrows} onClick={() => onMatch(cv)} disabled={analyzing}>Match with job</Button>
          <Button icon={cv.is_analyzed ? RefreshCw : ScanText} onClick={analyze} loading={analyzing}>
            {cv.is_analyzed ? 'Re-analyze' : 'Analyze CV'}
          </Button>
        </div>
      </Card>

      {analyzeError && (
        <Card><ErrorState error={analyzeError} onRetry={analyze} title="Analysis failed" className="py-8" /></Card>
      )}

      {analyzing ? (
        <AnalysisSkeleton label="Reviewing your CV… this usually takes 20–60 seconds." />
      ) : cv.analysis ? (
        <AnalysisView analysis={cv.analysis} />
      ) : (
        !analyzeError && (
          <Card>
            <EmptyState
              icon={ScanText}
              title="Ready for analysis"
              description="Get a score out of 100, a summary of your profile, strengths, gaps, missing keywords and concrete recommendations."
              action={<Button icon={ScanText} onClick={analyze}>Analyze CV</Button>}
            />
          </Card>
        )
      )}
    </div>
  )
}

export default function CvAnalyzer() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const { data: cvs, loading, error, reload, setData } = useAsync((signal) => cvService.list({ signal }), [])
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [matchCv, setMatchCv] = useState(null)

  const requested = Number(params.get('cv'))
  const selectedId = cvs?.some((c) => c.id === requested) ? requested : cvs?.[0]?.id
  const select = (id) => setParams({ cv: String(id) }, { replace: true })

  const onUploaded = (cv) => {
    setData((list) => [cv, ...(list ?? [])])
    select(cv.id)
  }

  const onAnalyzed = (updated) => setData((list) => list.map((c) => (c.id === updated.id ? { ...c, score: updated.score, is_analyzed: true } : c)))

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await cvService.remove(toDelete.id)
      setData((list) => list.filter((c) => c.id !== toDelete.id))
      if (toDelete.id === selectedId) setParams({}, { replace: true })
      toast.success('CV deleted')
      setToDelete(null)
    } catch (err) {
      toast.error('Could not delete CV', err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader title="CV Analyzer" description="Get an instant quality review of your CV, then see how well it matches specific roles." />

      {error ? (
        <Card><ErrorState error={error} onRetry={reload} title="Couldn't load your CVs" /></Card>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="p-4 lg:sticky lg:top-24">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Your CVs</h2>
            <CvDropzone onUploaded={onUploaded} compact={Boolean(cvs?.length)} />
            <div className="mt-4">
              {loading ? (
                <div className="space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-14" />)}</div>
              ) : cvs.length > 0 ? (
                <CvList cvs={cvs} selectedId={selectedId} onSelect={select} onDelete={setToDelete} />
              ) : null}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">Your CV files are stored privately and only visible to you.</p>
          </Card>

          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-72" />
            ) : selectedId ? (
              <CvDetail key={selectedId} cvId={selectedId} onAnalyzed={onAnalyzed} onMatch={setMatchCv} />
            ) : (
              <Card>
                <EmptyState
                  icon={FileText}
                  title="Upload your CV to get started"
                  description="We'll extract the text and give you a detailed review: score, strengths, gaps, missing keywords and recommendations."
                />
              </Card>
            )}
          </div>
        </div>
      )}

      <MatchModal open={Boolean(matchCv)} cv={matchCv} onClose={() => setMatchCv(null)} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this CV?"
        message={`"${toDelete?.original_filename}" and its analysis will be permanently deleted.`}
      />
    </>
  )
}
