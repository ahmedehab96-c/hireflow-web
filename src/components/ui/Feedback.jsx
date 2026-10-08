import { CircleAlert, LoaderCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

export function Spinner({ className = 'size-5' }) {
  return <LoaderCircle className={`animate-spin text-brand-700 ${className}`} aria-hidden="true" />
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-slate-500" role="status">
      <Spinner className="size-6" />
      {label}
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} aria-hidden="true" />
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center px-6 py-14 text-center ${className}`}>
      {Icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry, title = 'Something went wrong', className = '' }) {
  return (
    <div className={`flex flex-col items-center px-6 py-14 text-center ${className}`} role="alert">
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
        <CircleAlert className="size-6" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{error?.message || 'Please try again in a moment.'}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry} className="mt-5">Try again</Button>
      )}
    </div>
  )
}
