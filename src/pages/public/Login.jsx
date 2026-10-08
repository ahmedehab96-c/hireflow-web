import { LoaderCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { PasswordToggle } from '../../components/ui/PasswordToggle'
import { useAuth } from '../../hooks/useAuth'
import { useForm } from '../../hooks/useForm'
import { useToast } from '../../hooks/useToast'
import { homeFor } from '../../utils/auth'
import { rules } from '../../utils/validation'

const schema = {
  email: [rules.required('Email'), rules.email()],
  password: [rules.required('Password')],
}

// Seeded local/demo accounts. Shown in development, or in a build made with VITE_DEMO_MODE=true.
const SHOW_DEMO = import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true'
const DEMO_PASSWORD = 'Password123'
const DEMO_ACCOUNTS = [
  { label: 'Candidate', description: 'Applications, CV analyzer, interview coach', email: 'candidate1@hireflow.test' },
  { label: 'Admin', description: 'Analytics, companies, jobs, skills, users', email: 'admin@hireflow.test' },
]

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState(null)
  const form = useForm({ email: '', password: '' }, schema)

  const [demoLoading, setDemoLoading] = useState(null)

  const onSignedIn = (user) => {
    toast.success(`Welcome back, ${user.name.split(' ')[0]}`)
    const from = location.state?.from
    const target = from ? `${from.pathname}${from.search ?? ''}` : homeFor(user)
    navigate(target, { replace: true })
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setFormError(null)
    const { ok, result: user, error } = await form.submit(login)

    if (ok) {
      onSignedIn(user)
    } else if (error && error.status !== 422) {
      setFormError(error.message)
    }
  }

  const signInAsDemo = async (account) => {
    setFormError(null)
    setDemoLoading(account.email)
    form.reset({ email: account.email, password: DEMO_PASSWORD })
    try {
      onSignedIn(await login({ email: account.email, password: DEMO_PASSWORD }))
    } catch (error) {
      setFormError(error.status === 422 ? 'Demo accounts are not available. Run `php artisan db:seed` on the API.' : error.message)
      setDemoLoading(null)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
      <p className="mt-1.5 text-sm text-slate-500">
        New to HireFlow? <Link to="/register" state={location.state} className="font-medium text-brand-700 hover:text-brand-800">Create an account</Link>
      </p>

      {formError && <p className="mt-6 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-rose-200 ring-inset" role="alert">{formError}</p>}

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
        <Input label="Email" type="email" autoComplete="email" {...form.bind('email')} />
        <div className="relative">
          <Input label="Password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="[&_input]:pr-10" {...form.bind('password')} />
          <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
        </div>
        <Button type="submit" size="lg" className="w-full" loading={form.submitting}>Sign in</Button>
      </form>

      {SHOW_DEMO && (
        <section className="mt-8 rounded-xl border border-brand-200 bg-brand-50/50 p-4" aria-labelledby="demo-heading">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-brand-700" aria-hidden="true" />
            <h2 id="demo-heading" className="text-sm font-semibold text-brand-900">Explore the demo</h2>
          </div>
          <p className="mt-1 text-xs text-brand-900/70">Sign in with one click using seeded demo data.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => signInAsDemo(account)}
                disabled={Boolean(demoLoading) || form.submitting}
                className="rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:border-brand-400 disabled:opacity-60"
              >
                <span className="flex items-center justify-between gap-2 text-sm font-medium text-slate-900">
                  {account.label}
                  {demoLoading === account.email && <LoaderCircle className="size-4 animate-spin text-brand-700" aria-hidden="true" />}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">{account.description}</span>
                <span className="mt-1.5 block font-mono text-[11px] break-all text-slate-400">{account.email}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-brand-900/60">Password for both: <code className="font-mono">{DEMO_PASSWORD}</code></p>
        </section>
      )}
    </>
  )
}
