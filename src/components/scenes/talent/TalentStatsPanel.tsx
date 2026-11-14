/**
 * 天賦樹 - 當前加成總覽
 * 每一列都是 hl-row 結構，數值全部 mono tabular。
 */

import type React from 'react';
import { useTranslation } from '@/i18n';
import type { TalentModifiers } from '@/store/talentStore';
import {
  CoinIcon, HeartIcon, ConstructionIcon, ExplosionIcon, LightningIcon,
  TargetIcon, GiftIcon, SkullIcon, StarIcon, MoneyBagIcon,
} from '@/components/ui/Icons';
import { SegHead, Num } from '@/components/hl';

interface StatRow {
  label: string;
  icon: React.ReactNode;
  value: string;
  active: boolean;
}

export interface TalentStatsPanelProps {
  modifiers: TalentModifiers;
}

export function TalentStatsPanel({ modifiers }: TalentStatsPanelProps) {
  const { t } = useTranslation();
  const formatPercent = (v: number, base = 1) => {
    const diff = (v - base) * 100;
    if (Math.abs(diff) < 0.01) return null;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(0)}%`;
  };

  const formatFlat = (v: number, suffix = '') => {
    if (v === 0) return null;
    return `${v > 0 ? '+' : ''}${v.toFixed(0)}${suffix}`;
  };

  const rows: StatRow[] = [
    {
      label: t.talent.statStartMoney,
      icon: <CoinIcon className="h-3 w-3" />,
      value: [formatPercent(modifiers.startingMoneyMult), formatFlat(modifiers.startingMoneyFlat)].filter(Boolean).join(' / ') || '—',
      active: modifiers.startingMoneyMult > 1 || modifiers.startingMoneyFlat > 0,
    },
    {
      label: t.talent.statStartHealth,
      icon: <HeartIcon className="h-3 w-3" />,
      value: formatFlat(modifiers.startingHealthFlat) || '—',
      active: modifiers.startingHealthFlat > 0,
    },
    {
      label: t.talent.statTowerCost,
      icon: <ConstructionIcon className="h-3 w-3" />,
      value: formatPercent(modifiers.towerCostMult) || '—',
      active: modifiers.towerCostMult < 1,
    },
    {
      label: t.talent.statTowerDamage,
      icon: <ExplosionIcon className="h-3 w-3" />,
      value: formatPercent(modifiers.towerDamageMult) || '—',
      active: modifiers.towerDamageMult > 1,
    },
    {
      label: t.talent.statTowerSpeed,
      icon: <LightningIcon className="h-3 w-3" />,
      value: formatPercent(modifiers.towerAttackSpeedMult) || '—',
      active: modifiers.towerAttackSpeedMult > 1,
    },
    {
      label: t.talent.statTowerRange,
      icon: <TargetIcon className="h-3 w-3" />,
      value: formatPercent(modifiers.towerRangeMult) || '—',
      active: modifiers.towerRangeMult > 1,
    },
    {
      label: t.talent.statKillReward,
      icon: <GiftIcon className="h-3 w-3" />,
      value: formatPercent(modifiers.enemyRewardMult) || '—',
      active: modifiers.enemyRewardMult > 1,
    },
    {
      label: t.talent.statCritChance,
      icon: <StarIcon className="h-3 w-3" />,
      value: modifiers.criticalChance > 0 ? `+${(modifiers.criticalChance * 100).toFixed(0)}%` : '—',
      active: modifiers.criticalChance > 0,
    },
    {
      label: t.talent.statCritDamage,
      icon: <ExplosionIcon className="h-3 w-3" />,
      value: formatPercent(modifiers.criticalDamage) || '—',
      active: modifiers.criticalDamage > 1,
    },
    {
      label: t.talent.statBossDamage,
      icon: <SkullIcon className="h-3 w-3" />,
      value: formatPercent(modifiers.bossDamageMult) || '—',
      active: modifiers.bossDamageMult > 1,
    },
    {
      label: t.talent.statMetaCoin,
      icon: <MoneyBagIcon className="h-3 w-3" />,
      value: formatPercent(modifiers.metaCoinMult) || '—',
      active: modifiers.metaCoinMult > 1,
    },
  ];

  const activeCount = rows.filter((r) => r.active).length;

  return (
    <div className="flex flex-col">
      <SegHead
        label={t.talent.currentModifiers}
        right={<Num value={`${activeCount}/${rows.length}`} size="sm" tone="muted" />}
      />
      <div className="mt-2 flex flex-col">
        {rows.map((row) => (
          <div
            key={row.label}
            className={[
              'flex items-center justify-between border-b border-[var(--hl-line)] py-1.5 last:border-b-0',
              row.active ? '' : 'opacity-45',
            ].join(' ')}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className={row.active ? 'text-[var(--hl-signal)]' : 'text-[var(--hl-ink-4)]'}>
                {row.icon}
              </span>
              <span className="hl-label truncate">{row.label}</span>
            </span>
            <span className={row.active ? 'text-[var(--hl-ink)]' : 'text-[var(--hl-ink-3)]'}>
              <Num value={row.value} size="sm" tone={row.active ? 'signal' : 'muted'} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TalentStatsPanel;
