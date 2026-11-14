/**
 * 波次預覽 · 敵人類型色票圖例
 *
 * 色塊只有 8×8 方塊，外框 1px；顏色跟時間軸 canvas 用同一套資料色對照。
 */
import { useTranslation } from '@/i18n';
import type { CustomWaveData } from '@/types/game';
import { useEnemyAbilityLabels, getEnemyTypeDisplayName } from './enemyAbilityLabels';
import { isBossEnemyType } from './modValidation';
import { enemyBarVar } from './WaveTimelinePreview';

interface WaveTypeLegendProps {
  waveSet: CustomWaveData;
  className?: string;
}

export function collectWaveEnemyTypes(waveSet: CustomWaveData, abilityLabels: Record<string, string>) {
  const map = new Map<string, { type: string; color: string; count: number; isBoss: boolean }>();
  waveSet.waves.forEach((wave) => {
    wave.enemies.forEach((eg) => {
      const prev = map.get(eg.type);
      const color = enemyBarVar(eg.type);
      const name = getEnemyTypeDisplayName(eg.type, abilityLabels);
      if (prev) {
        prev.count += eg.count;
      } else {
        map.set(eg.type, {
          type: name,
          color,
          count: eg.count,
          isBoss: isBossEnemyType(eg.type),
        });
      }
    });
  });
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function WaveTypeLegend({ waveSet, className = '' }: WaveTypeLegendProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const abilityLabels = useEnemyAbilityLabels();
  const types = collectWaveEnemyTypes(waveSet, abilityLabels);
  if (types.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {types.map((item) => (
        <span
          key={item.type}
          className="inline-flex items-center gap-1.5 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-1.5 py-1"
        >
          <span
            className="h-2 w-2 flex-shrink-0"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className="max-w-[72px] truncate text-[11px] leading-none text-[var(--arc-ink-2)]">
            {item.type}
          </span>
          <span className="font-mono text-[10px] tabular-nums leading-none text-[var(--arc-ink-4)]">
            ×{item.count}
          </span>
          {item.isBoss && (
            <span className="border border-[rgba(255,182,39,0.4)] px-1 font-mono text-[9px] uppercase leading-[14px] tracking-[0.12em] text-[var(--arc-caution)]">
              {m.wvLegendBoss}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
