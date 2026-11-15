// 節點圖的靜態分析結論。
//
// 工坊允許在節點圖裡塞原生 JS（kind === 'js' 或節點帶 inlineCode）；
// 那種節點無法靜態分析，UI 必須顯示「無法靜態分析」，編譯器也回對應 warning。
// 這裡只看節點本身，不執行、不解析程式碼——純字串判斷，任何輸入都不會丟例外。

import type { WorkshopScriptGraph, WorkshopStaticAnalysis } from '@/types/workshop';

function hasInlineCode(node: WorkshopScriptGraph['nodes'][number]): boolean {
  return typeof node.inlineCode === 'string' && node.inlineCode.trim().length > 0;
}

export function analyzeScriptGraph(graph: WorkshopScriptGraph): WorkshopStaticAnalysis {
  const nodes = graph.nodes ?? [];
  const inlineJsNodeIds: string[] = [];
  for (const node of nodes) {
    if (node.kind === 'js' || hasInlineCode(node)) inlineJsNodeIds.push(node.id);
  }
  return {
    analyzable: inlineJsNodeIds.length === 0,
    inlineJsNodeIds,
    nodeCount: nodes.length,
    hookCount: (graph.entryNodeIds ?? []).length,
  };
}
