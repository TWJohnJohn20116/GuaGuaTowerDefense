/**
 * Mod 平衡 · 逐波威脅曲線圖
 *
 * 只用 1px 外框與方塊：無漸層、無發光、無圓角。
 */
import { motion } from 'framer-motion';
import { ChartIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { SegHead } from '@/components/hl';
import type { WaveThreatPoint } from './modBalanceAnalysis';

interface ModBalanceWaveChartProps {
  points: WaveThreatPoint[];
  className?: string;
}

export function ModBalanceWaveChart({ points, className = '' }: ModBalanceWaveChartProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  if (points.length === 0) return null;

  const maxThreat = Math.max(...points.map((p) => p.threat), 1);

  return (
    <div className={`space-y-2 ${className}`}>
      <SegHead
        label={
          <span className="flex items-center gap-1.5">
            <ChartIcon className="h-3 w-3" />
            {m.balWaveThreatChart}
          </span>
        }
      />
      <div className="max-h-48 space-y-1 overflow-y-auto pr-1 scrollbar-thin">
        {points.map((pt, idx) => {
          const width = (pt.threat / maxThreat) * 100;
          const isBoss = pt.hasBoss;
          return (
            <div key={`${pt.setId}-${pt.waveIndex}-${idx}`} className="flex items-center gap-2">
              <div
                className="w-14 truncate font-mono text-[10px] tabular-nums leading-none text-[var(--arc-ink-3)]"
                title={pt.label}
              >
                {pt.label}
              </div>
              <div className="relative h-3 flex-1 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
                <motion.div
                  className={`h-full ${isBoss ? 'bg-[var(--arc-caution)]' : 'bg-[var(--arc-reach)]'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.4, delay: idx * 0.03 }}
                />
              </div>
              <div className="w-9 text-right font-mono text-[10px] tabular-nums leading-none text-[var(--arc-ink-2)]">
                {pt.threat.toFixed(0)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
