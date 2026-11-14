/**
 * HARDLINE · 控件
 *
 * 按鈕只有一個骨架：方角、右下切角、1px 線。差異只在「填什麼色」。
 */
import type React from 'react';
import { playUiHover } from '@/services/audioService';

type Variant = 'signal' | 'line' | 'ghost' | 'danger' | 'quiet';
type Size = 'sm' | 'md' | 'lg';

const SIZE: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-[11.5px]',
  md: 'h-9 px-3.5 text-[12.5px]',
  lg: 'h-11 px-5 text-[13.5px]',
};

const VARIANT: Record<Variant, string> = {
  signal:
    'bg-[var(--hl-signal)] border-[var(--hl-signal)] text-[var(--hl-signal-ink)] hover:bg-[#e6ff74] hover:border-[#e6ff74] font-semibold',
  line:
    'bg-transparent border-[var(--hl-line-strong)] text-[var(--hl-ink-2)] hover:bg-[var(--hl-deck-2)] hover:text-[var(--hl-ink)] hover:border-[var(--hl-line-hot)]',
  ghost:
    'bg-transparent border-transparent text-[var(--hl-ink-2)] hover:bg-[var(--hl-deck-2)] hover:text-[var(--hl-ink)]',
  danger:
    'bg-transparent border-[rgba(255,75,62,0.4)] text-[var(--hl-alarm)] hover:bg-[rgba(255,75,62,0.1)] hover:border-[var(--hl-alarm)]',
  quiet:
    'bg-[var(--hl-deck-2)] border-[var(--hl-line)] text-[var(--hl-ink)] hover:bg-[var(--hl-deck-3)] hover:border-[var(--hl-line-hot)]',
};

export interface BtnProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: React.ReactNode;
  /** 右側鍵位，例如 "P" */
  kbd?: string;
  className?: string;
}

export function Btn({
  variant = 'quiet',
  size = 'md',
  block = false,
  icon,
  kbd,
  className = '',
  children,
  onMouseEnter,
  ...rest
}: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      onMouseEnter={(e) => {
        playUiHover();
        onMouseEnter?.(e);
      }}
      className={[
        'hl-btn-cut inline-flex items-center justify-center gap-2 whitespace-nowrap border font-medium',
        'transition-colors duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-35',
        SIZE[size],
        VARIANT[variant],
        block ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon}
      {children}
      {kbd && (
        <span
          className={`ml-1 border px-1 font-mono text-[10px] leading-[14px] ${
            variant === 'signal'
              ? 'border-black/25 text-black/60'
              : 'border-[var(--hl-line-strong)] text-[var(--hl-ink-3)]'
          }`}
        >
          {kbd}
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ Chip */

export function Chip({
  active = false,
  onClick,
  children,
  icon,
  className = '',
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex h-7 items-center gap-1.5 border px-2.5 font-mono text-[11px] transition-colors duration-150',
        active
          ? 'border-[var(--hl-signal)] bg-[var(--hl-signal)] font-semibold text-[var(--hl-signal-ink)]'
          : 'border-[var(--hl-line)] bg-transparent text-[var(--hl-ink-2)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]',
        className,
      ].join(' ')}
    >
      {icon}
      {children}
    </button>
  );
}

/* -------------------------------------------------------------- IndexRow */

/**
 * 索引列：主選單與所有清單的統一列型。
 * 左邊 mono 編號（01、02…），中間標題 + 副文，右邊狀態。
 */
export function IndexRow({
  index,
  title,
  desc,
  right,
  disabled = false,
  onClick,
}: {
  index: string | number;
  title: React.ReactNode;
  desc?: React.ReactNode;
  right?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => playUiHover()}
      className="group grid w-full grid-cols-[38px_1fr_auto] items-center gap-3 border-b border-[var(--hl-line)] px-2 py-3 text-left transition-colors duration-150 last:border-b-0 hover:bg-[var(--hl-deck-2)] disabled:pointer-events-none disabled:opacity-30"
    >
      <span className="font-mono text-[10px] tracking-wider text-[var(--hl-ink-4)] group-hover:text-[var(--hl-signal)]">
        {String(index).padStart(2, '0')}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13.5px] font-medium text-[var(--hl-ink)]">{title}</span>
        {desc && <span className="mt-0.5 block truncate text-[11px] text-[var(--hl-ink-3)]">{desc}</span>}
      </span>
      <span className="flex items-center gap-2 text-[var(--hl-ink-3)] group-hover:text-[var(--hl-ink-2)]">
        {right}
      </span>
    </button>
  );
}

/* --------------------------------------------------------------- Toggle */

export function Toggle({
  on,
  onChange,
  disabled = false,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className="hl-switch disabled:opacity-35"
      data-on={on ? 'true' : 'false'}
    />
  );
}
