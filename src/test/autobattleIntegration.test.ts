import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PATH, DIFFICULTY_MODIFIERS, PATHS } from '@/data/gameData';
import { useGameStore } from '@/store/gameStore';
import { buildContext } from '@/store/autobattle/context';
import { decide } from '@/store/autobattle/decide';
import { executeDecision } from '@/store/autobattle/execute';
import type { AutoBattleConfig } from '@/types/autobattle';
import type { TowerType } from '@/types/game';

const setupMatch = () => {
  const path = PATHS[DEFAULT_PATH];
  useGameStore.setState({
    scene: 'game',
    selectedPath: DEFAULT_PATH,
    activeMap: path ?? null,
    towers: [],
    enemies: [],
    projectiles: [],
    money: 2000,
    health: 10,
    currentWave: 3,
    isPlaying: true,
    isPaused: false,
    isGameOver: false,
    waveActive: false,
    allEnemiesSpawned: false,
    selectedTowerType: null,
    selectedTower: null,
    multiSelectedTowerIds: [],
    difficultyModifiers: DIFFICULTY_MODIFIERS.normal,
    placementHistory: [],
    placementHistoryIndex: -1,
    upgradeHistory: [],
    upgradeStats: { totalUpgrades: 0, totalSpent: 0, maxLevelReached: 1 },
    placementStats: { totalPlaced: 0, totalSold: 0, totalSpent: 0 },
    protocolNextTowerDiscount: 0,
    autoBattleDecisions: [],
    autoBattleLastActionAt: {},
  });
};

const config = (): AutoBattleConfig => ({
  mode: 'coach',
  presetId: 'balanced',
  weights: {},
  rules: [],
  allowedTiles: [],
  aiUntilWave: 99,
  lockedTargets: [],
  showOverlay: false,
  dryRun: false,
  firepower: null,
});

/** 掃一小塊區域找出第一個合法塔位 */
const firstBuildable = (type: TowerType) => {
  for (let col = 1; col < 14; col++) {
    for (let row = 1; row < 10; row++) {
      if (useGameStore.getState().placeTowerAs(type, { x: col, y: row })) return { col, row };
    }
  }
  return null;
};

describe('autobattle ↔ store integration', () => {
  beforeEach(setupMatch);

  it('placeTowerAs 可指定塔種放置，且不依賴玩家選中的塔', () => {
    const state = useGameStore.getState();
    const before = state.money;
    const spot = firstBuildable('sniper');
    expect(spot).not.toBeNull();
    const after = useGameStore.getState();
    expect(after.towers).toHaveLength(1);
    expect(after.towers[0].type).toBe('sniper');
    expect(after.money).toBeLessThan(before);
    expect(after.selectedTowerType).toBeNull();
  });

  it('沒有選塔時 placeTower 不會放塔', () => {
    expect(useGameStore.getState().placeTower({ x: 2, y: 2 })).toBe(false);
    expect(useGameStore.getState().towers).toHaveLength(0);
  });

  it('決策可以透過注入的 API 真的把塔放進 store', () => {
    const state = useGameStore.getState();
    const lookahead = { moneyReserve: 100, expectedAbilities: [], expectedEnemyCount: 5, pressure: 0.2, nextWaveTypes: [] };
    const ctx = buildContext(state, ['cooldown'], config(), lookahead);
    const decision = decide({
      ctx,
      pathConfig: PATHS[DEFAULT_PATH],
      costMult: 1,
      rules: [],
      triggers: ['cooldown'],
      lastActionAt: new Map(),
    });
    if (!decision.chosen || decision.verdict !== 'executed') {
      // 沒有可執行候選時，至少確認決策本身有紀錄
      expect(decision.candidates.length).toBeGreaterThan(0);
      return;
    }
    const outcome = executeDecision(decision, {
      place: (type, col, row) => useGameStore.getState().placeTowerAs(type, { x: col, y: row }),
      upgrade: () => false,
      sell: () => false,
      activateSkill: () => false,
      fuse: () => false,
      playerSkill: () => false,
      buyFirepower: () => false,
      skip: () => useGameStore.getState().skipWave(),
    });
    if (decision.chosen.kind === 'place') {
      expect(outcome.executed).toBe(true);
      expect(useGameStore.getState().towers.length).toBe(1);
    }
  });
});
