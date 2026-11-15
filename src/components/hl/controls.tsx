/**
 * CANDY POP · 控件
 *
 * 按鈕是厚實的糖果鍵：3px 墨線外框、底部 4px 實心投影，按下去整顆下沉。
 * 尺寸比上一版大一級——遊戲的按鈕就是要好按。
 */
import { forwardRef } from 'react';
import type React from 'react';
import { playUiHover } from '@/services/audioService';

type Variant = 'signal' | 'line' | 'ghost' | 'danger' | 'quiet';
type Size = 'sm' | 'md' | 'lg';

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[12.5px] rounded-[11px]',
  md: 'h-11 px-5 text-[14px]',
  lg: 'h-12 px-7 text-[15px] rounded-[18px]',
};

/**
 * 立體厚度只在「有實體邊框」的變體上出現。
 * ghost 的 CSS 用 box-shadow:none 關掉厚度，但 Tailwind 的陰影工具類會蓋回去，
 * 結果 ghost 按鈕下面浮著一條沒有按鈕本體的深色橫條（實機回報「很怪」）。
 */
const SIZE_SHADOW: Record<Size, string> = {
  sm: 'shadow-[0_3px_0_var(--cn-line)]',
  md: '',
  lg: 'shadow-[0_6px_0_var(--cn-line)]',
};

const VARIANT: Record<Variant, string> = {
  signal: 'arc-btn--gold',
  line: '',
  ghost: 'arc-btn--ghost',
  danger: 'arc-btn--danger',
  quiet: '',
};

interface BtnProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: React.ReactNode;
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
        'arc-btn whitespace-nowrap',
        SIZE[size],
        variant === 'ghost' ? '' : SIZE_SHADOW[size],
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
        <span className="ml-1 rounded-[7px] border-2 border-[var(--cn-line)] bg-[var(--cn-sun)] px-1.5 py-0.5 font-mono text-[10px] font-extrabold leading-none text-[var(--cn-on-sun)]">
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
      data-active={active ? 'true' : 'false'}
      className={`arc-chip ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}


/* ------------------------------------------------------------------ Input */

/**
 * 單行輸入框：原生 input 的屬性全部直通，只補 CANDY 外觀。
 * 需要錯誤態時傳 invalid。
 */
export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(({ className = '', invalid = false, ...rest }, ref) => (
  <input
    ref={ref}
    {...rest}
    className={[
      'arc-field',
      invalid ? 'border-[var(--cn-alert)] shadow-[0_0_0_4px_var(--cn-alert-soft)]' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  />
));
Input.displayName = 'Input';

/* ---------------------------------------------------------------- IconBtn */

/**
 * 圖示鍵：方形可點區，不做立體厚邊（會把 24–32px 的圖示撐壞）。
 * label 會變成 aria-label，必填。
 */
export function IconBtn({
  label,
  className = '',
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={[
        'inline-flex items-center justify-center rounded-[12px] text-[var(--cn-ink-2)]',
        'transition-[background-color,color,transform] duration-100 hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)]',
        'active:translate-y-px disabled:pointer-events-none disabled:opacity-40',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
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
      className="arc-switch disabled:opacity-40"
      data-on={on ? 'true' : 'false'}
    />
  );
}
