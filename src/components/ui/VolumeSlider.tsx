/**
 * 音量滑桿（設定頁與暫停選單共用）
 */

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Num } from '@/components/hl';

interface VolumeSliderProps {
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
          <span className="arc-label text-[11px] font-bold tracking-widest text-[var(--arc-ink-3)] uppercase">{label}</span>
        </div>
        <Num
          value={percentage}
          unit="%"
          size="sm"
          tone="ink"
          className="rounded-sm font-mono font-bold tracking-widest bg-[var(--cn-card-2)] px-2 py-0.5   border-[3px] border-[var(--cn-line-soft)]"
        />
      </div>
      <div className="relative h-2.5 rounded-sm bg-[var(--cn-card-2)]  overflow-hidden border-[3px] border-[var(--cn-line-soft)] ">
        <motion.div
          className="absolute inset-y-0 left-0 bg-nordic-primary  shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]"
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
