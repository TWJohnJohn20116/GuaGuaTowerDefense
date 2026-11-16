import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { Dot } from '@/components/hl';
import { BD_LABEL, BD_SHEET } from '../hudBoard';
import { FADE_OUT, SPRING_POP, SPRING_SNAPPY } from '@/utils/motionTokens';
import { formatNarration } from '../autobattle/formatNarration';

/**
 * AI 自動戰鬥狀態（標籤 → 置中彈出）
 *
 * 收起時是右側豎排小卡；展開時顯示「最新一筆決策 + 前五名候選」。
 * 完整推理（因子分解、時間軸、曲線、規則）在 AutoBattlePanel，這裡只給一眼可见的結論。
 */
export const AIStatusHeader = () => {
  const { t } = useTranslation();
  const autoBattleEnabled = useGameStore((s) => s.autoBattleEnabled);
  const latest = useGameStore((s) => s.autoBattleDecisions[0]);
  const openPanel = useGameStore((s) => s.setAutoBattlePanelOpen);
  const [open, setOpen] = useState(false);

  if (!autoBattleEnabled) return null;

  const c = t.content.autoBattle;
  const narration = latest
    ? formatNarration((c.narration as Record<string, string>)[latest.narrationKey.split('.').pop() ?? ''] ?? '', latest.narrationParams)
    : '';

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
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.22em]" style={{ writingMode: 'vertical-rl' }}>
            {t.game.aiActive}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--cn-sky)]" />
        </motion.button>
      ) : (
        <motion.div key="ai-layer" className="pointer-events-none fixed inset-0 z-[9996] flex items-center justify-center p-4">
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
            className={`${BD_SHEET} pointer-events-auto relative flex min-h-[220px] max-h-[76vh] w-[min(92vw,560px)] flex-col overflow-hidden`}
          >
            <header className="flex items-center gap-2 border-b-[3px] border-[var(--cn-line-soft)] px-3 py-2">
              <Dot tone="signal" pulse />
              <span className={`${BD_LABEL} text-[var(--cn-accent-text)]`}>{c.title}</span>
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
              {latest ? (
                <>
                  <p className="mb-1 font-mono text-[10px] text-[var(--cn-ink-3)]">
                    W{latest.snapshot.wave} · {c.verdict[latest.verdict]}
                  </p>
                  <p className="mb-2 text-[12px] leading-snug text-[var(--cn-ink)]">{narration}</p>
                  <ul className="space-y-1">
                    {latest.candidates.map((cand) => (
                      <li key={cand.id} className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-[10px] text-[var(--cn-ink-2)]">{c.action[cand.kind]}</span>
                        <span className="h-1 flex-1 overflow-hidden rounded bg-[var(--cn-line-soft)]">
                          <span className="block h-full bg-[var(--cn-sky)]" style={{ width: `${Math.min(100, Math.round(cand.total * 100))}%` }} />
                        </span>
                        <span className="w-6 text-right font-mono text-[9.5px] tabular-nums text-[var(--cn-ink-3)]">
                          {Math.round(cand.total * 100)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="font-mono text-[11px] text-[var(--cn-ink-3)]">{c.empty.noDecision}</p>
              )}
            </div>

            <footer className="border-t border-[var(--cn-line-soft)] px-3 py-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openPanel(true);
                }}
                className="w-full rounded-[var(--cn-r-sm)] border-[2px] border-[var(--cn-line)] bg-[var(--cn-card)] px-2 py-1.5 text-[11px] font-bold text-[var(--cn-ink)]"
              >
                {c.open}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
