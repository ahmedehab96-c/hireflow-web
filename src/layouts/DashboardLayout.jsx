import {
  BriefcaseBusiness, Building2, ChevronDown, FileText, LayoutDashboard, LogOut, Menu, MessagesSquare, ScanText, Search, Tags, UserRound, Users, X,
} from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { NotificationBell } from '../components/notifications/NotificationBell'
import { PageLoader } from '../components/ui/Feedback'
import { Avatar, Logo } from '../components/ui/Misc'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const NAV = {
  candidate: [
    { label: 'Dashboard', to: '/app', icon: LayoutDashboard, end: true },
    { label: 'My applications', to: '/app/applications', icon: FileText },
    { label: 'CV Analyzer', to: '/dashboard/cv', icon: ScanText },
    { label: 'Interview Coach', to: '/dashboard/interviews', icon: MessagesSquare },
    { label: 'Browse jobs', to: '/jobs', icon: Search },
    { label: 'Profile', to: '/app/profile', icon: UserRound },
  ],
  admin: [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Companies', to: '/admin/companies', icon: Building2 },
    { label: 'Jobs', to: '/admin/jobs', icon: BriefcaseBusiness },
    { label: 'Skills', to: '/admin/skills', icon: Tags },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Profile', to: '/admin/profile', icon: UserRound },
  ],
}

function SidebarNav({ items }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5" aria-label="Dashboard">
      {items.map(({ label, to, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={`size-[18px] ${isActive ? 'text-brand-700' : 'text-slate-400 group-hover:text-slate-500'}`} aria-hidden="true" />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => {
      if (event.type === 'keydown' ? event.key === 'Escape' : !ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1 pr-2 pl-1 hover:bg-slate-100"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={user.name} className="size-8 text-xs" />
        <span className="hidden max-w-36 truncate text-sm font-medium text-slate-700 sm:block">{user.name}</span>
        <ChevronDown className="size-4 text-slate-400" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-60 animate-fade-in rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5">
          <div className="border-b border-slate-100 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <Link
            role="menuitem"
            to={user.role === 'admin' ? '/admin/profile' : '/app/profile'}
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <UserRound className="size-4 text-slate-400" aria-hidden="true" /> Profile
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="size-4 text-slate-400" aria-hidden="true" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOn, setDrawerOn] = useState(null)
  const drawerOpen = drawerOn === location.pathname
  const setDrawerOpen = (next) => setDrawerOn(next ? location.pathname : null)
  const items = NAV[user.role] ?? NAV.candidate

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out', 'See you next time.')
    navigate('/login', { replace: true })
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 px-3 py-5">
      <div className="flex items-center justify-between px-2">
        <Link to="/" aria-label="HireFlow home"><Logo /></Link>
        {user.role === 'admin' && <span className="rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">Admin</span>}
      </div>
      <SidebarNav items={items} />
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <LogOut className="size-[18px] text-slate-400" aria-hidden="true" /> Sign out
      </button>
    </div>
  )

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-slate-900/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <aside className="relative h-full w-72 max-w-[85vw] bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute top-5 right-3 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="-ml-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>
          <Link to="/" className="lg:hidden" aria-label="HireFlow home"><Logo className="text-sm" /></Link>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/jobs" className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:flex">
              <Search className="size-4" aria-hidden="true" /> Job board
            </Link>
            <NotificationBell />
            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
