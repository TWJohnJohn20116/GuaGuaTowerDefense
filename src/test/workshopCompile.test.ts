// 工坊編譯器的行為測試：缺資產、重複 id、波次改寫、規則覆寫、來源快照。
//
// 全部 fixture 都在檔內 inline 造（固定 id／version／時間戳），不依賴 Date.now 的實際值，
// 也不碰 store——編譯器本身是純函式層。

import { describe, expect, it } from 'vitest';
import type { WaveConfig } from '@/types/game';
import type {
  WorkshopEnemyAsset,
  WorkshopLevel,
  WorkshopMapAsset,
  WorkshopProject,
  WorkshopRule,
  WorkshopRuleSetAsset,
  WorkshopScriptAsset,
  WorkshopTowerAsset,
} from '@/types/workshop';
import { compileProject } from '@/workshop/compile/compileProject';
import { runtimeAssetId } from '@/workshop/ids';

const PROJECT_ID = 'project_demo';
const FIXED_TIME = 1763200000000;

function makeLevel(patch: Partial<WorkshopLevel> = {}): WorkshopLevel {
  return {
    id: 'level_1',
    name: 'Level One',
    description: '',
    mapAssetId: null,
    waves: [],
    winConditions: {},
    ruleOverrides: [],
    startingResources: {},
    ruleSetRef: null,
    towerRefs: [],
    scriptRefs: [],
    artRefs: [],
    createdAt: FIXED_TIME,
    updatedAt: FIXED_TIME,
    ...patch,
  };
}

function makeProject(patch: Partial<WorkshopProject> = {}): WorkshopProject {
  return {
    id: PROJECT_ID,
    name: 'Demo Project',
    description: 'demo',
    thumbnail: '',
    version: '1.0.0',
    author: 'tester',
    license: 'cc-by-4.0',
    signature: null,
    ruleSetRef: null,
    winConditions: {},
    assetRefs: [],
    levels: [makeLevel()],
    createdAt: FIXED_TIME,
    updatedAt: FIXED_TIME,
    ...patch,
  };
}

function makeTower(patch: Partial<WorkshopTowerAsset> = {}): WorkshopTowerAsset {
  return {
    id: 'tower_basic',
    kind: 'tower',
    version: '1.0.0',
    name: 'Basic Tower',
    data: {
      baseType: 'basic',
      damage: 12,
      range: 3,
      fireRate: 1,
      cost: 60,
      color: '#7dd3fc',
      projectileColor: '#38bdf8',
      highlightColor: '#0ea5e9',
    },
    ...patch,
  };
}

function makeEnemyAsset(id: string, version = '1.0.0'): WorkshopEnemyAsset {
  return {
    id,
    kind: 'enemy',
    version,
    name: 'Slime',
    data: {
      baseType: 'normal',
      health: 90,
      speed: 60,
      reward: 8,
      size: 14,
      color: '#f97316',
    },
  };
}

function makeMapAsset(patch: Partial<WorkshopMapAsset> = {}): WorkshopMapAsset {
  return {
    id: 'map_field',
    kind: 'map',
    version: '1.0.0',
    name: 'Field',
    data: {
      difficulty: 'normal',
      waypoints: [],
      blockedCells: [],
      grid: { cols: 16, rows: 12 },
    },
    ...patch,
  };
}

function makeRule(id: string, amount: number, patch: Partial<WorkshopRule> = {}): WorkshopRule {
  return {
    id,
    name: id.toUpperCase(),
    enabled: true,
    condition: { trigger: 'waveStart' },
    actions: [{ kind: 'addMoney', value: amount }],
    ...patch,
  };
}

function makeRuleSet(
  id: string,
  rules: WorkshopRule[],
  version = '1.0.0',
): WorkshopRuleSetAsset {
  return { id, kind: 'ruleSet', version, name: id, data: { rules } };
}

function wavesOf(type: string, count = 3): WaveConfig[] {
  return [{ enemies: [{ type, count, delay: 0 }], reward: 10 }];
}

describe('compileProject：缺資產', () => {
  it('關卡 mapAssetId 指向不存在的地圖時不丟例外，回 missingMap 且 mapId 為 null', () => {
    const project = makeProject({ levels: [makeLevel({ mapAssetId: 'map_missing' })] });
    expect(() => compileProject(project, [])).not.toThrow();

    const result = compileProject(project, []);
    expect(result.warnings).toContain('studio.compile.missingMap');
    expect(result.settings.levels[0]?.mapId).toBeNull();

    const issue = result.issues.find((item) => item.code === 'missingMap');
    expect(issue?.key).toBe('studio.compile.missingMap');
    expect(issue?.assetId).toBe('map_missing');
    expect(issue?.levelId).toBe('level_1');
  });

  it('地圖資產存在時 mapId 是改寫後的執行期 id', () => {
    const project = makeProject({ levels: [makeLevel({ mapAssetId: 'map_field' })] });
    const result = compileProject(project, [makeMapAsset()]);
    expect(result.settings.levels[0]?.mapId).toBe(runtimeAssetId(PROJECT_ID, 'map_field'));
  });

  it('缺省欄位的關卡也能編譯（只填必填 waves／winConditions）', () => {
    const minimalLevel: WorkshopLevel = {
      id: 'level_min',
      name: 'Minimal',
      waves: [],
      winConditions: {},
    };
    const result = compileProject(makeProject({ levels: [minimalLevel] }), []);
    expect(result.settings.levels[0]?.mapId).toBeNull();
    expect(result.settings.levels[0]?.waveSetId).toBeNull();
    expect(result.mod.metadata.type).toBe('full');
  });
});

describe('compileProject：重複 id', () => {
  it('兩個資產同 id → duplicateRuntimeId，只保留第一筆', () => {
    const project = makeProject({
      assetRefs: [{ assetId: 'tower_dup', version: '1.0.0' }],
    });
    const first = makeTower({ id: 'tower_dup', name: 'First' });
    const second = makeTower({ id: 'tower_dup', name: 'Second' });

    const result = compileProject(project, [first, second]);
    expect(result.warnings).toContain('studio.compile.duplicateRuntimeId');
    expect(result.mod.content.towers).toHaveLength(1);
    expect(result.mod.content.towers?.[0]?.name).toBe('First');
  });

  it('規則集兩條規則同 id → duplicateRuleId，只編出一支腳本', () => {
    const ruleSet = makeRuleSet('ruleset_dup', [makeRule('r1', 10), makeRule('r1', 20)]);
    const project = makeProject({
      ruleSetRef: { assetId: 'ruleset_dup', version: '1.0.0' },
    });

    const result = compileProject(project, [ruleSet]);
    expect(result.warnings).toContain('studio.compile.duplicateRuleId');
    expect(result.mod.content.scripts).toHaveLength(1);
    expect(result.mod.content.scripts?.[0]?.code).toContain('api.money.add(10);');
  });
});

describe('compileProject：波次敵人改寫', () => {
  it('自訂敵人資產被波次引用 → 改寫成 runtimeAssetId，且 content.enemies 有同 id', () => {
    const project = makeProject({
      assetRefs: [{ assetId: 'enemy_slime', version: '1.0.0' }],
      levels: [
        makeLevel({
          waves: [
            {
              enemies: [
                { type: 'enemy_slime', count: 4, delay: 0 },
                { type: 'normal', count: 2, delay: 0 },
              ],
              reward: 12,
            },
          ],
        }),
      ],
    });

    const result = compileProject(project, [makeEnemyAsset('enemy_slime')]);
    const expectedId = runtimeAssetId(PROJECT_ID, 'enemy_slime');
    expect(expectedId).toBe('project_demo.enemy_slime');

    expect(result.mod.content.enemies?.[0]?.id).toBe(expectedId);
    expect(result.warnings).not.toContain('studio.compile.missingAsset');

    const waveSet = result.mod.content.waves?.[0];
    expect(waveSet?.id).toBe(runtimeAssetId(PROJECT_ID, 'waves.level_1'));
    expect(waveSet?.waves[0]?.enemies[0]?.type).toBe(expectedId);
    // 內建 EnemyType 原樣保留
    expect(waveSet?.waves[0]?.enemies[1]?.type).toBe('normal');
  });

  it('未知 enemy type → missingAsset 並丟掉該 group，整波變空但波數不減', () => {
    const project = makeProject({
      levels: [makeLevel({ waves: wavesOf('enemy_ghost', 2) })],
    });

    const result = compileProject(project, []);
    expect(result.warnings).toContain('studio.compile.missingAsset');
    expect(result.issues.some((item) => item.code === 'missingAsset' && item.assetId === 'enemy_ghost')).toBe(true);
    expect(result.warnings).toContain('studio.compile.invalidWaveGroup');

    const waveSet = result.mod.content.waves?.[0];
    expect(waveSet?.waves).toHaveLength(1);
    expect(waveSet?.waves[0]?.enemies).toEqual([]);
  });
});

describe('compileProject：規則覆寫', () => {
  it('關卡 ruleOverrides 取代一條、刪一條、新增一條', () => {
    const base = makeRuleSet('ruleset_main', [makeRule('r1', 10), makeRule('r2', 20)]);
    const project = makeProject({
      ruleSetRef: { assetId: 'ruleset_main', version: '1.0.0' },
      levels: [
        makeLevel({
          ruleOverrides: [
            { ruleId: 'r1', rule: makeRule('r1', 99) },
            { ruleId: 'r2', rule: null },
            { rule: makeRule('r3', 30) },
          ],
        }),
      ],
    });

    const result = compileProject(project, [base]);
    const scripts = result.mod.content.scripts ?? [];
    const rulePrefix = runtimeAssetId(PROJECT_ID, 'rule.');
    const ruleScripts = scripts.filter((script) => script.id.startsWith(rulePrefix));

    expect(ruleScripts.map((script) => script.id)).toEqual([
      runtimeAssetId(PROJECT_ID, 'rule.r1'),
      runtimeAssetId(PROJECT_ID, 'rule.r3'),
    ]);
    expect(ruleScripts[0]?.code).toContain('api.money.add(99);');
    expect(ruleScripts[0]?.code).not.toContain('api.money.add(10);');
    expect(ruleScripts[0]?.hooks).toEqual(['onWaveStart']);
    expect(ruleScripts[0]?.permissions).toEqual(['economy']);
    expect(ruleScripts[1]?.code).toContain('api.money.add(30);');
  });

  it('grantTower 無法用現有指令表達 → unsupportedRuleAction，不產生半殘腳本', () => {
    const ruleSet = makeRuleSet('ruleset_grant', [
      makeRule('r_grant', 0, { actions: [{ kind: 'grantTower', value: 1 }] }),
    ]);
    const project = makeProject({
      ruleSetRef: { assetId: 'ruleset_grant', version: '1.0.0' },
    });

    const result = compileProject(project, [ruleSet]);
    expect(result.warnings).toContain('studio.compile.unsupportedRuleAction');
    expect(result.mod.content.scripts).toHaveLength(0);
  });

  it('腳本資產內嵌 JS 節點 → inlineJsNotAnalyzable，腳本仍會編譯', () => {
    const scriptAsset: WorkshopScriptAsset = {
      id: 'script_inline',
      kind: 'script',
      version: '1.0.0',
      name: 'Inline Script',
      data: {
        code: 'function onWaveStart(ctx, api) { api.money.add(5); }',
        hooks: ['onWaveStart'],
        permissions: ['economy'],
        enabled: true,
        graph: {
          nodes: [
            {
              id: 'n1',
              kind: 'js',
              op: 'js',
              params: {},
              inlineCode: 'api.money.add(1);',
              next: [],
              position: { x: 0, y: 0 },
            },
          ],
          entryNodeIds: ['n1'],
        },
      },
    };
    const project = makeProject({
      assetRefs: [{ assetId: 'script_inline', version: '1.0.0' }],
    });

    const result = compileProject(project, [scriptAsset]);
    expect(result.warnings).toContain('studio.compile.inlineJsNotAnalyzable');
    expect(result.mod.content.scripts?.[0]?.id).toBe(
      runtimeAssetId(PROJECT_ID, 'script_inline'),
    );
  });
});

describe('compileProject：來源快照與版本', () => {
  it('ref.version 與資產實際版本不同 → assetVersionMismatch，provenance 用實際版本', () => {
    const project = makeProject({
      assetRefs: [{ assetId: 'tower_main', version: '1.0.0' }],
    });

    const result = compileProject(project, [makeTower({ id: 'tower_main', version: '1.1.0' })]);
    expect(result.warnings).toContain('studio.compile.assetVersionMismatch');

    const entry = result.settings.provenance.find((item) => item.assetId === 'tower_main');
    expect(entry?.version).toBe('1.1.0');
    expect(entry?.kind).toBe('tower');
    expect(entry?.runtimeId).toBe(runtimeAssetId(PROJECT_ID, 'tower_main'));
  });

  it('metadata 用固定時間戳換算 ISO，選項可覆寫 gameVersion／enabled／loadOrder', () => {
    const project = makeProject();
    const result = compileProject(project, [], {
      gameVersion: '9.9.9',
      enabled: false,
      loadOrder: 7,
    });

    expect(result.mod.metadata.createdAt).toBe(new Date(FIXED_TIME).toISOString());
    expect(result.mod.metadata.updatedAt).toBe(new Date(FIXED_TIME).toISOString());
    expect(result.mod.metadata.gameVersion).toBe('9.9.9');
    expect(result.mod.enabled).toBe(false);
    expect(result.mod.loadOrder).toBe(7);
  });
});

describe('compileProject：關卡設定', () => {
  it('勝負條件優先於關卡初始資源，波次間隔乘上 waveDelayMult', () => {
    const project = makeProject({
      winConditions: { initialMoney: 200, baseHealth: 30, waveIntervalSeconds: 10 },
      levels: [
        makeLevel({ startingResources: { money: 50, health: 5, waveDelayMult: 1.5 } }),
      ],
    });

    const level = compileProject(project, []).settings.levels[0];
    expect(level?.initialMoney).toBe(200);
    expect(level?.baseHealth).toBe(30);
    expect(level?.waveIntervalSeconds).toBe(15);
  });

  it('沒有勝負條件時用預設值（150 金／20 血／8 秒）', () => {
    const project = makeProject({ winConditions: {}, levels: [makeLevel({ winConditions: {} })] });
    const level = compileProject(project, []).settings.levels[0];
    expect(level?.initialMoney).toBe(150);
    expect(level?.baseHealth).toBe(20);
    expect(level?.waveIntervalSeconds).toBe(8);
  });

  it('關卡 towerRefs 改寫成 allowedTowerIds；空陣列＝全部', () => {
    const tower = makeTower({ id: 'tower_allowed' });
    const project = makeProject({
      assetRefs: [{ assetId: 'tower_allowed', version: '1.0.0' }],
      levels: [makeLevel({ towerRefs: [{ assetId: 'tower_allowed', version: '1.0.0' }] })],
    });

    const result = compileProject(project, [tower]);
    expect(result.settings.levels[0]?.allowedTowerIds).toEqual([
      runtimeAssetId(PROJECT_ID, 'tower_allowed'),
    ]);
  });
});

// 波次層的新欄位（hpScale／intervalMs／enabled／chapter／name）是工坊波次編輯器加的，
// 編譯層要負責兩件事：有值的才寫進 .ggmod、停用的波要歸零但保留波數。
describe('compileProject：波次層欄位', () => {
  it('停用的波編譯成空波 + 0 獎勵，波數不變', () => {
    const project = makeProject({
      levels: [
        makeLevel({
          waves: [
            { enemies: [{ type: 'normal', count: 3, delay: 0 }], reward: 40 },
            { enemies: [{ type: 'normal', count: 5, delay: 0 }], reward: 60, enabled: false },
            { enemies: [{ type: 'normal', count: 2, delay: 0 }], reward: 20 },
          ],
        }),
      ],
    });

    const result = compileProject(project, []);
    const waves = result.mod.content.waves?.[0]?.waves ?? [];
    expect(waves).toHaveLength(3);
    expect(waves[1].enemies).toEqual([]);
    expect(waves[1].reward).toBe(0);
    expect(waves[0].reward).toBe(40);
    expect(waves[2].reward).toBe(20);
    // 停用的波不該被當成「有敵人卻對不上」
    expect(result.warnings).not.toContain('studio.compile.invalidWaveGroup');
  });

  it('hpScale／intervalMs／chapter／name 只帶有值的欄位進封裝', () => {
    const project = makeProject({
      levels: [
        makeLevel({
          waves: [
            {
              enemies: [{ type: 'normal', count: 2, delay: 0 }],
              reward: 10,
              hpScale: 1.5,
              intervalMs: 400,
              chapter: 'A',
              name: '開場',
            },
            { enemies: [{ type: 'normal', count: 2, delay: 0 }], reward: 10 },
          ],
        }),
      ],
    });

    const result = compileProject(project, []);
    const waves = result.mod.content.waves?.[0]?.waves ?? [];
    expect(waves[0]).toMatchObject({ hpScale: 1.5, intervalMs: 400, chapter: 'A', name: '開場' });
    expect(waves[1].hpScale).toBeUndefined();
    expect(waves[1].intervalMs).toBeUndefined();
    expect(waves[1].chapter).toBeUndefined();
    expect(waves[1].name).toBeUndefined();
  });
});
