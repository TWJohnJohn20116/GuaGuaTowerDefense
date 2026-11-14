/**
 * 設定 · 滑桿（CANDY POP）
 *
 * 圓頭軌道、珊瑚填充、白色圓形 thumb。與自訂難度滑桿同一組視覺，
 * 讓「拖動一條值」在全站看起來是同一個控件。
 */

import type { ReactNode } from 'react';
import { playUiHover } from '@/services/audioService';

interface SettingsSliderProps {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  /** 右側顯示值；預設以百分比顯示 0–1 的比例 */
  display?: string;
}

export function SettingsSlider({
  value,
  onChange,
  disabled = false,
  icon,
  label,
  display,
}: SettingsSliderProps) {
  const percentage = Math.round(Math.max(0, Math.min(1, value)) * 100);

  return (
    <div className={`flex flex-col gap-2 ${disabled ? 'opacity-45' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1.5">
          {icon && (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--cn-ink-3)]">
              {icon}
            </span>
          )}
          <span className="arc-label truncate">{label}</span>
        </span>
        <span className="shrink-0 rounded-full border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-2 py-0.5 font-mono text-[11px] font-extrabold tabular-nums text-[var(--cn-ink-2)]">
          {display ?? `${percentage}%`}
        </span>
      </div>

      <div className="relative h-6">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card-2)]">
          <div
            className="h-full rounded-full bg-[var(--cn-coral)] transition-[width] duration-100 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          disabled={disabled}
          aria-label={label}
          onMouseEnter={() => playUiHover()}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed
            [&::-webkit-slider-runnable-track]:h-6 [&::-webkit-slider-runnable-track]:bg-transparent
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px]
            [&::-webkit-slider-thumb]:border-[var(--cn-line)] [&::-webkit-slider-thumb]:bg-[var(--cn-card)]
            [&::-webkit-slider-thumb]:mt-[-3px]
            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-[var(--cn-line)]
            [&::-moz-range-thumb]:bg-[var(--cn-card)]
            [&::-moz-range-track]:h-6 [&::-moz-range-track]:bg-transparent"
        />
      </div>
    </div>
  );
}

export default SettingsSlider;
