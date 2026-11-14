/**
 * 選擇路徑 · HARDLINE Console
 *
 * ┌ TopBar 52px：返回 + 標題 + 分類 Chip ────────────────┐
 * ├ Rail 212px（地圖列） │ 主區：任務簡報 ─────────────────┤
 * └──────────────────────────────────────────────────────┘
 * 難度是方塊分段；獎勵是 StatCell；出擊是全畫面唯一的大面積訊號色。
 */

import { useGameStore } from '@/store/gameStore';
import { useModStore } from '@/store/modStore';
import { PATHS, DIFFICULTY_MODIFIERS } from '@/data/gameData';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { GameDifficulty, DifficultyModifiers } from '@/types/game';
import { SceneShell } from '@/components/ui/SceneShell';
import { Chip, TopBar, Rail } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { findPlayableWaveSet } from '@/utils/waveSets';
import { isPathSelectionTypingTarget, resolvePathSelectionEscape } from '@/data/pathSelectionBack';
import {
  MapSidebar,
  MapBriefing,
  type MapCategory,
  type MapItemData,
} from './path-selection';

export default function PathSelection() {
  const { t } = useTranslation();
  const startGame = useGameStore((state) => state.startGame);
  const goBackScene = useGameStore((state) => state.goBackScene);

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<MapCategory>('advanced');
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('normal');
  const [endlessMode, setEndlessMode] = useState(false);
  const [selectedWaves, setSelectedWaves] = useState<number>(15);
  const [customWaveSetId, setCustomWaveSetId] = useState<string>('');
  const [customModifiers, setCustomModifiers] = useState<DifficultyModifiers>({
    enemyHealthMult: 1.0,
    enemySpeedMult: 1.0,
    enemyRewardMult: 1.0,
    startingMoney: 500,
    startingHealth: 10,
    towerCostMult: 1.0,
    waveDelayMult: 1.0,
  });

  const advancedMapItems = useMemo<MapItemData[]>(
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

  const mods = useModStore((state) => state.mods);
  const modMapItems = useMemo<MapItemData[]>(() => {
    const items: MapItemData[] = [];
    mods
      .filter((m) => m.enabled)
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

  const categoryChips = useMemo(
    () => [
      {
        id: 'advanced' as MapCategory,
        label: t.pathSelection.campaign.sidebarAdvanced,
        count: advancedMapItems.length,
      },
      {
        id: 'mod' as MapCategory,
        label: t.pathSelection.campaign.sidebarMod,
        count: modMapItems.length,
      },
    ],
    [t, advancedMapItems.length, modMapItems.length],
  );

  useEffect(() => {
    const list = activeCategory === 'advanced' ? advancedMapItems : modMapItems;
    if (list.length > 0) {
      const firstAvailable = list.find((m) => !m.isLocked);
      setSelectedPath(firstAvailable ? firstAvailable.key : list[0].key);
    } else {
      setSelectedPath(null);
    }
  }, [activeCategory, advancedMapItems, modMapItems]);

  const leavePathSelection = useCallback(() => {
    goBackScene();
  }, [goBackScene]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const action = resolvePathSelectionEscape({
        key: e.key,
        inTextField: isPathSelectionTypingTarget(e.target),
      });
      if (action === 'ignore') return;
      e.preventDefault();
      leavePathSelection();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [leavePathSelection]);

  const handleStartGame = (overrideId?: string) => {
    const targetId = overrideId || selectedPath;
    if (!targetId) return;
    let effectiveMaxWaves = endlessMode ? 0 : selectedWaves;
    if (!endlessMode && customWaveSetId) {
      const ws = findPlayableWaveSet(customWaveSetId);
      if (ws) effectiveMaxWaves = ws.waves.length;
    }
    startGame(
      targetId,
      selectedDifficulty,
      endlessMode,
      effectiveMaxWaves,
      selectedDifficulty === 'custom' ? customModifiers : undefined,
      customWaveSetId || undefined,
    );
  };

  const mod =
    selectedDifficulty === 'custom'
      ? customModifiers
      : DIFFICULTY_MODIFIERS[selectedDifficulty] || DIFFICULTY_MODIFIERS['normal'];

  const currentSelectedMapData = useMemo(() => {
    if (activeCategory === 'advanced') return advancedMapItems.find((m) => m.key === selectedPath);
    if (activeCategory === 'mod') return modMapItems.find((m) => m.key === selectedPath);
    return undefined;
  }, [activeCategory, advancedMapItems, modMapItems, selectedPath]);

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col gap-3">
        <TopBar
          title={t.pathSelection.title}
          meta={t.pathSelection.subtitle}
          back={{ onClick: leavePathSelection }}
          right={
            <div className="flex items-center gap-2">
              {categoryChips.map((chip) => (
                <Chip
                  key={chip.id}
                  active={activeCategory === chip.id}
                  onClick={() => setActiveCategory(chip.id)}
                >
                  {chip.label}
                  <span className="tabular-nums opacity-70">{chip.count}</span>
                </Chip>
              ))}
            </div>
          }
        />

        <div className="flex min-h-0 flex-1 gap-3">
          <Rail>
            <MapSidebar
              activeCategory={activeCategory}
              selectedId={selectedPath}
              onSelectMap={setSelectedPath}
              advancedMaps={advancedMapItems}
              modMaps={modMapItems}
            />
          </Rail>

          <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--cn-r-lg)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)]">
            <MapBriefing
              selectedMap={currentSelectedMapData}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              endlessMode={endlessMode}
              setEndlessMode={setEndlessMode}
              selectedWaves={selectedWaves}
              setSelectedWaves={setSelectedWaves}
              customModifiers={customModifiers}
              setCustomModifiers={setCustomModifiers}
              mod={mod}
              onStart={() => handleStartGame()}
              customWaveSetId={customWaveSetId}
              setCustomWaveSetId={setCustomWaveSetId}
            />
          </main>
        </div>
      </div>
    </SceneShell>
  );
}
