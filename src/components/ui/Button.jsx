import { LoaderCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: 'bg-brand-700 text-white shadow-sm hover:bg-brand-800 disabled:bg-brand-700/60',
  secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 shadow-sm hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 disabled:bg-rose-600/60',
  'danger-ghost': 'text-rose-600 hover:bg-rose-50',
}

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-11 gap-2 px-5 text-[15px]',
  icon: 'size-9 justify-center',
}

export function buttonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return `inline-flex shrink-0 items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`
}

export function Button({ variant, size, className, loading = false, icon: Icon, to, children, disabled, type = 'button', ...props }) {
  const classes = buttonClasses({ variant, size, className })
  const content = (
    <>
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : Icon && <Icon className="size-4" aria-hidden="true" />}
      {children}
    </>
  )

  if (to) {
    return <Link to={to} className={classes} {...props}>{content}</Link>
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  )
}
