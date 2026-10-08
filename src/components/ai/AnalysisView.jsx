import { BadgeCheck, Briefcase, GraduationCap, Lightbulb, SearchCheck, Tags, TriangleAlert } from 'lucide-react'
import { scoreBand } from '../../utils/constants'
import { PointList, Recommendations, SectionCard, SkillBadges } from './Insights'
import { ScoreRing } from './ScoreRing'

function Timeline({ items, primary, secondary, empty }) {
  if (!items?.length) return <p className="text-sm text-slate-500">{empty}</p>
  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li key={index} className="relative pl-5">
          <span className="absolute top-1.5 left-0 size-2 rounded-full bg-brand-500" aria-hidden="true" />
          {index < items.length - 1 && <span className="absolute top-4 bottom-[-18px] left-[3.5px] w-px bg-slate-200" aria-hidden="true" />}
          <p className="text-sm font-medium text-slate-900">{item[primary] || '—'}</p>
          <p className="text-xs text-slate-500">{[item[secondary], item.period].filter(Boolean).join(' · ')}</p>
          {item.highlights && <p className="mt-1 text-sm text-slate-600">{item.highlights}</p>}
        </li>
      ))}
    </ol>
  )
}

/** Full CV analysis: score, summary, skills, strengths/weaknesses, keywords, history and recommendations. */
export function AnalysisView({ analysis }) {
  const band = scoreBand(analysis.score, 'cv')

  return (
    <div className="space-y-4">
      <section className="flex flex-col items-center gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:p-6">
        <ScoreRing score={analysis.score} />
        <div className="text-center sm:text-left">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">CV score</p>
          <p className={`mt-0.5 text-lg font-semibold ${band.text}`}>{band.label}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{analysis.summary}</p>
        </div>
      </section>

      <SectionCard title="Skills" description="Evidenced in your CV" icon={Tags}>
        <SkillBadges items={analysis.skills} />
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Strengths" icon={BadgeCheck}>
          <PointList items={analysis.strengths} tone="positive" />
        </SectionCard>
        <SectionCard title="Weaknesses" icon={TriangleAlert}>
          <PointList items={analysis.weaknesses} tone="negative" empty="No major weaknesses found." />
        </SectionCard>
      </div>

      <SectionCard title="Missing keywords" description="Common terms for your target roles that your CV doesn't mention" icon={SearchCheck}>
        <SkillBadges items={analysis.missing_keywords} tone="keyword" empty="Your CV already covers the key terms." />
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Experience" icon={Briefcase}>
          <Timeline items={analysis.experience} primary="role" secondary="organization" empty="No work experience detected." />
        </SectionCard>
        <SectionCard title="Education" icon={GraduationCap}>
          <Timeline items={analysis.education} primary="qualification" secondary="institution" empty="No education detected." />
        </SectionCard>
      </div>

      <SectionCard title="Recommendations" description="Prioritised changes to strengthen your CV" icon={Lightbulb}>
        <Recommendations items={analysis.recommendations} />
      </SectionCard>
    </div>
  )
}
