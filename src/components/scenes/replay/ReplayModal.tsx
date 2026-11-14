/**
 * 回放 · 對話框外殼（HARDLINE Modal 版面）
 * 遮罩 rgba(6,7,10,0.82) + 置中 Deck（左上切角），按鈕直向全寬。
 */
import type React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CrossIcon } from '@/components/ui/Icons';

export function ReplayModal({
  open,
  title,
  onClose,
  width = 'max-w-[420px]',
  children,
}: {
  open: boolean;
  title: React.ReactNode;
  onClose: () => void;
  width?: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="replay-modal"
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-[rgba(6,7,10,0.82)] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`arc-cut-tl w-full ${width} arc-panel`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--cn-line-soft)] px-4 py-2.5">
              <span className="arc-label truncate text-[var(--arc-ink-2)]">{title}</span>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 text-[var(--arc-ink-4)] transition-colors hover:text-[var(--arc-ink)]"
              >
                <CrossIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReplayModal;
