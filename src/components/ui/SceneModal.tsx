/**
 * SceneModal - 場景統一模態框（HARDLINE）
 *
 * 遮罩 bg-[rgba(6,7,10,0.82)]，面板是一張 Deck（1px 線、實色底、左上切角），
 * 沒有陰影、沒有模糊、沒有圓角。
 * 搭配 AnimatePresence 使用；外層由呼叫端控制 open/exit。
 */

import type React from 'react';
import { motion } from 'framer-motion';
import { CrossIcon } from './Icons';

export type SceneModalVariant = 'glass' | 'solid';

export interface SceneModalProps {
  onClose: () => void;
  children: React.ReactNode;
  /** Tailwind max-width class，預設 max-w-5xl */
  maxWidth?: string;
  /** Tailwind max-height class，例如 max-h-[80vh] */
  maxHeight?: string;
  /** 外層 padding class */
  padding?: string;
  /** 面板額外 className（可覆蓋預設 padding） */
  panelClassName?: string;
  /** z-index class，預設 z-[9999] */
  zIndex?: string;
  /** solid：不捲動、內容自己管；glass：面板整體可捲動 */
  variant?: SceneModalVariant;
  /** fixed 全螢幕；absolute 用於編輯器內嵌遮罩 */
  position?: 'fixed' | 'absolute';
}

const BACKDROP = 'bg-[rgba(6,7,10,0.82)]';
const PANEL = 'border border-[var(--hl-line)] bg-[var(--hl-deck)] hl-cut-tl';

function panelBaseClasses(variant: SceneModalVariant) {
  if (variant === 'solid') {
    return `${PANEL} flex w-full flex-col overflow-hidden`;
  }
  return `${PANEL} w-full overflow-y-auto scrollbar-thin scrollbar-track-transparent`;
}

export function SceneModal({
  onClose,
  children,
  maxWidth = 'max-w-5xl',
  maxHeight = 'max-h-[90vh]',
  padding = 'p-4 md:p-8',
  panelClassName = 'p-6 md:p-8',
  zIndex = 'z-[9999]',
  variant = 'glass',
  position = 'fixed',
}: SceneModalProps) {
  const posClass = position === 'fixed' ? 'fixed inset-0' : 'absolute inset-0';

  return (
    <motion.div
      className={`${posClass} ${BACKDROP} ${zIndex} flex items-center justify-center ${padding}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`${panelBaseClasses(variant)} ${maxWidth} ${maxHeight} ${panelClassName}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.16 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export interface SceneModalHeaderProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  onClose: () => void;
  borderClass?: string;
  className?: string;
}

/** 對話框標題列：mono 小標 + 17px 標題 + 關閉 */
export function SceneModalHeader({
  title,
  icon,
  onClose,
  borderClass = 'border-[var(--hl-line)]',
  className = '',
}: SceneModalHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${borderClass} ${className}`}>
      <div className="flex min-w-0 items-center gap-2.5">
        {icon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-2)]">
            {icon}
          </span>
        )}
        <h3 className="truncate text-[17px] font-semibold leading-tight text-[var(--hl-ink)]">{title}</h3>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--hl-line-strong)] text-[var(--hl-ink-3)] transition-colors hover:border-[var(--hl-alarm)] hover:text-[var(--hl-alarm)]"
      >
        <CrossIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export interface SceneModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

/** 對話框可捲動內容區 */
export function SceneModalBody({ children, className = '' }: SceneModalBodyProps) {
  return (
    <div className={`min-h-0 flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-track-transparent ${className}`}>
      {children}
    </div>
  );
}

export interface SceneModalFooterProps {
  children: React.ReactNode;
  className?: string;
  borderClass?: string;
}

/** 對話框底部操作列 */
export function SceneModalFooter({
  children,
  className = '',
  borderClass = 'border-[var(--hl-line)]',
}: SceneModalFooterProps) {
  return (
    <div className={`flex gap-2 border-t px-4 py-3 ${borderClass} ${className}`}>
      {children}
    </div>
  );
}

export interface SceneModalCloseBarProps {
  onClose: () => void;
  label: string;
  className?: string;
}

/** 模態框右上角關閉列（詳情彈窗用） */
export function SceneModalCloseBar({ onClose, label, className = '' }: SceneModalCloseBarProps) {
  return (
    <div className={`mb-3 flex justify-end ${className}`}>
      <button
        type="button"
        onClick={onClose}
        className="border border-[var(--hl-line-strong)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)] transition-colors hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]"
      >
        {label}
      </button>
    </div>
  );
}

export default SceneModal;
