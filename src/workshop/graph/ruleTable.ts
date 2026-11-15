/**
 * 規則表 ↔ 節點圖：同一份模型的兩種視圖。
 *
 * 表格的每一列就是節點圖上的一個節點（不是另存一份資料），
 * 所有編輯動作都回傳「新的 RuleGraph」，由呼叫端整體寫回 store／Undo。
 */
import type { ModScriptHook } from '@/types/modScript';
import type { GraphEdge, GraphNode, GraphNodeCategory, GraphParamValue, RuleGraph } from './model';
import {
  cloneGraph,
  findNode,
  flowPredecessor,
  nextEdgeId,
  nextNodeId,
} from './model';
import { defaultParams, eventSpecByHook, nodeSpec } from './nodeLibrary';
import type {
  WorkshopScriptGraph,
  WorkshopScriptNode,
  WorkshopScriptNodeKind,
} from '@/types/workshop';

export interface RuleRow {
  nodeId: string;
  eventNodeId: string;
  hook: ModScriptHook | null;
  /** 縮排層級：事件 0、主鏈 1、分支 +1 */
  depth: number;
  category: GraphNodeCategory;
  type: string;
  labelKey: string;
  /** 參數摘要（技術符號與數字，不含語系文案） */
  summary: string;
  params: Record<string, GraphParamValue>;
  enabled: boolean;
  /** 事件列不可刪 */
  removable: boolean;
  unanalyzable: boolean;
}

function summarize(node: GraphNode): string {
  switch (node.type) {
    case 'action.addMoney':
      return 'amount ' + String(node.params.amount ?? 0);
    case 'action.damageBase':
      return 'amount ' + String(node.params.amount ?? 0);
    case 'action.healBase':
      return 'amount ' + String(node.params.amount ?? 0);
    case 'action.spawnEnemy':
      return (
        String(node.params.enemyType ?? '') +
        ' x' +
        String(node.params.count ?? 1) +
        ' @' +
        String(node.params.intervalMs ?? 200) +
        'ms'
      );
    case 'action.applyStatus':
      return (
        String(node.params.effect ?? '') +
        ' ' +
        String(node.params.durationMs ?? 0) +
        'ms ' +
        String(node.params.value ?? 0)
      );
    case 'action.log':
      return String(node.params.message ?? '');
    case 'action.setVar':
      return String(node.params.key ?? '') + ' = ' + String(node.params.value ?? 0);
    case 'action.addVar':
      return String(node.params.key ?? '') + ' += ' + String(node.params.delta ?? 1);
    case 'flow.if':
      return 'if';
    case 'flow.sequence':
      return '1 > 2 > 3';
    case 'flow.throttle':
      return '>= ' + String(node.params.intervalMs ?? 0) + 'ms';
    case 'flow.loop':
      return 'x' + String(node.params.count ?? 1);
    case 'num.literal':
      return String(node.params.value ?? 0);
    case 'num.state':
      return 'api.state.' + String(node.params.field ?? 'wave');
    case 'num.var':
      return String(node.params.key ?? '');
    case 'num.random':
      return String(node.params.min ?? 0) + '..' + String(node.params.max ?? 0);
    case 'num.add':
    case 'num.sub':
    case 'num.mul':
    case 'num.div':
      return 'a ' + node.type.slice(4) + ' b';
    case 'cond.chance':
      return String(node.params.probability ?? 0);
    case 'cond.compare':
      return 'a ' + String(node.params.op ?? '>') + ' b';
    case 'cond.enemyCount':
      return 'enemies ' + String(node.params.op ?? '>=') + ' ' + String(node.params.count ?? 0);
    case 'cond.money':
      return 'money ' + String(node.params.op ?? '>=') + ' ' + String(node.params.amount ?? 0);
    case 'js.node':
      return 'js';
    default:
      return '';
  }
}

function hookOf(node: GraphNode): ModScriptHook | null {
  const spec = nodeSpec(node.type);
  return spec && spec.hook ? spec.hook : null;
}

function childPorts(node: GraphNode): string[] {
  const spec = nodeSpec(node.type);
  if (!spec) return [];
  return spec.outputs.filter((port) => port.kind === 'flow').map((port) => port.id);
}

function walkRows(
  graph: RuleGraph,
  startNodeId: string,
  portId: string,
  eventNodeId: string,
  depth: number,
  visited: Set<string>,
  rows: RuleRow[],
): void {
  for (const edge of graph.edges) {
    if (edge.from !== startNodeId || edge.fromPort !== portId) continue;
    const node = findNode(graph, edge.to);
    if (!node || visited.has(node.id)) continue;
    visited.add(node.id);
    const spec = nodeSpec(node.type);
    if (!spec) continue;
    rows.push({
      nodeId: node.id,
      eventNodeId,
      hook: hookOf(node),
      depth,
      category: spec.category,
      type: spec.type,
      labelKey: spec.labelKey,
      summary: summarize(node),
      params: { ...node.params },
      enabled: node.enabled !== false,
      removable: spec.category !== 'event',
      unanalyzable: spec.unanalyzable === true,
    });
    if (spec.category === 'event') continue;
    for (const childPort of childPorts(node)) {
      const nested =
    spec.type === 'flow.if' ||
    spec.type === 'flow.sequence' ||
    spec.type === 'flow.sequenceN' ||
    spec.type === 'flow.switch' ||
    spec.type === 'flow.loop';
      walkRows(graph, node.id, childPort, eventNodeId, nested ? depth + 1 : depth, visited, rows);
    }
  }
}

/** 把圖攤成表：每個事件節點一段，分支縮排 */
export function graphToRows(graph: RuleGraph): RuleRow[] {
  const rows: RuleRow[] = [];
  for (const node of graph.nodes) {
    const spec = nodeSpec(node.type);
    if (!spec || spec.category !== 'event') continue;
    const visited = new Set<string>([node.id]);
    rows.push({
      nodeId: node.id,
      eventNodeId: node.id,
      hook: hookOf(node),
      depth: 0,
      category: 'event',
      type: spec.type,
      labelKey: spec.labelKey,
      summary: '',
      params: { ...node.params },
      enabled: node.enabled !== false,
      removable: false,
      unanalyzable: false,
    });
    walkRows(graph, node.id, 'out', node.id, 1, visited, rows);
  }
  return rows;
}

/* ------------------------------------------------------------- 編輯動作 */

function appendNode(graph: RuleGraph, node: GraphNode): RuleGraph {
  const next = cloneGraph(graph);
  next.nodes.push(node);
  return next;
}

/** 鏈尾：沿著單一 out 邊一路往後走（遇到 if/loop 這種沒有 out 的就停） */
function chainTail(graph: RuleGraph, startNodeId: string): GraphNode | null {
  let current = findNode(graph, startNodeId);
  if (!current) return null;
  const seen = new Set<string>([current.id]);
  for (let guard = 0; guard < 200; guard += 1) {
    const edges = graph.edges.filter((edge) => edge.from === current!.id && edge.fromPort === 'out');
    if (edges.length !== 1) return current;
    const next = findNode(graph, edges[0].to);
    if (!next || seen.has(next.id)) return current;
    seen.add(next.id);
    current = next;
  }
  return current;
}

export interface AddRowResult {
  graph: RuleGraph;
  nodeId: string | null;
}

/** 在事件鏈尾追加一列（動作或流程節點），並回傳新節點 id 供 UI 選取 */
export function addRuleRow(graph: RuleGraph, eventNodeId: string, type: string): AddRowResult {
  const spec = nodeSpec(type);
  const event = findNode(graph, eventNodeId);
  if (!spec || !event || spec.category === 'event') return { graph, nodeId: null };
  const tail = chainTail(graph, eventNodeId);
  if (!tail) return { graph, nodeId: null };
  const tailSpec = nodeSpec(tail.type);
  if (!tailSpec || !tailSpec.outputs.some((port) => port.id === 'out' && port.kind === 'flow')) {
    return { graph, nodeId: null };
  }
  const node: GraphNode = {
    id: nextNodeId(graph, 'n'),
    type: spec.type,
    x: tail.x + 240,
    y: tail.y,
    params: defaultParams(spec),
    enabled: true,
  };
  const withNode = appendNode(graph, node);
  withNode.edges.push({
    id: nextEdgeId(withNode),
    from: tail.id,
    fromPort: 'out',
    to: node.id,
    toPort: 'in',
  });
  return { graph: withNode, nodeId: node.id };
}

/** 刪除一列：把前後接起來，讓鏈不會斷 */
export function removeRuleRow(graph: RuleGraph, nodeId: string): RuleGraph {
  const node = findNode(graph, nodeId);
  if (!node) return graph;
  const spec = nodeSpec(node.type);
  if (!spec || spec.category === 'event') return graph;
  const predecessor = flowPredecessor(graph, nodeId);
  const successor = graph.edges.find((edge) => edge.from === nodeId && edge.fromPort === 'out');
  const branchOuts = graph.edges.filter(
    (edge) => edge.from === nodeId && edge.fromPort !== 'out' && edge.fromPort !== 'value',
  );
  const next = cloneGraph(graph);
  next.nodes = next.nodes.filter((item) => item.id !== nodeId);
  next.edges = next.edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId);
  if (predecessor && successor && branchOuts.length === 0) {
    next.edges.push({
      id: nextEdgeId(next),
      from: predecessor.from,
      fromPort: predecessor.fromPort,
      to: successor.to,
      toPort: 'in',
    });
  }
  return next;
}

/** 同一個來源埠上的兄弟節點換位置（真正改變執行順序，因為 codegen 照 edges 陣列順序） */
export function moveRuleRow(graph: RuleGraph, nodeId: string, direction: -1 | 1): RuleGraph {
  const parentEdge = flowPredecessor(graph, nodeId);
  if (!parentEdge) return graph;
  const siblings = graph.edges.filter(
    (edge) => edge.from === parentEdge.from && edge.fromPort === parentEdge.fromPort,
  );
  if (siblings.length < 2) return graph;
  const selfIndex = siblings.findIndex((edge) => edge.to === nodeId);
  const targetIndex = selfIndex + direction;
  if (selfIndex < 0 || targetIndex < 0 || targetIndex >= siblings.length) return graph;
  const selfEdge = siblings[selfIndex];
  const otherEdge = siblings[targetIndex];
  const next = cloneGraph(graph);
  const selfPos = next.edges.findIndex((edge) => edge.id === selfEdge.id);
  const otherPos = next.edges.findIndex((edge) => edge.id === otherEdge.id);
  if (selfPos < 0 || otherPos < 0) return graph;
  next.edges[selfPos] = otherEdge;
  next.edges[otherPos] = selfEdge;
  return next;
}

export function toggleRuleRow(graph: RuleGraph, nodeId: string, enabled: boolean): RuleGraph {
  const next = cloneGraph(graph);
  for (const node of next.nodes) {
    if (node.id === nodeId) node.enabled = enabled;
  }
  return next;
}

export function updateRowParam(
  graph: RuleGraph,
  nodeId: string,
  key: string,
  value: GraphParamValue,
): RuleGraph {
  const next = cloneGraph(graph);
  for (const node of next.nodes) {
    if (node.id === nodeId) node.params[key] = value;
  }
  return next;
}

/** 更新節點備註（純註解，不影響產生程式碼與規則表行為） */
export function updateRowNote(graph: RuleGraph, nodeId: string, note: string): RuleGraph {
  const next = cloneGraph(graph);
  for (const node of next.nodes) {
    if (node.id === nodeId) node.note = note;
  }
  return next;
}

export function updateRowJs(graph: RuleGraph, nodeId: string, js: string): RuleGraph {
  const next = cloneGraph(graph);
  for (const node of next.nodes) {
    if (node.id === nodeId) node.js = js;
  }
  return next;
}


/* -------------------------------------------- 存檔形狀（WorkshopScriptGraph） */

/**
 * 存進腳本模組資產時用的形狀（src/types/workshop.ts 的 WorkshopScriptGraph）。
 *
 * 這一層刻意保留完整連線資訊：next 的每一筆是「埠>節點 id」，
 * 例如 'then>n4'、'cond>n7'、'out>n2'。只用節點 id 會把 if/else 與資料線壓平，
 * 重新載入就救不回來；帶埠字串才能在工坊裡無損往返。
 */
export function toWorkshopScriptGraph(graph: RuleGraph): WorkshopScriptGraph {
  const nodes: WorkshopScriptNode[] = graph.nodes.map((node) => {
    const spec = nodeSpec(node.type);
    let kind: WorkshopScriptNodeKind = 'action';
    if (spec && spec.category === 'event') kind = 'trigger';
    else if (spec && (spec.category === 'condition' || spec.category === 'value')) kind = 'condition';
    else if (spec && spec.category === 'js') kind = 'js';

    const params: Record<string, string | number | boolean> = { ...node.params };
    if (node.enabled === false) params.__enabled = false;
    if (node.note) params.__note = node.note;

    const next = graph.edges
      .filter((edge) => edge.from === node.id)
      .map((edge) => edge.fromPort + '>' + edge.to);

    return {
      id: node.id,
      kind,
      op: spec && spec.hook ? spec.hook : node.type,
      params,
      ...(typeof node.js === 'string' ? { inlineCode: node.js } : {}),
      next,
      position: { x: node.x, y: node.y },
    };
  });

  const entryNodeIds = graph.nodes
    .filter((node) => {
      const spec = nodeSpec(node.type);
      return spec !== null && spec.category === 'event';
    })
    .map((node) => node.id);

  return { nodes, entryNodeIds };
}

/** 這些埠名在資料線上原樣保留；其餘 flow 線一律接到目標的 in 埠 */
const DATA_PORT_NAMES: ReadonlySet<string> = new Set([
  'cond',
  'a',
  'b',
  'amount',
  'value',
  'delta',
]);

/** 從存檔形狀還原成編輯用圖；壞掉的 next 條目直接忽略，不讓整個模組打不開 */
export function fromWorkshopScriptGraph(source: WorkshopScriptGraph): RuleGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let edgeSeq = 0;

  for (const raw of source.nodes) {
    const byType = nodeSpec(raw.op);
    const byHook = byType ? null : eventSpecByHook(raw.op as ModScriptHook);
    const spec = byType ?? byHook;
    if (!spec) continue;

    const params: Record<string, GraphParamValue> = {};
    for (const [key, value] of Object.entries(raw.params ?? {})) {
      if (key === '__enabled' || key === '__note') continue;
      params[key] = value;
    }

    const node: GraphNode = {
      id: raw.id,
      type: spec.type,
      x: Number.isFinite(raw.position?.x) ? raw.position.x : 0,
      y: Number.isFinite(raw.position?.y) ? raw.position.y : 0,
      params,
      ...(raw.params && raw.params.__enabled === false ? { enabled: false } : {}),
      ...(typeof raw.params?.__note === 'string' ? { note: raw.params.__note } : {}),
      ...(typeof raw.inlineCode === 'string' ? { js: raw.inlineCode } : {}),
    };
    nodes.push(node);

    for (const entry of raw.next ?? []) {
      const splitAt = entry.indexOf('>');
      if (splitAt <= 0) continue;
      const fromPort = entry.slice(0, splitAt);
      const to = entry.slice(splitAt + 1);
      edgeSeq += 1;
      const toPort = DATA_PORT_NAMES.has(fromPort) ? fromPort : 'in';
      edges.push({ id: 'e' + edgeSeq, from: raw.id, fromPort, to, toPort });
    }
  }

  const knownIds = new Set(nodes.map((node) => node.id));
  return {
    version: 1,
    nodes,
    edges: edges.filter((edge) => knownIds.has(edge.to)),
  };
}

/** 在指定座標插入任意節點（畫布雙擊／節點庫點選用） */
export function addNodeAt(graph: RuleGraph, type: string, x: number, y: number): AddRowResult {
  const spec = nodeSpec(type);
  if (!spec) return { graph, nodeId: null };
  const node: GraphNode = {
    id: nextNodeId(graph, spec.category === 'event' ? 'ev' : 'n'),
    type: spec.type,
    x,
    y,
    params: defaultParams(spec),
    enabled: true,
  };
  return { graph: appendNode(graph, node), nodeId: node.id };
}

/** 畫布刪除：節點與連線一起清掉（不自動接回，交由使用者決定要不要補線） */
export function deleteSelection(
  graph: RuleGraph,
  nodeIds: readonly string[],
  edgeIds: readonly string[],
): RuleGraph {
  const nodeSet = new Set(nodeIds);
  const edgeSet = new Set(edgeIds);
  const next = cloneGraph(graph);
  next.nodes = next.nodes.filter((node) => !nodeSet.has(node.id));
  next.edges = next.edges.filter(
    (edge) => !edgeSet.has(edge.id) && !nodeSet.has(edge.from) && !nodeSet.has(edge.to),
  );
  return next;
}

/** 新增事件節點（同一 hook 已存在就不動，驗證器會回報 duplicateEvent） */
export function addEventNode(graph: RuleGraph, type: string, x: number, y: number): AddRowResult {
  const spec = nodeSpec(type);
  if (!spec || spec.category !== 'event') return { graph, nodeId: null };
  const node: GraphNode = {
    id: nextNodeId(graph, 'ev'),
    type: spec.type,
    x,
    y,
    params: defaultParams(spec),
    enabled: true,
  };
  return { graph: appendNode(graph, node), nodeId: node.id };
}
