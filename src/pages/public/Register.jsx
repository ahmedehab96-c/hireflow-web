import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { useAuth } from '../../hooks/useAuth'
import { useForm } from '../../hooks/useForm'
import { useToast } from '../../hooks/useToast'
import { rules } from '../../utils/validation'
import { PasswordToggle } from '../../components/ui/PasswordToggle'

// Mirrors the API rules (min 8, letters + numbers) for instant feedback.
const schema = {
  name: [rules.required('Full name'), rules.maxLength(255, 'Full name')],
  email: [rules.required('Email'), rules.email(), rules.maxLength(255, 'Email')],
  password: [rules.required('Password'), rules.minLength(8, 'Password'), rules.password()],
  password_confirmation: [rules.required('Password confirmation'), rules.matches('password', 'Passwords do not match.')],
}

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState(null)
  const form = useForm({ name: '', email: '', password: '', password_confirmation: '' }, schema)

  const onSubmit = async (event) => {
    event.preventDefault()
    setFormError(null)
    const { ok, error } = await form.submit(register)

    if (ok) {
      toast.success('Account created', 'Start by saving a few jobs you like.')
      const from = location.state?.from
      navigate(from ? `${from.pathname}${from.search ?? ''}` : '/app', { replace: true })
    } else if (error && error.status !== 422) {
      setFormError(error.message)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Already have one? <Link to="/login" state={location.state} className="font-medium text-brand-700 hover:text-brand-800">Sign in</Link>
      </p>

      {formError && <p className="mt-6 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-rose-200 ring-inset" role="alert">{formError}</p>}

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
        <Input label="Full name" autoComplete="name" {...form.bind('name')} />
        <Input label="Email" type="email" autoComplete="email" {...form.bind('email')} />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            hint="At least 8 characters, with letters and numbers."
            className="[&_input]:pr-10"
            {...form.bind('password')}
          />
          <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
        </div>
        <Input label="Confirm password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" {...form.bind('password_confirmation')} />
        <Button type="submit" size="lg" className="w-full" loading={form.submitting}>Create account</Button>
      </form>
    </>
  )
}
