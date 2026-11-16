/**
 * 選圖 · 卡牌牆
 *
 * 主畫面本體。控制台兩行：上行選來源（進階／Mod／工坊），下行篩條件（搜尋／難度）。
 * 分類不放 TopBar——窄版三個 Chip 會把標題區壓爆，而且「切來源」與「篩條件」
 * 本來就是同一件事，放在一起才看得出順序。
 *
 * 挑到一張卡就往上升起簡報層（兩步流程的第一步）。篩選狀態留在這裡，
 * 切分類時由父層的 key 重掛，避免帶著上一類的難度篩選看到一片空牆。
 */

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { Btn, Chip, Empty, Input } from '@/components/hl';
import { playUiHover } from '@/services/audioService';
import { MapCard } from './MapCard';
import {
  filterMapItems,
  listAvailableDifficulties,
  sortForWall,
  type MapCategory,
  type MapItemData,
} from './mapLibrary';
import { MAP_DIFFICULTY_FILTER_ORDER, getMapDifficultyLabel } from './difficultyMeta';

interface CategoryTab {
  id: MapCategory;
  label: string;
  count: number;
}

interface MapWallProps {
  /** 目前分類的全部地圖（未篩選） */
  items: MapItemData[];
  /** 剛才開過簡報層的那張；從簡報返回時仍標記著 */
  activeKey: string | null;
  onOpen: (key: string) => void;
  /** 該分類完全沒有地圖時的空狀態文案 */
  emptyTitle: string;
  emptyHint?: string;
  categories: CategoryTab[];
  category: MapCategory;
  onCategoryChange: (category: MapCategory) => void;
}

export function MapWall({
  items,
  activeKey,
  onOpen,
  emptyTitle,
  emptyHint,
  categories,
  category,
  onCategoryChange,
}: MapWallProps) {
  const { t } = useTranslation();
  const c = t.pathSelection.campaign;

  const [query, setQuery] = useState('');
  const [difficulties, setDifficulties] = useState<ReadonlySet<string>>(new Set());

  const available = useMemo(
    () => listAvailableDifficulties(items, MAP_DIFFICULTY_FILTER_ORDER),
    [items],
  );

  const filtered = useMemo(
    () => sortForWall(filterMapItems(items, { query, difficulties })),
    [items, query, difficulties],
  );

  const hasFilter = query.trim() !== '' || difficulties.size > 0;

  const resetFilters = () => {
    setQuery('');
    setDifficulties(new Set());
  };

  const toggleDifficulty = useCallback((difficulty: string) => {
    setDifficulties((prev) => {
      const next = new Set(prev);
      if (next.has(difficulty)) next.delete(difficulty);
      else next.add(difficulty);
      return next;
    });
  }, []);

  const countLabel = c.mapsCount
    .replace('{filtered}', String(filtered.length))
    .replace('{total}', String(items.length));

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* 控制台：上行來源、下行篩選，共用一張面板 */}
      <div className="arc-panel flex shrink-0 flex-col gap-2 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((tab) => (
            <Chip
              key={tab.id}
              active={category === tab.id}
              onClick={() => onCategoryChange(tab.id)}
            >
              {tab.label}
              <span className="tabular-nums opacity-70">{tab.count}</span>
            </Chip>
          ))}
          <span className="ml-auto shrink-0 font-mono text-[10px] font-extrabold tabular-nums text-[var(--cn-ink-4)]">
            {countLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[160px] flex-1 sm:max-w-[260px]">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={c.searchMapsPlaceholder}
              aria-label={c.searchMapsPlaceholder}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {available.map((difficulty) => {
              const on = difficulties.has(difficulty);
              return (
                <button
                  key={difficulty}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleDifficulty(difficulty)}
                  onMouseEnter={() => playUiHover()}
                  className={[
                    'rounded-[var(--cn-r-pill)] border-2 px-2.5 py-[3px] text-[10.5px] font-extrabold leading-[15px]',
                    'transition-[background-color,border-color,color] duration-[120ms]',
                    on
                      ? 'border-[var(--cn-line)] bg-[var(--cn-coral-soft)] text-[var(--cn-signal-text)]'
                      : 'border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] text-[var(--cn-ink-3)] hover:border-[var(--cn-line-mid)] hover:text-[var(--cn-ink-2)]',
                  ].join(' ')}
                >
                  {getMapDifficultyLabel(difficulty, t)}
                </button>
              );
            })}
          </div>

          {hasFilter && (
            <Btn size="sm" variant="ghost" onClick={resetFilters}>
              {c.reset}
            </Btn>
          )}
        </div>
      </div>

      {/* 牆本體：只有這一塊滾動 */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-2 pr-0.5">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3 xl:grid-cols-4">
            {filtered.map((map, index) => (
              <MapCard
                key={map.key}
                map={map}
                index={index + 1}
                active={map.key === activeKey}
                onOpen={onOpen}
              />
            ))}
          </div>
        ) : hasFilter ? (
          <Empty title={c.noMapsFound} hint={c.noMapsFoundHint} className="mt-2" />
        ) : (
          <Empty title={emptyTitle} hint={emptyHint} className="mt-2" />
        )}
      </div>
    </div>
  );
}

export default MapWall;
