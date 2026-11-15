/**
 * 產生的腳本預覽（唯讀）。
 *
 * 顯示的是 codegen 的實際輸出——不是另外組一份字串，所以預覽與發佈／試玩
 * 用的程式碼保證同一份。JS 節點會標記「不可靜態分析」。
 */
import { useEffect, useState } from 'react';
import type React from 'react';
import { useTranslation } from '@/i18n';
import { Btn } from '@/components/hl/controls';
import { Deck, Empty, SegHead } from '@/components/hl/surface';
import { studioText } from '@/workshop/graph/model';
import type { CompiledGraph } from '@/workshop/graph/codegen';

export interface CodePreviewPanelProps {
  compiled: CompiledGraph;
}

function permissionKey(permission: string): string {
  return 'studio.graph.permission.' + permission.replace(/\./g, '_');
}

function ChipRow({ items, tone }: { items: readonly string[]; tone: 'signal' | 'caution' }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={[
            'rounded-full border-2 px-2 py-0.5 font-mono text-[10.5px] font-extrabold',
            tone === 'signal'
              ? 'border-[var(--cn-signal-text)] bg-[var(--cn-coral-soft)] text-[var(--cn-signal-text)]'
              : 'border-[var(--cn-sun)] bg-[var(--cn-sun-soft)] text-[var(--cn-caution-text)]',
          ].join(' ')}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function CodePreviewPanel({ compiled }: CodePreviewPanelProps): React.ReactElement {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = (): void => {
    if (!compiled.code || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(compiled.code)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  return (
    <Deck className="flex h-full min-h-0 flex-col gap-2 p-3">
      <SegHead
        label={studioText(t, 'studio.graph.code.title')}
        right={
          <Btn variant="line" size="sm" onClick={copy} disabled={compiled.code.length === 0}>
            {copied ? studioText(t, 'studio.graph.code.copied') : studioText(t, 'studio.graph.code.copy')}
          </Btn>
        }
      />

      <div className="flex flex-wrap items-center gap-3 text-[11px] font-extrabold text-[var(--cn-ink-3)]">
        <span>
          {studioText(t, 'studio.graph.code.lines')} {compiled.lineCount}
        </span>
        <span>
          {studioText(t, 'studio.graph.code.hooks')} {compiled.hooks.length}
        </span>
        <span>
          {studioText(t, 'studio.graph.code.permissions')} {compiled.permissions.length}
        </span>
      </div>

      {compiled.hooks.length > 0 && <ChipRow items={compiled.hooks} tone="signal" />}
      {compiled.permissions.length > 0 && (
        <ChipRow items={compiled.permissions.map((permission) => studioText(t, permissionKey(permission)))} tone="signal" />
      )}

      {compiled.unanalyzableNodeIds.length > 0 && (
        <div className="rounded-[10px] border-2 border-[var(--cn-caution)] bg-[var(--cn-caution-soft)] px-2.5 py-1.5 text-[11.5px] font-bold text-[var(--cn-caution-text)]">
          {studioText(t, 'studio.graph.code.unanalyzable')} · {compiled.unanalyzableNodeIds.join(', ')}
        </div>
      )}

      {compiled.code.length === 0 ? (
        <Empty
          className="flex-1"
          title={studioText(t, 'studio.graph.code.empty')}
          hint={studioText(t, 'studio.graph.code.emptyHint')}
        />
      ) : (
        <pre className="arc-panel--sunken min-h-0 flex-1 overflow-auto whitespace-pre p-3 font-mono text-[12px] leading-[1.6] text-[var(--cn-ink)]">
          {compiled.code}
        </pre>
      )}
    </Deck>
  );
}
