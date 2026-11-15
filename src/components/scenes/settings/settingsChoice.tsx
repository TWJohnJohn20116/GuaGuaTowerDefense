/**
 * 設定 · 選項按鈕群（CANDY POP）
 *
 * 只有兩種狀態：白底細框（未選）與珊瑚膜 + 珊瑚投影（選中）。
 * 這一組是設定頁唯一的「多選一」外觀，難度卡與波次方塊也用同一個視覺邏輯。
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
        'rounded-[var(--cn-r-sm)] border-[3px] font-mono text-[11px] font-bold transition-[background-color,border-color,color,box-shadow] duration-150',
        'disabled:pointer-events-none disabled:opacity-35',
        base,
        active
          ? 'border-[var(--cn-line)] bg-[var(--cn-coral-soft)] text-[var(--cn-signal-text)] shadow-[0_3px_0_var(--cn-coral-deep)]'
          : 'border-[var(--cn-line-soft)] bg-[var(--cn-card)] text-[var(--cn-ink-2)] hover:border-[var(--cn-line-mid)] hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}

/** 未選／選中的指示點 */
export function SettingsChoiceDot({ active }: { active: boolean }) {
  return (
    <span
      className={[
        'inline-block h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-150',
        active ? 'bg-[var(--cn-coral)]' : 'bg-[var(--cn-line-mid)]',
      ].join(' ')}
    />
  );
}
