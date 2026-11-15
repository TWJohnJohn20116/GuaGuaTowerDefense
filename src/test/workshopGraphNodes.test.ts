/**
 * 規則圖新增節點（第一層：布林組合／快照條件／數值來源／once／清除變數）
 *
 * 斷言原則與 workshopGraph.test.ts 一致：真的建一張圖、呼叫 compileGraph，
 * 檢查產出的程式碼內容與可建構性；不讀原始碼字串、不執行產生的程式。
 *
 * 這裡額外做一件現有測試沒做的事：對「每一個新節點型別」跑一次編譯，
 * 確保沒有任何一個漏掉 codegen 分支（漏掉會印出 unsupported node 註解）。
 */
import { describe, expect, it } from 'vitest';
import type { GraphEdge, GraphNode, GraphParamValue, RuleGraph } from '@/workshop/graph/model';
import { compileGraph, compileGraphCode } from '@/workshop/graph/codegen';
import { defaultParams, nodeSpec } from '@/workshop/graph/nodeLibrary';

function makeNode(
  id: string,
  type: string,
  params: Record<string, GraphParamValue> = {},
): GraphNode {
  const spec = nodeSpec(type);
  if (!spec) throw new Error('節點型別不在節點庫：' + type);
  return { id, type, x: 0, y: 0, params: { ...defaultParams(spec), ...params } };
}

function makeEdge(id: string, from: string, fromPort: string, to: string, toPort: string): GraphEdge {
  return { id, from, fromPort, to, toPort };
}

function makeGraph(nodes: GraphNode[], edges: GraphEdge[]): RuleGraph {
  return { version: 1, nodes, edges };
}

/** 事件 → 動作 */
function flowGraph(actionType: string, params: Record<string, GraphParamValue> = {}): RuleGraph {
  return makeGraph(
    [makeNode('ev', 'event.waveStart'), makeNode('act', actionType, params)],
    [makeEdge('e1', 'ev', 'out', 'act', 'in')],
  );
}

/** 事件 → if(條件) → 日誌：用來驗證條件節點真的被塞進 if */
function conditionGraph(conditionType: string, params: Record<string, GraphParamValue> = {}): RuleGraph {
  return makeGraph(
    [makeNode('ev', 'event.waveStart'), makeNode('cond', conditionType, params), makeNode('if', 'flow.if'), makeNode('log', 'action.log')],
    [
      makeEdge('e1', 'ev', 'out', 'if', 'in'),
      makeEdge('e2', 'cond', 'value', 'if', 'cond'),
      makeEdge('e3', 'if', 'then', 'log', 'in'),
    ],
  );
}

/** 數值節點 → 加錢的金額埠 */
function valueGraph(valueType: string, params: Record<string, GraphParamValue> = {}): RuleGraph {
  return makeGraph(
    [makeNode('ev', 'event.waveStart'), makeNode('val', valueType, params), makeNode('act', 'action.addMoney')],
    [
      makeEdge('e1', 'ev', 'out', 'act', 'in'),
      makeEdge('e2', 'val', 'value', 'act', 'amount'),
    ],
  );
}

const NEW_CONDITIONS = [
  'cond.and', 'cond.or', 'cond.not',
  'cond.wave', 'cond.health', 'cond.towerCount', 'cond.elapsed',
  'cond.enemyType', 'cond.difficulty', 'cond.endless', 'cond.varCompare',
] as const;

const NEW_VALUES = [
  'num.wave', 'num.health', 'num.money', 'num.towerCount', 'num.enemyCount', 'num.elapsedSec',
  'num.min', 'num.max', 'num.clamp', 'num.round',
] as const;

describe('新增節點都在節點庫裡', () => {
  it('每個型別都有規格、標籤與描述', () => {
    const all = [...NEW_CONDITIONS, ...NEW_VALUES, 'flow.once', 'action.clearVar'];
    for (const type of all) {
      const spec = nodeSpec(type);
      expect(spec, type).not.toBeNull();
      expect(spec?.labelKey.startsWith('studio.graph.node.'), type).toBe(true);
      expect(spec?.descriptionKey?.endsWith('.desc'), type).toBe(true);
    }
  });
});

describe('每個新節點都接得上 codegen', () => {
  it('條件節點全部能編進 if', () => {
    for (const type of NEW_CONDITIONS) {
      const code = compileGraphCode(conditionGraph(type));
      expect(code, type).not.toContain('unsupported node');
      expect(() => new Function(code)).not.toThrow();
    }
  });

  it('數值節點全部能接進金額埠', () => {
    for (const type of NEW_VALUES) {
      const code = compileGraphCode(valueGraph(type));
      expect(code, type).not.toContain('unsupported node');
      expect(() => new Function(code)).not.toThrow();
    }
  });

  it('flow.once 與 action.clearVar 能編進流程', () => {
    const once = makeGraph(
      [makeNode('ev', 'event.waveStart'), makeNode('once', 'flow.once'), makeNode('log', 'action.log')],
      [makeEdge('e1', 'ev', 'out', 'once', 'in'), makeEdge('e2', 'once', 'out', 'log', 'in')],
    );
    expect(compileGraphCode(once)).not.toContain('unsupported node');
    expect(compileGraphCode(flowGraph('action.clearVar', { key: 'counter' }))).not.toContain('unsupported node');
  });
});

describe('布林組合', () => {
  it('and／or／not 產生對應運算子', () => {
    const and = compileGraphCode(conditionGraph('cond.and'));
    expect(and).toContain('&&');
    const or = compileGraphCode(conditionGraph('cond.or'));
    expect(or).toContain('||');
    const not = compileGraphCode(conditionGraph('cond.not'));
    expect(not).toContain('(!');
  });

  it('巢狀組合：波次 ≥ 3 且 金錢 > 100', () => {
    const graph = makeGraph(
      [
        makeNode('ev', 'event.waveStart'),
        makeNode('and', 'cond.and'),
        makeNode('wave', 'cond.wave', { op: '>=', value: 3 }),
        makeNode('money', 'cond.money', { op: '>', amount: 100 }),
        makeNode('if', 'flow.if'),
        makeNode('log', 'action.log'),
      ],
      [
        makeEdge('e1', 'ev', 'out', 'if', 'in'),
        makeEdge('e2', 'and', 'value', 'if', 'cond'),
        makeEdge('e3', 'wave', 'value', 'and', 'a'),
        makeEdge('e4', 'money', 'value', 'and', 'b'),
        makeEdge('e5', 'if', 'then', 'log', 'in'),
      ],
    );
    const code = compileGraphCode(graph);
    expect(code).toContain('api.state.wave >= 3');
    expect(code).toContain('api.state.money > 100');
    expect(code).toContain('&&');
    expect(() => new Function(code)).not.toThrow();
  });
});

describe('快照條件', () => {
  it('波次／生命／塔數／時間各自讀對欄位', () => {
    expect(compileGraphCode(conditionGraph('cond.wave', { value: 5 }))).toContain('api.state.wave >= 5');
    expect(compileGraphCode(conditionGraph('cond.health', { value: 3 }))).toContain('api.state.health >= 3');
    expect(compileGraphCode(conditionGraph('cond.towerCount', { value: 4 }))).toContain('api.state.towerCount >= 4');
    expect(compileGraphCode(conditionGraph('cond.elapsed', { seconds: 90 }))).toContain('api.state.elapsedMs / 1000');
  });

  it('指定敵人數量讀 enemiesByType 並對缺項回 0', () => {
    const code = compileGraphCode(conditionGraph('cond.enemyType', { enemyType: 'boss', value: 1 }));
    expect(code).toContain("api.state.enemiesByType['boss'] ?? 0");
  });

  it('難度用字串相等、無盡模式用布林相等', () => {
    expect(compileGraphCode(conditionGraph('cond.difficulty', { difficulty: 'hard', op: '===' }))).toContain("api.state.difficulty === 'hard'");
    expect(compileGraphCode(conditionGraph('cond.endless', { value: 'true' }))).toContain('api.state.endless === true');
  });

  it('變數比對讀 store 並收集 storage 權限', () => {
    const graph = conditionGraph('cond.varCompare', { key: 'kills', op: '>=', value: 10 });
    const compiled = compileGraph(graph);
    expect(compiled.code).toContain("api.store.get('kills')");
    expect(compiled.permissions).toContain('storage');
  });
});

describe('數值來源與運算', () => {
  it('快照數值直接回欄位', () => {
    expect(compileGraphCode(valueGraph('num.wave'))).toContain('api.state.wave');
    expect(compileGraphCode(valueGraph('num.money'))).toContain('api.state.money');
    expect(compileGraphCode(valueGraph('num.enemyCount'))).toContain('api.state.enemyCount');
    expect(compileGraphCode(valueGraph('num.elapsedSec'))).toContain('api.state.elapsedMs / 1000');
  });

  it('min／max／clamp／round 產生 Math 呼叫', () => {
    expect(compileGraphCode(valueGraph('num.min'))).toContain('Math.min(');
    expect(compileGraphCode(valueGraph('num.max'))).toContain('Math.max(');
    expect(compileGraphCode(valueGraph('num.clamp'))).toContain('Math.min(Math.max(');
    expect(compileGraphCode(valueGraph('num.round'))).toContain('Math.round(');
  });

  it('可組合：加錢 = 波次 × 10', () => {
    const graph = makeGraph(
      [
        makeNode('ev', 'event.waveStart'),
        makeNode('mul', 'num.mul'),
        makeNode('wave', 'num.wave'),
        makeNode('ten', 'num.literal', { value: 10 }),
        makeNode('act', 'action.addMoney'),
      ],
      [
        makeEdge('e1', 'ev', 'out', 'act', 'in'),
        makeEdge('e2', 'mul', 'value', 'act', 'amount'),
        makeEdge('e3', 'wave', 'value', 'mul', 'a'),
        makeEdge('e4', 'ten', 'value', 'mul', 'b'),
      ],
    );
    const code = compileGraphCode(graph);
    expect(code).toContain('api.state.wave * 10');
    expect(() => new Function(code)).not.toThrow();
  });
});

const NEW_ACTIONS = ['action.addScore', 'action.modifyTower', 'action.upgradeTowerAt', 'action.sellTowerAt'] as const;
const NEW_EVENTS: { type: string; hook: string }[] = [
  { type: 'event.towerUpgraded', hook: 'onTowerUpgraded' },
  { type: 'event.enemySpawned', hook: 'onEnemySpawned' },
  { type: 'event.skillUsed', hook: 'onSkillUsed' },
  { type: 'event.bossKilled', hook: 'onBossKilled' },
  { type: 'event.wavePrepared', hook: 'onWavePrepared' },
];

describe('新動作節點（塔增益／計分／座標操作）', () => {
  it('每個動作都能編進流程', () => {
    for (const type of NEW_ACTIONS) {
      const code = compileGraphCode(flowGraph(type));
      expect(code, type).not.toContain('unsupported node');
      expect(() => new Function(code)).not.toThrow();
    }
  });

  it('modifyTower 產生 api.tower.modify 並收集 tower.modify 權限', () => {
    const graph = flowGraph('action.modifyTower', { scope: 'sniper', stat: 'range', multiplier: 1.5 });
    const compiled = compileGraph(graph);
    expect(compiled.code).toContain("api.tower.modify('sniper', 'range', 1.5)");
    expect(compiled.permissions).toContain('tower.modify');
  });

  it('非法 stat 會退回 damage（避免產生沙箱不認得的值）', () => {
    const code = compileGraphCode(flowGraph('action.modifyTower', { stat: 'nonsense' }));
    expect(code).toContain("'damage'");
    expect(code).not.toContain('nonsense');
  });

  it('addScore 與座標操作產生對應 api 呼叫', () => {
    expect(compileGraphCode(flowGraph('action.addScore', { amount: 25 }))).toContain('api.score.add(25)');
    expect(compileGraphCode(flowGraph('action.upgradeTowerAt', { row: 3, col: 4 }))).toContain('api.tower.upgrade(3, 4)');
    expect(compileGraphCode(flowGraph('action.sellTowerAt', { row: 1, col: 2 }))).toContain('api.tower.sell(1, 2)');
  });
});

describe('新事件節點', () => {
  it('每個事件都指向正確 hook 並產生處理函式', () => {
    for (const entry of NEW_EVENTS) {
      const spec = nodeSpec(entry.type);
      expect(spec?.hook, entry.type).toBe(entry.hook);
      const code = compileGraphCode(
        makeGraph(
          [makeNode('ev', entry.type), makeNode('log', 'action.log', { message: 'x' })],
          [makeEdge('e1', 'ev', 'out', 'log', 'in')],
        ),
      );
      expect(code, entry.type).toContain('function ' + entry.hook + '(ctx, api)');
    }
  });
});

describe('漏怪事件節點', () => {
  it('節點庫有 event.enemyLeaked 且指向 onEnemyLeaked', () => {
    const spec = nodeSpec('event.enemyLeaked');
    expect(spec).not.toBeNull();
    expect(spec?.hook).toBe('onEnemyLeaked');
    expect(spec?.category).toBe('event');
  });

  it('編譯後產生 onEnemyLeaked 處理函式', () => {
    const graph = makeGraph(
      [makeNode('ev', 'event.enemyLeaked'), makeNode('log', 'action.log', { message: 'leak' })],
      [makeEdge('e1', 'ev', 'out', 'log', 'in')],
    );
    const code = compileGraphCode(graph);
    expect(code).toContain('function onEnemyLeaked(ctx, api)');
    expect(() => new Function(code)).not.toThrow();
  });
});

describe('只執行一次與清除變數', () => {
  it('once 產生持久旗標的守衛', () => {
    const graph = makeGraph(
      [makeNode('ev', 'event.gameStart'), makeNode('once', 'flow.once'), makeNode('act', 'action.addMoney')],
      [makeEdge('e1', 'ev', 'out', 'once', 'in'), makeEdge('e2', 'once', 'out', 'act', 'in')],
    );
    const compiled = compileGraph(graph);
    expect(compiled.code).toContain('__graphOnce');
    expect(compiled.code).toContain('!== 1');
    expect(compiled.permissions).toContain('storage');
  });

  it('clearVar 把變數設成 null', () => {
    const code = compileGraphCode(flowGraph('action.clearVar', { key: 'counter' }));
    expect(code).toContain("api.store.set('counter', null)");
  });
});
