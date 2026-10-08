import { useCallback, useState } from 'react'
import { flattenErrors, validate } from '../utils/validation'

/**
 * Form state with client rules + server (422) errors.
 * `submit(fn)` validates, then calls fn(values); ApiError field errors are mapped back to inputs.
 */
export function useForm(initialValues, schema = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const setField = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }, [])

  const bind = (name) => ({
    name,
    value: values[name] ?? '',
    error: errors[name],
    onChange: (event) => setField(name, event.target.value),
  })

  const submit = async (handler) => {
    const clientErrors = validate(values, schema)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return { ok: false }

    setSubmitting(true)
    try {
      const result = await handler(values)
      return { ok: true, result }
    } catch (error) {
      if (error?.status === 422) setErrors(flattenErrors(error.errors))
      return { ok: false, error }
    } finally {
      setSubmitting(false)
    }
  }

  const reset = useCallback((next = initialValues) => {
    setValues(next)
    setErrors({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { values, errors, submitting, setField, setErrors, bind, submit, reset }
}
