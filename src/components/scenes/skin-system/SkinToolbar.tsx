/**
 * 皮膚工坊 · 篩選列（HARDLINE）
 *
 * 分頁與塔分類已移到左軌，這裡只放：篩選、稀有度、排序、搜尋。
 * 全部用 Chip 與 hl-input，不用彩虹膠囊。
 */
import { useTranslation } from '@/i18n';
import { Chip } from '@/components/hl';
import type {
  SkinFilterMode,
  SkinRarityFilter,
  SkinSortMode,
  SkinTab,
} from './skinShared';

interface SkinToolbarProps {
  tab: SkinTab;
  filter: SkinFilterMode;
  rarityFilter: SkinRarityFilter;
  sort: SkinSortMode;
  search: string;
  onFilterChange: (filter: SkinFilterMode) => void;
  onRarityFilterChange: (filter: SkinRarityFilter) => void;
  onSortChange: (sort: SkinSortMode) => void;
  onSearchChange: (value: string) => void;
}

const RARITY_KEYS = {
  all: 'rarityAll',
  legendary: 'rarityLegendary',
  epic: 'rarityEpic',
  rare: 'rarityRare',
  uncommon: 'rarityUncommon',
  common: 'rarityCommon',
} as const;

const SORT_KEYS: Record<SkinSortMode, 'sortDefault' | 'sortRarity' | 'sortName' | 'sortTower'> = {
  default: 'sortDefault',
  rarity: 'sortRarity',
  name: 'sortName',
  tower: 'sortTower',
};

const RARITY_OPTIONS: SkinRarityFilter[] = ['all', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
const SORT_OPTIONS: SkinSortMode[] = ['default', 'rarity', 'name', 'tower'];

export function SkinToolbar({
  tab,
  filter,
  rarityFilter,
  sort,
  search,
  onFilterChange,
  onRarityFilterChange,
  onSortChange,
  onSearchChange,
}: SkinToolbarProps) {
  const { t } = useTranslation();
  const s = t.skins.toolbar;

  const filterOptions: { id: SkinFilterMode; label: string }[] = [
    { id: 'all', label: s.filterAll },
    { id: 'unlocked', label: s.filterUnlocked },
    { id: 'locked', label: s.filterLocked },
    { id: 'equipped', label: s.filterEquipped },
  ];

  return (
    <div className="shrink-0 border-b border-[var(--hl-line)] bg-[var(--hl-void)] px-4 py-2.5 sm:px-5">
      {tab === 'library' && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filterOptions.map(({ id, label }) => (
            <Chip key={id} active={filter === id} onClick={() => onFilterChange(id)}>
              {label}
            </Chip>
          ))}
        </div>
      )}

      {tab !== 'sets' && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {RARITY_OPTIONS.map((id) => (
            <Chip key={id} active={rarityFilter === id} onClick={() => onRarityFilterChange(id)}>
              {s[RARITY_KEYS[id]]}
            </Chip>
          ))}
          <span className="mx-1 h-4 w-px bg-[var(--hl-line)]" />
          {SORT_OPTIONS.map((id) => (
            <Chip key={id} active={sort === id} onClick={() => onSortChange(id)}>
              {s[SORT_KEYS[id]]}
            </Chip>
          ))}
          <div className="ml-auto w-full sm:w-[220px]">
            <input
              className="hl-input"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={tab === 'favorites' ? s.searchFavorites : s.searchLibrary}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SkinToolbar;
