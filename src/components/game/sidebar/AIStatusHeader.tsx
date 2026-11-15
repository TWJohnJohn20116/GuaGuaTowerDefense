import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import {
  SearchIcon, UpArrowIcon, ConstructionIcon, LightningIcon, SkipForwardIcon,
  ChevronUpIcon, ChevronDownIcon,
} from '@/components/ui/Icons';
import { Dot } from '@/components/hl';
import { BD_LABEL, BD_SHEET } from '../hudBoard';
import { FADE_OUT, SPRING_POP, SPRING_SNAPPY } from '@/utils/motionTokens';

/**
 * AI 自動戰鬥狀態（標籤 → 置中彈出）
 *
 * 與情報標籤同款：收起是右側豎排小卡，點開時紙卡從標籤方向飛到畫面中央，
 * 帶回彈；關閉時反向飛回並淡出。
 */
export const AIStatusHeader = () => {
  const { t } = useTranslation();
  const autoBattleEnabled = useGameStore((s) => s.autoBattleEnabled);
  const latestLog = useGameStore((s) => s.autoBattleLogs[0]);
  const [open, setOpen] = useState(false);
  const [thinkingCollapsed, setThinkingCollapsed] = useState(true);

  if (!autoBattleEnabled) return null;

  return (
    <AnimatePresence initial={false}>
      {!open ? (
        <motion.button
          key="ai-tab"
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.game.aiActive}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85, transition: FADE_OUT }}
          transition={SPRING_SNAPPY}
          className="pointer-events-auto flex h-24 w-8 flex-col items-center justify-center gap-1.5 rounded-[var(--cn-r-sm)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] text-[var(--cn-ink-2)] shadow-[0_4px_0_var(--cn-line)] transition-[transform,box-shadow] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
        >
          <span
            className="font-mono text-[9px] font-extrabold uppercase tracking-[0.22em]"
            style={{ writingMode: 'vertical-rl' }}
          >
            {t.game.aiActive}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--cn-sky)]" />
        </motion.button>
      ) : (
        <motion.div
          key="ai-layer"
          className="pointer-events-none fixed inset-0 z-[9996] flex items-center justify-center p-4"
        >
          <motion.button
            type="button"
            aria-label={t.common.close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: FADE_OUT }}
            transition={{ duration: 0.16 }}
            onClick={() => setOpen(false)}
            className="pointer-events-auto absolute inset-0 bg-[rgba(46,36,64,0.38)]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.42, x: 220, y: 140, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 200, y: 130, rotate: -2, transition: FADE_OUT }}
            transition={SPRING_POP}
            className={`${BD_SHEET} pointer-events-auto relative flex max-h-[70vh] w-[320px] flex-col overflow-hidden`}
          >
            <header className="flex items-center gap-2 border-b-[3px] border-[var(--cn-line-soft)] px-3 py-2">
              <Dot tone="signal" pulse />
              <span className={`${BD_LABEL} text-[var(--cn-accent-text)]`}>{t.game.aiActive}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.common.close}
                className="ml-auto flex h-6 w-6 items-center justify-center rounded-full border-[2px] border-[var(--cn-line)] text-[var(--cn-ink-3)] transition-colors hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)]"
              >
                <span className="text-[11px] font-extrabold leading-none">×</span>
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
              {latestLog ? (
                <div className="flex items-center gap-1.5">
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[var(--cn-ink-3)]">
                    {latestLog.type === 'place' ? <ConstructionIcon className="h-3 w-3" /> : latestLog.type === 'upgrade' ? <UpArrowIcon className="h-3 w-3" /> : latestLog.type === 'skill' ? <LightningIcon className="h-3 w-3" /> : latestLog.type === 'skip' ? <SkipForwardIcon className="h-3 w-3" /> : <SearchIcon className="h-3 w-3" />}
                  </span>
                  <span className="truncate font-mono text-[10px] text-[var(--cn-ink-2)]">{latestLog.message}</span>
                  {latestLog.thinking && latestLog.thinking.length > 0 && (
                    <button
                      type="button"
                      className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[2px] border-[var(--cn-line-soft)] text-[var(--cn-ink-4)] transition-colors hover:border-[var(--cn-line)] hover:text-[var(--cn-ink)]"
                      onClick={() => setThinkingCollapsed(!thinkingCollapsed)}
                      aria-expanded={!thinkingCollapsed}
                    >
                      {thinkingCollapsed ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronUpIcon className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              ) : (
                <p className="font-mono text-[10px] text-[var(--cn-ink-4)]">{t.game.aiActive}</p>
              )}

              <AnimatePresence initial={false}>
                {!thinkingCollapsed && latestLog?.thinking && latestLog.thinking.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, transition: FADE_OUT }}
                    transition={{ duration: 0.16 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 max-h-40 space-y-1 overflow-y-auto border-l-2 border-[var(--cn-sky)] pl-2">
                      {latestLog.thinking.slice(0, 8).map((step, i) => (
                        <div
                          key={`${latestLog.id}-${i}`}
                          className="flex items-start gap-1.5 font-mono text-[9.5px] text-[var(--cn-ink-3)]"
                        >
                          <span className="shrink-0 text-[var(--cn-ink-4)]">{'>'}</span>
                          <span className="truncate">{step}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
