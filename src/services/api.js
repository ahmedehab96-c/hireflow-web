import axios from 'axios'

const TOKEN_KEY = 'hireflow.token'

/**
 * The API issues Sanctum bearer tokens (no cookie session), so the token lives in
 * localStorage behind this single module. Nothing else reads or writes it directly,
 * and the app never renders raw HTML, which keeps the XSS surface small.
 */
export const tokenStorage = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* storage unavailable (private mode); the session lasts until reload */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
  },
}

/** Normalised error so pages never dig through axios internals. */
export class ApiError extends Error {
  constructor(message, status = 0, errors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export const UNAUTHORIZED_EVENT = 'hireflow:unauthorized'

/** Configured per environment; without it the API is expected on the same origin under /api. */
export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

const client = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/json' },
  timeout: 15000,
})

client.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)

    if (!error.response) {
      return Promise.reject(new ApiError('Unable to reach the server. Check your connection and try again.'))
    }

    const { status, data } = error.response

    if (status === 401 && tokenStorage.get()) {
      tokenStorage.clear()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }

    return Promise.reject(new ApiError(data?.message || 'Something went wrong.', status, data?.errors || {}))
  },
)

/** Every endpoint returns { success, message, data }; callers get `data` directly. */
const unwrap = (promise) => promise.then((response) => response.data.data)

export const api = {
  get: (url, params, config) => unwrap(client.get(url, { params, ...config })),
  post: (url, body, config) => unwrap(client.post(url, body, config)),
  put: (url, body) => unwrap(client.put(url, body)),
  delete: (url) => unwrap(client.delete(url)),
}

/** Strips empty values so query strings stay clean. */
export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

/** Walks a paginated endpoint and returns every item (used for small reference lists). */
export async function fetchAllPages(url, params = {}) {
  const items = []
  let page = 1
  let lastPage = 1
  do {
    const data = await api.get(url, { ...params, page })
    items.push(...data.items)
    lastPage = data.meta.last_page
    page += 1
  } while (page <= lastPage)
  return items
}
