/**
 * 地圖側欄 · 頂部標題（HARDLINE）
 *
 * 分類切換在 PathSelection 的 TopBar；這塊只顯示目前分類與清單筆數。
 */

import { SegHead } from '@/components/hl';
import { useTranslation } from '@/i18n';

export type MapCategory = 'advanced' | 'mod';

interface SidebarHeaderProps {
  activeCategory: MapCategory;
  mapCount: number;
}

export function SidebarHeader({ activeCategory, mapCount }: SidebarHeaderProps) {
  const { t } = useTranslation();
  const c = t.pathSelection.campaign;

  const label = activeCategory === 'advanced' ? c.sidebarAdvanced : c.sidebarMod;

  return (
    <div className="sticky top-0 z-10 border-b border-[var(--cn-line-soft)] bg-[var(--arc-deck)] px-3 py-2.5">
      <SegHead
        label={label}
        right={
          <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
            {String(mapCount).padStart(2, '0')}
          </span>
        }
      />
    </div>
  );
}

export default SidebarHeader;
