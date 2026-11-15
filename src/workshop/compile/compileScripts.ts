// 腳本模組資產 → CustomScriptData（mod.content.scripts 的成員）。
//
// 腳本本體照抄，只把 id 換成執行期 id；若資產帶節點圖且含原生 JS，
// 這裡回 inlineJsNotAnalyzable，讓 UI 標示「無法靜態分析」。
// 腳本仍會編譯——它跑在 Worker 沙箱裡，只是靜態分析看不到內容。

import type { CustomScriptData } from '@/types/modScript';
import type {
  WorkshopAssetProvenance,
  WorkshopCompileIssue,
  WorkshopCompileWarningCode,
  WorkshopScriptAsset,
} from '@/types/workshop';
import { runtimeAssetId } from '@/workshop/ids';
import { analyzeScriptGraph } from './analyzeScript';

interface ScriptCompileResult {
  script: CustomScriptData;
  provenance: WorkshopAssetProvenance;
  issues: WorkshopCompileIssue[];
}

function createIssue(
  code: WorkshopCompileWarningCode,
  extra: Pick<WorkshopCompileIssue, 'assetId' | 'params'> = {},
): WorkshopCompileIssue {
  const issue: WorkshopCompileIssue = { code, key: `studio.compile.${code}` };
  if (extra.assetId !== undefined) issue.assetId = extra.assetId;
  if (extra.params !== undefined) issue.params = extra.params;
  return issue;
}

export function compileScriptAsset(
  projectId: string,
  asset: WorkshopScriptAsset,
): ScriptCompileResult {
  const issues: WorkshopCompileIssue[] = [];
  const data = asset.data;

  if (data.graph) {
    const analysis = analyzeScriptGraph(data.graph);
    if (!analysis.analyzable) {
      issues.push(
        createIssue('inlineJsNotAnalyzable', {
          assetId: asset.id,
          params: { nodes: analysis.inlineJsNodeIds.length },
        }),
      );
    }
  }

  const id = runtimeAssetId(projectId, asset.id);
  const script: CustomScriptData = {
    id,
    modId: projectId,
    name: asset.name,
    description: asset.description ?? '',
    hooks: [...(data.hooks ?? [])],
    permissions: [...(data.permissions ?? [])],
    code: data.code ?? '',
    ...(typeof data.throttleMs === 'number' ? { throttleMs: data.throttleMs } : {}),
    ...(typeof data.enabled === 'boolean' ? { enabled: data.enabled } : {}),
  };

  return {
    script,
    provenance: { runtimeId: id, assetId: asset.id, version: asset.version, kind: 'script' },
    issues,
  };
}
