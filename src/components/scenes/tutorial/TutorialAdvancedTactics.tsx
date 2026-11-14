/**
 * 進階戰術教學 — HARDLINE 規格文件版
 */

import {
  TargetIcon, SwordsIcon, LightbulbIcon, SparklesIcon,
} from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { Deck, Segments } from '@/components/hl';
import { SpecNote, SpecRow, SpecSection } from './TutorialPageComponents';

export function TutorialAdvancedTactics() {
  const { t } = useTranslation();
  const p = t.tutorial.advancedTacticsPage;

  return (
    <div className="space-y-5">
      <SpecSection label={p.pageTitle}>
        <p className="text-[12.5px] leading-relaxed text-[var(--arc-ink-2)]">{p.pageIntro}</p>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><TargetIcon className="h-3 w-3" />{p.placementSection}</span>}>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {p.placementTactics.map((tactic, idx) => (
            <Deck key={tactic.title} className="p-3">
              <div className="mb-2 flex items-baseline gap-2 border-b border-[var(--cn-line-soft)] pb-1.5">
                <span className="arc-label">{String(idx + 1).padStart(2, '0')}</span>
                <span className="min-w-0 truncate text-[12.5px] font-medium text-[var(--arc-ink)]">{tactic.title}</span>
              </div>
              <ul className="space-y-1.5">
                {tactic.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 bg-[var(--arc-gold)]" />
                    <span className="text-[11px] leading-relaxed text-[var(--arc-ink-2)]">{b}</span>
                  </li>
                ))}
              </ul>
            </Deck>
          ))}
        </div>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><SparklesIcon className="h-3 w-3" />{p.combosSection}</span>}>
        <div className="border-t border-[var(--cn-line-soft)]">
          {p.towerCombos.map((combo) => (
            <div key={combo.title} className="border-b border-[var(--cn-line-soft)] py-2.5 last:border-b-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12.5px] font-medium text-[var(--arc-ink)]">{combo.title}</span>
                <Segments total={5} filled={combo.rating} tone="caution" size="sm" />
                <span className="ml-auto flex flex-wrap items-center gap-1">
                  {combo.towers.map((name, i) => (
                    <span key={i} className="border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--arc-ink-2)]">
                      {name}
                    </span>
                  ))}
                </span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{combo.desc}</p>
              <p className="mt-1 font-mono text-[10px] text-[var(--arc-ink-3)]">
                {p.bestForLabel} <span className="text-[var(--arc-vital)]">{combo.best}</span>
              </p>
            </div>
          ))}
        </div>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><SwordsIcon className="h-3 w-3" />{p.rhythmSection}</span>}>
        <div className="border-t border-[var(--cn-line-soft)]">
          {p.rhythmTips.map((tip, idx) => (
            <SpecRow key={tip.title} index={idx + 1} title={tip.title} desc={tip.desc} />
          ))}
        </div>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><LightbulbIcon className="h-3 w-3" />{p.antiPatternsSection}</span>}>
        <div className="space-y-1.5">
          {p.antiPatterns.map((ap) => (
            <SpecNote key={ap.warn} label={ap.warn} tone="alarm">
              <span className="text-[var(--arc-vital)]">→</span> {ap.fix}
            </SpecNote>
          ))}
        </div>
      </SpecSection>
    </div>
  );
}

export default TutorialAdvancedTactics;
