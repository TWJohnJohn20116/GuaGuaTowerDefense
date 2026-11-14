// 更新日誌 · 版本卡（HARDLINE：左側 mono 版本號 + 右側變更條目）
import { AnimatePresence, motion } from 'framer-motion';
import type { ChangeSection } from '@/components/changelog';
import { ChevronDownIcon } from '@/components/ui/Icons';
import { ChangelogChangeBlock } from '@/components/scenes/changelog-scene/ChangelogChangeBlock';
import {
  countSectionItems, getVersionType, VERSION_TYPE_STYLE,
} from '@/components/scenes/changelog-scene/changelogUtils';
import { Num } from '@/components/hl';

interface ChangelogVersionCardProps {
  section: ChangeSection;
  isExpanded: boolean;
  isLatest: boolean;
  onToggle: () => void;
  index: number;
}

export function ChangelogVersionCard({
  section, isExpanded, isLatest, onToggle,
}: ChangelogVersionCardProps) {
  const versionType = getVersionType(section.version);
  const style = VERSION_TYPE_STYLE[versionType];
  const totalChanges = countSectionItems(section);

  return (
    <article
      className={[
        'grid grid-cols-1 border bg-[var(--arc-deck)] sm:grid-cols-[148px_1fr]',
        isLatest ? 'border-[var(--arc-gold)]' : 'border-[var(--cn-line-soft)]',
      ].join(' ')}
    >
      {/* 左：mono 版本號 */}
      <button
        type="button"
        onClick={onToggle}
        className="flex flex-row items-center gap-3 border-b border-[var(--cn-line-soft)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--arc-deck-2)] sm:flex-col sm:items-start sm:border-b-0 sm:border-r"
      >
        <Num
          value={`v${section.version}`}
          tone="ink"
          size="md"
          className="leading-none"
        />
        <Num
          value={section.date}
          tone="muted"
          size="sm"
          className="font-mono tabular-nums leading-none"
        />
        <span className="flex items-center gap-1.5">
          <span className={`border ${style.border} px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] ${style.tone}`}>
            {style.label}
          </span>
          <Num
            value={totalChanges}
            tone="muted"
            size="sm"
            className="font-mono tabular-nums leading-none"
          />
        </span>
        <span className="ml-auto flex items-center gap-1 sm:ml-0">
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.16 }}
            className="text-[var(--arc-ink-4)]"
          >
            <ChevronDownIcon className="h-3.5 w-3.5" />
          </motion.span>
        </span>
      </button>

      {/* 右：變更條目 */}
      <div className="min-w-0 px-3 py-2.5">
        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="space-y-2.5">
                {section.changes.map((change, changeIndex) => (
                  <div key={change.title}>
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="arc-label">{String(changeIndex + 1).padStart(2, '0')}</span>
                      <span className="min-w-0 truncate text-[12px] font-medium text-[var(--arc-ink-2)]">
                        {change.title}
                      </span>
                      <span className="h-px flex-1 bg-[var(--arc-line)]" />
                    </div>
                    <ChangelogChangeBlock title={change.title} items={change.items} index={changeIndex} />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap items-center gap-x-2 gap-y-1"
            >
              {section.changes.map((change) => (
                <span key={change.title} className="border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--arc-ink-3)]">
                  {change.title}
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}
