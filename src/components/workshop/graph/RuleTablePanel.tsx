/**
 * 規則表：節點圖的表格視圖（同一份模型的兩種投影）。
 *
 * 每一列就是一個節點；在這裡勾選／排序／刪除，改的是同一張圖，
 * 因此畫布與表格永遠同步——不存在「表格改了圖沒改」的情況。
 */
import { useMemo, useState } from 'react';
import type React from 'react';
import { useTranslation } from '@/i18n';
import { Btn, IconBtn, Toggle } from '@/components/hl/controls';
import { Deck, Empty, SegHead } from '@/components/hl/surface';
import { CustomSelect } from '@/components/ui/CustomSelect';
import type { GraphIssue } from '@/workshop/graph/validate';
import type { RuleGraph } from '@/workshop/graph/model';
import { findNode, studioText } from '@/workshop/graph/model';
import { nodeSpecsByCategory } from '@/workshop/graph/nodeLibrary';
import type { RuleRow } from '@/workshop/graph/ruleTable';
import {
  addRuleRow,
  graphToRows,
  moveRuleRow,
  removeRuleRow,
  toggleRuleRow,
} from '@/workshop/graph/ruleTable';

export interface RuleTablePanelProps {
  graph: RuleGraph;
  issues: readonly GraphIssue[];
  selectedNodeId: string | null;
  onChange: (graph: RuleGraph) => void;
  onSelect: (nodeId: string) => void;
}

const CATEGORY_TONE: Record<RuleRow['category'], string> = {
  event: 'bg-[var(--cn-sun)] text-[var(--cn-on-sun)]',
  condition: 'bg-[var(--cn-grape-soft)] text-[var(--cn-reach-text)]',
  action: 'bg-[var(--cn-coral-soft)] text-[var(--cn-signal-text)]',
  flow: 'bg-[var(--cn-card-2)] text-[var(--cn-ink-2)]',
  value: 'bg-[var(--cn-mint-soft)] text-[var(--cn-vital-text)]',
  js: 'bg-[var(--cn-sun-soft)] text-[var(--cn-caution-text)]',
};

function severityOf(issues: readonly GraphIssue[], nodeId: string): 'error' | 'warning' | null {
  let result: 'error' | 'warning' | null = null;
  for (const issue of issues) {
    if (issue.nodeId !== nodeId) continue;
    if (issue.severity === 'error') return 'error';
    result = 'warning';
  }
  return result;
}

function AddRowControl({
  graph,
  eventNodeId,
  onAdd,
}: {
  graph: RuleGraph;
  eventNodeId: string;
  onAdd: (graph: RuleGraph) => void;
}) {
  const { t } = useTranslation();
  const options = useMemo(
    () => [...nodeSpecsByCategory('action'), ...nodeSpecsByCategory('flow')],
    [],
  );
  const [selected, setSelected] = useState<string>(options.length > 0 ? options[0].type : '');

  if (options.length === 0) return null;

  return (
    <div className="flex items-center gap-2 pl-4 pt-1">
      <CustomSelect
        className="min-w-0 flex-1"
        value={selected}
        onChange={setSelected}
        options={options.map((option) => ({
          value: option.type,
          label: studioText(t, option.labelKey),
        }))}
        size="sm"
        position="inline"
      />
      <Btn
        variant="line"
        size="sm"
        onClick={() => {
          const result = addRuleRow(graph, eventNodeId, selected);
          if (result.nodeId) onAdd(result.graph);
        }}
      >
        {studioText(t, 'studio.graph.table.addRow')}
      </Btn>
    </div>
  );
}

export function RuleTablePanel({
  graph,
  issues,
  selectedNodeId,
  onChange,
  onSelect,
}: RuleTablePanelProps): React.ReactElement {
  const { t } = useTranslation();
  const rows = useMemo(() => graphToRows(graph), [graph]);

  if (rows.length === 0) {
    return (
      <Deck className="flex h-full flex-col gap-2 p-3">
        <SegHead label={studioText(t, 'studio.graph.table.title')} />
        <Empty
          className="flex-1"
          title={studioText(t, 'studio.graph.table.emptyTitle')}
          hint={studioText(t, 'studio.graph.table.emptyHint')}
        />
      </Deck>
    );
  }

  const eventRows = rows.filter((row) => row.category === 'event');

  return (
    <Deck className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto p-3">
      <SegHead
        label={studioText(t, 'studio.graph.table.title')}
        right={
          <span className="text-[11px] font-extrabold text-[var(--cn-ink-3)]">
            {rows.length} · {studioText(t, 'studio.graph.table.rows')}
          </span>
        }
      />

      <div className="flex flex-col gap-3">
        {eventRows.map((eventRow) => {
          const sectionRows = rows.filter((row) => row.eventNodeId === eventRow.nodeId);
          const children = sectionRows.filter((row) => row.nodeId !== eventRow.nodeId);
          const eventNode = findNode(graph, eventRow.nodeId);
          return (
            <div key={eventRow.nodeId} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 rounded-[10px] border-2 border-[var(--cn-line)] bg-[var(--cn-card-2)] px-2.5 py-1.5">
                <span
                  className={
                    'rounded-[7px] px-1.5 py-0.5 font-mono text-[10px] font-extrabold uppercase ' +
                    CATEGORY_TONE.event
                  }
                >
                  event
                </span>
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left text-[13px] font-extrabold text-[var(--cn-ink)]"
                  onClick={() => onSelect(eventRow.nodeId)}
                >
                  {studioText(t, eventRow.labelKey)}
                </button>
                {eventNode && (
                  <Toggle
                    on={eventNode.enabled !== false}
                    onChange={(next) => onChange(toggleRuleRow(graph, eventRow.nodeId, next))}
                    label={studioText(t, 'studio.graph.table.enabled')}
                  />
                )}
              </div>

              {children.length === 0 && (
                <div className="pl-4 text-[11.5px] font-bold text-[var(--cn-ink-3)]">
                  {studioText(t, 'studio.graph.table.emptyChain')}
                </div>
              )}

              {children.map((row) => {
                const severity = severityOf(issues, row.nodeId);
                return (
                  <div
                    key={row.nodeId}
                    className={[
                      'flex items-center gap-2 rounded-[10px] border-2 px-2 py-1.5',
                      selectedNodeId === row.nodeId
                        ? 'border-[var(--cn-signal-text)] bg-[var(--cn-coral-soft)]'
                        : severity === 'error'
                          ? 'border-[var(--cn-alert)] bg-[var(--cn-alert-soft)]'
                          : severity === 'warning'
                            ? 'border-[var(--cn-sun)] bg-[var(--cn-sun-soft)]'
                            : 'border-[var(--cn-line-soft)] bg-[var(--cn-card)]',
                    ].join(' ')}
                    style={{ marginLeft: (row.depth - 1) * 14 + 16 }}
                  >
                    <span
                      className={
                        'shrink-0 rounded-[7px] px-1.5 py-0.5 font-mono text-[10px] font-extrabold uppercase ' +
                        CATEGORY_TONE[row.category]
                      }
                    >
                      {row.category}
                    </span>
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left text-[12.5px] font-extrabold text-[var(--cn-ink)]"
                      onClick={() => onSelect(row.nodeId)}
                    >
                      {studioText(t, row.labelKey)}
                      {row.summary && (
                        <span className="ml-2 font-mono text-[11px] font-bold text-[var(--cn-ink-2)]">
                          {row.summary}
                        </span>
                      )}
                      {row.unanalyzable && (
                        <span className="ml-2 rounded-full bg-[var(--cn-sun)] px-1.5 py-0.5 text-[10px] font-extrabold text-[var(--cn-on-sun)]">
                          {studioText(t, 'studio.graph.table.unanalyzable')}
                        </span>
                      )}
                    </button>
                    <IconBtn
                      label={studioText(t, 'studio.graph.table.moveUp')}
                      className="h-7 w-7"
                      onClick={() => onChange(moveRuleRow(graph, row.nodeId, -1))}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 15l7-7 7 7" />
                      </svg>
                    </IconBtn>
                    <IconBtn
                      label={studioText(t, 'studio.graph.table.moveDown')}
                      className="h-7 w-7"
                      onClick={() => onChange(moveRuleRow(graph, row.nodeId, 1))}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 9l7 7 7-7" />
                      </svg>
                    </IconBtn>
                    <Toggle
                      on={row.enabled}
                      onChange={(next) => onChange(toggleRuleRow(graph, row.nodeId, next))}
                      label={studioText(t, 'studio.graph.table.enabled')}
                    />
                    <IconBtn
                      label={studioText(t, 'studio.graph.table.delete')}
                      className="h-7 w-7"
                      onClick={() => onChange(removeRuleRow(graph, row.nodeId))}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </IconBtn>
                  </div>
                );
              })}

              <AddRowControl
                graph={graph}
                eventNodeId={eventRow.nodeId}
                onAdd={(next) => onChange(next)}
              />
            </div>
          );
        })}
      </div>
    </Deck>
  );
}
