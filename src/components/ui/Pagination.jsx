import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

export function Pagination({ meta, onPageChange, className = '' }) {
  if (!meta || meta.last_page <= 1) return null

  const { current_page: page, last_page: last, per_page: perPage, total } = meta
  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  return (
    <nav className={`flex items-center justify-between gap-4 ${className}`} aria-label="Pagination">
      <p className="text-sm text-slate-500">
        <span className="font-medium text-slate-700">{from}–{to}</span> of <span className="font-medium text-slate-700">{total}</span>
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= last} onClick={() => onPageChange(page + 1)}>
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
