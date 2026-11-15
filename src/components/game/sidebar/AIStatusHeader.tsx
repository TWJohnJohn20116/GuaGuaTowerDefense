import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import {
  SearchIcon, UpArrowIcon, ConstructionIcon, LightningIcon, SkipForwardIcon,
  ChevronUpIcon, ChevronDownIcon,
} from '@/components/ui/Icons';
import { Dot } from '@/components/hl';
import { BD_LABEL, BD_SHEET } from '../hudBoard';

/**
 * AI 自動戰鬥狀態（豎排標籤）
 *
 * 收起時與「戰場情報」標籤同款：32px 寬的豎排小卡，一眼看到 AI 正在運作。
 * 點開才是紙卡浮層，顯示最近一條決策與它的思考步驟。
 */
export const AIStatusHeader = () => {
  const { t } = useTranslation();
  const autoBattleEnabled = useGameStore((s) => s.autoBattleEnabled);
  const latestLog = useGameStore((s) => s.autoBattleLogs[0]);
  const [open, setOpen] = useState(false);
  const [thinkingCollapsed, setThinkingCollapsed] = useState(true);

  if (!autoBattleEnabled) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.game.aiActive}
        className="pointer-events-auto flex h-24 w-8 flex-col items-center justify-center gap-1.5 rounded-[var(--cn-r-sm)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] text-[var(--cn-ink-2)] shadow-[0_4px_0_var(--cn-line)] transition-[transform,box-shadow] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
      >
        <span
          className="font-mono text-[9px] font-extrabold uppercase tracking-[0.22em]"
          style={{ writingMode: 'vertical-rl' }}
        >
          {t.game.aiActive}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--cn-sky)]" />
      </button>
    );
  }

  return (
    <div className={`${BD_SHEET} pointer-events-auto w-full overflow-hidden`}>
      <header className="flex items-center gap-2 border-b-[3px] border-[var(--cn-line-soft)] px-2.5 py-1.5">
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

      <div className="px-2.5 py-1.5">
        {latestLog ? (
          <div className="flex items-center gap-1.5">
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[var(--cn-ink-3)]">
              {latestLog.type === 'place' ? <ConstructionIcon className="h-3 w-3" /> : latestLog.type === 'upgrade' ? <UpArrowIcon className="h-3 w-3" /> : latestLog.type === 'skill' ? <LightningIcon className="h-3 w-3" /> : latestLog.type === 'skip' ? <SkipForwardIcon className="h-3 w-3" /> : <SearchIcon className="h-3 w-3" />}
            </span>
            <span className="truncate font-mono text-[9.5px] text-[var(--cn-ink-2)]">{latestLog.message}</span>
            {latestLog.thinking && latestLog.thinking.length > 0 && (
              <button
                type="button"
                className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[2px] border-[var(--cn-line-soft)] text-[var(--cn-ink-4)] transition-colors hover:border-[var(--cn-line)] hover:text-[var(--cn-ink)]"
                onClick={() => setThinkingCollapsed(!thinkingCollapsed)}
                aria-expanded={!thinkingCollapsed}
              >
                {thinkingCollapsed ? <ChevronDownIcon className="h-2.5 w-2.5" /> : <ChevronUpIcon className="h-2.5 w-2.5" />}
              </button>
            )}
          </div>
        ) : (
          <p className="font-mono text-[9.5px] text-[var(--cn-ink-4)]">{t.game.aiActive}</p>
        )}

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
                    className="flex items-start gap-1.5 font-mono text-[9px] text-[var(--cn-ink-3)]"
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
    </div>
  );
};
