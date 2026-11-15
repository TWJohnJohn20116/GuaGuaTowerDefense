/**
 * 規則圖靜態驗證：懸空節點、型別不合、必要欄位、循環、權限推導。
 *
 * 只回傳「代碼」不回傳中文句子——文案交給 i18n（studio.graph.issue.<code>），
 * 這樣同一份驗證結果可以在任何語言下顯示，也不會把中文寫進資料層。
 */
import type { ModScriptHook, ModScriptPermission } from '@/types/modScript';
import type { GraphEdge, GraphNode, GraphPort, GraphPortKind, RuleGraph } from './model';
import { GRAPH_NODE_LIMIT, GRAPH_STATE_FIELDS, GRAPH_STATUS_EFFECTS } from './model';
import { MOD_SCRIPT_PERMISSIONS } from '@/mod-script/limits';
import { nodeSpec } from './nodeLibrary';

type GraphIssueSeverity = 'error' | 'warning';

type GraphIssueCode =
  | 'unknownNodeType'
  | 'missingParam'
  | 'invalidNumber'
  | 'invalidOption'
  | 'emptyStoreKey'
  | 'emptyLogMessage'
  | 'danglingEdge'
  | 'portUnknown'
  | 'portKindMismatch'
  | 'selfEdge'
  | 'flowPortMulti'
  | 'duplicateEvent'
  | 'ifWithoutCondition'
  | 'eventWithoutBody'
  | 'unusedValue'
  | 'unreachable'
  | 'cycle'
  | 'jsEmpty'
  | 'jsUnanalyzable'
  | 'nodeLimit'
  | 'noEvents';

export interface GraphIssue {
  code: GraphIssueCode;
  severity: GraphIssueSeverity;
  nodeId?: string;
  edgeId?: string;
  paramKey?: string;
}

interface GraphValidation {
  errors: GraphIssue[];
  warnings: GraphIssue[];
  /** 由節點庫推導出的權限清單（含 JS 節點的保守全權限） */
  permissions: ModScriptPermission[];
  /** 圖上用到的 hook（去重，順序固定） */
  hooks: ModScriptHook[];
  /** 是否含不可靜態分析的節點 */
  hasJs: boolean;
  /** 給畫布標色用：nodeId → 最高嚴重度 */
  issuesByNode: Record<string, 'error' | 'warning'>;
}

/**
 * 沙箱的全部權限；JS 節點無法靜態分析，保守起見全部要求。
 *
 * 刻意吃 limits.ts 的同一份清單：先前這裡手抄了一份，新增權限時漏掉，
 * 導致 collectPermissions 把新權限過濾掉（節點明明要求了卻不顯示）。
 */
const ALL_PERMISSIONS: readonly ModScriptPermission[] = MOD_SCRIPT_PERMISSIONS;

/** 這幾個參數是空的就算錯誤（其餘空白只是無效果） */
const REQUIRED_PARAMS: readonly { type: string; key: string }[] = [
  { type: 'action.spawnEnemy', key: 'enemyType' },
  { type: 'action.setVar', key: 'key' },
  { type: 'action.addVar', key: 'key' },
  { type: 'num.var', key: 'key' },
];

function portOf(node: GraphNode, portId: string, direction: 'in' | 'out'): GraphPort | null {
  const spec = nodeSpec(node.type);
  if (!spec) return null;
  const ports = direction === 'in' ? spec.inputs : spec.outputs;
  for (const port of ports) {
    if (port.id === portId) return port;
  }
  return null;
}

/** 兩個埠能不能接：flow 接 flow；資料埠要求同 kind（boolean 不可接 number） */
export function portsCompatible(from: GraphPortKind, to: GraphPortKind): boolean {
  if (from === 'flow' || to === 'flow') return from === 'flow' && to === 'flow';
  return from === to;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function checkParams(node: GraphNode, issues: GraphIssue[]): void {
  const spec = nodeSpec(node.type);
  if (!spec) return;
  for (const param of spec.params) {
    const value = node.params[param.key];
    if (value === undefined || value === null) {
      issues.push({ code: 'missingParam', severity: 'error', nodeId: node.id, paramKey: param.key });
      continue;
    }
    if (param.kind === 'number') {
      if (!isNumber(value)) {
        issues.push({ code: 'invalidNumber', severity: 'error', nodeId: node.id, paramKey: param.key });
        continue;
      }
      if (param.min !== undefined && value < param.min) {
        issues.push({ code: 'invalidNumber', severity: 'error', nodeId: node.id, paramKey: param.key });
      }
      if (param.max !== undefined && value > param.max) {
        issues.push({ code: 'invalidNumber', severity: 'error', nodeId: node.id, paramKey: param.key });
      }
    } else if (param.kind === 'select' || param.kind === 'stateField' || param.kind === 'statusEffect') {
      const allowed =
        param.kind === 'stateField'
          ? GRAPH_STATE_FIELDS
          : param.kind === 'statusEffect'
            ? GRAPH_STATUS_EFFECTS
            : (param.options ?? []).map((option) => option.value);
      if (typeof value !== 'string' || !(allowed as readonly string[]).includes(value)) {
        issues.push({ code: 'invalidOption', severity: 'error', nodeId: node.id, paramKey: param.key });
      }
    } else if (param.kind === 'boolean') {
      if (typeof value !== 'boolean') {
        issues.push({ code: 'invalidOption', severity: 'error', nodeId: node.id, paramKey: param.key });
      }
    } else if (typeof value !== 'string') {
      issues.push({ code: 'invalidOption', severity: 'error', nodeId: node.id, paramKey: param.key });
    }
  }
  for (const required of REQUIRED_PARAMS) {
    if (required.type !== node.type) continue;
    const paramKey = required.key;
    const value = node.params[paramKey];
    if (typeof value !== 'string' || value.trim().length === 0) {
      issues.push({
        code: paramKey === 'key' ? 'emptyStoreKey' : 'missingParam',
        severity: 'error',
        nodeId: node.id,
        paramKey,
      });
    }
  }
  if (node.type === 'action.log') {
    const message = node.params.message;
    if (typeof message !== 'string' || message.trim().length === 0) {
      issues.push({ code: 'emptyLogMessage', severity: 'warning', nodeId: node.id, paramKey: 'message' });
    }
  }
}

function checkEdges(graph: RuleGraph, issues: GraphIssue[]): void {
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  for (const edge of graph.edges) {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);
    if (!from || !to) {
      issues.push({ code: 'danglingEdge', severity: 'error', edgeId: edge.id });
      continue;
    }
    if (edge.from === edge.to) {
      issues.push({ code: 'selfEdge', severity: 'error', edgeId: edge.id });
      continue;
    }
    const outPort = portOf(from, edge.fromPort, 'out');
    const inPort = portOf(to, edge.toPort, 'in');
    if (!outPort || !inPort) {
      issues.push({ code: 'portUnknown', severity: 'error', edgeId: edge.id });
      continue;
    }
    if (!portsCompatible(outPort.kind, inPort.kind)) {
      issues.push({ code: 'portKindMismatch', severity: 'error', edgeId: edge.id });
    }
  }
}

/** 找出所有參與循環的節點（回傳 nodeId 集合） */
function findCycleNodes(graph: RuleGraph): Set<string> {
  const adjacency = new Map<string, string[]>();
  for (const node of graph.nodes) adjacency.set(node.id, []);
  for (const edge of graph.edges) {
    const list = adjacency.get(edge.from);
    if (list) list.push(edge.to);
  }
  const state = new Map<string, 0 | 1 | 2>();
  const cyclic = new Set<string>();
  const stack: string[] = [];

  const visit = (nodeId: string): void => {
    state.set(nodeId, 1);
    stack.push(nodeId);
    for (const next of adjacency.get(nodeId) ?? []) {
      const nextState = state.get(next) ?? 0;
      if (nextState === 1) {
        const fromIndex = stack.indexOf(next);
        if (fromIndex >= 0) {
          for (const cyclicNode of stack.slice(fromIndex)) cyclic.add(cyclicNode);
        }
      } else if (nextState === 0) {
        visit(next);
      }
    }
    stack.pop();
    state.set(nodeId, 2);
  };

  for (const node of graph.nodes) {
    if ((state.get(node.id) ?? 0) === 0) visit(node.id);
  }
  return cyclic;
}

function checkEvents(graph: RuleGraph, issues: GraphIssue[]): void {
  const seenHooks = new Map<string, string>();
  let eventCount = 0;
  for (const node of graph.nodes) {
    const spec = nodeSpec(node.type);
    if (!spec || spec.category !== 'event' || !spec.hook) continue;
    eventCount += 1;
    const existing = seenHooks.get(spec.hook);
    if (existing) {
      issues.push({ code: 'duplicateEvent', severity: 'error', nodeId: node.id });
    } else {
      seenHooks.set(spec.hook, node.id);
    }
    const hasOutgoing = graph.edges.some((edge) => edge.from === node.id && edge.fromPort !== 'value');
    if (!hasOutgoing) {
      issues.push({ code: 'eventWithoutBody', severity: 'warning', nodeId: node.id });
    }
  }
  if (eventCount === 0) {
    issues.push({ code: 'noEvents', severity: 'warning' });
  }
}

function checkFlowNodes(graph: RuleGraph, issues: GraphIssue[]): void {
  for (const node of graph.nodes) {
    if (node.type === 'flow.if') {
      const hasCond = graph.edges.some((edge) => edge.to === node.id && edge.toPort === 'cond');
      if (!hasCond) {
        issues.push({ code: 'ifWithoutCondition', severity: 'error', nodeId: node.id });
      }
    }
    const spec = nodeSpec(node.type);
    if (!spec) continue;
    for (const port of spec.outputs) {
      if (port.kind !== 'flow') continue;
      const count = graph.edges.filter(
        (edge) => edge.from === node.id && edge.fromPort === port.id,
      ).length;
      if (count > 1) {
        issues.push({ code: 'flowPortMulti', severity: 'warning', nodeId: node.id });
      }
    }
  }
}

function checkUnused(graph: RuleGraph, issues: GraphIssue[]): void {
  const incoming = new Set(graph.edges.map((edge) => edge.to));
  for (const node of graph.nodes) {
    const spec = nodeSpec(node.type);
    if (!spec) continue;
    if (spec.category === 'event') continue;
    if (spec.category === 'value' || spec.category === 'condition') {
      const used = graph.edges.some((edge) => edge.from === node.id);
      if (!used) {
        issues.push({ code: 'unusedValue', severity: 'warning', nodeId: node.id });
      }
      continue;
    }
    if (!incoming.has(node.id)) {
      issues.push({ code: 'unreachable', severity: 'warning', nodeId: node.id });
    }
  }
}

function checkJsNodes(graph: RuleGraph, issues: GraphIssue[]): void {
  for (const node of graph.nodes) {
    if (node.type !== 'js.node') continue;
    const code = node.js ?? '';
    if (code.trim().length === 0) {
      issues.push({ code: 'jsEmpty', severity: 'warning', nodeId: node.id });
    }
    issues.push({ code: 'jsUnanalyzable', severity: 'warning', nodeId: node.id });
  }
}

/** 蒐集這張圖需要的權限（JS 節點＝無法分析 → 全部） */
export function collectPermissions(graph: RuleGraph): ModScriptPermission[] {
  const found = new Set<ModScriptPermission>();
  let hasJs = false;
  for (const node of graph.nodes) {
    const spec = nodeSpec(node.type);
    if (!spec) continue;
    if (spec.unanalyzable) hasJs = true;
    for (const permission of spec.permissions ?? []) found.add(permission);
  }
  if (hasJs) {
    for (const permission of ALL_PERMISSIONS) found.add(permission);
  }
  return ALL_PERMISSIONS.filter((permission) => found.has(permission));
}

/** 這張圖會產生哪些 hook（依節點庫順序，不是節點順序） */
export function collectHooks(graph: RuleGraph): ModScriptHook[] {
  const hooks: ModScriptHook[] = [];
  for (const node of graph.nodes) {
    const spec = nodeSpec(node.type);
    if (!spec || !spec.hook) continue;
    if (!hooks.includes(spec.hook)) hooks.push(spec.hook);
  }
  return hooks;
}

export function validateGraph(graph: RuleGraph): GraphValidation {
  const issues: GraphIssue[] = [];

  if (graph.nodes.length > GRAPH_NODE_LIMIT) {
    issues.push({ code: 'nodeLimit', severity: 'error' });
  }

  for (const node of graph.nodes) {
    if (!nodeSpec(node.type)) {
      issues.push({ code: 'unknownNodeType', severity: 'error', nodeId: node.id });
      continue;
    }
    checkParams(node, issues);
  }

  checkEdges(graph, issues);
  checkEvents(graph, issues);
  checkFlowNodes(graph, issues);
  checkUnused(graph, issues);
  checkJsNodes(graph, issues);

  for (const nodeId of findCycleNodes(graph)) {
    issues.push({ code: 'cycle', severity: 'error', nodeId });
  }

  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  const issuesByNode: Record<string, 'error' | 'warning'> = {};
  for (const issue of issues) {
    if (!issue.nodeId) continue;
    if (issue.severity === 'error') {
      issuesByNode[issue.nodeId] = 'error';
    } else if (!issuesByNode[issue.nodeId]) {
      issuesByNode[issue.nodeId] = 'warning';
    }
  }

  return {
    errors,
    warnings,
    permissions: collectPermissions(graph),
    hooks: collectHooks(graph),
    hasJs: graph.nodes.some((node) => nodeSpec(node.type)?.unanalyzable === true),
    issuesByNode,
  };
}

/** 這條邊能不能接（畫布拖曳時的即時檢查，與驗證共用同一套規則） */
export function canConnect(
  graph: RuleGraph,
  from: string,
  fromPort: string,
  to: string,
  toPort: string,
): boolean {
  if (from === to) return false;
  const fromNode = graph.nodes.find((node) => node.id === from);
  const toNode = graph.nodes.find((node) => node.id === to);
  if (!fromNode || !toNode) return false;
  const outPort = portOf(fromNode, fromPort, 'out');
  const inPort = portOf(toNode, toPort, 'in');
  if (!outPort || !inPort) return false;
  return portsCompatible(outPort.kind, inPort.kind);
}

/** 邊是否重複（同一個起點埠只能接一條，避免語意不明） */
export function isDuplicateEdge(graph: RuleGraph, edge: Omit<GraphEdge, 'id'>): boolean {
  return graph.edges.some(
    (existing) =>
      existing.from === edge.from &&
      existing.fromPort === edge.fromPort &&
      existing.to === edge.to &&
      existing.toPort === edge.toPort,
  );
}
