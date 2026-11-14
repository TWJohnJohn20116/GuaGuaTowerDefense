/**
 * 場景頂部結果提示（商店購買、回放匯入匯出等）
 * HARDLINE：1px 線 + 左緣 2px 訊號條，mono 文字，無陰影與模糊。
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon } from './Icons';

export type SceneNoticeTone = 'success' | 'danger';

interface SceneNoticeToastProps {
  message: string | null;
  tone?: SceneNoticeTone;
}

export function SceneNoticeToast({
  message,
  tone = 'success',
}: SceneNoticeToastProps) {
  const success = tone === 'success';

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`fixed left-1/2 top-3 z-[200] -translate-x-1/2 arc-panel--flat border-l-2 px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.06em] ${
            success
              ? 'border-l-[var(--arc-vital)] text-[var(--arc-vital)]'
              : 'border-l-[var(--arc-alert)] text-[var(--arc-alert)]'
          }`}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          {success ? (
            <span className="flex items-center gap-2">
              <CheckIcon className="h-3.5 w-3.5" />
              {message}
            </span>
          ) : (
            message
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SceneNoticeToast;
