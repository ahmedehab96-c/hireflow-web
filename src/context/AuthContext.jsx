import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { tokenStorage, UNAUTHORIZED_EVENT } from '../services/api'
import { authService } from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // "loading" while restoring a stored session; "error" if the server couldn't be reached to check it.
  const [status, setStatus] = useState(() => (tokenStorage.get() ? 'loading' : 'ready'))
  const [restoreError, setRestoreError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!tokenStorage.get()) return

    authService.me()
      .then((me) => {
        setUser(me)
        setStatus('ready')
      })
      .catch((error) => {
        // Only an explicit 401 means the token is invalid (the API client has already cleared it).
        // Network errors, rate limits or server errors keep the session so the user can retry.
        if (error.status === 401) {
          setStatus('ready')
        } else {
          setRestoreError(error)
          setStatus('error')
        }
      })
  }, [attempt])

  const retryRestore = useCallback(() => {
    setRestoreError(null)
    setStatus('loading')
    setAttempt((n) => n + 1)
  }, [])

  // Any 401 from the API (expired or revoked token) signs the user out everywhere.
  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const startSession = useCallback(({ user: nextUser, token }) => {
    tokenStorage.set(token)
    setUser(nextUser)
    setStatus('ready')
    setRestoreError(null)
    return nextUser
  }, [])

  const login = useCallback(async (credentials) => startSession(await authService.login(credentials)), [startSession])
  const register = useCallback(async (payload) => startSession(await authService.register(payload)), [startSession])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      /* token may already be invalid; clear locally regardless */
    } finally {
      tokenStorage.clear()
      setUser(null)
      setStatus('ready')
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      restoreError,
      retryRestore,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isCandidate: user?.role === 'candidate',
      login,
      register,
      logout,
    }),
    [user, status, restoreError, retryRestore, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
