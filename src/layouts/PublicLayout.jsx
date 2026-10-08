import { Menu, X } from 'lucide-react'
import { Suspense, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Feedback'
import { Avatar, Logo } from '../components/ui/Misc'
import { useAuth } from '../hooks/useAuth'
import { homeFor } from '../utils/auth'

const YEAR = new Date().getFullYear()

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Job board', to: '/jobs' },
      { label: 'Job matching', href: '/#job-matching' },
      { label: 'CV analyzer', href: '/#cv-analyzer' },
      { label: 'Interview coach', href: '/#interview-coach' },
    ],
  },
  {
    title: 'Candidates',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Application tracking', href: '/#application-tracking' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/register' },
    ],
  },
]

const navLink = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`

export function PublicLayout() {
  const { user } = useAuth()
  const location = useLocation()
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState(null)
  const open = openOn === location.pathname
  const setOpen = (next) => setOpenOn(next ? location.pathname : null)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" aria-label="HireFlow home"><Logo /></Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            <NavLink to="/jobs" className={navLink}>Find jobs</NavLink>
            <a href="/#how-it-works" className={navLink({ isActive: false })}>How it works</a>
          </nav>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            {user ? (
              <Link to={homeFor(user)} className="flex items-center gap-2 rounded-lg py-1 pr-3 pl-1 text-sm font-medium text-slate-700 hover:bg-slate-100">
                <Avatar name={user.name} className="size-8 text-xs" />
                {user.role === 'admin' ? 'Admin console' : 'My dashboard'}
              </Link>
            ) : (
              <>
                <Button variant="ghost" to="/login">Sign in</Button>
                <Button to="/register">Create account</Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="-mr-2 ml-auto rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              <NavLink to="/jobs" className={navLink}>Find jobs</NavLink>
              <a href="/#how-it-works" className={navLink({ isActive: false })}>How it works</a>
            </nav>
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
              {user ? (
                <Button to={homeFor(user)}>{user.role === 'admin' ? 'Admin console' : 'My dashboard'}</Button>
              ) : (
                <>
                  <Button to="/register">Create account</Button>
                  <Button variant="secondary" to="/login">Sign in</Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo className="text-sm" />
            <p className="mt-3 max-w-xs text-slate-500">Find the right job. Prepare smarter. Get hired.</p>
          </div>
          {FOOTER_LINKS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="font-semibold text-slate-900">{group.title}</p>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a href={link.href} className="text-slate-500 hover:text-slate-900">{link.label}</a>
                    ) : (
                      <Link to={link.to} className="text-slate-500 hover:text-slate-900">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="border-t border-slate-100">
          <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-400 sm:px-6">© {YEAR} HireFlow. All company names and job listings in the demo are fictional.</p>
        </div>
      </footer>
    </div>
  )
}
