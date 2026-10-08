import { Eye, EyeOff } from 'lucide-react'

/** Sits over the right edge of a labelled password <Input>. */
export function PasswordToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute top-[34px] right-2 rounded-md p-1.5 text-slate-400 hover:text-slate-600"
      aria-label={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  )
}
