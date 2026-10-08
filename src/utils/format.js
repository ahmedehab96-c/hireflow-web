const compact = new Intl.NumberFormat('en', { maximumFractionDigits: 0 })

export function formatSalary(min, max, currency = 'AED') {
  if (min == null && max == null) return null
  if (min != null && max != null) {
    return min === max ? `${currency} ${compact.format(min)}` : `${currency} ${compact.format(min)} – ${compact.format(max)}`
  }
  return min != null ? `From ${currency} ${compact.format(min)}` : `Up to ${currency} ${compact.format(max)}`
}

export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-GB', options).format(new Date(value))
}

export function formatDateTime(value) {
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const STEPS = [
  ['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60],
]

export function timeAgo(value) {
  if (!value) return ''
  const seconds = (new Date(value).getTime() - Date.now()) / 1000
  for (const [unit, size] of STEPS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

/** ISO string → value for <input type="datetime-local"> in the user's local time. */
export function toDateTimeInput(value) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

/** <input type="datetime-local"> value → ISO string (or null). */
export function fromDateTimeInput(value) {
  return value ? new Date(value).toISOString() : null
}

export function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('')
}

export function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
