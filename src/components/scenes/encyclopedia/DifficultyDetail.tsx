/**
 * 圖鑑 · 難度詳情（HARDLINE 詳情欄）
 *
 * 起始資源、五項數值修飾、特性提示。修飾值用資料色標記方向（對玩家更不利＝紅）。
 */
import type React from 'react';
import { SegHead, StatCell } from '@/components/hl';
import {
  MoneyBagIcon, PackageIcon, AlienIcon, LightningIcon, TrophyIcon,
  ConstructionIcon, LightbulbIcon, ChartIcon, HeartIcon, ThemeIcon, Timer2Icon,
} from '@/components/ui/Icons';
import { DIFFICULTY_MODIFIERS } from '@/data/gameData';
import type { GameDifficulty } from '@/types/game';
import { ALL_DIFFICULTIES, DIFFICULTY_VISUAL } from './EncyclopediaTypes';
import { EncyclopediaSourceLinks } from './EncyclopediaSourceLinks';
import { useTranslation } from '@/i18n';

interface DifficultyDetailProps {
  selectedItem: string;
  onOpenFile?: (path: string) => void;
}

type DifficultyKey = 'easy' | 'normal' | 'hard' | 'nightmare' | 'impossible';

const panel = 'border border-[var(--hl-line)] bg-[var(--hl-deck)] p-2.5';

/** 修飾方向 → 資料色（對玩家更不利＝紅、更有利＝綠、持平＝主文字） */
function modTone(value: number, inverted = false): 'alarm' | 'vital' | 'ink' {
  if (value === 1) return 'ink';
  const harder = inverted ? value < 1 : value > 1;
  return harder ? 'alarm' : 'vital';
}

export function DifficultyDetail({ selectedItem, onOpenFile }: DifficultyDetailProps) {
  const { t } = useTranslation();
  const selectedDiff = ALL_DIFFICULTIES.includes(selectedItem as GameDifficulty) ? selectedItem as DifficultyKey : null;

  if (!selectedDiff) {
    return (
      <div className="flex min-h-[260px] h-full items-center justify-center px-4 text-center">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
          {t.encyclopedia.selectDifficultyHint}
        </span>
      </div>
    );
  }

  const visual = DIFFICULTY_VISUAL[selectedDiff];
  const info = t.encyclopedia.difficulties[selectedDiff];
  const modifiers = DIFFICULTY_MODIFIERS[selectedDiff];

  const modRows: { key: string; label: string; value: number; icon: React.ReactNode; inverted?: boolean }[] = [
    { key: 'hp', label: t.encyclopedia.detailEnemyHealthMod, value: modifiers.enemyHealthMult, icon: <AlienIcon className="h-3 w-3" /> },
    { key: 'speed', label: t.encyclopedia.detailEnemySpeedMod, value: modifiers.enemySpeedMult, icon: <LightningIcon className="h-3 w-3" /> },
    { key: 'reward', label: t.encyclopedia.detailKillRewardMod, value: modifiers.enemyRewardMult, icon: <TrophyIcon className="h-3 w-3" />, inverted: true },
    { key: 'cost', label: t.encyclopedia.detailBuildCostMod, value: modifiers.towerCostMult, icon: <ConstructionIcon className="h-3 w-3" /> },
    { key: 'delay', label: t.encyclopedia.detailWaveDelayMod, value: modifiers.waveDelayMult, icon: <Timer2Icon className="h-3 w-3" />, inverted: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="flex items-start gap-3 border-b border-[var(--hl-line)] pb-3">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center border"
          style={{ borderColor: `${visual.color}66`, color: visual.color }}
        >
          <ThemeIcon icon={visual.icon} className="h-7 w-7" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
            {info.name}
          </h3>
          <p className="text-[11.5px] leading-relaxed text-[var(--hl-ink-2)]">{info.description}</p>
        </div>
      </div>

      {/* 初始資源 */}
      <div className="flex flex-col gap-2">
        <SegHead label={t.encyclopedia.detailInitialResources} />
        <div className="grid grid-cols-2 gap-2">
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><HeartIcon className="h-3 w-3" />{t.encyclopedia.detailInitialHealth}</span>}
              value={modifiers.startingHealth}
              tone="alarm"
            />
          </div>
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><MoneyBagIcon className="h-3 w-3" />{t.encyclopedia.detailInitialMoney}</span>}
              value={modifiers.startingMoney}
              unit="$"
              tone="signal"
            />
          </div>
        </div>
      </div>

      {/* 數值修飾 */}
      <div className="flex flex-col gap-2">
        <SegHead
          label={t.encyclopedia.detailValueModifiers}
          right={<span className="text-[var(--hl-ink-4)]"><ChartIcon className="h-3 w-3" /></span>}
        />
        {modRows.map((row) => {
          const pct = Math.round(row.value * 100);
          const tone = modTone(row.value, row.inverted);
          return (
            <div key={row.key} className="flex items-center gap-2 border border-[var(--hl-line)] px-2.5 py-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-3)]">
                {row.icon}
              </span>
              <span className="min-w-0 flex-1 truncate">
                <span className="hl-label">{row.label}</span>
              </span>
              <span
                className={`shrink-0 font-mono text-[12px] font-semibold tabular-nums ${
                  tone === 'alarm' ? 'text-[var(--hl-alarm)]' : tone === 'vital' ? 'text-[var(--hl-vital)]' : 'text-[var(--hl-ink)]'
                }`}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      {/* 特性提示 */}
      <div className="flex flex-col gap-2">
        <SegHead
          label={t.encyclopedia.detailDifficultyTraits}
          right={<span className="text-[var(--hl-caution)]"><LightbulbIcon className="h-3 w-3" /></span>}
        />
        {info.tips.map((tip: string, index: number) => (
          <div key={index} className="flex items-start gap-2 border border-[var(--hl-line)] px-2.5 py-2">
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="min-w-0 flex-1 text-[11px] leading-relaxed text-[var(--hl-ink-2)]">{tip}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 border-t border-[var(--hl-line)] pt-2 text-[var(--hl-ink-4)]">
        <PackageIcon className="h-3 w-3" />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.08em]">loadout</span>
      </div>

      {onOpenFile && (
        <div className="border-t border-[var(--hl-line)] pt-3">
          <EncyclopediaSourceLinks tab="difficulty" itemId={selectedDiff} onOpenFile={onOpenFile} />
        </div>
      )}
    </div>
  );
}
