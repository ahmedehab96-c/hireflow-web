import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { createContext, useCallback, useMemo, useRef, useState } from 'react'

export const ToastContext = createContext(null)

const VARIANTS = {
  success: { icon: CircleCheck, tone: 'text-emerald-600' },
  error: { icon: CircleAlert, tone: 'text-rose-600' },
  info: { icon: Info, tone: 'text-sky-600' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const push = useCallback((variant, title, description) => {
    const id = ++nextId.current
    setToasts((list) => [...list.slice(-3), { id, variant, title, description }])
    setTimeout(() => dismiss(id), variant === 'error' ? 6000 : 4000)
  }, [dismiss])

  const toast = useMemo(() => ({
    success: (title, description) => push('success', title, description),
    error: (title, description) => push('error', title, description),
    info: (title, description) => push('info', title, description),
  }), [push])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      >
        {toasts.map(({ id, variant, title, description }) => {
          const { icon: Icon, tone } = VARIANTS[variant]
          return (
            <div
              key={id}
              role={variant === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5"
            >
              <Icon className={`mt-0.5 size-5 shrink-0 ${tone}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{title}</p>
                {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(id)}
                className="-m-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
