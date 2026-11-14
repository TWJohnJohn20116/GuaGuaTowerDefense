/**
 * 音量滑桿（設定頁與暫停選單共用）
 */

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface VolumeSliderProps {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
}

export function VolumeSlider({
  value,
  onChange,
  disabled = false,
  icon,
  label,
}: VolumeSliderProps) {
  const percentage = Math.round(value * 100);

  return (
    <div className={`space-y-2 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
          <span className="text-[11px] font-bold tracking-widest text-[var(--hl-ink-3)] uppercase">{label}</span>
        </div>
        <span className="text-[11px] font-mono font-bold tracking-widest text-[var(--hl-ink-2)] bg-black/40 px-2 py-0.5   border border-[var(--hl-line)]">
          {percentage}%
        </span>
      </div>
      <div className="relative h-2.5 bg-black/40  overflow-hidden border border-[var(--hl-line)] ">
        <motion.div
          className="absolute inset-y-0 left-0 bg-nordic-primary  shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.1 }}
        />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default VolumeSlider;
