// 更新日誌 · 最新版本區塊（HARDLINE：mono 版本號 + 1px 線，無光暈、無漸層）
import type { ChangeSection } from '@/components/changelog';
import { ChangelogChangeBlock } from '@/components/scenes/changelog-scene/ChangelogChangeBlock';
import {
  countSectionItems, getVersionType, VERSION_TYPE_STYLE,
} from '@/components/scenes/changelog-scene/changelogUtils';

interface ChangelogHeroProps {
  section: ChangeSection;
}

export function ChangelogHero({ section }: ChangelogHeroProps) {
  const versionType = getVersionType(section.version);
  const style = VERSION_TYPE_STYLE[versionType];
  const totalChanges = countSectionItems(section);
  const previewChanges = section.changes.slice(0, 2);

  return (
    <section className="hl-cut-tl border border-[var(--hl-signal-edge)] bg-[var(--hl-deck)]">
      {/* 版本列 */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 border-b border-[var(--hl-line)] px-4 py-3">
        <span className="hl-num text-[22px] leading-none text-[var(--hl-signal)]">
          v{section.version}
        </span>
        <span className={`border ${style.border} px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] ${style.tone}`}>
          {style.label}
        </span>
        <span className="font-mono text-[10px] tabular-nums leading-none text-[var(--hl-ink-3)]">
          {section.date}
        </span>
        <span className="ml-auto font-mono text-[10px] tabular-nums leading-none text-[var(--hl-ink-3)]">
          {totalChanges}
        </span>
      </div>

      {/* 條目 */}
      <div className="px-4 py-3">
        {previewChanges.map((change) => (
          <div key={`${section.version}-${change.title}`} className="mb-2.5 last:mb-0">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="min-w-0 truncate text-[12.5px] font-medium text-[var(--hl-ink)]">
                {change.title}
              </span>
              <span className="h-px flex-1 bg-[var(--hl-line)]" />
            </div>
            <ChangelogChangeBlock title={change.title} items={change.items} index={0} />
          </div>
        ))}
      </div>
    </section>
  );
}
