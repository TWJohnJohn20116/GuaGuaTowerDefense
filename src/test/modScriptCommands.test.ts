/**
 * 腳本指令落地（applyModScriptCommands）的行為測試
 *
 * 為什麼要這支：節點庫掃描只證明「產得出程式碼」，不證明指令真的把狀態改對。
 * 這裡直接呼叫落地函式，斷言 store 的實際變化——六種新指令各至少一個案例。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { applyModScriptCommands } from '@/mod-script/commands';
import { useGameStore } from '@/store/gameStore';
import { DEFAULT_PATH, PATHS, DIFFICULTY_MODIFIERS, PATHS } from '@/data/gameData';
import { makeEnemy } from '@/test/fixtures';
import type { ModScriptCommand } from '@/types/modScript';
import type { MapPoint } from '@/types/game';
import { sampleBuildablePoints } from '@/data/mapGeometry';

const source = { scriptId: 'script-1', scriptName: '測試腳本' };

const reset = (): void => {
  useGameStore.setState({
    scene: 'game',
    selectedPath: DEFAULT_PATH,
    activeMap: PATHS[DEFAULT_PATH] ?? null,
    towers: [],
    enemies: [],
    projectiles: [],
    impactParticles: [],
    money: 1000,
    score: 0,
    health: 10,
    currentWave: 1,
    isGameOver: false,
    difficultyModifiers: DIFFICULTY_MODIFIERS.normal,
    scriptTowerMods: {},
    scriptWaveDelayMs: 0,
    selectedTowerType: null,
  });
};

const run = async (commands: ModScriptCommand[]) => applyModScriptCommands(commands, source);

/** 找一個可以放塔的點（自由制：用共用的取樣器） */
const findFreePoint = (): MapPoint => {
  const spot = sampleBuildablePoints(PATHS[DEFAULT_PATH], 1)[0];
  if (!spot) throw new Error('地圖上沒有可建造點');
  return spot;
};

describe('指令落地', () => {
  beforeEach(reset);

  it('addMoney 改變金錢', async () => {
    await run([{ kind: 'addMoney', amount: 250 }]);
    expect(useGameStore.getState().money).toBeCloseTo(1250);
  });

  it('addScore 改變分數且不會低於 0', async () => {
    await run([{ kind: 'addScore', amount: 30 }]);
    expect(useGameStore.getState().score).toBe(30);
    await run([{ kind: 'addScore', amount: -999 }]);
    expect(useGameStore.getState().score).toBe(0);
  });

  it('modifyTower 累加到 scriptTowerMods 並夾住上限', async () => {
    await run([
      { kind: 'modifyTower', scope: '*', stat: 'damage', multiplier: 2 },
      { kind: 'modifyTower', scope: '*', stat: 'damage', multiplier: 2 },
    ]);
    expect(useGameStore.getState().scriptTowerMods['*']?.damage).toBeCloseTo(4);

    await run([{ kind: 'modifyTower', scope: 'basic', stat: 'range', multiplier: 99 }]);
    expect(useGameStore.getState().scriptTowerMods.basic?.range).toBeCloseTo(5);
  });

  it('setDifficulty 反覆呼叫會飽和而不是指數成長', async () => {
    for (let i = 0; i < 20; i += 1) {
      await run([{ kind: 'setDifficulty', healthMult: 2 }]);
    }
    expect(useGameStore.getState().difficultyModifiers.enemyHealthMult).toBeCloseTo(10);
  });

  it('setWaveDelay 寫進 store', async () => {
    await run([{ kind: 'setWaveDelay', delayMs: 1500 }]);
    expect(useGameStore.getState().scriptWaveDelayMs).toBe(1500);
  });

  it('teleportEnemy 只搬動指定型別', async () => {
    useGameStore.setState({
      enemies: [
        makeEnemy({ id: 'a', type: 'normal', x: 1, y: 1 }),
        makeEnemy({ id: 'b', type: 'boss', x: 2, y: 2 }),
      ],
    });
    await run([{ kind: 'teleportEnemy', enemyType: 'normal', row: 5, col: 6 }]);
    const enemies = useGameStore.getState().enemies;
    expect(enemies.find((enemy) => enemy.id === 'a')).toMatchObject({ x: 6, y: 5 });
    expect(enemies.find((enemy) => enemy.id === 'b')).toMatchObject({ x: 2, y: 2 });
  });

  it('playEffect 會被套用（粒子進渲染緩衝，不在 store 裡）', async () => {
    // 粒子是模組級 particlesBuffer，由渲染層取用；這裡只能驗指令有落地
    const result = await run([{ kind: 'playEffect', row: 3, col: 4, color: '#ffffff' }]);
    expect(result.applied).toBe(1);
  });

  it('grantTower 在空格放塔，佔用格會被跳過', async () => {
    const point = findFreePoint();
    const first = await run([
      { kind: 'grantTower', towerType: 'basic', row: point.y, col: point.x },
    ]);
    expect(first.applied).toBe(1);
    expect(useGameStore.getState().towers).toHaveLength(1);

    const second = await run([
      { kind: 'grantTower', towerType: 'basic', row: point.y, col: point.x },
    ]);
    expect(second.skipped).toBe(1);
    expect(useGameStore.getState().towers).toHaveLength(1);
  });

  it('upgradeTowerAt 與 sellTowerAt 對座標作用', async () => {
    const point = findFreePoint();
    await run([{ kind: 'grantTower', towerType: 'basic', row: point.y, col: point.x }]);
    const placed = useGameStore.getState().towers[0];
    expect(placed).toBeDefined();

    const upgraded = await run([
      { kind: 'upgradeTowerAt', row: point.y, col: point.x },
    ]);
    expect(upgraded.applied).toBe(1);
    expect(useGameStore.getState().towers[0].level).toBeGreaterThan(1);

    await run([{ kind: 'sellTowerAt', row: point.y, col: point.x }]);
    expect(useGameStore.getState().towers).toHaveLength(0);
  });
});
