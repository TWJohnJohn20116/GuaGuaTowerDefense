/**
 * 簡報層 · 自訂難度滑桿
 *
 * 只在玩家難度＝自訂時展開。六個參數涵蓋「這局多難」的全部槓桿：
 * 起手資源（生命／金幣）× 敵人強度（血／速）× 經濟壓力（塔價／擊殺獎勵）。
 * 波次延遲留給引擎常數——玩家調它看不出差別，只會多一個滑桿。
 */

import type { Dispatch, SetStateAction } from 'react';
import type { DifficultyModifiers } from '@/types/game';
import { useTranslation } from '@/i18n';
import { Btn } from '@/components/hl';

/** 與場景主檔共用的預設值：重置按鈕回到這裡 */
export const DEFAULT_MODIFIERS: DifficultyModifiers = {
  enemyHealthMult: 1.0,
  enemySpeedMult: 1.0,
  enemyRewardMult: 1.0,
  startingMoney: 500,
  startingHealth: 10,
  towerCostMult: 1.0,
  waveDelayMult: 1.0,
};

interface SliderConfig {
  key: keyof DifficultyModifiers;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
}

interface CustomTuningProps {
  custom: DifficultyModifiers;
  setCustom: Dispatch<SetStateAction<DifficultyModifiers>>;
}

export function CustomTuning({ custom, setCustom }: CustomTuningProps) {
  const { t } = useTranslation();

  const sliders: SliderConfig[] = [
    {
      key: 'startingHealth',
      label: t.pathSelection.startingHealth,
      min: 1,
      max: 100,
      step: 1,
      format: (v) => String(v),
    },
    {
      key: 'startingMoney',
      label: t.pathSelection.startingMoney,
      min: 50,
      max: 5000,
      step: 50,
      format: (v) => String(v),
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
    {
      key: 'towerCostMult',
      label: t.pathSelection.towerCost,
      min: 0.3,
      max: 3,
      step: 0.1,
      format: (v) => `${v.toFixed(1)}x`,
    },
    {
      key: 'enemyRewardMult',
      label: t.pathSelection.killReward,
      min: 0.3,
      max: 3,
      step: 0.1,
      format: (v) => `${v.toFixed(1)}x`,
    },
  ];

  return (
    <div className="rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-mid)] bg-[var(--cn-card-2)] p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="arc-label">{t.pathSelection.customParams}</span>
        <Btn size="sm" variant="ghost" onClick={() => setCustom(DEFAULT_MODIFIERS)}>
          {t.pathSelection.resetDefaults}
        </Btn>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
        {sliders.map((slider) => (
          <div key={slider.key}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="arc-label">{slider.label}</span>
              <span className="font-mono text-[12px] font-extrabold tabular-nums text-[var(--cn-signal-text)]">
                {slider.format(custom[slider.key])}
              </span>
            </div>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={custom[slider.key]}
              aria-label={slider.label}
              onChange={(event) =>
                setCustom((prev) => ({ ...prev, [slider.key]: parseFloat(event.target.value) }))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--cn-line-mid)] accent-[var(--cn-coral)]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomTuning;
