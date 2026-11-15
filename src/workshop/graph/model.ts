/**
 * 視覺化規則圖的資料模型（純型別＋純函式，無 React／store 依賴）
 *
 * 一份圖就是一個專案（或關卡）的規則來源；規則表與節點圖都是它的投影，
 * 不存在第二份資料。codegen 只讀這份模型。
 */
import type { ModScriptHook, ModScriptPermission } from '@/types/modScript';

/* ------------------------------------------------------------ 基本型別 */

/** 節點分類（畫布配色與規則表分組都用它） */
export type GraphNodeCategory = 'event' | 'condition' | 'action' | 'flow' | 'value' | 'js';

/** 埠的值型別；flow 是「執行流」，其餘是資料 */
export type GraphPortKind = 'flow' | 'number' | 'boolean' | 'string';

export interface GraphPort {
  id: string;
  kind: GraphPortKind;
  /** i18n key（例：studio.graph.port.in） */
  labelKey: string;
}

/** 參數值只允許純量，才能存成 JSON 進 .ggmod */
export type GraphParamValue = string | number | boolean;

export interface GraphNode {
  id: string;
  /** 節點庫的 type（見 nodeLibrary.ts） */
  type: string;
  x: number;
  y: number;
  params: Record<string, GraphParamValue>;
  /** js 節點內容：與腳本同語言、同 Worker 沙箱、同權限模型 */
  js?: string;
  /** false＝停用；規則表的勾選欄直接寫這裡 */
  enabled?: boolean;
  /** 使用者備註（不影響產生程式碼） */
  note?: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  fromPort: string;
  to: string;
  toPort: string;
}

export interface RuleGraph {
  version: 1;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/* -------------------------------------------------------------- 參數規格 */

type GraphParamKind =
  | 'number'
  | 'text'
  | 'boolean'
  | 'select'
  | 'stateField'
  | 'statusEffect'
  | 'storeKey'
  | 'enemyType'
  | 'compareOp';

interface GraphParamOption {
  value: string;
  labelKey: string;
}

export interface GraphParamSpec {
  key: string;
  kind: GraphParamKind;
  labelKey: string;
  default: GraphParamValue;
  min?: number;
  max?: number;
  step?: number;
  options?: readonly GraphParamOption[];
  placeholderKey?: string;
}

/* ------------------------------------------------------------- 節點規格 */

export interface GraphNodeSpec {
  type: string;
  category: GraphNodeCategory;
  labelKey: string;
  descriptionKey: string;
  /** 畫布左上角的單字識別（ASCII，不是 UI 文案） */
  glyph: string;
  inputs: readonly GraphPort[];
  outputs: readonly GraphPort[];
  params: readonly GraphParamSpec[];
  /** 事件節點才有 */
  hook?: ModScriptHook;
  /** 這個節點會用到的權限（規則圖推導權限清單用） */
  permissions?: readonly ModScriptPermission[];
  /** true＝內容不可靜態分析（目前只有 JS 節點） */
  unanalyzable?: boolean;
}

/* --------------------------------------------------------------- 常數 */

export const GRAPH_NODE_LIMIT = 320;

/** 腳本可讀的狀態欄位（與 ModScriptStateSnapshot 的數字欄位一致） */
export const GRAPH_STATE_FIELDS = [
  'wave',
  'maxWaves',
  'money',
  'health',
  'towerCount',
  'enemyCount',
  'elapsedMs',
] as const;

export const GRAPH_STATUS_EFFECTS = [
  'slow',
  'poison',
  'burn',
  'stun',
  'weakness',
  'exposed',
  'root',
] as const;

/* ------------------------------------------------------------ 建構子 */

export function emptyGraph(): RuleGraph {
  return { version: 1, nodes: [], edges: [] };
}

/** 產生不重複的節點 id（前綴＋遞增序號） */
export function nextNodeId(graph: RuleGraph, prefix = 'n'): string {
  const used = new Set(graph.nodes.map((node) => node.id));
  let index = graph.nodes.length + 1;
  let candidate = prefix + index;
  while (used.has(candidate)) {
    index += 1;
    candidate = prefix + index;
  }
  return candidate;
}

export function nextEdgeId(graph: RuleGraph): string {
  const used = new Set(graph.edges.map((edge) => edge.id));
  let index = graph.edges.length + 1;
  let candidate = 'e' + index;
  while (used.has(candidate)) {
    index += 1;
    candidate = 'e' + index;
  }
  return candidate;
}

export function cloneGraph(graph: RuleGraph): RuleGraph {
  return {
    version: 1,
    nodes: graph.nodes.map((node) => ({ ...node, params: { ...node.params } })),
    edges: graph.edges.map((edge) => ({ ...edge })),
  };
}

/* -------------------------------------------------------------- 查詢 */

export function findNode(graph: RuleGraph, nodeId: string): GraphNode | null {
  for (const node of graph.nodes) {
    if (node.id === nodeId) return node;
  }
  return null;
}

/** 節點在鏈上的前一個節點（只認單一輸入的 flow 埠） */
export function flowPredecessor(graph: RuleGraph, nodeId: string): GraphEdge | null {
  for (const edge of graph.edges) {
    if (edge.to === nodeId && edge.toPort === 'in' && edge.fromPort !== 'value') return edge;
  }
  return null;
}

/* ------------------------------------------------------------ i18n 橋 */

/**
 * 讀取 studio.* 文案。
 *
 * 新工坊的鍵由 lead 統一寫進 zh-TW.ts；在鍵還沒落地前，直接寫 t.studio.xxx
 * 會讓 tsc 紅（Translations 由 zh-TW 推導）。這裡用純函式走訪翻譯樹，
 * 缺鍵時回退成 key 本身，這樣 UI 永遠有字可顯示、CI 也不會因為鍵的先後順序而紅。
 */
export function studioText(tree: unknown, key: string): string {
  const parts = key.split('.');
  let cursor: unknown = tree;
  for (let index = 0; index < parts.length; index += 1) {
    if (typeof cursor !== 'object' || cursor === null) return key;
    const record = cursor as Record<string, unknown>;
    // 葉鍵本身可能含點（例：'gameStart.desc'）：先試整段剩餘路徑，再逐段下降
    const leaf = record[parts.slice(index).join('.')];
    if (leaf !== undefined) return typeof leaf === 'string' ? leaf : key;
    const direct = record[parts[index]];
    if (direct === undefined) return key;
    cursor = direct;
  }
  return typeof cursor === 'string' ? cursor : key;
}

