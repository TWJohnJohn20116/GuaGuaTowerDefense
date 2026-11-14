/**
 * 遊戲模式教學 — HARDLINE 規格文件版
 */
import { LightbulbIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { SpecRow, SpecSection } from './TutorialPageComponents';

export function TutorialGameModes() {
  const { t } = useTranslation();
  const p = t.tutorial.gameModesPage;

  return (
    <div className="space-y-5">
      <SpecSection label={p.pageTitle}>
        <p className="text-[12.5px] leading-relaxed text-[var(--arc-ink-2)]">{p.pageIntro}</p>

        <div className="mt-3 border-t border-[var(--cn-line-soft)]">
          {p.modes.map((mode, i) => (
            <div key={mode.title} className="border-b border-[var(--cn-line-soft)] py-2.5 last:border-b-0">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[12.5px] font-medium text-[var(--arc-ink)]">{mode.title}</span>
              </div>
              <p className="mt-1 pl-[26px] text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{mode.desc}</p>
              <ul className="mt-1.5 space-y-1 pl-[26px]">
                {mode.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 bg-[var(--arc-gold)]" />
                    <span className="text-[11px] leading-relaxed text-[var(--arc-ink-2)]">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><LightbulbIcon className="h-3 w-3" />{p.flowTipsTitle}</span>}>
        <div className="border-t border-[var(--cn-line-soft)]">
          {p.flowTips.map((tip, i) => (
            <SpecRow key={tip.title} index={i + 1} title={tip.title} desc={tip.text} />
          ))}
        </div>
      </SpecSection>
    </div>
  );
}

export default TutorialGameModes;
