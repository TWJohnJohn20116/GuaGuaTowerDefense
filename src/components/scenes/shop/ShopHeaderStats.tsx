// 商店 · 頂列統計（等寬數值 + 結構線分隔）
import type React from 'react';
import { CoinIcon, TowerIcon, LightningIcon } from '@/components/ui/Icons';
import { Num, Rule } from '@/components/hl';
import { useTranslation } from '@/i18n';

interface ShopHeaderStatsProps {
  coins: number;
  towerUnlocked: number;
  towerTotal: number;
  skillUnlocked: number;
  skillTotal: number;
}

function TopStat({
  icon,
  label,
  value,
  tone = 'ink',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'ink' | 'signal';
}) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-[var(--arc-ink-3)]">{icon}</span>
      <span className="flex flex-col justify-center leading-none">
        <span className="arc-label">{label}</span>
        <span className="mt-0.5"><Num value={value} size="sm" tone={tone} /></span>
      </span>
    </span>
  );
}

export function ShopHeaderStats({
  coins, towerUnlocked, towerTotal, skillUnlocked, skillTotal,
}: ShopHeaderStatsProps) {
  const { t } = useTranslation();
  const s = t.shop.toolbar;

  return (
    <div className="flex items-center gap-3">
      <TopStat
        icon={<CoinIcon className="h-3.5 w-3.5" />}
        label={t.shop.balance}
        value={coins.toLocaleString()}
        tone="signal"
      />
      <Rule vertical className="h-6" />
      <TopStat
        icon={<TowerIcon className="h-3.5 w-3.5" />}
        label={s.tabTowers}
        value={`${towerUnlocked}/${towerTotal}`}
      />
      <Rule vertical className="h-6" />
      <TopStat
        icon={<LightningIcon className="h-3.5 w-3.5" />}
        label={s.tabSkills}
        value={`${skillUnlocked}/${skillTotal}`}
      />
    </div>
  );
}

export default ShopHeaderStats;
