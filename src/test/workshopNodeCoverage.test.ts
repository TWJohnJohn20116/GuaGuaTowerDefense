/**
 * 節點庫全掃描：每一個節點型別都要能編譯
 *
 * 為什麼要這支：每次新增節點都可能忘記加 codegen 分支，而 codegen 對未知型別
 * 只會安靜地印一行 `unsupported node` 註解——UI 上看不出來，玩家只會覺得「規則沒生效」。
 * 這支測試直接走整個節點庫，任何漏接的型別都會讓 CI 紅。
 */
import { describe, expect, it } from 'vitest';
import type { GraphEdge, GraphNode, GraphParamValue, RuleGraph } from '@/workshop/graph/model';
import { compileGraphCode } from '@/workshop/graph/codegen';
import { defaultParams, nodeSpec, nodeSpecsByCategory } from '@/workshop/graph/nodeLibrary';

function node(id: string, type: string, params: Record<string, GraphParamValue> = {}): GraphNode {
  const spec = nodeSpec(type);
  if (!spec) throw new Error('節點型別不在節點庫：' + type);
  return { id, type, x: 0, y: 0, params: { ...defaultParams(spec), ...params } };
}

function edge(id: string, from: string, fromPort: string, to: string, toPort: string): GraphEdge {
  return { id, from, fromPort, to, toPort };
}

/** 把單一節點接成「能被編譯」的最小圖，依分類決定接法 */
function graphFor(type: string): RuleGraph {
  const spec = nodeSpec(type);
  if (!spec) throw new Error(type);
  const event = node('ev', 'event.waveStart');
  if (spec.category === 'event') {
    return { version: 1, nodes: [node('ev', type), node('log', 'action.log')], edges: [edge('e1', 'ev', 'out', 'log', 'in')] };
  }
  if (spec.category === 'condition') {
    return {
      version: 1,
      nodes: [event, node('target', type), node('if', 'flow.if'), node('log', 'action.log')],
      edges: [
        edge('e1', 'ev', 'out', 'if', 'in'),
        edge('e2', 'target', 'value', 'if', 'cond'),
        edge('e3', 'if', 'then', 'log', 'in'),
      ],
    };
  }
  if (spec.category === 'value') {
    const isText = spec.outputs[0]?.kind === 'string';
    return {
      version: 1,
      nodes: [event, node('target', type), node('log', 'action.log'), node('money', 'action.addMoney')],
      edges: [
        edge('e1', 'ev', 'out', 'log', 'in'),
        edge('e2', 'target', 'value', isText ? 'log' : 'money', isText ? 'message' : 'amount'),
      ],
    };
  }
  // action / flow / js：事件直接接上
  return { version: 1, nodes: [event, node('target', type)], edges: [edge('e1', 'ev', 'out', 'target', 'in')] };
}

describe('節點庫全掃描', () => {
  const categories = ['event', 'condition', 'action', 'flow', 'value', 'js'] as const;

  for (const category of categories) {
    it(category + ' 類的每個節點都能編譯', () => {
      const specs = nodeSpecsByCategory(category);
      expect(specs.length).toBeGreaterThan(0);
      for (const spec of specs) {
        const code = compileGraphCode(graphFor(spec.type));
        expect(code, spec.type).not.toContain('unsupported node');
        expect(() => new Function(code), spec.type).not.toThrow();
      }
    });
  }
});
