import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { LOADING_TIP_CLASS, nextLoadingTipIndex, visibleLoadingTip } from '@/data/loadingTips';

interface LoadingProps {
  message?: string;
  progress?: number;
}

/**
 * 載入畫面 — HARDLINE
 * 一條 1px 軌道 + mono 百分比，沒有光暈、沒有漸層、沒有圓角。
 */
export default function Loading({ message, progress }: LoadingProps) {
  const { t } = useTranslation();
  const tips = t.game.loadingTips;
  const showTips = useSettingsStore((s) => s.gameplay.showTips);
  const [tipIndex, setTipIndex] = useState(0);
  const displayMessage = message ?? t.common.loading;
  const tipText = visibleLoadingTip(tips, showTips ? tipIndex : 0, showTips);

  useEffect(() => {
    if (!showTips || tips.length === 0) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => nextLoadingTipIndex(prev, tips.length));
    }, 3000);
    return () => clearInterval(interval);
  }, [showTips, tips.length]);

  return (
    <div className="hl-grid-bg relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[var(--hl-void)] font-sans">
      <div className="relative flex w-[320px] flex-col gap-3">
        {/* 標籤列 */}
        <div className="flex items-baseline justify-between border-b border-[var(--hl-line)] pb-2">
          <span className="hl-label">system / load</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
            {displayMessage}
          </span>
        </div>

        {/* 逐格掃動的儀表刻度 */}
        <div className="flex items-end gap-1" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.span
              key={i}
              className="block h-3 w-full bg-[var(--hl-line)]"
              animate={{ backgroundColor: ['#222831', '#333b47', '#222831'] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.055, ease: 'linear' }}
            />
          ))}
        </div>

        {/* 進度軌道 */}
        <div className="relative h-[3px] w-full overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
          {progress !== undefined ? (
            <motion.span
              className="absolute inset-y-0 left-0 block bg-[var(--hl-signal)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <motion.span
              className="absolute inset-y-0 block w-1/3 bg-[var(--hl-signal)]"
              animate={{ left: ['-35%', '100%'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>

        <div className="flex items-baseline justify-between">
          <span className="hl-label">{displayMessage}</span>
          {progress !== undefined && (
            <span className="font-mono text-[15px] font-semibold tabular-nums leading-none text-[var(--hl-signal)]">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      </div>

      {/* 循環提示 */}
      <div className={`absolute bottom-16 flex h-8 items-center justify-center px-6 ${LOADING_TIP_CLASS}`}>
        <AnimatePresence mode="wait">
          {tipText ? (
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-xl border-l-2 border-[var(--hl-line-strong)] pl-3 text-center"
            >
              {tipText}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
