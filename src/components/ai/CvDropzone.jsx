import { FileUp } from 'lucide-react'
import { useId, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { cvService } from '../../services/cvService'
import { CV_MAX_MB } from '../../utils/constants'

function validate(file) {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) return 'Only PDF files are accepted.'
  if (file.size > CV_MAX_MB * 1024 * 1024) return `The CV must not be larger than ${CV_MAX_MB} MB.`
  return null
}

/** Drag-and-drop / click-to-browse PDF upload with progress and server error display. */
export function CvDropzone({ onUploaded, compact = false }) {
  const toast = useToast()
  const inputId = useId()
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)

  const upload = async (file) => {
    if (!file) return
    const problem = validate(file)
    if (problem) {
      setError(problem)
      return
    }

    setError(null)
    setProgress(0)
    try {
      const cv = await cvService.upload(file, setProgress)
      toast.success('CV uploaded', 'Text extracted — ready to analyze.')
      onUploaded(cv)
    } catch (err) {
      setError(err.errors?.file?.[0] ?? err.message)
    } finally {
      setProgress(null)
    }
  }

  const uploading = progress !== null

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (!uploading) upload(e.dataTransfer.files?.[0]) }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors ${compact ? 'px-4 py-5' : 'px-6 py-10'} ${
          dragging ? 'border-brand-500 bg-brand-50/60' : error ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50 hover:border-brand-400 hover:bg-brand-50/30'
        } ${uploading ? 'pointer-events-none' : ''}`}
      >
        <span className="mb-2.5 flex size-10 items-center justify-center rounded-lg bg-white text-brand-700 shadow-xs ring-1 ring-slate-200">
          <FileUp className="size-5" aria-hidden="true" />
        </span>
        {uploading ? (
          <span className="w-full max-w-48">
            <span className="text-sm font-medium text-slate-700">Uploading… {progress}%</span>
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
              <span className="block h-full rounded-full bg-brand-600 transition-[width]" style={{ width: `${progress}%` }} />
            </span>
          </span>
        ) : (
          <>
            <span className="text-sm font-medium text-slate-900"><span className="text-brand-700">Choose a PDF</span> or drag it here</span>
            <span className="mt-1 text-xs text-slate-500">Text-based PDF, up to {CV_MAX_MB} MB</span>
          </>
        )}
        <input
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => { upload(e.target.files?.[0]); e.target.value = '' }}
        />
      </label>
      {error && <p className="mt-2 text-xs text-rose-600" role="alert">{error}</p>}
    </div>
  )
}
