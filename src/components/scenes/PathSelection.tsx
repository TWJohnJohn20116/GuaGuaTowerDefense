/**
 * 選擇路徑 · 卡牌牆 → 全屏簡報層（兩步流程）
 *
 * ┌ TopBar：返回 + 標題 + 來源分類 Chip ──────────────────┐
 * ├ 卡牌牆：搜尋／難度篩選／地圖卡網格（唯一會滾動的區域）─┤
 * └ 點一張卡 → 推起全屏簡報層（難度＋模式＋出擊）──────────┘
 *
 * 為什麼拆兩步：卡面上塞難度選擇與出擊鍵，四十張圖就會長出四十組控制項。
 * 卡牌牆只負責「挑哪張圖」，這一局的參數全部在簡報層決定一次。
 *
 * 狀態：選圖狀態（activeKey／簡報層開關）留在這一層的 React state。
 * 它不是世界狀態——進場後真正生效的東西都寫進 startGame 的參數。
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useModStore } from '@/store/modStore';
import { PATHS, DIFFICULTY_MODIFIERS } from '@/data/gameData';
import { listCampaignLevels, startCampaignLevel } from '@/workshop/campaign';
import { setActiveMapTheme } from '@/utils/themeBoard';
import { useWorkshopStore } from '@/store/workshopStore';
import { useWorkshopProgressStore } from '@/store/workshopProgressStore';
import type { DifficultyModifiers, GameDifficulty } from '@/types/game';
import { SceneShell } from '@/components/ui/SceneShell';
import { TopBar } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { findPlayableWaveSet } from '@/utils/waveSets';
import { isPathSelectionTypingTarget, resolvePathSelectionEscape } from '@/data/pathSelectionBack';
import { MapWall } from './path-selection/MapWall';
import { BriefingOverlay } from './path-selection/BriefingOverlay';
import { DEFAULT_MODIFIERS } from './path-selection/CustomTuning';
import {
  CATEGORY_ORDER,
  type MapCategory,
  type MapItemData,
} from './path-selection/mapLibrary';

export default function PathSelection() {
  const { t } = useTranslation();
  const startGame = useGameStore((state) => state.startGame);
  const goBackScene = useGameStore((state) => state.goBackScene);

  const [category, setCategory] = useState<MapCategory>('advanced');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');
  const [endlessMode, setEndlessMode] = useState(false);
  const [selectedWaves, setSelectedWaves] = useState(15);
  const [customWaveSetId, setCustomWaveSetId] = useState('');
  const [customModifiers, setCustomModifiers] = useState<DifficultyModifiers>(DEFAULT_MODIFIERS);

  /* ── 三條地圖來源 ──────────────────────────────────────────────── */

  const mods = useModStore((state) => state.mods);
  const workshopProjects = useWorkshopStore((state) => state.projects);
  const workshopAssets = useWorkshopStore((state) => state.assets);
  const completedByProject = useWorkshopProgressStore((state) => state.completed);

  const advancedItems = useMemo<MapItemData[]>(
    () =>
      Object.entries(PATHS)
        .filter(([key]) => key !== 'random')
        .map(([key, path]) => ({
          key,
          path,
          name: path.name,
          difficulty: path.difficulty,
          description: path.description,
          type: 'advanced' as const,
        })),
    [],
  );

  const modItems = useMemo<MapItemData[]>(() => {
    const items: MapItemData[] = [];
    mods
      .filter((mod) => mod.enabled)
      .forEach((mod) => {
        mod.content.maps?.forEach((map) => {
          items.push({
            key: map.id,
            path: {
              name: map.name,
              description: map.description,
              difficulty: map.difficulty,
              category: map.category,
              waypoints: map.waypoints,
              segments: map.segments,
              startSegmentId: map.startSegmentId,
            },
            name: map.name,
            difficulty: map.difficulty,
            description: map.description,
            type: 'mod' as const,
            modName: mod.metadata.name,
          });
        });
      });
    return items;
  }, [mods]);

  const workshopItems = useMemo<MapItemData[]>(
    () =>
      listCampaignLevels().map((level) => ({
        key: level.key,
        path: level.path,
        name: level.levelName,
        difficulty: level.path.difficulty,
        description: level.projectName,
        type: 'workshop' as const,
        modName: level.projectName,
        isLocked: level.locked,
      })),
    // listCampaignLevels 直接讀 store；這三個依賴只是「資料變了就重算」
    [workshopProjects, workshopAssets, completedByProject],
  );

  const itemsByCategory = useMemo<Record<MapCategory, MapItemData[]>>(
    () => ({ advanced: advancedItems, mod: modItems, workshop: workshopItems }),
    [advancedItems, modItems, workshopItems],
  );

  const items = itemsByCategory[category];
  const activeMap = useMemo(
    () => (activeKey ? items.find((item) => item.key === activeKey) : undefined),
    [items, activeKey],
  );

  /* ── 分類切換：順手收掉簡報層與選取，避免開著別分類的地圖 ───────── */

  const changeCategory = useCallback((next: MapCategory) => {
    setCategory(next);
    setActiveKey(null);
    setBriefingOpen(false);
  }, []);

  const openBriefing = useCallback((key: string) => {
    setActiveKey(key);
    setBriefingOpen(true);
  }, []);

  const closeBriefing = useCallback(() => setBriefingOpen(false), []);

  /* ── Esc：先關簡報層，沒有層才離開場景（搜尋框自己吃掉按鍵） ─────── */

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const action = resolvePathSelectionEscape({
        key: event.key,
        inTextField: isPathSelectionTypingTarget(event.target),
      });
      if (action === 'ignore') return;
      event.preventDefault();
      if (briefingOpen) {
        setBriefingOpen(false);
        return;
      }
      goBackScene();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [briefingOpen, goBackScene]);

  /* ── 出擊 ─────────────────────────────────────────────────────── */

  const handleStart = useCallback(() => {
    if (!activeKey) return;

    // 工坊關卡：走正式局，地圖與波次由 campaign 模組註冊
    if (activeKey.startsWith('ws:')) {
      void startCampaignLevel(activeKey);
      return;
    }

    let effectiveMaxWaves = endlessMode ? 0 : selectedWaves;
    if (!endlessMode && customWaveSetId) {
      const waveSet = findPlayableWaveSet(customWaveSetId);
      if (waveSet) effectiveMaxWaves = waveSet.waves.length;
    }

    // 地圖自訂主題：開局前套用（缺省＝跟隨全域主題）
    setActiveMapTheme(PATHS[activeKey]?.theme ?? null);
    startGame(
      activeKey,
      difficulty,
      endlessMode,
      effectiveMaxWaves,
      difficulty === 'custom' ? customModifiers : undefined,
      customWaveSetId || undefined,
    );
  }, [activeKey, endlessMode, selectedWaves, customWaveSetId, difficulty, customModifiers, startGame]);

  const modifiers =
    difficulty === 'custom'
      ? customModifiers
      : DIFFICULTY_MODIFIERS[difficulty] || DIFFICULTY_MODIFIERS['normal'];

  /* ── 呈現 ─────────────────────────────────────────────────────── */

  const c = t.pathSelection.campaign;
  const categoryLabels: Record<MapCategory, string> = {
    advanced: c.sidebarAdvanced,
    mod: c.sidebarMod,
    workshop: c.sidebarWorkshop,
  };
  const categoryChips = CATEGORY_ORDER.map((id) => ({
    id,
    label: categoryLabels[id],
    count: itemsByCategory[id].length,
  }));

  const emptyState = useMemo(() => {
    if (category === 'mod') {
      return {
        title: t.pathSelectionExt?.noModMaps || c.sidebarMod,
        hint: t.pathSelectionExt?.enableModMaps,
      };
    }
    if (category === 'workshop') {
      return { title: c.sidebarWorkshop, hint: undefined };
    }
    return { title: c.noAdvancedMaps, hint: undefined };
  }, [category, t, c]);

  return (
    <>
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col gap-3">
        <TopBar
          title={t.pathSelection.title}
          meta={t.pathSelection.subtitle}
          back={{ onClick: goBackScene }}
        />

        {/* key={category}：切分類時連篩選狀態一起重置 */}
        <div className="min-h-0 flex-1">
          <MapWall
            key={category}
            items={items}
            activeKey={activeKey}
            onOpen={openBriefing}
            emptyTitle={emptyState.title}
            emptyHint={emptyState.hint}
            categories={categoryChips}
            category={category}
            onCategoryChange={changeCategory}
          />
        </div>

      </div>
    </SceneShell>

    {/* 全屏覆蓋層放在 SceneShell 外面：它不該吃到場景的 p-3 內距 */}
    {briefingOpen && activeMap && (
      <BriefingOverlay
        map={activeMap}
        onClose={closeBriefing}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        customModifiers={customModifiers}
        setCustomModifiers={setCustomModifiers}
        modifiers={modifiers}
        endlessMode={endlessMode}
        setEndlessMode={setEndlessMode}
        selectedWaves={selectedWaves}
        setSelectedWaves={setSelectedWaves}
        customWaveSetId={customWaveSetId}
        setCustomWaveSetId={setCustomWaveSetId}
        onStart={handleStart}
      />
    )}
    </>
  );
}
