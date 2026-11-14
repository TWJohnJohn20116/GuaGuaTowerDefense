/**
 * 地圖選擇 · 左軌內容（CANDY POP Rail）
 *
 * 搜尋與難度篩選貼在清單頂端的凹槽裡，清單本體維持「一列一張圖」的節奏，
 * 底部是筆數與重置。這裡不畫預覽圖：主區的地圖卡才是預覽的唯一位置。
 */

import { useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { Btn, Input, Rule } from '@/components/hl';
import {
  SidebarHeader,
  DifficultyChips,
  MapRow,
  EmptyState,
  DIFFICULTY_ORDER,
  type MapCategory,
  type MapItemData,
} from './sidebar';

export type { MapCategory, MapItemData };

interface MapSidebarProps {
  activeCategory: MapCategory;
  selectedId: string | null;
  onSelectMap: (id: string) => void;
  advancedMaps: MapItemData[];
  modMaps: MapItemData[];
}

export function MapSidebar({
  activeCategory,
  selectedId,
  onSelectMap,
  advancedMaps,
  modMaps,
}: MapSidebarProps) {
  const { t } = useTranslation();
  const c = t.pathSelection.campaign;
  const [searchText, setSearchText] = useState('');
  const [difficultyFilters, setDifficultyFilters] = useState<Set<string>>(new Set());

  const currentMaps = activeCategory === 'advanced' ? advancedMaps : modMaps;

  const availableDifficulties = useMemo(() => {
    const set = new Set<string>();
    currentMaps.forEach((m) => set.add(m.difficulty));
    return DIFFICULTY_ORDER.filter((d) => set.has(d));
  }, [currentMaps]);

  const filteredMaps = useMemo(() => {
    let result = currentMaps;
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.modName?.toLowerCase().includes(q) ||
          m.difficulty.toLowerCase().includes(q),
      );
    }
    if (difficultyFilters.size > 0) {
      result = result.filter((m) => difficultyFilters.has(m.difficulty));
    }
    return result;
  }, [currentMaps, searchText, difficultyFilters]);

  const toggleDifficulty = (diff: string) => {
    setDifficultyFilters((prev) => {
      const next = new Set(prev);
      if (next.has(diff)) next.delete(diff);
      else next.add(diff);
      return next;
    });
  };

  const resetFilters = () => {
    setSearchText('');
    setDifficultyFilters(new Set());
  };

  const hasActiveFilter = searchText.trim() !== '' || difficultyFilters.size > 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SidebarHeader activeCategory={activeCategory} mapCount={currentMaps.length} />

      <div className="px-2 py-2">
        <div className="rounded-[var(--cn-r-md)] border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] p-1.5">
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={c.searchMapsPlaceholder}
            aria-label={c.searchMapsPlaceholder}
          />
          <div className="mt-1.5">
            <DifficultyChips
              available={availableDifficulties}
              activeFilters={difficultyFilters}
              onToggle={toggleDifficulty}
              onReset={resetFilters}
            />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-1">
        {filteredMaps.length > 0 ? (
          filteredMaps.map((map, i) => (
            <MapRow
              key={map.key}
              map={map}
              index={i + 1}
              selected={selectedId === map.key}
              onClick={() => onSelectMap(map.key)}
            />
          ))
        ) : hasActiveFilter ? (
          <EmptyState title={c.noMapsFound} hint={c.noMapsFoundHint} />
        ) : (
          <EmptyState
            title={
              activeCategory === 'mod'
                ? t.pathSelectionExt?.noModMaps || c.sidebarMod
                : c.noAdvancedMaps
            }
            hint={activeCategory === 'mod' ? t.pathSelectionExt?.enableModMaps : undefined}
          />
        )}
      </div>

      <Rule />
      <div className="flex items-center justify-between gap-2 px-2 py-2">
        <span className="min-w-0 truncate font-mono text-[9.5px] font-extrabold uppercase tracking-[0.08em] text-[var(--cn-ink-4)]">
          {c.mapsCount
            .replace('{filtered}', String(filteredMaps.length))
            .replace('{total}', String(currentMaps.length))}
        </span>
        {hasActiveFilter && (
          <Btn size="sm" variant="ghost" onClick={resetFilters}>
            {c.reset}
          </Btn>
        )}
      </div>
    </div>
  );
}

export default MapSidebar;
