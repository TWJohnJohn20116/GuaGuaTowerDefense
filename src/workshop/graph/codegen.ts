/**
 * 節點圖 → hook 腳本編譯器。
 *
 * 產出必須是既有 mod-script 契約：具名函式 onXxx(ctx, api)，只用 api.* 與 ctx.*，
 * 不得出現 import/export——所以產出可以直接丟給 compileScriptHandlers（它只建構不執行）。
 *
 * 編譯是純函式：同一張圖永遠得到同一份字串（節點順序與邊順序都照陣列原始順序），
 * 這樣規則表的預覽、發佈快照與測試才會一致。
 */
import type { ModScriptHook, ModScriptPermission } from '@/types/modScript';
import type { GraphEdge, GraphNode, RuleGraph } from './model';
import { collectHooks, collectPermissions } from './validate';
import { nodeSpec } from './nodeLibrary';

export interface CompiledGraph {
  /** 產生的腳本；空圖回空字串 */
  code: string;
  hooks: ModScriptHook[];
  permissions: ModScriptPermission[];
  /** 含 JS 的節點（靜態分析無法覆蓋） */
  unanalyzableNodeIds: string[];
  lineCount: number;
}

const MAX_DEPTH = 24;

/** 字串字面量跳脫（含 U+2028/U+2029，否則某些 JS 引擎會斷行） */
function jsString(value: string): string {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return "'" + escaped + "'";
}

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function indexNodes(graph: RuleGraph): Map<string, GraphNode> {
  return new Map(graph.nodes.map((node) => [node.id, node]));
}

/** 只取「資料」邊：fromPort 不是 flow 的那種 */
function dataEdge(graph: RuleGraph, toNode: string, toPort: string): GraphEdge | null {
  for (const edge of graph.edges) {
    if (edge.to === toNode && edge.toPort === toPort) return edge;
  }
  return null;
}

interface EmitContext {
  graph: RuleGraph;
  nodes: Map<string, GraphNode>;
  lines: string[];
  depth: number;
  counter: number;
  unanalyzable: Set<string>;
}

function pad(ctx: EmitContext): string {
  return '  '.repeat(ctx.depth);
}

function pushLine(ctx: EmitContext, text: string): void {
  ctx.lines.push(pad(ctx) + text);
}

function nextCounter(ctx: EmitContext): number {
  ctx.counter += 1;
  return ctx.counter;
}

/* ----------------------------------------------------------- 值運算式 */

function valueExpression(ctx: EmitContext, node: GraphNode, stack: readonly string[]): string {
  if (stack.length > MAX_DEPTH || stack.includes(node.id)) return '0';
  const nextStack = [...stack, node.id];
  const operands = (ports: readonly string[], fallbacks: readonly number[]): string[] =>
    ports.map((portId, index) => operandExpression(ctx, node.id, portId, fallbacks[index], nextStack));

  switch (node.type) {
    case 'num.literal':
      return String(num(node.params.value, 0));
    case 'num.add': {
      const [a, b] = operands(['a', 'b'], [0, 0]);
      return '(' + a + ' + ' + b + ')';
    }
    case 'num.sub': {
      const [a, b] = operands(['a', 'b'], [0, 0]);
      return '(' + a + ' - ' + b + ')';
    }
    case 'num.mul': {
      const [a, b] = operands(['a', 'b'], [1, 1]);
      return '(' + a + ' * ' + b + ')';
    }
    case 'num.div': {
      const [a, b] = operands(['a', 'b'], [1, 1]);
      return '(' + b + ' === 0 ? 0 : ' + a + ' / ' + b + ')';
    }
    case 'num.state':
      return 'api.state.' + stateField(node.params.field);
    case 'num.var':
      return 'Number(api.store.get(' + jsString(storeKey(node)) + ') ?? 0)';
    case 'num.random': {
      const min = Math.round(num(node.params.min, 0));
      const max = Math.round(num(node.params.max, 10));
      return 'api.rngInt(' + String(Math.min(min, max)) + ', ' + String(Math.max(min, max)) + ')';
    }
    case 'cond.chance': {
      const probability = num(node.params.probability, 0.25);
      const clamped = Math.min(1, Math.max(0, probability));
      return 'api.chance(' + String(clamped) + ')';
    }
    case 'cond.compare': {
      const [a, b] = operands(['a', 'b'], [0, 0]);
      return '(' + a + ' ' + compareOp(node.params.op) + ' ' + b + ')';
    }
    case 'cond.enemyCount':
      return '(api.state.enemyCount ' + compareOp(node.params.op) + ' ' + Math.round(num(node.params.count, 0)) + ')';
    case 'cond.money':
      return '(api.state.money ' + compareOp(node.params.op) + ' ' + Math.round(num(node.params.amount, 0)) + ')';
    case 'cond.and': {
      const [a, b] = operands(['a', 'b'], [1, 1]);
      return '(' + a + ' && ' + b + ')';
    }
    case 'cond.or': {
      const [a, b] = operands(['a', 'b'], [0, 0]);
      return '(' + a + ' || ' + b + ')';
    }
    case 'cond.not': {
      const [a] = operands(['a'], [1]);
      return '(!' + a + ')';
    }
    case 'cond.wave':
      return '(api.state.wave ' + compareOp(node.params.op) + ' ' + Math.round(num(node.params.value, 1)) + ')';
    case 'cond.health':
      return '(api.state.health ' + compareOp(node.params.op) + ' ' + Math.round(num(node.params.value, 1)) + ')';
    case 'cond.towerCount':
      return '(api.state.towerCount ' + compareOp(node.params.op) + ' ' + Math.round(num(node.params.value, 1)) + ')';
    case 'cond.elapsed':
      return '((api.state.elapsedMs / 1000) ' + compareOp(node.params.op) + ' ' + num(node.params.seconds, 60) + ')';
    case 'cond.enemyType': {
      const type = str(node.params.enemyType, 'grunt').trim() || 'grunt';
      return '((api.state.enemiesByType[' + jsString(type) + '] ?? 0) ' + compareOp(node.params.op) + ' ' + Math.round(num(node.params.value, 1)) + ')';
    }
    case 'cond.difficulty': {
      const difficulty = str(node.params.difficulty, 'normal').trim() || 'normal';
      const op = str(node.params.op, '===') === '!==' ? '!==' : '===';
      return '(api.state.difficulty ' + op + ' ' + jsString(difficulty) + ')';
    }
    case 'cond.endless':
      return '(api.state.endless === ' + (str(node.params.value, 'true') === 'true' ? 'true' : 'false') + ')';
    case 'cond.varCompare':
      return '(Number(api.store.get(' + jsString(storeKey(node)) + ') ?? 0) ' + compareOp(node.params.op) + ' ' + num(node.params.value, 0) + ')';
    case 'num.wave':
      return 'api.state.wave';
    case 'num.health':
      return 'api.state.health';
    case 'num.money':
      return 'api.state.money';
    case 'num.towerCount':
      return 'api.state.towerCount';
    case 'num.enemyCount':
      return 'api.state.enemyCount';
    case 'num.elapsedSec':
      return '(api.state.elapsedMs / 1000)';
    case 'num.min': {
      const [a, b] = operands(['a', 'b'], [0, 0]);
      return 'Math.min(' + a + ', ' + b + ')';
    }
    case 'num.max': {
      const [a, b] = operands(['a', 'b'], [0, 0]);
      return 'Math.max(' + a + ', ' + b + ')';
    }
    case 'num.clamp': {
      const [value, low, high] = operands(['value', 'min', 'max'], [0, 0, 100]);
      return 'Math.min(Math.max(' + value + ', ' + low + '), ' + high + ')';
    }
    case 'num.round': {
      const [value] = operands(['value'], [0]);
      return 'Math.round(' + value + ')';
    }
    default:
      return '0';
  }
}

function operandExpression(
  ctx: EmitContext,
  ownerId: string,
  portId: string,
  fallback: number,
  stack: readonly string[],
): string {
  const edge = dataEdge(ctx.graph, ownerId, portId);
  if (!edge) return String(fallback);
  const source = ctx.nodes.get(edge.from);
  if (!source) return String(fallback);
  return valueExpression(ctx, source, stack);
}

function stateField(value: unknown): string {
  const field = str(value, 'wave');
  const allowed = ['wave', 'maxWaves', 'money', 'health', 'towerCount', 'enemyCount', 'elapsedMs'];
  return allowed.includes(field) ? field : 'wave';
}

function compareOp(value: unknown): string {
  const op = str(value, '>');
  const allowed = ['>', '>=', '<', '<=', '===', '!=='];
  return allowed.includes(op) ? op : '>';
}

function storeKey(node: GraphNode): string {
  const key = str(node.params.key, '').trim();
  return key.length > 0 ? key.slice(0, 64) : 'unnamed';
}

/* ------------------------------------------------------------- 敘述句 */

function emitChain(ctx: EmitContext, nodeId: string, visited: Set<string>): void {
  if (visited.has(nodeId)) {
    pushLine(ctx, '/* cycle skipped: ' + nodeId + ' */');
    return;
  }
  if (ctx.depth > MAX_DEPTH) {
    pushLine(ctx, '/* depth limit: ' + nodeId + ' */');
    return;
  }
  const node = ctx.nodes.get(nodeId);
  if (!node) return;
  if (node.enabled === false) {
    pushLine(ctx, '/* disabled: ' + nodeId + ' */');
    return;
  }
  visited.add(nodeId);

  switch (node.type) {
    case 'action.addMoney':
      pushLine(ctx, 'api.money.add(' + amountExpression(ctx, node, 'amount', 25) + ');');
      break;
    case 'action.damageBase':
      pushLine(ctx, 'api.base.damage(' + amountExpression(ctx, node, 'amount', 1) + ');');
      break;
    case 'action.healBase':
      pushLine(ctx, 'api.base.heal(' + amountExpression(ctx, node, 'amount', 1) + ');');
      break;
    case 'action.spawnEnemy': {
      const enemyType = str(node.params.enemyType, 'grunt').trim() || 'grunt';
      const count = Math.round(num(node.params.count, 1));
      const interval = Math.round(num(node.params.intervalMs, 200));
      pushLine(
        ctx,
        'api.spawn.enemy(' + jsString(enemyType) + ', ' + count + ', ' + interval + ');',
      );
      break;
    }
    case 'action.applyStatus': {
      const effect = str(node.params.effect, 'slow');
      const duration = Math.round(num(node.params.durationMs, 2000));
      const value = num(node.params.value, 0);
      const targetType = str(node.params.enemyType, '').trim();
      const target = targetType ? ', { enemyType: ' + jsString(targetType) + ' }' : '';
      pushLine(
        ctx,
        'api.status.apply(' + jsString(effect) + ', ' + duration + ', ' + value + target + ');',
      );
      break;
    }
    case 'action.log': {
      const message = str(node.params.message, '');
      pushLine(ctx, 'api.log(' + jsString(message) + ');');
      break;
    }
    case 'action.setVar': {
      const key = jsString(storeKey(node));
      const value = operandExpression(ctx, node.id, 'value', num(node.params.value, 0), [node.id]);
      pushLine(ctx, 'api.store.set(' + key + ', ' + value + ');');
      break;
    }
    case 'action.addVar': {
      const key = jsString(storeKey(node));
      const delta = operandExpression(ctx, node.id, 'delta', num(node.params.delta, 1), [node.id]);
      pushLine(ctx, 'api.store.set(' + key + ', Number(api.store.get(' + key + ') ?? 0) + ' + delta + ');');
      break;
    }
    case 'flow.if': {
      const conditionEdge = dataEdge(ctx.graph, node.id, 'cond');
      const conditionNode = conditionEdge ? ctx.nodes.get(conditionEdge.from) : undefined;
      const condition = conditionNode ? valueExpression(ctx, conditionNode, [node.id]) : 'true';
      const thenEdges = flowEdges(ctx.graph, node.id, 'then');
      const elseEdges = flowEdges(ctx.graph, node.id, 'else');
      pushLine(ctx, 'if (' + condition + ') {');
      ctx.depth += 1;
      if (thenEdges.length === 0) pushLine(ctx, '/* empty */');
      for (const edge of thenEdges) emitChain(ctx, edge.to, visited);
      ctx.depth -= 1;
      if (elseEdges.length > 0) {
        pushLine(ctx, '} else {');
        ctx.depth += 1;
        for (const edge of elseEdges) emitChain(ctx, edge.to, visited);
        ctx.depth -= 1;
      }
      pushLine(ctx, '}');
      return;
    }
    case 'flow.sequence': {
      for (const port of ['first', 'second', 'third']) {
        for (const edge of flowEdges(ctx.graph, node.id, port)) {
          emitChain(ctx, edge.to, visited);
        }
      }
      return;
    }
    case 'flow.throttle': {
      const index = nextCounter(ctx);
      const key = jsString('__graphThrottle' + index);
      const interval = Math.round(num(node.params.intervalMs, 500));
      pushLine(ctx, 'const __t' + index + ' = Number(api.store.get(' + key + ') ?? 0);');
      pushLine(ctx, 'if (api.state.elapsedMs - __t' + index + ' >= ' + interval + ') {');
      ctx.depth += 1;
      pushLine(ctx, 'api.store.set(' + key + ', api.state.elapsedMs);');
      const edges = flowEdges(ctx.graph, node.id, 'out');
      if (edges.length === 0) pushLine(ctx, '/* empty */');
      for (const edge of edges) emitChain(ctx, edge.to, visited);
      ctx.depth -= 1;
      pushLine(ctx, '}');
      return;
    }
    case 'action.addScore':
      pushLine(ctx, 'api.score.add(' + amountExpression(ctx, node, 'amount', 10) + ');');
      break;
    case 'action.modifyTower': {
      const scope = str(node.params.scope, '*').trim() || '*';
      const rawStat = str(node.params.stat, 'damage');
      const stat = rawStat === 'range' || rawStat === 'fireRate' ? rawStat : 'damage';
      const multiplier = num(node.params.multiplier, 1.2);
      pushLine(ctx, 'api.tower.modify(' + jsString(scope) + ', ' + jsString(stat) + ', ' + multiplier + ');');
      break;
    }
    case 'action.upgradeTowerAt': {
      const row = Math.round(num(node.params.row, 0));
      const col = Math.round(num(node.params.col, 0));
      pushLine(ctx, 'api.tower.upgrade(' + row + ', ' + col + ');');
      break;
    }
    case 'action.sellTowerAt': {
      const row = Math.round(num(node.params.row, 0));
      const col = Math.round(num(node.params.col, 0));
      pushLine(ctx, 'api.tower.sell(' + row + ', ' + col + ');');
      break;
    }
    case 'action.clearVar': {
      const key = jsString(storeKey(node));
      pushLine(ctx, 'api.store.set(' + key + ', null);');
      break;
    }
    case 'flow.once': {
      const index = nextCounter(ctx);
      const key = jsString('__graphOnce' + index);
      pushLine(ctx, 'if (api.store.get(' + key + ') !== 1) {');
      ctx.depth += 1;
      pushLine(ctx, 'api.store.set(' + key + ', 1);');
      const onceEdges = flowEdges(ctx.graph, node.id, 'out');
      if (onceEdges.length === 0) pushLine(ctx, '/* empty */');
      for (const edge of onceEdges) emitChain(ctx, edge.to, visited);
      ctx.depth -= 1;
      pushLine(ctx, '}');
      return;
    }
    case 'flow.loop': {
      const index = nextCounter(ctx);
      const count = Math.min(50, Math.max(1, Math.round(num(node.params.count, 3))));
      pushLine(ctx, 'for (let __i' + index + ' = 0; __i' + index + ' < ' + count + '; __i' + index + ' += 1) {');
      ctx.depth += 1;
      const edges = flowEdges(ctx.graph, node.id, 'body');
      if (edges.length === 0) pushLine(ctx, '/* empty */');
      for (const edge of edges) emitChain(ctx, edge.to, visited);
      ctx.depth -= 1;
      pushLine(ctx, '}');
      return;
    }
    case 'js.node': {
      ctx.unanalyzable.add(node.id);
      pushLine(ctx, '/* node ' + node.id + ': inline JS (not statically analyzable) */');
      const body = str(node.js, '');
      const bodyLines = body.split(/\r?\n/);
      if (body.trim().length === 0) {
        pushLine(ctx, '/* empty js node */');
      } else {
        for (const line of bodyLines) pushLine(ctx, line);
      }
      break;
    }
    default:
      pushLine(ctx, '/* unsupported node: ' + node.type + ' */');
      return;
  }

  for (const edge of flowEdges(ctx.graph, node.id, 'out')) {
    emitChain(ctx, edge.to, visited);
  }
}

function amountExpression(ctx: EmitContext, node: GraphNode, portId: string, fallback: number): string {
  return operandExpression(ctx, node.id, portId, num(node.params[portId], fallback), [node.id]);
}

function flowEdges(graph: RuleGraph, nodeId: string, portId: string): GraphEdge[] {
  return graph.edges.filter((edge) => edge.from === nodeId && edge.fromPort === portId);
}

/** 產生單一 hook 的函式；body 為空時留下註解，確保 new Function 仍然可解析 */
function emitHandler(ctx: EmitContext, hook: ModScriptHook, nodeId: string): void {
  ctx.lines.push('function ' + hook + '(ctx, api) {');
  ctx.depth = 1;
  const edges = flowEdges(ctx.graph, nodeId, 'out');
  if (edges.length === 0) {
    pushLine(ctx, '/* no actions */');
  }
  const visited = new Set<string>();
  for (const edge of edges) emitChain(ctx, edge.to, visited);
  ctx.depth = 0;
  ctx.lines.push('}');
  ctx.lines.push('');
}

/** 只要字串的簡便入口（測試與唯讀預覽用） */
export function compileGraphCode(graph: RuleGraph): string {
  return compileGraph(graph).code;
}

export function compileGraph(graph: RuleGraph): CompiledGraph {
  const nodes = indexNodes(graph);
  const eventNodes: { hook: ModScriptHook; nodeId: string }[] = [];
  for (const node of graph.nodes) {
    const spec = nodeSpec(node.type);
    if (!spec || !spec.hook) continue;
    eventNodes.push({ hook: spec.hook, nodeId: node.id });
  }

  const hooks = collectHooks(graph);
  const permissions = collectPermissions(graph);

  if (eventNodes.length === 0) {
    return {
      code: '',
      hooks,
      permissions,
      unanalyzableNodeIds: [],
      lineCount: 0,
    };
  }

  const ctx: EmitContext = {
    graph,
    nodes,
    lines: ['// auto-generated from rule graph — edit the graph, not this file', ''],
    depth: 0,
    counter: 0,
    unanalyzable: new Set<string>(),
  };

  // 去重：同一個 hook 只會產生一個函式（驗證器會另外回報 duplicateEvent）
  const emittedHooks = new Set<ModScriptHook>();
  for (const event of eventNodes) {
    if (emittedHooks.has(event.hook)) continue;
    emittedHooks.add(event.hook);
    emitHandler(ctx, event.hook, event.nodeId);
  }

  const code = ctx.lines.join('\n').replace(/\n+$/, '\n');
  return {
    code,
    hooks,
    permissions,
    unanalyzableNodeIds: Array.from(ctx.unanalyzable),
    lineCount: code.length === 0 ? 0 : code.trimEnd().split('\n').length,
  };
}


