import { useId } from 'react'

const control = (error) =>
  `block w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
    error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-brand-600 focus:ring-brand-600/15'
  }`

function FieldShell({ id, label, hint, error, required, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}

function describedBy(id, error, hint) {
  if (error) return `${id}-error`
  return hint ? `${id}-hint` : undefined
}

export function Input({ label, hint, error, required, className, icon: Icon, ...props }) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />}
        <input
          id={id}
          className={`${control(error)} h-10 ${Icon ? 'pl-9' : ''}`}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy(id, error, hint)}
          {...props}
        />
      </div>
    </FieldShell>
  )
}

export function Textarea({ label, hint, error, required, className, rows = 4, ...props }) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={id}
        rows={rows}
        className={`${control(error)} py-2`}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...props}
      />
    </FieldShell>
  )
}

export function Select({ label, hint, error, required, className, options, placeholder, ...props }) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        id={id}
        className={`${control(error)} h-10 pr-8`}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </FieldShell>
  )
}
