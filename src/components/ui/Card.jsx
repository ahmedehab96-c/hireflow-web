export function Card({ className = '', children, ...props }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-xs ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
