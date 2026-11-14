/**
 * 戰前簡報 · 自訂難度滑桿（HARDLINE）
 *
 * 只出現於「自訂」難度。滑桿走 1px 軌道 + 資料色，不放圓角膠囊。
 */

import type { Dispatch, SetStateAction } from 'react';
import type { DifficultyModifiers } from '@/types/game';
import { useTranslation } from '@/i18n';
import { Btn } from '@/components/hl';

interface CustomParamConfig {
  key: keyof DifficultyModifiers;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}

interface CustomSlidersProps {
  custom: DifficultyModifiers;
  setCustom: Dispatch<SetStateAction<DifficultyModifiers>>;
}

const DEFAULT_MODIFIERS: DifficultyModifiers = {
  enemyHealthMult: 1.0,
  enemySpeedMult: 1.0,
  enemyRewardMult: 1.0,
  startingMoney: 500,
  startingHealth: 10,
  towerCostMult: 1.0,
  waveDelayMult: 1.0,
};

export function CustomSliders({ custom, setCustom }: CustomSlidersProps) {
  const { t } = useTranslation();
  const params: CustomParamConfig[] = [
    {
      key: 'startingHealth',
      label: t.pathSelection.startingHealth,
      min: 1,
      max: 100,
      step: 1,
      format: (v) => `${v}`,
    },
    {
      key: 'startingMoney',
      label: t.pathSelection.startingMoney,
      min: 50,
      max: 5000,
      step: 50,
      format: (v) => `${v}`,
    },
    {
      key: 'enemyHealthMult',
      label: t.pathSelection.enemyHealth,
      min: 0.1,
      max: 10,
      step: 0.1,
      format: (v) => `${v.toFixed(1)}x`,
    },
    {
      key: 'enemySpeedMult',
      label: t.pathSelection.enemySpeed,
      min: 0.1,
      max: 5,
      step: 0.1,
      format: (v) => `${v.toFixed(1)}x`,
    },
  ];

  return (
    <div className="arc-enter border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--cn-line-soft)] px-3 py-2">
        <span className="arc-label">{t.pathSelection.customParams}</span>
        <Btn size="sm" variant="ghost" onClick={() => setCustom(DEFAULT_MODIFIERS)}>
          {t.pathSelection.resetDefaults}
        </Btn>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-3 px-3 py-3 sm:grid-cols-2">
        {params.map((p) => {
          const value = custom[p.key];
          return (
            <div key={p.key}>
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="arc-label">{p.label}</span>
                <span className="font-mono text-[11px] tabular-nums text-[var(--arc-caution)]">
                  {p.format(value)}
                </span>
              </div>
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={value}
                aria-label={p.label}
                onChange={(e) =>
                  setCustom((prev) => ({ ...prev, [p.key]: parseFloat(e.target.value) }))
                }
                className="h-1 w-full cursor-pointer appearance-none bg-[var(--arc-line)] accent-[var(--arc-caution)]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CustomSliders;
