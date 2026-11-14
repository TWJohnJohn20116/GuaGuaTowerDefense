/**
 * 波次與經濟教學 — HARDLINE 規格文件版
 * 縮放表用 1px 格線，數值全 mono。
 */

import {
  MoneyBagIcon, WaveIcon, CoinIcon,
  StarIcon, FlameIcon, TargetIcon,
} from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { SpecCell, SpecGrid, SpecRow, SpecSection } from './TutorialPageComponents';

export function TutorialWaveEconomy() {
  const { t } = useTranslation();
  const p = t.tutorial.waveEconomyPage;
  const headers = p.scalingHeaders;

  return (
    <div className="space-y-5">
      <SpecSection label={p.pageTitle}>
        <p className="text-[12.5px] leading-relaxed text-[var(--arc-ink-2)]">{p.pageIntro}</p>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><WaveIcon className="h-3 w-3" />{p.waveRulesSection}</span>}>
        <SpecGrid cols={4}>
          {p.waveFacts.map((fact) => (
            <SpecCell key={fact.title} label={fact.title} value={<span className="font-sans text-[11px] font-normal leading-snug text-[var(--arc-ink-2)]">{fact.desc}</span>} />
          ))}
        </SpecGrid>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><MoneyBagIcon className="h-3 w-3" />{p.economySection}</span>}>
        <SpecGrid cols={4}>
          {p.economySources.map((src) => (
            <SpecCell key={src.title} label={src.title} value={<span className="font-sans text-[11px] font-normal leading-snug text-[var(--arc-ink-2)]">{src.desc}</span>} />
          ))}
        </SpecGrid>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><CoinIcon className="h-3 w-3" />{p.savingSection}</span>}>
        <div className="border-t border-[var(--cn-line-soft)]">
          {p.savingTips.map((tip, idx) => (
            <SpecRow
              key={tip.title}
              index={idx + 1}
              title={<span className="flex items-center gap-1.5"><StarIcon className="h-3 w-3 text-[var(--arc-caution)]" />{tip.title}</span>}
              desc={(
                <>
                  <span className="border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--arc-ink-3)]">
                    {p.ruleLabel}
                  </span>
                  <span className="ml-2">{tip.rule}</span>
                  <span className="mt-1 block text-[var(--arc-ink-3)]">{tip.tip}</span>
                </>
              )}
            />
          ))}
        </div>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><FlameIcon className="h-3 w-3" />{p.scalingSection}</span>}>
        <div className="border-[3px] border-[var(--cn-line-soft)]">
          <div className="grid grid-cols-5 gap-2 border-b border-[var(--cn-line-soft)] bg-[var(--arc-deck-2)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--arc-ink-3)]">
            <span>{headers.wave}</span>
            <span>{headers.enemyHP}</span>
            <span>{headers.enemySpeed}</span>
            <span>{headers.reward}</span>
            <span>{headers.tip}</span>
          </div>
          {p.scalingRows.map((row) => (
            <div
              key={row.wave}
              className="grid grid-cols-5 gap-2 border-b border-[var(--cn-line-soft)] px-2.5 py-2 font-mono text-[10.5px] tabular-nums last:border-b-0"
            >
              <span className="text-[var(--arc-gold)]">{row.wave}</span>
              <span className="text-[var(--arc-alert)]">{row.enemyHP}</span>
              <span className="text-[var(--arc-caution)]">{row.enemySpeed}</span>
              <span className="text-[var(--arc-vital)]">{row.reward}</span>
              <span className="font-sans text-[10.5px] text-[var(--arc-ink-2)]">{row.tip}</span>
            </div>
          ))}
        </div>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><TargetIcon className="h-3 w-3" />{p.difficultySection}</span>}>
        <SpecGrid cols={5}>
          {p.difficultyTips.map((tip) => (
            <SpecCell
              key={tip.difficulty}
              label={tip.difficulty}
              value={<span className="font-sans text-[11px] font-normal leading-snug text-[var(--arc-ink-2)]">{tip.tip}</span>}
            />
          ))}
        </SpecGrid>
      </SpecSection>
    </div>
  );
}

export default TutorialWaveEconomy;
