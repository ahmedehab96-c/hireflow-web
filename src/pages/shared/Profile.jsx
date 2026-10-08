import { CalendarDays, LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { StatusBreakdown } from '../../components/applications/StatusBreakdown'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Avatar, PageHeader } from '../../components/ui/Misc'
import { useApplicationStats } from '../../hooks/useApplicationStats'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { formatDate } from '../../utils/format'

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <Icon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
      <dt className="w-32 shrink-0 text-sm text-slate-500">{label}</dt>
      <dd className="min-w-0 truncate text-sm font-medium text-slate-900">{value}</dd>
    </div>
  )
}

function ActivityCard() {
  const stats = useApplicationStats()
  return (
    <Card>
      <CardHeader title="Your activity" description={stats.data ? `${stats.data.total} tracked applications` : undefined} />
      <div className="p-5">
        {stats.loading ? <Skeleton className="h-48" /> : stats.error ? (
          <ErrorState error={stats.error} onRetry={stats.reload} />
        ) : stats.data.total ? (
          <StatusBreakdown counts={stats.data.counts} total={stats.data.total} />
        ) : (
          <p className="py-4 text-center text-sm text-slate-500">No applications tracked yet.</p>
        )}
      </div>
    </Card>
  )
}

export default function Profile() {
  const { user, isCandidate, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const onLogout = async () => {
    await logout()
    toast.success('Signed out')
    navigate('/login', { replace: true })
  }

  return (
    <>
      <PageHeader title="Profile" description="Your account details." />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-4 border-b border-slate-100 p-5">
              <Avatar name={user.name} className="size-14 text-lg" />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-slate-900">{user.name}</p>
                <p className="truncate text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
            <dl className="divide-y divide-slate-100">
              <Row icon={UserRound} label="Full name" value={user.name} />
              <Row icon={Mail} label="Email" value={user.email} />
              <Row icon={ShieldCheck} label="Account type" value={user.role === 'admin' ? 'Administrator' : 'Candidate'} />
              <Row icon={CalendarDays} label="Member since" value={formatDate(user.created_at)} />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Session" description="Signing out revokes this device's access token." />
            <div className="p-5">
              <Button variant="secondary" icon={LogOut} onClick={onLogout}>Sign out</Button>
            </div>
          </Card>
        </div>

        {isCandidate && <ActivityCard />}
      </div>
    </>
  )
}
