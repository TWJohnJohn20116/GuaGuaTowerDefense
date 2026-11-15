/**
 * 規則工坊頁（節點圖＋規則表＋產碼預覽的整合外殼）。
 *
 * 契約：頁面級元件只接 { projectId, levelId? }，其餘狀態自己從 workshopStore 讀寫
 * （見 lead 釘死的 store 介面）。圖存在 kind === 'script' 的資產裡：
 * data.graph 是節點圖、data.code 是 codegen 產物——試玩／安裝時編譯的也是同一份。
 *
 * 作用域：專案層與關卡層各有一份圖；關卡層＝該關卡 scriptRefs 指向的腳本模組。
 */
import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { useTranslation } from '@/i18n';
import { useWorkshopStore } from '@/store/workshopStore';
import { Btn, Chip } from '@/components/hl/controls';
import { Deck, Empty, SegHead } from '@/components/hl/surface';
import type { AssetRef, WorkshopAsset, WorkshopScriptData } from '@/types/workshop';
import type { GraphNodeCategory, RuleGraph } from '@/workshop/graph/model';
import { cloneGraph, emptyGraph, nextEdgeId, studioText } from '@/workshop/graph/model';
import { nodeSpecsByCategory } from '@/workshop/graph/nodeLibrary';
import { compileGraph } from '@/workshop/graph/codegen';
import { canConnect, isDuplicateEdge, validateGraph } from '@/workshop/graph/validate';
import {
  addNodeAt,
  deleteSelection,
  fromWorkshopScriptGraph,
  removeRuleRow,
  toWorkshopScriptGraph,
  toggleRuleRow,
  updateRowJs,
  updateRowParam,
} from '@/workshop/graph/ruleTable';
import { GraphCanvas } from './GraphCanvas';
import type { GraphSelection } from './GraphCanvas';
import { NodeInspector } from './NodeInspector';
import { RuleTablePanel } from './RuleTablePanel';
import { CodePreviewPanel } from './CodePreviewPanel';

export interface GraphPageProps {
  projectId: string;
  levelId?: string;
}

type Scope = 'project' | 'level';

const PALETTE_CATEGORIES: readonly { category: GraphNodeCategory; labelKey: string }[] = [
  { category: 'event', labelKey: 'studio.graph.palette.events' },
  { category: 'condition', labelKey: 'studio.graph.palette.conditions' },
  { category: 'action', labelKey: 'studio.graph.palette.actions' },
  { category: 'flow', labelKey: 'studio.graph.palette.flows' },
  { category: 'value', labelKey: 'studio.graph.palette.values' },
  { category: 'js', labelKey: 'studio.graph.palette.js' },
];

function firstScriptRefId(
  refs: readonly AssetRef[] | undefined,
  assets: readonly WorkshopAsset[],
): string | null {
  if (!refs) return null;
  for (const ref of refs) {
    const asset = assets.find((item) => item.id === ref.assetId);
    if (asset && asset.kind === 'script') return asset.id;
  }
  return null;
}

function readStoredGraph(asset: WorkshopAsset | undefined): RuleGraph {
  if (!asset || asset.kind !== 'script') return emptyGraph();
  const data: WorkshopScriptData = asset.data;
  if (!data.graph) return emptyGraph();
  return fromWorkshopScriptGraph(data.graph);
}

export function GraphPage({ projectId, levelId }: GraphPageProps): React.ReactElement {
  const { t } = useTranslation();
  const projects = useWorkshopStore((state) => state.projects);
  const assets = useWorkshopStore((state) => state.assets);
  const activeLevelId = useWorkshopStore((state) => state.activeLevelId);

  const project = projects.find((item) => item.id === projectId) ?? null;
  const resolvedLevelId = levelId ?? activeLevelId;
  const level =
    project === null
      ? null
      : project.levels.find((item) => item.id === resolvedLevelId) ?? project.levels[0] ?? null;

  const [scope, setScope] = useState<Scope>('level');
  const [panel, setPanel] = useState<'table' | 'code'>('table');
  const [selection, setSelection] = useState<GraphSelection>({ nodes: [], edges: [] });
  const [paletteType, setPaletteType] = useState<string>('action.addMoney');
  const [addCount, setAddCount] = useState(0);

  const scopeRefId =
    scope === 'level' && level
      ? firstScriptRefId(level.scriptRefs, assets)
      : firstScriptRefId(project?.assetRefs, assets);

  const scopeAsset = scopeRefId ? assets.find((item) => item.id === scopeRefId) : undefined;
  const storedGraph = useMemo(() => readStoredGraph(scopeAsset), [scopeAsset]);

  const [graph, setGraph] = useState<RuleGraph>(storedGraph);
  const [boundAssetId, setBoundAssetId] = useState<string | null>(scopeRefId);

  // 只在「綁定換了」（專案／作用域／關卡／資產）時重新載入。
  // storedGraph 刻意不放進 deps：每次存檔都會產生新的圖物件，
  // 放進來會在每次編輯後把選取清空（參數面板跟著關掉），體感像當機。
  useEffect(() => {
    setGraph(storedGraph);
    setBoundAssetId(scopeRefId);
  }, [projectId, scope, resolvedLevelId, scopeRefId]);

  useEffect(() => {
    setSelection({ nodes: [], edges: [] });
  }, [projectId, scope, resolvedLevelId, scopeRefId]);

  const validation = useMemo(() => validateGraph(graph), [graph]);
  const compiled = useMemo(() => compileGraph(graph), [graph]);
  const selectedNodeId = selection.nodes.length > 0 ? selection.nodes[selection.nodes.length - 1] : null;

  const assetName =
    scope === 'level'
      ? studioText(t, 'studio.graph.asset.levelRules')
      : studioText(t, 'studio.graph.asset.projectRules');

  const applyGraph = (next: RuleGraph): void => {
    setGraph(next);
    const state = useWorkshopStore.getState();
    let targetId = boundAssetId;
    if (!targetId) {
      targetId = state.createAsset('script', assetName);
      const created = state.getAsset(targetId);
      if (!created) return;
      const ref: AssetRef = { assetId: created.id, version: created.version };
      if (scope === 'level' && level) {
        state.updateLevel(projectId, level.id, {
          scriptRefs: [...(level.scriptRefs ?? []), ref],
        });
      } else if (project) {
        state.updateProject(projectId, { assetRefs: [...project.assetRefs, ref] });
      }
      setBoundAssetId(targetId);
    }
    if (!targetId) return;
    const current = useWorkshopStore.getState().getAsset(targetId);
    if (!current || current.kind !== 'script') return;
    const nextCompiled = compileGraph(next);
    const data: WorkshopScriptData = {
      code: nextCompiled.code,
      hooks: nextCompiled.hooks,
      permissions: nextCompiled.permissions,
      graph: toWorkshopScriptGraph(next),
      throttleMs: current.data.throttleMs,
      enabled: current.data.enabled ?? true,
    };
    useWorkshopStore.getState().upsertAsset({ ...current, data, updatedAt: Date.now() });
  };

  if (!project) {
    return (
      <Deck className="flex h-full flex-col p-4">
        <Empty
          className="flex-1"
          title={studioText(t, 'studio.graph.page.missingProject')}
          hint={studioText(t, 'studio.graph.page.missingProjectHint')}
        />
      </Deck>
    );
  }

  const addAtPoint = (type: string, point: { x: number; y: number }): void => {
    const result = addNodeAt(graph, type, point.x, point.y);
    if (result.graph !== graph) {
      applyGraph(result.graph);
      if (result.nodeId) {
        setSelection({ nodes: [result.nodeId], edges: [] });
        setAddCount((count) => count + 1);
      }
    }
  };

  const addFromPalette = (type: string): void => {
    setPaletteType(type);
    const index = addCount;
    addAtPoint(type, { x: 80 + (index % 4) * 220, y: 80 + Math.floor(index / 4) * 150 });
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <Deck className="flex flex-wrap items-center gap-2 px-3 py-2">
        <span className="arc-label shrink-0">{studioText(t, 'studio.graph.page.scope')}</span>
        <Chip active={scope === 'project'} onClick={() => setScope('project')}>
          {studioText(t, 'studio.graph.page.scopeProject')}
        </Chip>
        <Chip
          active={scope === 'level'}
          onClick={() => {
            if (level) setScope('level');
          }}
        >
          {level ? level.name : studioText(t, 'studio.graph.page.noLevel')}
        </Chip>

        <span className="mx-1 h-6 w-[3px] rounded-full bg-[var(--cn-line-soft)]" />

        <span className="text-[12px] font-extrabold text-[var(--cn-alarm-text)]">
          {studioText(t, 'studio.graph.page.errors')} {validation.errors.length}
        </span>
        <span className="text-[12px] font-extrabold text-[var(--cn-caution-text)]">
          {studioText(t, 'studio.graph.page.warnings')} {validation.warnings.length}
        </span>
        {validation.hasJs && (
          <span className="rounded-full bg-[var(--cn-sun)] px-2 py-0.5 text-[10.5px] font-extrabold text-[var(--cn-on-sun)]">
            {studioText(t, 'studio.graph.page.hasJs')}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] font-bold text-[var(--cn-ink-3)]">
            {studioText(t, 'studio.graph.page.doubleClickHint')}
          </span>
          {scope === 'level' && !level && (
            <span className="text-[11px] font-bold text-[var(--cn-caution-text)]">
              {studioText(t, 'studio.graph.page.noLevelHint')}
            </span>
          )}
        </div>
      </Deck>

      <div className="flex min-h-0 flex-1 gap-2">
        <Deck className="flex w-[196px] shrink-0 flex-col gap-2 overflow-y-auto p-2">
          <SegHead label={studioText(t, 'studio.graph.palette.title')} />
          {PALETTE_CATEGORIES.map((entry) => {
            const specs = nodeSpecsByCategory(entry.category);
            if (specs.length === 0) return null;
            return (
              <div key={entry.category} className="flex flex-col gap-1">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-[var(--cn-ink-3)]">
                  {studioText(t, entry.labelKey)}
                </span>
                {specs.map((spec) => (
                  <button
                    key={spec.type}
                    type="button"
                    onClick={() => addFromPalette(spec.type)}
                    className={[
                      'flex items-center gap-2 rounded-[9px] border-2 px-2 py-1 text-left text-[12px] font-extrabold transition-colors',
                      paletteType === spec.type
                        ? 'border-[var(--cn-signal-text)] bg-[var(--cn-coral-soft)] text-[var(--cn-signal-text)]'
                        : 'border-transparent bg-[var(--cn-card-2)] text-[var(--cn-ink-2)] hover:border-[var(--cn-line)]',
                    ].join(' ')}
                  >
                    <span className="w-6 shrink-0 text-center font-mono text-[10px]">{spec.glyph}</span>
                    <span className="min-w-0 truncate">{studioText(t, spec.labelKey)}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </Deck>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div className="min-h-0 flex-1">
            <GraphCanvas
              graph={graph}
              selection={selection}
              issuesByNode={validation.issuesByNode}
              onSelectionChange={setSelection}
              onMoveNodes={(moves) => {
                const next = cloneGraph(graph);
                for (const move of moves) {
                  const node = next.nodes.find((item) => item.id === move.id);
                  if (node) {
                    node.x = move.x;
                    node.y = move.y;
                  }
                }
                applyGraph(next);
              }}
              onConnect={(edge) => {
                if (!canConnect(graph, edge.from, edge.fromPort, edge.to, edge.toPort)) return;
                if (isDuplicateEdge(graph, edge)) return;
                const next = cloneGraph(graph);
                next.edges.push({ id: nextEdgeId(next), ...edge });
                applyGraph(next);
              }}
              onDeleteSelection={(nodeIds, edgeIds) => {
                applyGraph(deleteSelection(graph, nodeIds, edgeIds));
                setSelection({ nodes: [], edges: [] });
              }}
              onRequestAddNode={(point) => addAtPoint(paletteType, point)}
              onOpenNode={(nodeId) => setSelection({ nodes: [nodeId], edges: [] })}
            />
          </div>

          <Deck className="flex h-[38%] min-h-[210px] flex-col gap-2 p-2">
            <div className="flex items-center gap-2">
              <Chip active={panel === 'table'} onClick={() => setPanel('table')}>
                {studioText(t, 'studio.graph.page.tabTable')}
              </Chip>
              <Chip active={panel === 'code'} onClick={() => setPanel('code')}>
                {studioText(t, 'studio.graph.page.tabCode')}
              </Chip>
              <span className="ml-auto text-[11px] font-bold text-[var(--cn-ink-3)]">
                {studioText(t, 'studio.graph.page.nodes')} {graph.nodes.length}
              </span>
              <Btn
                variant="line"
                size="sm"
                onClick={() => {
                  const sample = nodeSpecsByCategory('event')[0];
                  if (sample) addFromPalette(sample.type);
                }}
              >
                {studioText(t, 'studio.graph.page.addEvent')}
              </Btn>
            </div>
            <div className="min-h-0 flex-1">
              {panel === 'table' ? (
                <RuleTablePanel
                  graph={graph}
                  issues={[...validation.errors, ...validation.warnings]}
                  selectedNodeId={selectedNodeId}
                  onChange={applyGraph}
                  onSelect={(nodeId) => setSelection({ nodes: [nodeId], edges: [] })}
                />
              ) : (
                <CodePreviewPanel compiled={compiled} />
              )}
            </div>
          </Deck>
        </div>

        <div className="w-[300px] shrink-0">
          <NodeInspector
            graph={graph}
            nodeId={selectedNodeId}
            issues={[...validation.errors, ...validation.warnings]}
            onChangeParam={(nodeId, key, value) => applyGraph(updateRowParam(graph, nodeId, key, value))}
            onChangeJs={(nodeId, js) => applyGraph(updateRowJs(graph, nodeId, js))}
            onToggleEnabled={(nodeId, enabled) => applyGraph(toggleRuleRow(graph, nodeId, enabled))}
            onDelete={(nodeId) => {
              applyGraph(removeRuleRow(graph, nodeId));
              setSelection({ nodes: [], edges: [] });
            }}
            onClose={() => setSelection({ nodes: [], edges: [] })}
          />
        </div>
      </div>
    </div>
  );
}
