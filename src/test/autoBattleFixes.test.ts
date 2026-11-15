/**
 * 自動戰鬥 B1–B3 回歸測試。
 *
 * 這三項缺陷為什麼能活這麼久：`src/test/` 158 個測試檔中沒有任何一個提到 autoBattle，
 * 所以「AI 永遠不升級」「AI 建塔少付錢」「融合功能不可達」都沒有東西會紅。
 * 詳細證據見 docs/research/2026-11-14-auto-battle-research.md。
 *
 * B1：升級判定誤用「批次升級」predicate（要求已選路線）→ Lv1 塔永遠被過濾掉。
 * B2：AI 建塔直接寫 TOWER_DATA[type].cost，沒乘 towerCostMult → 1.3 倍圖少付 23%。
 * B3：autoFusion 沒有 UI 入口 → 87 行融合評分＋執行全是死碼。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { DEFAULT_PATH, DIFFICULTY_MODIFIERS, GAME_CONSTANTS, PATHS, TOWER_DATA } from '@/data/gameData';
import { sampleBuildablePoints } from '@/data/mapGeometry';
import {
  canAutoUpgradeTower,
  canBatchUpgradeTower,
  getTowerUpgradeCost,
} from '@/data/towerUpgradeCost';
import { getTowerBuildCost } from '@/data/towerCost';
import type { MapPoint } from '@/types/game';
import { makeTower } from './fixtures';

/** 找第一個可建造點（自由制：用共用的取樣器，不再掃格子） */
const firstEmpty = (): MapPoint => {
  const spot = sampleBuildablePoints(PATHS[DEFAULT_PATH], 1)[0];
  if (!spot) throw new Error('地圖上沒有可建造點可測試');
  return spot;
};

const resetMatch = (towerCostMult = 1): MapPoint => {
  useGameStore.setState({
    activeMap: PATHS[DEFAULT_PATH] ?? null,
    towers: [],
    enemies: [],
    projectiles: [],
    money: 10_000,
    currentWave: 3,
    selectedTowerType: 'basic',
    selectedTower: null,
    difficultyModifiers: { ...DIFFICULTY_MODIFIERS.normal, towerCostMult },
    placementHistory: [],
    placementHistoryIndex: -1,
    upgradeHistory: [],
    upgradeStats: { totalUpgrades: 0, totalSpent: 0, maxLevelReached: 1 },
    upgradeAnimations: [],
    placementStats: { totalPlaced: 0, totalSold: 0, totalSpent: 0 },
    protocolNextTowerDiscount: 0,
    fusionMode: false,
    fusionSourceId: null,
    // 與 gameStore.ts 的預設值一致（B3 的契約：融合預設關閉）
    autoBattleConfig: {
      useSkills: true,
      autoSkip: true,
      autoUpgrade: true,
      autoPlace: true,
      autoSell: false,
      autoFusion: false,
    },
  });
  return firstEmpty();
};

beforeEach(() => {
  resetMatch();
});

describe('B1：自動戰鬥的升級判定', () => {
  it('Lv1 必須可升級（原本用 canBatchUpgradeTower 會回 false，AI 永遠停在 Lv1）', () => {
    expect(canAutoUpgradeTower({ level: 1, upgradePath: null })).toBe(true);
  });

  it('Lv2 已選路線可升級，未選路線則擋下（狀態壞了交回手動處理）', () => {
    expect(canAutoUpgradeTower({ level: 2, upgradePath: 'A' })).toBe(true);
    expect(canAutoUpgradeTower({ level: 2, upgradePath: 'B' })).toBe(true);
    expect(canAutoUpgradeTower({ level: 2, upgradePath: null })).toBe(false);
  });

  it('滿級不可升級，且可自訂上限', () => {
    expect(canAutoUpgradeTower({ level: GAME_CONSTANTS.MAX_TOWER_LEVEL, upgradePath: 'A' })).toBe(false);
    expect(canAutoUpgradeTower({ level: 4, upgradePath: 'A' })).toBe(true);
    expect(canAutoUpgradeTower({ level: 3, upgradePath: 'A' }, 3)).toBe(false);
  });

  it('批次升級規則不受影響（Lv1 仍不可，因為它沒有路線參數可傳）', () => {
    expect(canBatchUpgradeTower({ level: 1, upgradePath: null })).toBe(false);
    expect(canBatchUpgradeTower({ level: 2, upgradePath: 'A' })).toBe(true);
  });

  it('AI 的「Lv1→2 自己選路線」與 upgradeTower 契約一致：沒給路線就失敗，給了就成功', () => {
    const pos = resetMatch();
    const tower = makeTower({ id: 'tower-b1', type: 'basic', pos, level: 1, upgradePath: null });
    useGameStore.setState({ towers: [tower] });

    // 沒帶路線 → store 拒絕（newLevel === 2 需要 path）
    expect(useGameStore.getState().upgradeTower(tower)).toBe(false);
    expect(useGameStore.getState().towers[0].level).toBe(1);

    // 帶路線（AI 會自己決定 A/B）→ 成功，並且路線被寫進塔上
    const moneyBefore = useGameStore.getState().money;
    expect(useGameStore.getState().upgradeTower(tower, 'B')).toBe(true);

    const upgraded = useGameStore.getState().towers[0];
    expect(upgraded.level).toBe(2);
    expect(upgraded.upgradePath).toBe('B');
    expect(useGameStore.getState().money).toBe(
      moneyBefore - getTowerUpgradeCost(TOWER_DATA.basic.cost, 1),
    );
  });

  it('實際跑一輪決策就會升級（不只是謂詞正確）', () => {
    const grid = resetMatch();
    // 12 座高績效 Lv1 塔：valueScore = 2(擊殺) + 2(傷害) + 2(剩餘等級) = 6 > 3 → 必定觸發升級
    const towers: Tower[] = Array.from({ length: 12 }, (_, i) =>
      makeTower({
        id: `tw-${i}`,
        type: 'basic',
        pos: { x: (i % 5) + 1.5, y: Math.floor(i / 5) + 1.5 },
        level: 1,
        upgradePath: null,
        kills: 100,
        totalDamage: 5000,
      }),
    );
    useGameStore.setState({
      grid,
      towers,
      money: 10_000,
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      autoBattleEnabled: true,
      autoBattleLastDecision: 0,
    });

    useGameStore.getState().runAutoBattleLogic();

    const upgraded = useGameStore.getState().towers.filter((t) => t.level >= 2);
    expect(upgraded.length, 'AI 完全沒有升級任何塔（B1 回歸）').toBeGreaterThan(0);
    // Lv1 → Lv2 必須自己選路線，否則 store 的契約（newLevel===2 需 path）會擋下
    expect(upgraded.every((t) => t.upgradePath === 'A' || t.upgradePath === 'B')).toBe(true);
  });
});

describe('B2：建塔費用倍率', () => {  it('getTowerBuildCost 套用倍率並四捨五入', () => {
    expect(getTowerBuildCost(150, 1)).toBe(150);
    expect(getTowerBuildCost(150, 1.3)).toBe(195);
    expect(getTowerBuildCost(150, 0.5)).toBe(75);
    expect(getTowerBuildCost(175, 1.3)).toBe(228); // 227.5 → 228
    expect(getTowerBuildCost(150)).toBe(150); // 預設倍率 1
  });

  it('非法倍率（0 / 負數 / NaN）回退為 1，不會把塔變成免費或負價', () => {
    expect(getTowerBuildCost(150, 0)).toBe(150);
    expect(getTowerBuildCost(150, -2)).toBe(150);
    expect(getTowerBuildCost(150, Number.NaN)).toBe(150);
  });

  it('placeTower 的扣款與算式同源：1.3 倍圖付 1.3 倍價（AI 也吃同一個函式）', () => {
    const grid = resetMatch(1.3);
    const pos = firstEmpty(grid);
    const before = useGameStore.getState().money;

    expect(useGameStore.getState().placeTower(pos)).toBe(true);

    const expected = getTowerBuildCost(TOWER_DATA.basic.cost, 1.3);
    expect(useGameStore.getState().money).toBe(before - expected);
    expect(expected).toBeGreaterThan(TOWER_DATA.basic.cost); // 1.3 倍確實比較貴
  });

  it('placeTower 在 0.5 倍圖付半價（AI 不會再被自己的算式掐死）', () => {
    const grid = resetMatch(0.5);
    const pos = firstEmpty(grid);
    const before = useGameStore.getState().money;

    expect(useGameStore.getState().placeTower(pos)).toBe(true);

    const expected = getTowerBuildCost(TOWER_DATA.basic.cost, 0.5);
    expect(useGameStore.getState().money).toBe(before - expected);
    expect(expected).toBeLessThan(TOWER_DATA.basic.cost);
  });
});

describe('B3：融合開關', () => {
  it('預設關閉（融合會吃掉兩座塔，不能默默開啟）', () => {
    expect(useGameStore.getState().autoBattleConfig.autoFusion).toBe(false);
  });

  it('側欄開關走的路徑能寫入，且不影響其他 5 個鍵', () => {
    useGameStore.getState().setAutoBattleConfig({ autoFusion: true });

    const config = useGameStore.getState().autoBattleConfig;
    expect(config.autoFusion).toBe(true);
    expect(config.autoPlace).toBe(true);
    expect(config.autoUpgrade).toBe(true);
    expect(config.useSkills).toBe(true);
    expect(config.autoSkip).toBe(true);
    expect(config.autoSell).toBe(false);
  });
});
