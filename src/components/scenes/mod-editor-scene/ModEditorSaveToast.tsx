/**
 * Mod 編輯器 · 儲存結果列 — HARDLINE
 *
 * 不用縮放動畫，只用 1px 線 + 位移式揭示。
 */
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, WarningIcon } from '@/components/ui/Icons';

interface SaveToastMessage {
  type: 'success' | 'error';
  text: string;
}

interface ModEditorSaveToastProps {
  message: SaveToastMessage | null;
  onDismiss?: () => void;
  autoHideMs?: number;
}

export function ModEditorSaveToast({
  message,
  onDismiss,
  autoHideMs = 3200,
}: ModEditorSaveToastProps) {
  useEffect(() => {
    if (!message || !onDismiss) return;
    const t = setTimeout(onDismiss, autoHideMs);
    return () => clearTimeout(t);
  }, [message, onDismiss, autoHideMs]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className={[
            'absolute left-1/2 top-3 z-50 -translate-x-1/2 border px-3 py-1.5',
            message.type === 'success'
              ? 'border-[rgba(53,224,138,0.38)] bg-[rgba(53,224,138,0.12)]'
              : 'border-[rgba(255,61,113,0.38)] bg-[rgba(255,61,113,0.12)]',
          ].join(' ')}
        >
          <span className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckIcon className="h-3.5 w-3.5 text-[var(--arc-vital)]" />
            ) : (
              <WarningIcon className="h-3.5 w-3.5 text-[var(--arc-alert)]" />
            )}
            <span
              className={[
                'font-mono text-[10.5px] uppercase tracking-[0.06em]',
                message.type === 'success' ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-alert)]',
              ].join(' ')}
            >
              {message.text}
            </span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
