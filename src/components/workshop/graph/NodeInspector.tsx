/**
 * 節點檢視器：選中節點的參數面板（含 JS 節點的程式碼框）。
 *
 * 只回報「哪個參數改成什麼」，不自己改圖——圖的唯一寫入點在外殼（GraphPage），
 * 這樣 Undo/重做與自動存檔都只有一條路徑。
 */
import { useEffect, useState } from 'react';
import type React from 'react';
import { useTranslation } from '@/i18n';
import { Btn, IconBtn, Input, Toggle } from '@/components/hl/controls';
import { Deck, Empty, Rule, SegHead } from '@/components/hl/surface';
import type { GraphIssue } from '@/workshop/graph/validate';
import type { GraphNode, GraphParamSpec, GraphParamValue, RuleGraph } from '@/workshop/graph/model';
import { findNode, studioText } from '@/workshop/graph/model';
import { nodeSpec } from '@/workshop/graph/nodeLibrary';
import { ScriptFullEditor } from './ScriptFullEditor';

export interface NodeInspectorProps {
  graph: RuleGraph;
  nodeId: string | null;
  issues: readonly GraphIssue[];
  onChangeParam: (nodeId: string, key: string, value: GraphParamValue) => void;
  onChangeJs: (nodeId: string, js: string) => void;
  onToggleEnabled: (nodeId: string, enabled: boolean) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

const FIELD_CLASS =
  'arc-field w-full text-[12.5px] font-bold';

function NumberField({
  value,
  spec,
  onCommit,
}: {
  value: number;
  spec: GraphParamSpec;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string>(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = (raw: string): void => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const min = spec.min;
    const max = spec.max;
    const clamped = Math.min(max ?? parsed, Math.max(min ?? parsed, parsed));
    onCommit(clamped);
    setDraft(String(clamped));
  };

  return (
    <Input
      type="number"
      className={FIELD_CLASS}
      value={draft}
      min={spec.min}
      max={spec.max}
      step={spec.step ?? 1}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={(event) => commit(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') commit((event.target as HTMLInputElement).value);
      }}
    />
  );
}

function ParamField({
  spec,
  value,
  onChange,
}: {
  spec: GraphParamSpec;
  value: GraphParamValue | undefined;
  onChange: (value: GraphParamValue) => void;
}) {
  const { t } = useTranslation();
  const label = studioText(t, spec.labelKey);

  if (spec.kind === 'number') {
    const numeric = typeof value === 'number' ? value : Number(spec.default);
    return (
      <label className="flex flex-col gap-1">
        <span className="arc-label">{label}</span>
        <NumberField value={numeric} spec={spec} onCommit={onChange} />
      </label>
    );
  }

  if (spec.kind === 'boolean') {
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="arc-label">{label}</span>
        <Toggle on={value === true} onChange={onChange} label={label} />
      </div>
    );
  }

  if (spec.kind === 'select' || spec.kind === 'stateField' || spec.kind === 'statusEffect') {
    const options = spec.options ?? [];
    return (
      <label className="flex flex-col gap-1">
        <span className="arc-label">{label}</span>
        <select
          className={FIELD_CLASS}
          value={typeof value === 'string' ? value : String(spec.default)}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {studioText(t, option.labelKey)}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="arc-label">{label}</span>
      <Input
        className={FIELD_CLASS}
        value={typeof value === 'string' ? value : ''}
        placeholder={spec.placeholderKey ? studioText(t, spec.placeholderKey) : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function IssueList({
  issues,
  nodeId,
}: {
  issues: readonly GraphIssue[];
  nodeId: string;
}) {
  const { t } = useTranslation();
  const own = issues.filter((issue) => issue.nodeId === nodeId);
  if (own.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {own.map((issue, index) => (
        <div
          key={issue.code + '-' + String(index)}
          className={[
            'flex items-start gap-2 rounded-[10px] border-2 px-2.5 py-1.5 text-[12px] font-bold',
            issue.severity === 'error'
              ? 'border-[var(--cn-alert)] bg-[var(--cn-alert-soft)] text-[var(--cn-alarm-text)]'
              : 'border-[var(--cn-sun)] bg-[var(--cn-sun-soft)] text-[var(--cn-caution-text)]',
          ].join(' ')}
        >
          <span className="mt-0.5 shrink-0 text-[10px] font-extrabold uppercase">
            {studioText(t, 'studio.graph.issue.' + issue.severity)}
          </span>
          <span className="min-w-0 break-words">
            {studioText(t, 'studio.graph.issue.' + issue.code)}
            {issue.paramKey ? ' · ' + issue.paramKey : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

function JsEditor({ node, onChange }: { node: GraphNode; onChange: (js: string) => void }) {
  const { t } = useTranslation();
  const [full, setFull] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <SegHead
        label={studioText(t, 'studio.graph.inspector.js')}
        right={(
          <Btn size="sm" variant="line" onClick={() => setFull(true)}>
            {studioText(t, 'studio.graph.inspector.fullEditor')}
          </Btn>
        )}
      />
      <div className="rounded-[10px] border-2 border-[var(--cn-caution)] bg-[var(--cn-caution-soft)] px-2.5 py-1.5 text-[11.5px] font-bold text-[var(--cn-caution-text)]">
        {studioText(t, 'studio.graph.inspector.jsHint')}
      </div>
      <textarea
        className="arc-field min-h-[180px] w-full resize-y font-mono text-[12px] leading-[1.55]"
        spellCheck={false}
        value={node.js ?? ''}
        placeholder={studioText(t, 'studio.graph.inspector.jsPlaceholder')}
        onChange={(event) => onChange(event.target.value)}
      />
      {full && (
        <ScriptFullEditor
          title={node.type + ' · ' + node.id}
          value={node.js ?? ''}
          onSave={(next) => {
            onChange(next);
            setFull(false);
          }}
          onClose={() => setFull(false)}
        />
      )}
    </div>
  );
}

export function NodeInspector({
  graph,
  nodeId,
  issues,
  onChangeParam,
  onChangeJs,
  onToggleEnabled,
  onDelete,
  onClose,
}: NodeInspectorProps): React.ReactElement {
  const { t } = useTranslation();
  const node = nodeId ? findNode(graph, nodeId) : null;
  const spec = node ? nodeSpec(node.type) : null;

  if (!node || !spec) {
    return (
      <Deck className="flex h-full flex-col p-3">
        <SegHead label={studioText(t, 'studio.graph.inspector.title')} />
        <Empty
          className="mt-3 flex-1"
          title={studioText(t, 'studio.graph.inspector.emptyTitle')}
          hint={studioText(t, 'studio.graph.inspector.emptyHint')}
        />
      </Deck>
    );
  }

  return (
    <Deck className="flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border-[3px] border-[var(--cn-line)] bg-[var(--cn-sun)] font-mono text-[11px] font-extrabold text-[var(--cn-on-sun)]">
          {spec.glyph}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-extrabold text-[var(--cn-ink)]">
            {studioText(t, spec.labelKey)}
          </div>
          <div className="truncate font-mono text-[10.5px] font-bold text-[var(--cn-ink-3)]">
            {node.type} · {node.id}
          </div>
        </div>
        <Toggle
          on={node.enabled !== false}
          onChange={(next) => onToggleEnabled(node.id, next)}
          label={studioText(t, 'studio.graph.inspector.enabled')}
        />
        <IconBtn label={studioText(t, 'studio.graph.inspector.close')} onClick={onClose} className="h-8 w-8">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </IconBtn>
      </div>

      <p className="text-[12px] font-semibold leading-[1.6] text-[var(--cn-ink-2)]">
        {studioText(t, spec.descriptionKey)}
      </p>

      <IssueList issues={issues} nodeId={node.id} />

      <Rule />

      {spec.params.length > 0 && (
        <div className="flex flex-col gap-2">
          <SegHead label={studioText(t, 'studio.graph.inspector.params')} />
          {spec.params.map((param) => (
            <ParamField
              key={param.key}
              spec={param}
              value={node.params[param.key]}
              onChange={(value) => onChangeParam(node.id, param.key, value)}
            />
          ))}
        </div>
      )}

      {spec.inputs.length > 0 && (
        <div className="flex flex-col gap-1">
          <SegHead label={studioText(t, 'studio.graph.inspector.inputs')} />
          <div className="flex flex-wrap gap-1.5">
            {spec.inputs.map((port) => (
              <span
                key={port.id}
                className="rounded-full border-2 border-[var(--cn-line-soft)] px-2 py-0.5 text-[11px] font-extrabold text-[var(--cn-ink-2)]"
              >
                {studioText(t, port.labelKey)} · {port.kind}
              </span>
            ))}
          </div>
        </div>
      )}

      {spec.type === 'js.node' && (
        <JsEditor node={node} onChange={(js) => onChangeJs(node.id, js)} />
      )}

      <div className="mt-auto flex items-center gap-2 pt-1">
        <Btn variant="line" size="sm" onClick={() => onDelete(node.id)}>
          {studioText(t, 'studio.graph.inspector.delete')}
        </Btn>
        <span className="text-[11px] font-bold text-[var(--cn-ink-3)]">
          {studioText(t, 'studio.graph.inspector.hint')}
        </span>
      </div>
    </Deck>
  );
}
