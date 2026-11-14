/**
 * 地圖側欄 · 頂部標題（HARDLINE）
 *
 * 分類切換在 PathSelection 的 TopBar；這塊只顯示目前分類與清單筆數。
 */

import { SegHead } from '@/components/hl';
import { useTranslation } from '@/i18n';

export type MapCategory = 'campaign' | 'advanced' | 'mod';

interface SidebarHeaderProps {
  activeCategory: MapCategory;
  mapCount: number;
}

export function SidebarHeader({ activeCategory, mapCount }: SidebarHeaderProps) {
  const { t } = useTranslation();
  const c = t.pathSelection.campaign;

  const label =
    activeCategory === 'campaign'
      ? c.sidebarCampaign
      : activeCategory === 'advanced'
        ? c.sidebarAdvanced
        : c.sidebarMod;

  return (
    <div className="sticky top-0 z-10 border-b border-[var(--hl-line)] bg-[var(--hl-deck)] px-3 py-2.5">
      <SegHead
        label={label}
        right={
          <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
            {String(mapCount).padStart(2, '0')}
          </span>
        }
      />
    </div>
  );
}

export default SidebarHeader;
