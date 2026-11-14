/**
 * 天賦樹教學 — HARDLINE 規格文件版
 */

import {
  CoinIcon, SwordsIcon, ShieldIcon, WrenchIcon,
  StarIcon, LightbulbIcon, RefreshIcon, MouseIcon,
  TreeIcon, SparklesIcon, TargetIcon,
} from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { SpecNote, SpecRow, SpecSection } from './TutorialPageComponents';

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  economy: CoinIcon,
  offense: SwordsIcon,
  defense: ShieldIcon,
  utility: WrenchIcon,
};

export function TutorialTalentTree() {
  const { t } = useTranslation();
  const p = t.tutorial.talentTreePage;

  return (
    <div className="space-y-5">
      <SpecSection label={p.pageTitle}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
            <TreeIcon className="h-4 w-4 text-[var(--hl-signal)]" />
          </div>
          <p className="text-[12.5px] leading-relaxed text-[var(--hl-ink-2)]">{p.pageIntro}</p>
        </div>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><SparklesIcon className="h-3 w-3" />{p.categoriesSection}</span>}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {p.categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] ?? SparklesIcon;
            return (
              <div key={cat.id} className="border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--hl-line-strong)] bg-[var(--hl-void-2)]">
                    <Icon className="h-3.5 w-3.5 text-[var(--hl-ink-2)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium text-[var(--hl-ink)]">{cat.name}</div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--hl-ink-2)]">{cat.desc}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {cat.highlights.map((h) => (
                    <span key={h} className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--hl-ink-3)]">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><MouseIcon className="h-3 w-3" />{p.flowSection}</span>}>
        <div className="border-t border-[var(--hl-line)]">
          {p.flowSteps.map((step, idx) => (
            <SpecRow key={step.num} index={idx + 1} title={step.title} desc={step.desc} right={<span className="font-mono text-[10px] text-[var(--hl-ink-4)]">{step.num}</span>} />
          ))}
        </div>
      </SpecSection>

      <SpecSection label={<span className="flex items-center gap-1.5"><TargetIcon className="h-3 w-3" />{p.buildsSection}</span>}>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
          {p.builds.map((build, idx) => (
            <div key={build.name} className="border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3">
              <div className="mb-2 flex items-center gap-2 border-b border-[var(--hl-line)] pb-1.5">
                <span className="hl-label">{String(idx + 1).padStart(2, '0')}</span>
                <StarIcon className="h-3 w-3 text-[var(--hl-caution)]" />
                <span className="min-w-0 truncate text-[12.5px] font-medium text-[var(--hl-ink)]">{build.name}</span>
              </div>
              <ul className="space-y-1.5">
                {build.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-3 shrink-0 font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">{i + 1}.</span>
                    <span className="text-[11px] leading-relaxed text-[var(--hl-ink-2)]">{step}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 border-t border-[var(--hl-line)] pt-1.5">
                <span className="hl-label mr-2">{p.bestForLabel}</span>
                <span className="font-mono text-[10.5px] text-[var(--hl-vital)]">{build.bestFor}</span>
              </div>
            </div>
          ))}
        </div>
      </SpecSection>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SpecNote label={<span className="flex items-center gap-1.5"><LightbulbIcon className="h-3 w-3" />{p.keystoneTipTitle}</span>} tone="caution">
          {p.keystoneTipDesc}
        </SpecNote>
        <SpecNote label={<span className="flex items-center gap-1.5"><RefreshIcon className="h-3 w-3" />{p.refundTipTitle}</span>} tone="reach">
          {p.refundTipDesc}
        </SpecNote>
      </div>
    </div>
  );
}

export default TutorialTalentTree;
