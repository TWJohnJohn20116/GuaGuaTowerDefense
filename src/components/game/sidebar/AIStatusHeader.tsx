import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import {
  SearchIcon, UpArrowIcon, ConstructionIcon, LightningIcon, SkipForwardIcon,
  ChevronUpIcon, ChevronDownIcon,
} from '@/components/ui/Icons';
import { Dot } from '@/components/hl';

/**
 * 塔塢頂端的自動戰鬥狀態條（HARDLINE）
 * 1px 線 + 左緣訊號條；狀態點是方塊，不用發光圓點。
 */
export const AIStatusHeader = () => {
  const { t } = useTranslation();
  const autoBattleEnabled = useGameStore((s) => s.autoBattleEnabled);
  const latestLog = useGameStore((s) => s.autoBattleLogs[0]);
  const [thinkingCollapsed, setThinkingCollapsed] = useState(true);

  return (
    <AnimatePresence>
      {autoBattleEnabled && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="border-b-[3px] border-[var(--cn-line-soft)] border-l-[6px] border-l-[var(--cn-sky)] px-2.5 py-1.5">
            <div className="flex items-center gap-2">
              <Dot tone="signal" pulse />
              <span className="arc-label text-[var(--cn-accent-text)]">{t.game.aiActive}</span>

              {latestLog && (
                <span className="ml-auto flex min-w-0 items-center gap-1">
                  <span className="flex h-3 w-3 shrink-0 items-center justify-center text-[var(--arc-ink-3)]">
                    {latestLog.type === 'place' ? <ConstructionIcon className="h-3 w-3" /> : latestLog.type === 'upgrade' ? <UpArrowIcon className="h-3 w-3" /> : latestLog.type === 'skill' ? <LightningIcon className="h-3 w-3" /> : latestLog.type === 'skip' ? <SkipForwardIcon className="h-3 w-3" /> : <SearchIcon className="h-3 w-3" />}
                  </span>
                  <span className="truncate font-mono text-[9.5px] text-[var(--arc-ink-3)]">{latestLog.message}</span>
                </span>
              )}

              {latestLog?.thinking && latestLog.thinking.length > 0 && (
                <button
                  type="button"
                  className="arc-btn arc-btn--ghost flex h-4 w-4 shrink-0 items-center justify-center rounded-xs px-0 text-[var(--arc-ink-4)] hover:text-[var(--arc-ink-2)]"
                  onClick={() => setThinkingCollapsed(!thinkingCollapsed)}
                  aria-expanded={!thinkingCollapsed}
                >
                  {thinkingCollapsed ? <ChevronDownIcon className="h-2.5 w-2.5" /> : <ChevronUpIcon className="h-2.5 w-2.5" />}
                </button>
              )}
            </div>

            <AnimatePresence>
              {!thinkingCollapsed && latestLog?.thinking && latestLog.thinking.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1.5 max-h-32 space-y-0.5 overflow-y-auto border-l-2 border-[var(--cn-sky)] pl-2">
                    {latestLog.thinking.slice(0, 8).map((step, i) => (
                      <div
                        key={`${latestLog.id}-${i}`}
                        className="flex items-start gap-1.5 font-mono text-[9px] text-[var(--arc-ink-3)]"
                      >
                        <span className="shrink-0 text-[var(--arc-ink-4)]">{'>'}</span>
                        <span className="truncate">{step}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
