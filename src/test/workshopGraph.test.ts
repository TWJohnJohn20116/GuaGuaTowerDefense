/**
 * 規則圖工坊：codegen 與 validate 的純函式測試。
 *
 * 這裡只碰 src/workshop/graph 的純函式（不動 React、不動 store），
 * 所有斷言都是「真的建一張圖再呼叫函式」，不讀原始碼字串。
 * 產出的程式碼只做 new Function 的建構檢查，不執行。
 */
import { describe, expect, it } from 'vitest';
import type { GraphEdge, GraphNode, GraphParamValue, RuleGraph } from '@/workshop/graph/model';
import { emptyGraph } from '@/workshop/graph/model';
import { compileGraph, compileGraphCode } from '@/workshop/graph/codegen';
import { defaultParams, nodeSpec } from '@/workshop/graph/nodeLibrary';
import { canConnect, portsCompatible, validateGraph } from '@/workshop/graph/validate';
import {
  fromWorkshopScriptGraph,
  graphToRows,
  removeRuleRow,
  toggleRuleRow,
  toWorkshopScriptGraph,
  updateRowParam,
} from '@/workshop/graph/ruleTable';

/* ------------------------------------------------------------ 建圖工具 */

/** 依節點庫的預設參數建節點，避免每個案例手抄一份 params */
function makeNode(
  id: string,
  type: string,
  params: Record<string, GraphParamValue> = {},
  patch: Partial<Pick<GraphNode, 'js' | 'enabled'>> = {},
): GraphNode {
  const spec = nodeSpec(type);
  if (!spec) throw new Error('節點型別不在節點庫：' + type);
  return { id, type, x: 0, y: 0, params: { ...defaultParams(spec), ...params }, ...patch };
}

function makeEdge(
  id: string,
  from: string,
  fromPort: string,
  to: string,
  toPort: string,
): GraphEdge {
  return { id, from, fromPort, to, toPort };
}

function makeGraph(nodes: GraphNode[], edges: GraphEdge[] = []): RuleGraph {
  return { version: 1, nodes, edges };
}

/** 事件 → 動作的最小流：event.waveStart 的 out 接到動作節點的 in */
function linkedGraph(
  actionType: string,
  params: Record<string, GraphParamValue> = {},
  patch: Partial<Pick<GraphNode, 'js' | 'enabled'>> = {},
): RuleGraph {
  return makeGraph(
    [makeNode('ev', 'event.waveStart'), makeNode('act', actionType, params, patch)],
    [makeEdge('e1', 'ev', 'out', 'act', 'in')],
  );
}

/** errors 與 warnings 的 code 集合（不假設某個檢查是 error 還是 warning） */
function allIssueCodes(graph: RuleGraph): string[] {
  const validation = validateGraph(graph);
  return [...validation.errors, ...validation.warnings].map((issue) => issue.code);
}

/* ----------------------------------------------------------- codegen */

describe('compileGraphCode：規則圖 → 腳本字串', () => {
  it('空圖不丟錯，只產出註解或空字串', () => {
    expect(() => compileGraph(emptyGraph())).not.toThrow();
    const code = compileGraphCode(emptyGraph());
    const lines = code
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    expect(lines.every((line) => line.startsWith('//'))).toBe(true);
    const compiled = compileGraph(emptyGraph());
    expect(compiled.code.trim().length === 0 || compiled.code.trim().startsWith('//')).toBe(true);
    expect(compiled.permissions).toEqual([]);
    expect(compiled.hooks).toEqual([]);
  });

  it('event.waveStart 接 action.addMoney 產出 onWaveStart(ctx, api)', () => {
    const graph = linkedGraph('action.addMoney');
    const compiled = compileGraph(graph);
    expect(compiled.code).toContain('function onWaveStart(ctx, api)');
    expect(compiled.code).toContain('api.money.add(');
    expect(compiled.hooks).toEqual(['onWaveStart']);
    expect(compiled.code).toBe(compileGraphCode(graph));
  });

  it('產出的程式碼可以被 new Function 建構（只建構，不執行）', () => {
    const code = compileGraphCode(linkedGraph('action.addMoney'));
    expect(code.length).toBeGreaterThan(0);
    expect(() => new Function(code)).not.toThrow();
    expect(typeof new Function(code)).toBe('function');
  });

  it('compileGraph 的權限推導與 validateGraph 一致（含 economy）', () => {
    const graph = linkedGraph('action.addMoney');
    expect(validateGraph(graph).permissions).toContain('economy');
    expect(compileGraph(graph).permissions).toContain('economy');
  });
});

/* ---------------------------------------------------------- validate */

describe('validateGraph：連線與參數', () => {
  it('邊指向不存在的節點 → danglingEdge', () => {
    const graph = makeGraph(
      [makeNode('ev', 'event.waveStart')],
      [makeEdge('e1', 'ev', 'out', 'ghost', 'in')],
    );
    const { errors } = validateGraph(graph);
    const hits = errors.filter((issue) => issue.code === 'danglingEdge');
    expect(hits).toHaveLength(1);
    expect(hits[0].edgeId).toBe('e1');
  });

  it('action.spawnEnemy 的 enemyType 為空 → missingParam（對得上 nodeId 與參數）', () => {
    const graph = linkedGraph('action.spawnEnemy', { enemyType: '' });
    const { errors } = validateGraph(graph);
    const hits = errors.filter(
      (issue) => issue.code === 'missingParam' && issue.nodeId === 'act',
    );
    expect(hits.some((issue) => issue.paramKey === 'enemyType')).toBe(true);
  });

  it('action.spawnEnemy 填了 enemyType 就不再報該節點的 missingParam', () => {
    const graph = linkedGraph('action.spawnEnemy', { enemyType: 'grunt' });
    const { errors } = validateGraph(graph);
    const hits = errors.filter(
      (issue) => issue.code === 'missingParam' && issue.nodeId === 'act',
    );
    expect(hits).toHaveLength(0);
  });
});

describe('validateGraph：流程與事件', () => {
  it('flow.if 沒接 cond → ifWithoutCondition', () => {
    const graph = linkedGraph('flow.if');
    const { errors } = validateGraph(graph);
    const hits = errors.filter((issue) => issue.code === 'ifWithoutCondition');
    expect(hits).toHaveLength(1);
    expect(hits[0].nodeId).toBe('act');
  });

  it('兩個 event.waveStart → duplicateEvent 且 nodeId 是第二個', () => {
    const graph = makeGraph([
      makeNode('ev1', 'event.waveStart'),
      makeNode('ev2', 'event.waveStart'),
    ]);
    const { errors } = validateGraph(graph);
    const hits = errors.filter((issue) => issue.code === 'duplicateEvent');
    expect(hits).toHaveLength(1);
    expect(hits[0].nodeId).toBe('ev2');
  });
});

describe('validateGraph：JS 節點與權限', () => {
  it('js.node 讓 hasJs 為 true，並回報 jsUnanalyzable', () => {
    const graph = linkedGraph('js.node', {}, { js: 'return 1;' });
    const validation = validateGraph(graph);
    expect(validation.hasJs).toBe(true);
    expect(allIssueCodes(graph)).toContain('jsUnanalyzable');
    const hits = [...validation.errors, ...validation.warnings].filter(
      (issue) => issue.code === 'jsUnanalyzable',
    );
    expect(hits.some((issue) => issue.nodeId === 'act')).toBe(true);
  });

  it('含 action.addMoney 的圖推導出 economy 權限', () => {
    const validation = validateGraph(linkedGraph('action.addMoney'));
    expect(validation.permissions).toContain('economy');
    expect(validation.hasJs).toBe(false);
  });
});

/* -------------------------------------------------------- 埠相容性 */

describe('portsCompatible / canConnect：埠型別規則', () => {
  it('flow 只接 flow，資料埠要求同 kind', () => {
    expect(portsCompatible('flow', 'flow')).toBe(true);
    expect(portsCompatible('flow', 'number')).toBe(false);
    expect(portsCompatible('number', 'boolean')).toBe(false);
    expect(portsCompatible('number', 'number')).toBe(true);
  });

  it('canConnect 依實際埠型別判斷（畫布拖曳與驗證共用同一套規則）', () => {
    const graph = linkedGraph('action.addMoney');
    expect(canConnect(graph, 'ev', 'out', 'act', 'in')).toBe(true);
    expect(canConnect(graph, 'ev', 'out', 'act', 'amount')).toBe(false);
    expect(canConnect(graph, 'ev', 'out', 'ev', 'in')).toBe(false);
  });
});

/* ------------------------------------------------- 規則表 ↔ 節點圖 */

describe('ruleTable：表格與節點圖是同一份模型', () => {
  it('graphToRows 把事件鏈攤成有序的列，且列 id 就是節點 id', () => {
    const graph = linkedGraph('action.addMoney');
    const rows = graphToRows(graph);
    expect(rows).toHaveLength(2);
    expect(rows[0].category).toBe('event');
    expect(rows[0].nodeId).toBe('ev');
    expect(rows[1].nodeId).toBe('act');
    expect(rows[1].depth).toBeGreaterThan(rows[0].depth);
  });

  it('表格刪一列＝圖上真的少一個節點，且前後接回', () => {
    const graph = makeGraph(
      [
        makeNode('ev', 'event.waveStart'),
        makeNode('a', 'action.addMoney'),
        makeNode('b', 'action.log', { message: 'hi' }),
      ],
      [makeEdge('e1', 'ev', 'out', 'a', 'in'), makeEdge('e2', 'a', 'out', 'b', 'in')],
    );
    const next = removeRuleRow(graph, 'a');
    expect(next.nodes.map((node) => node.id)).toEqual(['ev', 'b']);
    const reconnected = next.edges.find((edge) => edge.from === 'ev' && edge.to === 'b');
    expect(reconnected).toBeTruthy();
  });

  it('表格勾選停用＝節點的 enabled 變成 false，codegen 不再產出那一步', () => {
    const graph = toggleRuleRow(linkedGraph('action.addMoney'), 'act', false);
    const compiled = compileGraph(graph);
    expect(compiled.code).toContain('function onWaveStart(ctx, api)');
    expect(compiled.code).not.toContain('api.money.add(');
  });

  it('表格改參數＝圖上參數同步，且產出的程式碼跟著變', () => {
    const graph = updateRowParam(linkedGraph('action.addMoney'), 'act', 'amount', 77);
    const node = graph.nodes.find((item) => item.id === 'act');
    expect(node?.params.amount).toBe(77);
    expect(compileGraph(graph).code).toContain('api.money.add(77)');
  });

  it('存檔形狀往返：toWorkshopScriptGraph → fromWorkshopScriptGraph 保留節點、埠與坐標', () => {
    const graph = makeGraph(
      [
        { ...makeNode('ev', 'event.waveStart'), x: 10, y: 20 },
        { ...makeNode('a', 'action.addMoney', { amount: 5 }), x: 200, y: 20 },
      ],
      [makeEdge('e1', 'ev', 'out', 'a', 'in')],
    );
    const stored = toWorkshopScriptGraph(graph);
    expect(stored.entryNodeIds).toEqual(['ev']);
    const restored = fromWorkshopScriptGraph(stored);
    expect(restored.nodes.map((node) => node.id)).toEqual(['ev', 'a']);
    expect(restored.nodes[1].params.amount).toBe(5);
    expect(restored.nodes[1].x).toBe(200);
    expect(restored.edges.some((edge) => edge.from === 'ev' && edge.to === 'a')).toBe(true);
  });
});

