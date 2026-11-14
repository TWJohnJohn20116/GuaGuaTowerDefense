// 皮膚工坊 · 頂列統計（等寬數值 + 結構線分隔）
import type React from 'react';
import { useTranslation } from '@/i18n';
import { PaletteIcon, CheckIcon, StarIcon } from '@/components/ui/Icons';
import { Num, Rule } from '@/components/hl';

interface SkinHeaderStatsProps {
  unlockedCount: number;
  totalCount: number;
  equippedCount: number;
  favoriteCount: number;
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

export function SkinHeaderStats({
  unlockedCount,
  totalCount,
  equippedCount,
  favoriteCount,
}: SkinHeaderStatsProps) {
  const { t } = useTranslation();
  const h = t.skins.headerStats;

  return (
    <div className="flex items-center gap-3">
      <TopStat
        icon={<PaletteIcon className="h-3.5 w-3.5" />}
        label={h.collectionProgress}
        value={`${unlockedCount}/${totalCount}`}
        tone="signal"
      />
      <Rule vertical className="h-6" />
      <TopStat
        icon={<CheckIcon className="h-3.5 w-3.5" />}
        label={h.equipped}
        value={String(equippedCount)}
      />
      <Rule vertical className="h-6" />
      <TopStat
        icon={<StarIcon className="h-3.5 w-3.5" />}
        label={h.favorites}
        value={String(favoriteCount)}
      />
    </div>
  );
}

export default SkinHeaderStats;
