/**
 * Tiny rule-based validator. Each rule returns an error message or null.
 * Server-side 422 errors are merged on top, so the API stays the source of truth.
 */
export const rules = {
  required: (label) => (v) => (v === null || v === undefined || String(v).trim() === '' ? `${label} is required.` : null),
  email: () => (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address.' : null),
  minLength: (n, label) => (v) => (v && String(v).length < n ? `${label} must be at least ${n} characters.` : null),
  maxLength: (n, label) => (v) => (v && String(v).length > n ? `${label} must be at most ${n} characters.` : null),
  url: () => (v) => {
    if (!v) return null
    try {
      const { protocol } = new URL(v)
      return protocol === 'http:' || protocol === 'https:' ? null : 'Enter a full URL starting with https://'
    } catch {
      return 'Enter a full URL starting with https://'
    }
  },
  password: () => (v) => (v && !(/[a-z]/i.test(v) && /\d/.test(v)) ? 'Use at least one letter and one number.' : null),
  matches: (field, message) => (v, values) => (v !== values[field] ? message : null),
  nonNegativeInt: (label) => (v) => (v !== '' && v != null && !/^\d+$/.test(String(v)) ? `${label} must be a whole number.` : null),
}

export function validate(values, schema) {
  const errors = {}
  for (const [field, fieldRules] of Object.entries(schema)) {
    for (const rule of fieldRules) {
      const message = rule(values[field], values)
      if (message) {
        errors[field] = message
        break
      }
    }
  }
  return errors
}

/** Laravel returns { field: [messages] }; forms show the first message per field. */
export function flattenErrors(errors = {}) {
  return Object.fromEntries(Object.entries(errors).map(([key, messages]) => [key, Array.isArray(messages) ? messages[0] : messages]))
}
