/**
 * 設定 · HARDLINE 滑桿
 *
 * 方角軌道、1px 線、訊號色填充與方形 thumb。
 * 只在設定場景使用（暫停選單有自己的滑桿元件）。
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
            <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--hl-ink-3)]">
              {icon}
            </span>
          )}
          <span className="hl-label truncate">{label}</span>
        </span>
        <span className="shrink-0 border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-[var(--hl-ink-2)]">
          {display ?? `${percentage}%`}
        </span>
      </div>

      <div className="relative h-4">
        {/* 軌道：1px 線 + 訊號填充 */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
          <div
            className="h-full bg-[var(--hl-signal)] transition-[width] duration-100 ease-out"
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
          onMouseEnter={() => playUiHover()}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed
            [&::-webkit-slider-runnable-track]:h-4 [&::-webkit-slider-runnable-track]:bg-transparent
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-[7px] [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--hl-signal)]
            [&::-webkit-slider-thumb]:bg-[var(--hl-signal)]
            [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-[7px] [&::-moz-range-thumb]:
            [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--hl-signal)]
            [&::-moz-range-track]:h-4 [&::-moz-range-track]:bg-transparent"
        />
      </div>
    </div>
  );
}

export default SettingsSlider;
