/**
 * 皮膚工坊 · HARDLINE Console
 *
 * TopBar 52px → 左軌 212px（分頁＋塔分類）＋ 主區（篩選列＋皮膚格）＋ 右側詳情 336–376px。
 * 解鎖條件、收藏、裝備與預覽邏輯全部沿用原 store。
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSkinStore } from '@/store/skinStore';
import { useAchievementStore } from '@/store/achievementStore';
import { ALL_SKINS } from '@/data/skinData';
import type { TowerSkin, SkinRarity } from '@/types/skin';
import type { TowerType } from '@/types/game';
import { useTranslation } from '@/i18n';
import { SceneShell } from '@/components/ui/SceneShell';
import { Deck, Rail, RailItem, SegHead, TopBar } from '@/components/hl';
import { PaletteIcon } from '@/components/ui/Icons';
import {
  SkinHeaderStats,
  SkinToolbar,
  SkinGrid,
  SkinDetailPanel,
  SkinSuggestionBanner,
  SkinSetGrid,
  getSkinUnlockProgress,
  getEquippedSkinIdForSkin,
  buildModelSetSummaries,
  getSkinsByModelSet,
  type SkinFilterMode,
  type SkinRarityFilter,
  type SkinSortMode,
  type SkinPreviewAnimMode,
  type SkinTab,
  type TowerGroupFilter,
  getSkinsForTowerGroup,
  sortSkins,
} from './skin-system';

export default function Skins() {
  const { t } = useTranslation();
  const s = t.skins;
  const {
    equippedSkins,
    favorites,
    isSkinUnlocked,
    isSkinEquipped,
    equipSkin,
    toggleFavorite,
    toggleFavoriteSet,
    getStats,
  } = useSkinStore();

  const statistics = useAchievementStore((st) => st.statistics);
  const completedAchievements = useAchievementStore((st) =>
    Object.entries(st.playerAchievements)
      .filter(([, pa]) => pa.status === 'completed' || pa.status === 'claimed')
      .map(([id]) => id),
  );

  const favoriteSets = useSkinStore((st) => st.favoriteSets ?? []);

  const [tab, setTab] = useState<SkinTab>('library');
  const [filter, setFilter] = useState<SkinFilterMode>('all');
  const [rarityFilter, setRarityFilter] = useState<SkinRarityFilter>('all');
  const [sort, setSort] = useState<SkinSortMode>('default');
  const [towerGroup, setTowerGroup] = useState<TowerGroupFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedSkinId, setSelectedSkinId] = useState<string | null>(null);
  const [previewLevel, setPreviewLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [previewAnimMode, setPreviewAnimMode] = useState<SkinPreviewAnimMode>('idle');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  const stats = getStats();
  const modelSetSummaries = useMemo(
    () => buildModelSetSummaries(isSkinUnlocked),
    [isSkinUnlocked],
  );

  const filteredSkins = useMemo(() => {
    let skins: TowerSkin[] = ALL_SKINS.filter((sk) => !sk.hidden);

    if (tab === 'favorites') {
      skins = skins.filter((sk) => favorites.includes(sk.id));
    } else if (tab === 'sets' && selectedSetId) {
      skins = getSkinsByModelSet(selectedSetId);
    } else if (tab === 'library') {
      const groupTowers = getSkinsForTowerGroup(towerGroup);
      skins = skins.filter(
        (sk) => sk.towerType === 'all' || groupTowers.includes(sk.towerType as TowerType),
      );

      switch (filter) {
        case 'unlocked':
          skins = skins.filter((sk) => isSkinUnlocked(sk.id));
          break;
        case 'locked':
          skins = skins.filter((sk) => !isSkinUnlocked(sk.id));
          break;
        case 'equipped':
          skins = skins.filter((sk) => isSkinEquipped(sk.id));
          break;
      }
    }

    if (rarityFilter !== 'all') {
      skins = skins.filter((sk) => sk.rarity === rarityFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      skins = skins.filter(
        (sk) =>
          sk.name.toLowerCase().includes(q) ||
          sk.description.toLowerCase().includes(q) ||
          sk.towerType.toLowerCase().includes(q),
      );
    }

    return sortSkins(skins, sort, favorites, isSkinEquipped, isSkinUnlocked);
  }, [tab, filter, rarityFilter, sort, towerGroup, search, favorites, selectedSetId, isSkinUnlocked, isSkinEquipped]);

  const selectedSkin = useMemo(
    () => filteredSkins.find((sk) => sk.id === selectedSkinId) || null,
    [filteredSkins, selectedSkinId],
  );

  const selectedUnlockProgress = useMemo(() => {
    if (!selectedSkin) return null;
    return getSkinUnlockProgress(
      selectedSkin,
      statistics,
      completedAchievements,
      isSkinUnlocked(selectedSkin.id),
    );
  }, [selectedSkin, statistics, completedAchievements, isSkinUnlocked]);

  const selectedEquippedSkinId = useMemo(() => {
    if (!selectedSkin) return null;
    return getEquippedSkinIdForSkin(selectedSkin, equippedSkins);
  }, [selectedSkin, equippedSkins]);

  const suggestion = useMemo(() => {
    const locked = ALL_SKINS.filter((sk) => !sk.hidden && !isSkinUnlocked(sk.id));
    if (locked.length === 0) return null;
    const rarityOrder: SkinRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const next = [...locked].sort(
      (a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity),
    )[0];
    return { label: next.name, nearUnlock: next.rarity === 'common' || next.rarity === 'uncommon' };
  }, [isSkinUnlocked]);

  useEffect(() => {
    if (filteredSkins.length === 0) {
      setSelectedSkinId(null);
      return;
    }
    if (!selectedSkinId || !filteredSkins.some((sk) => sk.id === selectedSkinId)) {
      setSelectedSkinId(filteredSkins[0].id);
    }
  }, [filteredSkins, selectedSkinId]);

  useEffect(() => {
    setPreviewLevel(3);
    setPreviewAnimMode('idle');
    setCompareMode(false);
  }, [selectedSkin?.id]);

  const handlePrev = useCallback(() => {
    if (filteredSkins.length === 0) return;
    const i = filteredSkins.findIndex((sk) => sk.id === selectedSkinId);
    const next = i <= 0 ? filteredSkins.length - 1 : i - 1;
    setSelectedSkinId(filteredSkins[next].id);
  }, [filteredSkins, selectedSkinId]);

  const handleNext = useCallback(() => {
    if (filteredSkins.length === 0) return;
    const i = filteredSkins.findIndex((sk) => sk.id === selectedSkinId);
    const next = i < 0 || i >= filteredSkins.length - 1 ? 0 : i + 1;
    setSelectedSkinId(filteredSkins[next].id);
  }, [filteredSkins, selectedSkinId]);

  const handleTabChange = (next: SkinTab) => {
    setTab(next);
    if (next === 'favorites') setFilter('all');
    if (next !== 'sets') setSelectedSetId(null);
  };

  const handleSelectSet = (setId: string) => {
    setSelectedSetId(setId);
    const firstSkin = getSkinsByModelSet(setId)[0];
    if (firstSkin) setSelectedSkinId(firstSkin.id);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        setPreviewLevel(Number(e.key) as 1 | 2 | 3 | 4 | 5);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePrev, handleNext]);

  const groupCount = (group: TowerGroupFilter) => {
    if (group === 'all') return ALL_SKINS.filter((sk) => !sk.hidden).length;
    const towers = getSkinsForTowerGroup(group);
    return ALL_SKINS.filter((sk) => !sk.hidden && sk.towerType !== 'all' && towers.includes(sk.towerType as TowerType)).length;
  };

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={t.mainMenu.skins}
          meta={t.mainMenu.skinsDesc}
          back={{ to: 'mainMenu' }}
          glyph={<PaletteIcon className="h-4 w-4" />}
          right={<SkinHeaderStats
            unlockedCount={stats.unlockedSkins}
            totalCount={stats.totalSkins}
            equippedCount={stats.equippedSkins}
            favoriteCount={favorites.length}
          />}
        />

        <div className="flex min-h-0 flex-1">
          <Rail label={s.all}>
            <RailItem
              index={1}
              label={s.toolbar.tabLibrary}
              active={tab === 'library'}
              onClick={() => handleTabChange('library')}
              right={<span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
                {stats.unlockedSkins}/{stats.totalSkins}
              </span>}
            />
            <RailItem
              index={2}
              label={s.toolbar.tabFavorites}
              active={tab === 'favorites'}
              onClick={() => handleTabChange('favorites')}
              right={<span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
                {favorites.length}
              </span>}
            />
            <RailItem
              index={3}
              label={s.toolbar.tabSets}
              active={tab === 'sets'}
              onClick={() => handleTabChange('sets')}
              right={<span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
                {favoriteSets.length}
              </span>}
            />

            {tab === 'library' && (
              <>
                <div className="px-3 pb-1 pt-4">
                  <SegHead label={s.toolbar.towerGroupAll} />
                </div>
                {([
                  ['all', s.toolbar.towerGroupAll],
                  ['basic', s.toolbar.towerGroupBasic],
                  ['element', s.toolbar.towerGroupElement],
                  ['fusion', s.toolbar.towerGroupFusion],
                ] as const).map(([id, label], i) => (
                  <RailItem
                    key={id}
                    index={4 + i}
                    label={label}
                    active={towerGroup === id}
                    onClick={() => setTowerGroup(id)}
                    right={<span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
                      {groupCount(id)}
                    </span>}
                  />
                ))}
              </>
            )}
          </Rail>

          <main className="flex min-w-0 flex-1 flex-col bg-[var(--arc-void)]">
            <SkinToolbar
              tab={tab}
              filter={filter}
              rarityFilter={rarityFilter}
              sort={sort}
              search={search}
              onFilterChange={setFilter}
              onRarityFilterChange={setRarityFilter}
              onSortChange={setSort}
              onSearchChange={setSearch}
            />

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {tab === 'sets' && !selectedSetId ? (
                <SkinSetGrid
                  sets={modelSetSummaries}
                  selectedSetId={selectedSetId}
                  favoriteSets={favoriteSets}
                  onSelectSet={handleSelectSet}
                  onToggleSetFavorite={toggleFavoriteSet}
                />
              ) : (
                <>
                  {tab === 'sets' && selectedSetId && (
                    <div className="mb-3 flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedSetId(null)}
                        className="arc-chip flex items-center gap-1.5"
                      >
                        <span className="font-mono text-[10px] tracking-[0.08em] uppercase">
                          {s.backToSets}
                        </span>
                      </button>
                      <span className="arc-label">
                        {modelSetSummaries.find((set) => set.id === selectedSetId)?.name}
                      </span>
                    </div>
                  )}
                  <SkinGrid
                    skins={filteredSkins}
                    selectedId={selectedSkinId}
                    isUnlocked={isSkinUnlocked}
                    isEquipped={isSkinEquipped}
                    isFavorite={(id) => favorites.includes(id)}
                    onSelect={setSelectedSkinId}
                    onToggleFavorite={toggleFavorite}
                    previewAnimMode={previewAnimMode}
                    emptyHint={
                      tab === 'favorites'
                        ? s.emptyNoFavorites
                        : tab === 'sets'
                          ? s.emptyNoSkinsInSet
                          : undefined
                    }
                  />
                </>
              )}

              {suggestion && tab === 'library' && filter !== 'unlocked' && (
                <SkinSuggestionBanner
                  label={suggestion.label}
                  nearUnlock={suggestion.nearUnlock}
                />
              )}
            </div>
          </main>

          <Deck as="aside" className="flex w-[336px] shrink-0 flex-col overflow-y-auto arc-panel--flat p-4 xl:w-[376px]">
            <SkinDetailPanel
              skin={selectedSkin}
              isUnlocked={selectedSkin ? isSkinUnlocked(selectedSkin.id) : false}
              isEquipped={selectedSkin ? isSkinEquipped(selectedSkin.id) : false}
              isFavorite={selectedSkin ? favorites.includes(selectedSkin.id) : false}
              equippedSkins={equippedSkins}
              previewLevel={previewLevel}
              previewAnimMode={previewAnimMode}
              compareMode={compareMode}
              unlockProgress={selectedUnlockProgress}
              equippedSkinId={selectedEquippedSkinId}
              onLevelChange={setPreviewLevel}
              onAnimModeChange={setPreviewAnimMode}
              onCompareModeChange={setCompareMode}
              onToggleFavorite={() => selectedSkin && toggleFavorite(selectedSkin.id)}
              onEquip={equipSkin}
            />
          </Deck>
        </div>
      </div>
    </SceneShell>
  );
}
