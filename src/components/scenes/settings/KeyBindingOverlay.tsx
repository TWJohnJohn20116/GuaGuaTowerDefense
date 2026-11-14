/**
 * 設定 - 鍵盤綁定捕獲遮罩（HARDLINE Modal）
 *
 * 遮罩 + 一張置中 Deck notch；按鈕直向全寬。
 * 不做脈衝光暈、不做旋轉圖示：等待狀態只靠一條訊號色虛線。
 */

import { useEffect, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PointerIcon } from '@/components/ui/Icons';
import { SceneModal } from '@/components/ui/SceneModal';
import { Btn, Deck, Key } from '@/components/hl';
import type { KeyAction } from '@/types/game';

interface KeyBindingOverlayProps {
  open: boolean;
  action: KeyAction | null;
  label?: string;
  icon?: ReactNode;
  pressKeyText: string;
  waitingText: string;
  cancelText: string;
  onCapture: (action: KeyAction, key: string) => void;
  onClose: () => void;
}

export function KeyBindingOverlay({
  open,
  action,
  label,
  icon,
  pressKeyText,
  waitingText,
  cancelText,
  onCapture,
  onClose,
}: KeyBindingOverlayProps) {
  useEffect(() => {
    if (!open || !action) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        onClose();
        return;
      }
      onCapture(action, e.code);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, action, onCapture, onClose]);

  return (
    <AnimatePresence>
      {open && action && (
        <SceneModal
          onClose={onClose}
          maxWidth="max-w-[420px]"
          variant="solid"
          panelClassName="p-0"
          zIndex="z-50"
          padding="p-4"
        >
          <Deck notch tone="bare" className="flex flex-col border-0">
            <div className="flex items-center gap-2.5 border-b border-[var(--cn-line-soft)] px-4 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-2)]">
                {icon}
              </span>
              <span className="arc-label text-[var(--arc-ink-2)]">{label}</span>
            </div>

            <div className="flex flex-col gap-3 px-4 py-4">
              <p className="text-[11.5px] leading-relaxed text-[var(--arc-ink-3)]">{pressKeyText}</p>

              <div className="flex h-14 items-center justify-center border border-dashed border-[var(--arc-gold-edge)] bg-[var(--arc-void-2)]">
                <span className="font-mono text-[13px] font-semibold tracking-[0.08em] text-[var(--arc-gold)]">
                  {waitingText}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[var(--arc-ink-4)]">
                <PointerIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="font-mono text-[10px] uppercase tracking-[0.08em]">{cancelText}</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <Key>esc</Key>
                </span>
              </div>
            </div>

            <div className="border-t border-[var(--cn-line-soft)] p-3">
              <Btn variant="line" block onClick={onClose}>
                {cancelText}
              </Btn>
            </div>
          </Deck>
        </SceneModal>
      )}
    </AnimatePresence>
  );
}

export default KeyBindingOverlay;
