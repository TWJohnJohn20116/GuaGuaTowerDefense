// 商店 · 主區狀態列（分類已移到左軌，這裡只留進度與說明）
import { useTranslation } from '@/i18n';
import { SegHead, Segments, Num } from '@/components/hl';
import type { ShopTab } from './shopData';

export type TowerFilter = 'all' | 'basic' | 'special';

interface ShopToolbarProps {
  tab: ShopTab;
  towerProgress: { unlocked: number; total: number };
  skillProgress: { unlocked: number; total: number };
}

export function ShopToolbar({ tab, towerProgress, skillProgress }: ShopToolbarProps) {
  const { t } = useTranslation();
  const s = t.shop.toolbar;
  const progress = tab === 'towers' ? towerProgress : skillProgress;

  return (
    <div className="shrink-0 border-b border-[var(--cn-line-soft)] bg-[var(--arc-void)] px-4 py-2.5 sm:px-5">
      <div className="flex items-center gap-3">
        <SegHead
          className="min-w-0"
          label={tab === 'towers' ? s.tabTowers : s.tabSkills}
          right={
            <span className="flex shrink-0 items-center gap-2">
              <Segments total={progress.total} filled={progress.unlocked} size="sm" />
              <Num value={`${progress.unlocked}/${progress.total}`} size="sm" tone="muted" />
            </span>
          }
        />
      </div>
      <div className="mt-1.5 flex items-center gap-3">
        <span className="arc-micro truncate">
          {tab === 'towers' ? t.shop.subtitle : s.skillsHint}
        </span>
      </div>
    </div>
  );
}

export default ShopToolbar;
