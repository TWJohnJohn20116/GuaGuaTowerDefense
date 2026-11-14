/**
 * 成就觀測站 · HARDLINE Console
 *
 * 左軌分類（mono 編號 + 筆數）│ 主區密集格子 │ 右側詳情 336px
 * 稀有度只用文字標籤與 --hl-* 資料色，沒有彩虹邊與發光。
 */
import { useState, useMemo, useCallback, useEffect, type KeyboardEvent } from 'react';
import { useAchievementStore } from '@/store/achievementStore';
import { ALL_ACHIEVEMENTS, ACHIEVEMENTS_BY_CATEGORY } from '@/data/achievementData';
import { getCatalogAchievements, isAchievementTrackable } from '@/store/achievementStoreCheck';
import { getPlaystyleIsmAchievements } from '@/data/playstyleIsmRegistry';
import { compareAchievements } from '@/data/achievementSort';
import type { Achievement, AchievementCategory, AchievementStatus } from '@/types/achievement';
import { RARITY_CONFIG } from '@/types/achievement';
import { SceneShell } from '@/components/ui/SceneShell';
import { Rail, TopBar } from '@/components/hl';
import { useTranslation } from '@/i18n';
import {
  isEarned,
  RARITY_ORDER,
  type ObservatoryFilterMode,
  type CategoryProgress,
  type ObservatoryCategory,
  AchievementsHeaderStats,
  AchievementsToolbar,
  AchievementsGrid,
  AchievementDetailPanel,
  ClaimableSummaryBanner,
  CategorySidebar,
  ArchiveRibbon,
} from './achievement-observatory';

const STATUS_WEIGHT: Record<AchievementStatus, number> = {
  completed: 0,
  in_progress: 1,
  locked: 2,
  claimed: 3,
};

export default function Achievements() {
  const { t } = useTranslation();
  const {
    getAchievementStatus,
    getAchievementProgress,
    getCompletionPercentage,
    claimAchievement,
    claimAllAchievements,
  } = useAchievementStore();
  const playerAchievements = useAchievementStore((s) => s.playerAchievements);

  const [selectedCategory, setSelectedCategory] = useState<ObservatoryCategory>('all');
  const [filter, setFilter] = useState<ObservatoryFilterMode>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scrollToId, setScrollToId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [railFocusIndex, setRailFocusIndex] = useState(0);

  useEffect(() => {
    const pending = useAchievementStore.getState().navigateHighlightAchievementId;
    if (!pending) return;
    setSelectedId(pending);
    setScrollToId(pending);
    setHighlightId(pending);
    useAchievementStore.getState().setNavigateHighlightAchievementId(null);
    const timer = window.setTimeout(() => setHighlightId(null), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  const catalog = useMemo(() => getCatalogAchievements(), []);

  const overview = useMemo(() => {
    let earned = 0;
    let points = 0;
    let claimable = 0;
    for (const a of catalog) {
      const s = getAchievementStatus(a.id);
      if (isEarned(s)) {
        earned++;
        points += RARITY_CONFIG[a.rarity].points;
      }
      if (s === 'completed') claimable++;
    }
    return { earned, points, claimable, total: catalog.length };
  }, [catalog, playerAchievements, getAchievementStatus]);

  const playstyleList = useMemo(() => getPlaystyleIsmAchievements(), []);

  const playstyleProgress = useMemo(() => {
    let earned = 0;
    for (const a of playstyleList) {
      if (isEarned(getAchievementStatus(a.id))) earned++;
    }
    return { earned, total: playstyleList.length };
  }, [playstyleList, playerAchievements, getAchievementStatus]);

  const categoryProgress = useMemo<CategoryProgress[]>(() => {
    return (Object.keys(ACHIEVEMENTS_BY_CATEGORY) as AchievementCategory[]).map((category) => {
      const list = (ACHIEVEMENTS_BY_CATEGORY[category] || []).filter(isAchievementTrackable);
      let earned = 0;
      for (const a of list) {
        if (isEarned(getAchievementStatus(a.id))) earned++;
      }
      return { category, earned, total: list.length };
    });
  }, [playerAchievements, getAchievementStatus]);

  const nextTargets = useMemo(() => {
    return catalog
      .filter((a) => {
        if (a.hidden || a.secret) return false;
        const s = getAchievementStatus(a.id);
        if (isEarned(s)) return false;
        const pct = getCompletionPercentage(a.id);
        return pct > 0 && pct < 100;
      })
      .map((a) => ({ achievement: a, pct: getCompletionPercentage(a.id) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 6);
  }, [catalog, playerAchievements, getAchievementStatus, getCompletionPercentage]);

  const filteredAchievements = useMemo(() => {
    let list: Achievement[] =
      selectedCategory === 'all'
        ? catalog
        : selectedCategory === 'playstyle'
          ? playstyleList
          : (ACHIEVEMENTS_BY_CATEGORY[selectedCategory] || []).filter(isAchievementTrackable);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q),
      );
    }

    if (filter !== 'all') {
      list = list.filter((a) => {
        const s = getAchievementStatus(a.id);
        if (filter === 'completed') return isEarned(s);
        if (filter === 'claimable') return s === 'completed';
        if (filter === 'in_progress') return s === 'in_progress';
        if (filter === 'locked') return s === 'locked';
        return true;
      });
    }

    list = list.filter((a) => !a.hidden || isEarned(getAchievementStatus(a.id)));

    return [...list].sort((a, b) => {
      const wa = STATUS_WEIGHT[getAchievementStatus(a.id)];
      const wb = STATUS_WEIGHT[getAchievementStatus(b.id)];
      if (wa !== wb) return wa - wb;
      return (
        RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity) ||
        compareAchievements(a, b)
      );
    });
  }, [catalog, selectedCategory, filter, search, playerAchievements, getAchievementStatus, playstyleList]);

  const categoryEarned = useMemo(() => {
    if (selectedCategory === 'all') return overview.earned;
    if (selectedCategory === 'playstyle') return playstyleProgress.earned;
    const row = categoryProgress.find((c) => c.category === selectedCategory);
    return row?.earned ?? 0;
  }, [selectedCategory, overview.earned, playstyleProgress.earned, categoryProgress]);

  const categoryTotal = useMemo(() => {
    if (selectedCategory === 'all') return overview.total;
    if (selectedCategory === 'playstyle') return playstyleProgress.total;
    const row = categoryProgress.find((c) => c.category === selectedCategory);
    return row?.total ?? 0;
  }, [selectedCategory, overview.total, playstyleProgress.total, categoryProgress]);

  const selectedAchievement = useMemo(
    () =>
      filteredAchievements.find((a) => a.id === selectedId) ??
      ALL_ACHIEVEMENTS.find((a) => a.id === selectedId) ??
      null,
    [filteredAchievements, selectedId],
  );

  useEffect(() => {
    if (filteredAchievements.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredAchievements.some((a) => a.id === selectedId)) {
      setSelectedId(filteredAchievements[0].id);
    }
  }, [filteredAchievements, selectedId]);

  useEffect(() => {
    if (nextTargets.length === 0) {
      setRailFocusIndex(0);
      return;
    }
    if (railFocusIndex >= nextTargets.length) setRailFocusIndex(0);
  }, [nextTargets.length, railFocusIndex]);

  const handleClaim = useCallback((id: string) => claimAchievement(id), [claimAchievement]);

  const handleClaimAll = useCallback(() => {
    const n = claimAllAchievements();
    if (n > 0) setFilter('all');
  }, [claimAllAchievements]);

  const jumpToAchievement = useCallback((id: string) => {
    setSearch('');
    setFilter('all');
    setSelectedCategory('all');
    setSelectedId(id);
    setScrollToId(id);
    setHighlightId(id);
    window.setTimeout(() => setHighlightId(null), 2200);
  }, []);

  const handleRailKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (nextTargets.length === 0) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setRailFocusIndex((i) => (i + 1) % nextTargets.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setRailFocusIndex((i) => (i - 1 + nextTargets.length) % nextTargets.length);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        jumpToAchievement(nextTargets[railFocusIndex].achievement.id);
      }
    },
    [nextTargets, railFocusIndex, jumpToAchievement],
  );

  const selectedStatus = selectedAchievement
    ? getAchievementStatus(selectedAchievement.id)
    : null;

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={t.achievements.title}
          meta={t.achievements.subtitle}
          back={{ to: 'mainMenu' }}
          right={
            <AchievementsHeaderStats
              earnedCount={overview.earned}
              totalCount={overview.total}
              points={overview.points}
              claimableCount={overview.claimable}
            />
          }
        />

        <ClaimableSummaryBanner
          claimableCount={overview.claimable}
          onClaimAll={handleClaimAll}
          onShowClaimable={() => setFilter('claimable')}
        />

        <ArchiveRibbon
          categories={categoryProgress}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          totalEarned={overview.earned}
          totalCount={overview.total}
        />

        <div className="flex min-h-0 flex-1">
          <Rail label="category">
            <CategorySidebar
              categories={categoryProgress}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              totalEarned={overview.earned}
              totalCount={overview.total}
              playstyle={playstyleProgress}
            />
          </Rail>

          <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--hl-void)]">
            <AchievementsToolbar
              filter={filter}
              search={search}
              categoryEarned={categoryEarned}
              categoryTotal={categoryTotal}
              nextTargets={nextTargets}
              railFocusIndex={railFocusIndex}
              onFilterChange={setFilter}
              onSearchChange={setSearch}
              onTargetSelect={jumpToAchievement}
              onRailKeyDown={handleRailKeyDown}
            />

            <div className="flex min-h-0 flex-1">
              <div className="min-h-0 flex-1 overflow-y-auto">
                <AchievementsGrid
                  achievements={filteredAchievements}
                  selectedId={selectedId}
                  highlightId={highlightId}
                  scrollToId={scrollToId}
                  getStatus={getAchievementStatus}
                  getPct={getCompletionPercentage}
                  onSelect={setSelectedId}
                  onScrollHandled={() => setScrollToId(null)}
                />
              </div>

              <aside className="hidden w-[336px] shrink-0 border-l border-[var(--hl-line)] bg-[var(--hl-deck)] lg:flex lg:flex-col">
                <AchievementDetailPanel
                  achievement={selectedAchievement}
                  status={selectedStatus}
                  pct={selectedAchievement ? getCompletionPercentage(selectedAchievement.id) : 0}
                  progress={selectedAchievement ? getAchievementProgress(selectedAchievement.id) : []}
                  onClaim={handleClaim}
                />
              </aside>
            </div>
          </main>
        </div>
      </div>
    </SceneShell>
  );
}
