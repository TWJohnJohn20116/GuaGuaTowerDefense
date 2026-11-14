/**
 * 設定 · HARDLINE 選項按鈕群
 *
 * 只有兩種狀態：方框（未選）與訊號膜（選中）。全專案設定場景共用同一組。
 * 不引入分類色，避免一頁出現第二個主色。
 */

import type React from 'react';
import { playUiHover } from '@/services/audioService';

interface SettingsChoiceRowProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsChoiceRow({ children, className = '' }: SettingsChoiceRowProps) {
  return <div className={`flex w-full flex-wrap items-stretch gap-1.5 ${className}`}>{children}</div>;
}

interface SettingsChoiceButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  layout?: 'inline' | 'stack';
  className?: string;
  title?: string;
  disabled?: boolean;
}

export function SettingsChoiceButton({
  active,
  onClick,
  children,
  layout = 'inline',
  className = '',
  title,
  disabled = false,
}: SettingsChoiceButtonProps) {
  const base =
    layout === 'inline'
      ? 'flex min-w-0 flex-1 items-center justify-center gap-1.5 px-2.5 py-1.5'
      : 'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 py-2';

  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => playUiHover()}
      className={[
        'border font-mono text-[10.5px] transition-colors duration-150 disabled:pointer-events-none disabled:opacity-35',
        base,
        active
          ? 'border-[var(--arc-gold)] bg-[var(--arc-gold-veil)] font-semibold text-[var(--arc-gold)]'
          : 'border-[var(--cn-line-soft)] bg-transparent text-[var(--arc-ink-2)] hover:border-[var(--arc-line-hot)] hover:text-[var(--arc-ink)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}

/** 未選／選中的方塊指示點（方形，不用圓點） */
export function SettingsChoiceDot({ active }: { active: boolean }) {
  return (
    <span
      className={[
        'inline-block h-1.5 w-1.5 shrink-0 transition-colors duration-150',
        active ? 'bg-[var(--arc-gold)]' : 'bg-[var(--arc-line-hot)]',
      ].join(' ')}
    />
  );
}
