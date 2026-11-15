/**
 * 戰前簡報 · 自訂難度滑桿（CANDY POP）
 *
 * 只在「自訂」難度展開。軌道 4px、拇指是糖果圓點，數值用等寬字。
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
    <div className="arc-pop mt-3 rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-mid)] bg-[var(--cn-card-2)] p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="arc-label">{t.pathSelection.customParams}</span>
        <Btn size="sm" variant="ghost" onClick={() => setCustom(DEFAULT_MODIFIERS)}>
          {t.pathSelection.resetDefaults}
        </Btn>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
        {params.map((p) => {
          const value = custom[p.key];
          return (
            <div key={p.key}>
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="arc-label">{p.label}</span>
                <span className="font-mono text-[12px] font-extrabold tabular-nums text-[var(--cn-signal-text)]">
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
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--cn-line-mid)] accent-[var(--cn-coral)]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CustomSliders;
