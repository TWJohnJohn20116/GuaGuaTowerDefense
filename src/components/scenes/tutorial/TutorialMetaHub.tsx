/**
 * 元進度中心教學 — HARDLINE 規格文件版
 */
import { LightbulbIcon, TargetIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { SpecNote, SpecSection } from './TutorialPageComponents';

export function TutorialMetaHub() {
  const { t } = useTranslation();
  const p = t.tutorial.metaHubPage;

  return (
    <div className="space-y-5">
      <SpecSection label={p.pageTitle}>
        <p className="text-[12.5px] leading-relaxed text-[var(--hl-ink-2)]">{p.pageIntro}</p>

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          {p.hubs.map((hub, i) => (
            <div key={hub.title} className="border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3">
              <div className="flex items-baseline gap-2 border-b border-[var(--hl-line)] pb-1.5">
                <span className="hl-label">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 truncate text-[12.5px] font-medium text-[var(--hl-ink)]">{hub.title}</span>
                <span className="ml-auto shrink-0 font-mono text-[10px] text-[var(--hl-ink-4)]">{hub.path}</span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--hl-ink-2)]">{hub.desc}</p>
              <ul className="mt-1.5 space-y-1">
                {hub.tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <TargetIcon className="mt-0.5 h-2.5 w-2.5 shrink-0 text-[var(--hl-ink-4)]" />
                    <span className="text-[11px] leading-relaxed text-[var(--hl-ink-2)]">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><LightbulbIcon className="h-3 w-3" />{p.loopsTitle}</span>}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {p.loops.map((loop) => (
            <SpecNote key={loop.label} label={loop.label} tone="reach">
              {loop.items.join(' · ')}
            </SpecNote>
          ))}
        </div>
      </SpecSection>
    </div>
  );
}

export default TutorialMetaHub;
