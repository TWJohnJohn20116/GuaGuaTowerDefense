/**
 * 可選列／卡：列表裡「點一下就選取」的容器。
 *
 * 為什麼要有這個原語：工坊各頁原本各寫一套 border／active 配色，
 * 同一種互動出現十種寫法（border-2／border-3／border-transparent 混用，
 * active 有 signal／sun／grape／line-mid／coral 五種色），改一處樣式要改十個檔。
 *
 * 職責邊界（刻意切乾淨，否則換頁就會走版）：
 *  - variant 只決定排版骨架（直的卡片／橫的列／無框的列內可點區），不含邊框與間距
 *  - tone 只決定 active／idle 的邊框顏色、底色、文字色
 *  - 間距、圓角、字級一律由呼叫端的 className 決定，維持各頁原本的密度
 */
import type { ReactNode } from 'react';

export type SelectableRowVariant = 'row' | 'card' | 'bare';
export type SelectableRowTone = 'signal' | 'signalSoft' | 'sun' | 'grape' | 'line' | 'coral';

export interface SelectableRowProps {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  variant?: SelectableRowVariant;
  /** active 的配色角色；各頁原本用的色不同，保留可選以免破壞既有視覺 */
  tone?: SelectableRowTone;
  className?: string;
  /** aria-label；沒有可見文字時必填 */
  label?: string;
  title?: string;
  disabled?: boolean;
}

/** 只給骨架，間距一律由呼叫端指定（避免兩個 gap 工具類互相覆蓋，結果取決於 CSS 順序） */
const VARIANT: Record<SelectableRowVariant, string> = {
  row: 'flex w-full items-center text-left',
  card: 'flex w-full flex-col text-left',
  /** 外層容器已有邊框時用這個：只保留「可點區」的排版，不畫框也不上底色 */
  bare: 'flex min-w-0 flex-1 items-center text-left',
};

const ACTIVE: Record<SelectableRowTone, string> = {
  signal: 'border-[var(--cn-signal-text)] bg-[var(--cn-card)]',
  signalSoft: 'border-[var(--cn-signal)] bg-[var(--cn-signal-soft)] text-[var(--cn-ink)]',
  sun: 'border-[var(--cn-line)] bg-[var(--cn-sun-soft)]',
  grape: 'border-[var(--cn-grape)] bg-[var(--cn-card-2)]',
  line: 'border-[var(--cn-line-mid)] bg-[var(--cn-card)] text-[var(--cn-ink)]',
  coral: 'border-[var(--cn-signal-text)] bg-[var(--cn-coral-soft)] text-[var(--cn-signal-text)]',
};

const IDLE: Record<SelectableRowTone, string> = {
  signal: 'border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] hover:border-[var(--cn-line)]',
  signalSoft: 'border-transparent text-[var(--cn-ink-2)] hover:border-[var(--cn-line-soft)]',
  sun: 'border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] hover:border-[var(--cn-line)]',
  grape: 'border-[var(--cn-line-soft)] bg-[var(--cn-card)] hover:border-[var(--cn-line)]',
  line: 'border-transparent text-[var(--cn-ink-2)] hover:bg-[var(--cn-card-2)]',
  coral: 'border-transparent bg-[var(--cn-card-2)] text-[var(--cn-ink-2)] hover:border-[var(--cn-line)]',
};

export function SelectableRow({
  active = false,
  onClick,
  children,
  variant = 'row',
  tone = 'signal',
  className = '',
  label,
  title,
  disabled = false,
}: SelectableRowProps) {
  const surface = variant === 'bare' ? '' : active ? ACTIVE[tone] : IDLE[tone];
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        VARIANT[variant],
        surface,
        'transition-colors duration-100 disabled:opacity-40',
        'outline-hidden focus-visible:ring-3 focus-visible:ring-[var(--cn-signal-text)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}
