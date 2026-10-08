import { Suspense } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { PageLoader } from '../components/ui/Feedback'
import { Logo } from '../components/ui/Misc'
import { STATUS_MAP } from '../utils/constants'

const PREVIEW = [
  { title: 'Senior Laravel Developer', company: 'Dunecrest Technologies', status: 'technical_interview' },
  { title: 'Flutter Mobile Engineer', company: 'Marina Mobile Labs', status: 'applied' },
  { title: 'Data Analyst', company: 'Falcon Ledger Finance', status: 'offer' },
]

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,560px)] xl:grid-cols-[1fr_640px]">
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <Link to="/" aria-label="HireFlow home" className="self-start"><Logo /></Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-brand-900 lg:flex lg:flex-col lg:justify-center lg:px-14">
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:32px_32px]" aria-hidden="true" />
        <div className="relative">
          <p className="text-sm font-medium text-brand-300">Your job search, organised</p>
          <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight text-white">
            Every application, interview and offer in one place.
          </h2>
          <ul className="mt-10 space-y-3" aria-label="Example pipeline">
            {PREVIEW.map((item) => {
              const meta = STATUS_MAP[item.status]
              return (
                <li key={item.title} className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.06] px-4 py-3.5 ring-1 ring-white/10">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{item.title}</p>
                    <p className="truncate text-xs text-brand-200/70">{item.company}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-white/90">
                    <span className={`size-2 rounded-full ${meta.dot}`} aria-hidden="true" />
                    {meta.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>
    </div>
  )
}
