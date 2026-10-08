import { Briefcase, CircleCheck, CircleX, Lightbulb } from 'lucide-react'
import { scoreBand } from '../../utils/constants'
import { Recommendations, SectionCard, SkillBadges } from './Insights'
import { ScoreRing } from './ScoreRing'

export function MatchResult({ result }) {
  const band = scoreBand(result.match_score, 'match')
  const total = result.matched_skills.length + result.missing_skills.length
  const coverage = total ? Math.round((result.matched_skills.length / total) * 100) : null

  return (
    <div className="space-y-4">
      <section className="flex flex-col items-center gap-5 rounded-xl border border-slate-200 bg-slate-50/60 p-5 sm:flex-row">
        <ScoreRing score={result.match_score} kind="match" size={112} />
        <div className="w-full text-center sm:text-left">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Match score</p>
          <p className={`mt-0.5 text-lg font-semibold ${band.text}`}>{band.label}</p>
          {result.summary && <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{result.summary}</p>}
          {coverage !== null && (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>Skill coverage</span>
                <span className="tabular-nums">{result.matched_skills.length} of {total} skills</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${coverage}%` }} />
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <SectionCard title="Matched skills" icon={CircleCheck}>
          <SkillBadges items={result.matched_skills} tone="match" empty="No matching skills found." />
        </SectionCard>
        <SectionCard title="Missing skills" icon={CircleX}>
          <SkillBadges items={result.missing_skills} tone="missing" empty="You cover every required skill." />
        </SectionCard>
      </div>

      {result.matching_experience?.length > 0 && (
        <SectionCard title="Relevant experience" icon={Briefcase}>
          <ul className="space-y-2">
            {result.matching_experience.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-slate-700">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard title="How to improve your chances" icon={Lightbulb}>
        <Recommendations items={result.recommendations} />
      </SectionCard>
    </div>
  )
}
