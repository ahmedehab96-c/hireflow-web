import {
  Bookmark, CalendarClock, CircleX, CodeXml, Gift, Send, Trophy,
} from 'lucide-react'

export const APPLICATION_STATUSES = [
  { value: 'saved', label: 'Saved', icon: Bookmark, badge: 'bg-slate-100 text-slate-700 ring-slate-500/20', dot: 'bg-slate-400', bar: 'bg-slate-400' },
  { value: 'applied', label: 'Applied', icon: Send, badge: 'bg-sky-50 text-sky-700 ring-sky-600/20', dot: 'bg-sky-500', bar: 'bg-sky-500' },
  { value: 'interview', label: 'Interview', icon: CalendarClock, badge: 'bg-amber-50 text-amber-800 ring-amber-600/25', dot: 'bg-amber-500', bar: 'bg-amber-500' },
  { value: 'technical_interview', label: 'Technical interview', icon: CodeXml, badge: 'bg-violet-50 text-violet-700 ring-violet-600/20', dot: 'bg-violet-500', bar: 'bg-violet-500' },
  { value: 'offer', label: 'Offer', icon: Gift, badge: 'bg-teal-50 text-teal-700 ring-teal-600/20', dot: 'bg-teal-500', bar: 'bg-teal-500' },
  { value: 'rejected', label: 'Rejected', icon: CircleX, badge: 'bg-rose-50 text-rose-700 ring-rose-600/20', dot: 'bg-rose-500', bar: 'bg-rose-400' },
  { value: 'hired', label: 'Hired', icon: Trophy, badge: 'bg-emerald-600 text-white ring-emerald-700', dot: 'bg-emerald-600', bar: 'bg-emerald-600' },
]

export const STATUS_MAP = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s.value, s]))

/** The forward path of a successful application; rejected sits outside it. */
export const PIPELINE = ['saved', 'applied', 'interview', 'technical_interview', 'offer', 'hired']

export const JOB_STATUSES = [
  { value: 'active', label: 'Active', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  { value: 'draft', label: 'Draft', badge: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
  { value: 'closed', label: 'Closed', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
]

export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
]

export const employmentLabel = (value) => EMPLOYMENT_TYPES.find((t) => t.value === value)?.label ?? null

export const CV_MAX_MB = 5

/** Score bands shared by the CV score and the job match score. */
const BANDS = {
  cv: [
    [85, 'Excellent'],
    [70, 'Strong'],
    [50, 'Fair'],
    [0, 'Needs work'],
  ],
  interview: [
    [85, 'Excellent'],
    [70, 'Good'],
    [50, 'Developing'],
    [0, 'Needs practice'],
  ],
  match: [
    [85, 'Strong match'],
    [65, 'Good match'],
    [40, 'Partial match'],
    [0, 'Weak match'],
  ],
}

const TONES = [
  { min: 80, ring: 'stroke-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-700', soft: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  { min: 60, ring: 'stroke-brand-500', bar: 'bg-brand-500', text: 'text-brand-700', soft: 'bg-brand-50 text-brand-800 ring-brand-600/20' },
  { min: 40, ring: 'stroke-amber-500', bar: 'bg-amber-500', text: 'text-amber-700', soft: 'bg-amber-50 text-amber-800 ring-amber-600/25' },
  { min: 0, ring: 'stroke-rose-500', bar: 'bg-rose-500', text: 'text-rose-700', soft: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
]

export function scoreBand(score, kind = 'cv') {
  const label = BANDS[kind].find(([min]) => score >= min)[1]
  return { label, ...TONES.find((t) => score >= t.min) }
}

export const INTERVIEW_TYPES = [
  { value: 'mixed', label: 'Mixed', plan: '3 HR · 3 technical · 2 behavioral', description: 'A realistic first-round interview covering fit, skills and experience.' },
  { value: 'technical', label: 'Technical', plan: '8 technical questions', description: 'Role-specific knowledge and problem solving based on the job requirements.' },
  { value: 'behavioral', label: 'Behavioral', plan: '8 behavioral questions', description: 'Past situations and how you handled them — practise the STAR method.' },
  { value: 'hr', label: 'HR', plan: '8 HR questions', description: 'Motivation, career goals and fit with the role and company.' },
]

export const interviewTypeLabel = (value) => INTERVIEW_TYPES.find((t) => t.value === value)?.label ?? value

export const QUESTION_CATEGORIES = {
  hr: { label: 'HR', badge: 'bg-sky-50 text-sky-700 ring-sky-600/20' },
  technical: { label: 'Technical', badge: 'bg-violet-50 text-violet-700 ring-violet-600/20' },
  behavioral: { label: 'Behavioral', badge: 'bg-amber-50 text-amber-800 ring-amber-600/25' },
}

export const INTERVIEW_STATUSES = {
  pending: { label: 'Not started', badge: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
  in_progress: { label: 'In progress', badge: 'bg-sky-50 text-sky-700 ring-sky-600/20' },
  completed: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
}
