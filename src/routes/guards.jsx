import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ErrorState, PageLoader } from '../components/ui/Feedback'
import { useAuth } from '../hooks/useAuth'
import { homeFor } from '../utils/auth'

/** Shown when a stored session couldn't be checked (server unreachable, rate limited…). */
function RestoreError() {
  const { restoreError, retryRestore } = useAuth()
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <ErrorState error={restoreError} onRetry={retryRestore} title="We couldn't restore your session" />
    </div>
  )
}

/** Requires a signed-in user, optionally with a specific role. */
export function ProtectedRoute({ role }) {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoader label="Restoring your session…" />
  if (status === 'error') return <RestoreError />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />

  return <Outlet />
}

/** Login/register are for signed-out visitors only. */
export function GuestRoute() {
  const { user, status } = useAuth()

  if (status === 'loading') return <PageLoader />
  if (user) return <Navigate to={homeFor(user)} replace />

  return <Outlet />
}
