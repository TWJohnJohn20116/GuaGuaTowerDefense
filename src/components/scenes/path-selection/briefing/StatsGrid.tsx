/**
 * 戰前簡報 · 戰場參數（CANDY POP 資料格）
 *
 * 六格 2×3：標籤在上、等寬數值在下。大於 100% 對玩家不利 → alarm；
 * 低於 100% → vital。只用資料色，不做彩色底板。
 */

import type { DifficultyModifiers } from '@/types/game';
import { useTranslation } from '@/i18n';
import { StatCell } from '@/components/hl';

interface StatsGridProps {
  mod: DifficultyModifiers;
}

type CellTone = 'ink' | 'vital' | 'alarm';

export function StatsGrid({ mod }: StatsGridProps) {
  const { t } = useTranslation();

  const toneFor = (v: number, reverse = false): CellTone => {
    if (v === 1) return 'ink';
    const worse = reverse ? v < 1 : v > 1;
    return worse ? 'alarm' : 'vital';
  };

  const cells: { label: string; value: string; tone: CellTone }[] = [
    { label: t.pathSelection.startingHealth, value: String(mod.startingHealth), tone: 'ink' },
    { label: t.pathSelection.startingMoney, value: String(mod.startingMoney), tone: 'ink' },
    {
      label: t.pathSelection.towerCost,
      value: `${Math.round(mod.towerCostMult * 100)}%`,
      tone: toneFor(mod.towerCostMult),
    },
    {
      label: t.pathSelection.enemyHealth,
      value: `${Math.round(mod.enemyHealthMult * 100)}%`,
      tone: toneFor(mod.enemyHealthMult),
    },
    {
      label: t.pathSelection.enemySpeed,
      value: `${Math.round(mod.enemySpeedMult * 100)}%`,
      tone: toneFor(mod.enemySpeedMult),
    },
    {
      label: t.pathSelection.killReward,
      value: `${Math.round(mod.enemyRewardMult * 100)}%`,
      tone: toneFor(mod.enemyRewardMult, true),
    },
  ];

  return (
    <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
      {cells.map((c) => (
        <div key={c.label} className="arc-panel--sunken flex flex-col justify-center px-2.5 py-2">
          <StatCell label={c.label} value={c.value} tone={c.tone} />
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;
