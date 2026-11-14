/**
 * 圖鑑 · 圖示庫分頁
 * 瀏覽遊戲內所有 SVG 圖示（左網格 + 右詳情）
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { SearchInput } from '@/components/ui/CustomInput';
import {
  SceneBrowseGridPanel,
  SceneBrowseGridScroll,
  SceneBrowseDetailAside,
  SceneBrowseToolbar,
} from '@/components/ui/SceneWorkshopLayout';
import { SceneFilterChip, SceneBrowseEmptyState } from '@/components/ui/SceneBrowseParts';
import { SelectionCardFrame } from '@/components/ui/SelectionCardFrame';
import { SparklesIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { getIconCategoryLabel } from '@/i18n/iconCategoryLabels';
import {
  ALL_GAME_ICONS,
  ICON_CATEGORY_ORDER,
  ICON_LIBRARY_SCOPE,
  filterGameIcons,
  type IconCategory,
  type GameIconEntry,
} from './gameIconRegistry';
import { IconDetailPanel } from './IconDetailPanel';

interface IconLibraryPanelProps {
  onOpenFile?: (path: string) => void;
}

export function IconLibraryPanel({ onOpenFile }: IconLibraryPanelProps) {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<IconCategory | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterGameIcons({ search, category }),
    [search, category],
  );

  const selected = useMemo(
    () => filtered.find((icon) => icon.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((icon) => icon.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <SceneBrowseToolbar>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="w-full lg:w-72">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder={e.iconLibSearchPlaceholder}
              size="sm"
            />
          </div>
          <div className="flex flex-1 flex-wrap gap-2">
            <SceneFilterChip
              active={category === 'all'}
              accent="sky"
              onClick={() => setCategory('all')}
            >
              {e.iconLibFilterAll.replace('{count}', String(ALL_GAME_ICONS.length))}
            </SceneFilterChip>
            {ICON_CATEGORY_ORDER.map((cat) => {
              const count = ALL_GAME_ICONS.filter((i) => i.category === cat).length;
              if (count === 0) return null;
              return (
                <SceneFilterChip
                  key={cat}
                  active={category === cat}
                  accent="sky"
                  onClick={() => setCategory(cat)}
                >
                  {`${getIconCategoryLabel(e, cat)} (${count})`}
                </SceneFilterChip>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--hl-ink-3)]">
            {e.iconLibTotalCount.replace('{count}', String(filtered.length))}
          </div>
          <span className="border border-[var(--hl-line)] bg-[var(--hl-deck-2)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--hl-vital)]">
            {e.iconLibEmbeddedBadge}
          </span>
          <span className="text-[10px] font-medium text-[var(--hl-ink-4)]">
            {e.iconLibScopeHint.replace('{count}', String(ICON_LIBRARY_SCOPE.totalInRegistry))}
          </span>
        </div>
      </SceneBrowseToolbar>

      <div className="flex min-h-0 flex-1 flex-col gap-4 sm:flex-row">
        <SceneBrowseGridPanel className="min-h-[320px] flex-1">
          <SceneBrowseGridScroll>
            {filtered.length === 0 ? (
              <SceneBrowseEmptyState
                icon={<SparklesIcon className="h-10 w-10 text-[var(--hl-ink-4)]" />}
                message={e.iconLibNoResults}
                actionLabel={e.iconLibClearFilter}
                onAction={() => {
                  setSearch('');
                  setCategory('all');
                }}
              />
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {filtered.map((icon, index) => (
                  <IconCard
                    key={icon.id}
                    icon={icon}
                    selected={selectedId === icon.id}
                    index={index}
                    onClick={() => setSelectedId(icon.id)}
                  />
                ))}
              </div>
            )}
          </SceneBrowseGridScroll>
        </SceneBrowseGridPanel>

        <SceneBrowseDetailAside className="min-h-0">
          <IconDetailPanel icon={selected} onOpenFile={onOpenFile} />
        </SceneBrowseDetailAside>
      </div>
    </div>
  );
}

function IconCard({
  icon,
  selected,
  index,
  onClick,
}: {
  icon: GameIconEntry;
  selected: boolean;
  index: number;
  onClick: () => void;
}) {
  const IconCmp = icon.Component;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.01, 0.25) }}
      className="h-full"
    >
      <SelectionCardFrame
        selected={selected}
        accent="#38bdf8"
        onClick={onClick}
        minHeight={108}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center  border border-[var(--hl-line)] bg-[var(--hl-deck-2)]">
            <IconCmp
              className={`h-6 w-6 transition-colors ${
                selected ? 'text-[var(--hl-reach)]' : 'text-[var(--hl-ink-2)] group-hover:text-[var(--hl-ink)]'
              }`}
            />
          </div>
          <span className="line-clamp-2 w-full text-center text-[10px] font-bold leading-tight text-[var(--hl-ink-3)] group-hover:text-[var(--hl-ink)]">
            {icon.displayName}
          </span>
        </div>
      </SelectionCardFrame>
    </motion.div>
  );
}
