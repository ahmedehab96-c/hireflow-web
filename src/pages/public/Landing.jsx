import {
  ArrowRight, BriefcaseBusiness, Check, GitCompareArrows, MapPin, MessagesSquare, ScanText, Search, SquareKanban, X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ScoreRing } from '../../components/ai/ScoreRing'
import { JobCard, JobCardSkeleton } from '../../components/jobs/JobCard'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/Feedback'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../hooks/useAuth'
import { jobService } from '../../services/jobService'
import { STATUS_MAP } from '../../utils/constants'
import { homeFor } from '../../utils/auth'

const STEPS = [
  { title: 'Upload your CV', text: 'Get a score out of 100, the skills we found, gaps and specific fixes.' },
  { title: 'Find roles that fit', text: 'Browse open roles and check how your CV matches each one before you apply.' },
  { title: 'Practise the interview', text: 'Answer eight questions written for that role and get feedback on every answer.' },
  { title: 'Track every application', text: 'Follow each role from saved to offer, with dates and notes in one place.' },
]

const FEATURES = [
  { icon: GitCompareArrows, title: 'Job Matching', text: 'See matched and missing skills for a specific role.', href: '#job-matching' },
  { icon: ScanText, title: 'CV Analyzer', text: 'A structured review of your CV with prioritised fixes.', href: '#cv-analyzer' },
  { icon: MessagesSquare, title: 'Interview Coach', text: 'Mock interviews with a score and a better answer for each question.', href: '#interview-coach' },
  { icon: SquareKanban, title: 'Application Tracking', text: 'Seven clear stages, from saved to hired.', href: '#application-tracking' },
]

const BOARD = [
  { status: 'applied', items: ['Backend Engineer', 'Product Designer'] },
  { status: 'interview', items: ['Data Analyst'] },
  { status: 'offer', items: ['DevOps Engineer'] },
]

function HeroSearch() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')

  const onSubmit = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (location.trim()) params.set('location', location.trim())
    navigate(`/jobs${params.size ? `?${params}` : ''}`)
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row" role="search">
      <label className="flex flex-1 items-center gap-2 rounded-lg px-3">
        <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
        <span className="sr-only">Job title or keyword</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Job title or keyword" className="h-10 w-full bg-transparent text-sm placeholder:text-slate-400 focus:outline-none" />
      </label>
      <label className="flex flex-1 items-center gap-2 rounded-lg border-slate-200 px-3 sm:border-l">
        <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
        <span className="sr-only">Location</span>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or remote" className="h-10 w-full bg-transparent text-sm placeholder:text-slate-400 focus:outline-none" />
      </label>
      <Button type="submit" size="lg">Search jobs</Button>
    </form>
  )
}

/* ---------- Static product previews (decorative, built from real UI pieces) ---------- */

function Frame({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 sm:p-5" aria-hidden="true">
      <p className="border-b border-slate-100 pb-3 text-sm font-semibold text-slate-900">{title}</p>
      <div className="pt-4">{children}</div>
    </div>
  )
}

function PipelinePreview() {
  return (
    <Frame title="My applications">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {BOARD.map((column) => {
          const meta = STATUS_MAP[column.status]
          return (
            <div key={column.status} className="rounded-lg bg-slate-50 p-2 sm:p-2.5">
              <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                <span className={`size-1.5 rounded-full ${meta.dot}`} /> {meta.label}
              </p>
              <div className="space-y-2">
                {column.items.map((title) => (
                  <div key={title} className="rounded-md border border-slate-200 bg-white p-2">
                    <p className="truncate text-[11px] font-medium text-slate-800">{title}</p>
                    <div className="mt-1.5 h-1.5 w-2/3 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Frame>
  )
}

function MatchPreview() {
  return (
    <Frame title="Match: Senior Laravel Developer">
      <div className="flex items-center gap-4">
        <ScoreRing score={82} kind="match" size={88} stroke={8} />
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {['PHP', 'Laravel', 'MySQL', 'REST APIs'].map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-600/20 ring-inset"><Check className="size-3" />{s}</span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-600/20 ring-inset"><X className="size-3" />Docker</span>
        </div>
      </div>
    </Frame>
  )
}

function CvPreview() {
  return (
    <Frame title="CV review">
      <div className="flex items-center gap-4">
        <ScoreRing score={74} size={88} stroke={8} />
        <ol className="min-w-0 space-y-2 text-xs text-slate-600">
          {['Add a two-line summary for backend roles', 'Quantify impact: latency, uptime, users', 'Mention testing practice'].map((t, i) => (
            <li key={t} className="flex gap-2"><span className="flex size-4 shrink-0 items-center justify-center rounded bg-brand-700 text-[10px] font-semibold text-white">{i + 1}</span>{t}</li>
          ))}
        </ol>
      </div>
    </Frame>
  )
}

function InterviewPreview() {
  return (
    <Frame title="Question 4 / 8">
      <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-violet-600/20 ring-inset">Technical</span>
      <p className="mt-2 text-sm font-medium text-slate-900">How would you troubleshoot a Laravel endpoint that became slow in production?</p>
      <div className="mt-3 flex items-start gap-3 rounded-lg bg-slate-50 p-3">
        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-600/20 ring-inset">8<span className="text-xs opacity-70">/10</span></span>
        <p className="text-xs leading-relaxed text-slate-600">Clear, structured approach. Add the result you measured after the fix to make it memorable.</p>
      </div>
    </Frame>
  )
}

function FeatureRow({ id, eyebrow, title, text, points, cta, preview, reverse }) {
  return (
    <section id={id} className="scroll-mt-20 py-12 sm:py-16">
      <div className={`grid items-center gap-10 lg:grid-cols-2 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div>
          <p className="text-sm font-medium text-brand-700">{eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{title}</h3>
          <p className="mt-3 text-slate-600">{text}</p>
          <ul className="mt-5 space-y-2.5">
            {points.map((p) => (
              <li key={p} className="flex gap-2.5 text-sm text-slate-700"><Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />{p}</li>
            ))}
          </ul>
          {cta && <Link to={cta.to} className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800">{cta.label} <ArrowRight className="size-4" aria-hidden="true" /></Link>}
        </div>
        <div className="mx-auto w-full max-w-md lg:max-w-none">{preview}</div>
      </div>
    </section>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsync((signal) => jobService.list({ per_page: 4 }, { signal }), [])
  const openRoles = data?.meta.total

  return (
    <>
      {/* 1. Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800 ring-1 ring-brand-200 ring-inset">
              <BriefcaseBusiness className="size-3.5" aria-hidden="true" />
              {openRoles != null ? `${openRoles} open roles right now` : 'Career workspace for job seekers'}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-slate-900 sm:text-5xl">
              Find the right job. Prepare smarter. Get hired.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-pretty text-slate-600">
              HireFlow puts job search, CV feedback, interview practice and application tracking in one workspace, so every application you send is a stronger one.
            </p>
            <HeroSearch />
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              {user ? (
                <Link to={homeFor(user)} className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800">Go to your dashboard <ArrowRight className="size-4" aria-hidden="true" /></Link>
              ) : (
                <>
                  <Link to="/register" className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800">Create a free account <ArrowRight className="size-4" aria-hidden="true" /></Link>
                  <span>No credit card. Candidates use it free.</span>
                </>
              )}
            </div>
          </div>
          <div className="hidden lg:block"><PipelinePreview /></div>
        </div>
      </section>

      {/* 2. Value proposition */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">A job search usually lives in ten browser tabs and a spreadsheet.</h2>
          <div className="space-y-4 text-slate-600">
            <p>Listings in one place, your CV in another, interview notes somewhere else, and no clear picture of which applications are still moving.</p>
            <p>HireFlow brings those pieces together. Your CV, the roles you care about, your interview practice and every application share one workspace, and each step uses what you did in the last one: your CV shapes your match results and your interview questions.</p>
          </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">How HireFlow works</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-slate-200 p-5">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">{index + 1}</span>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. AI career assistant overview */}
      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-700">AI career assistant</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Specific feedback, not generic advice</h2>
          <p className="mt-3 text-slate-600">Every result is based on your CV and the actual job posting, and comes back in a consistent structure you can act on: scores, matched and missing skills, and concrete next steps.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text, href }) => (
            <a key={title} href={href} className="group rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-300">
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Icon className="size-5" aria-hidden="true" /></span>
              <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-brand-800">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </a>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl divide-y divide-slate-200 px-4 sm:px-6">
        {/* 5. Job matching */}
        <FeatureRow
          id="job-matching"
          eyebrow="Job Matching"
          title="Know where you stand before you apply"
          text="Pick a role and one of your CVs. HireFlow compares them against the job description and its required skills."
          points={['Match score out of 100', 'Matched and missing skills side by side', 'Relevant experience from your CV', 'Steps to improve your chances for that role']}
          cta={{ label: 'Browse jobs to match', to: '/jobs' }}
          preview={<MatchPreview />}
        />
        {/* 6. CV analyzer */}
        <FeatureRow
          id="cv-analyzer"
          eyebrow="CV Analyzer"
          title="A clear review of your CV in under a minute"
          text="Upload a text-based PDF. You get a structured review of what's working and what to change first."
          points={['Overall score with a short profile summary', 'Skills, experience and education as recruiters read them', 'Strengths, weaknesses and missing keywords', 'Recommendations in priority order']}
          cta={{ label: 'Analyze your CV', to: '/dashboard/cv' }}
          preview={<CvPreview />}
          reverse
        />
        {/* 7. Interview coach */}
        <FeatureRow
          id="interview-coach"
          eyebrow="Interview Coach"
          title="Rehearse the interview for the role you want"
          text="Choose HR, technical, behavioral or a mixed interview. Questions come from the job and your background, one at a time."
          points={['Eight questions tailored to the role', 'A score out of 10 and feedback after every answer', 'A stronger version of each answer to learn from', 'Final report: technical, communication and relevance']}
          cta={{ label: 'Start a practice interview', to: '/dashboard/interviews/new' }}
          preview={<InterviewPreview />}
        />
        {/* 8. Application tracking */}
        <FeatureRow
          id="application-tracking"
          eyebrow="Application Tracking"
          title="Every application, one clear pipeline"
          text="Save roles you like, log the ones you've applied to, and move them through each stage as you hear back."
          points={['Saved, applied, interview, technical, offer, rejected and hired', 'Interview dates and private notes per application', 'Dashboard with your pipeline and upcoming interviews', 'Notifications when something changes']}
          cta={{ label: 'Open your tracker', to: '/app/applications' }}
          preview={<PipelinePreview />}
          reverse
        />
      </div>

      {/* Live roles */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Latest openings</h2>
              <p className="mt-1 text-sm text-slate-500">Recently posted roles from companies hiring now.</p>
            </div>
            <Link to="/jobs" className="hidden items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800 sm:flex">
              View all jobs <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {error ? (
            <div className="rounded-xl border border-slate-200"><ErrorState error={error} onRetry={reload} title="Couldn't load jobs" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {loading ? Array.from({ length: 4 }, (_, i) => <JobCardSkeleton key={i} />) : data.items.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          )}
          <Button to="/jobs" variant="secondary" className="mt-6 w-full sm:hidden">View all jobs</Button>
        </div>
      </section>

      {/* 9. Statistics / benefits */}
      <section className="border-y border-slate-200">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-slate-200 lg:grid-cols-4">
          {[
            { value: openRoles ?? '—', label: 'Open roles on the board', note: 'Updated as companies post' },
            { value: '0–100', label: 'Scores for CVs and matches', note: 'Comparable across roles' },
            { value: '8', label: 'Questions per mock interview', note: 'With feedback on each' },
            { value: '7', label: 'Application stages tracked', note: 'From saved to hired' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-50 px-4 py-8 sm:px-6">
              <dt className="text-sm font-medium text-slate-900">{stat.label}</dt>
              <dd className="mt-2 text-3xl font-semibold tracking-tight text-brand-800 tabular-nums">{stat.value}</dd>
              <dd className="mt-1 text-xs text-slate-500">{stat.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 10. CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-brand-900 px-6 py-10 sm:flex-row sm:items-center sm:px-10">
          <div>
            <h2 className="text-xl font-semibold text-white">{user ? 'Pick up where you left off' : 'Your next application can be your best one'}</h2>
            <p className="mt-1.5 text-sm text-brand-200/80">
              {user ? 'Your applications, CV reviews and interview practice are waiting.' : 'Create an account, upload your CV and get your first review in minutes.'}
            </p>
          </div>
          <Link
            to={user ? homeFor(user) : '/register'}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-brand-900 hover:bg-brand-50"
          >
            {user ? 'Open dashboard' : 'Get started free'} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
