import { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n';
import { LightningIcon } from '@/components/ui/Icons';
import { getSnapshot, isPerfEnabled, setPerfEnabled } from '@/utils/perfMonitor';
import type { PerfSnapshot } from '@/utils/perfMonitor';
import { DevInfoRow, DevSection, DevToggle } from './common';

/**
 * 即時效能面板
 *
 * 讀 perfMonitor 的每秒快照：FPS、各 stage 的 avg/max。取樣關閉時不跑 interval，
 * 也不顯示殘值（避免看到一小時前的數字誤判）。
 */
export function PerfSection() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(isPerfEnabled);
  const [snap, setSnap] = useState<PerfSnapshot>(getSnapshot);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setSnap(getSnapshot()), 1000);
    return () => clearInterval(id);
  }, [enabled]);

  const toggle = () => {
    const next = !enabled;
    setPerfEnabled(next);
    setEnabled(next);
    if (next) setSnap(getSnapshot());
  };

  const fps = snap.windowMs > 0 ? Math.round((snap.framesInWindow / snap.windowMs) * 1000) : 0;
  const stages = Object.entries(snap.stages);

  return (
    <DevSection
      title={t.dev.secLivePerf}
      icon={<LightningIcon className="h-3.5 w-3.5" />}
      accent="amber"
      keywords={['perf', 'fps', 'frame', '效能', '幀率', '監控']}
    >
      <DevToggle
        label={t.dev.perfSample}
        value={enabled}
        onChange={toggle}
        accent="amber"
        icon={<LightningIcon className="h-3.5 w-3.5" />}
      />
      {enabled && (
        <>
          <DevInfoRow label="FPS" value={fps} color={fps >= 55 ? 'emerald' : fps >= 30 ? 'amber' : 'rose'} />
          <DevInfoRow label={t.dev.perfFrames} value={snap.framesInWindow} />
          {stages.length === 0 && (
            <p className="py-2 text-center font-mono text-[10px] text-[var(--arc-ink-4)]">
              {t.dev.perfNoData}
            </p>
          )}
          {stages.map(([name, stage]) => (
            <div
              key={name}
              className="flex items-baseline justify-between gap-2 font-mono text-[10px]"
            >
              <span className="truncate text-[var(--arc-ink-3)]">{name}</span>
              <span className="shrink-0 text-[var(--arc-ink)]">
                {stage.avg.toFixed(2)}ms
                <span className="ml-1 text-[var(--arc-ink-4)]">max {stage.max.toFixed(2)}</span>
              </span>
            </div>
          ))}
        </>
      )}
    </DevSection>
  );
}