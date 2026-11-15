/**
 * 全螢幕腳本編輯器（JS 節點／腳本模組共用）
 *
 * 不是第二套編輯器：沿用 ScriptCodeEditor 的高亮與自動完成，
 * 只把它放大到整頁，補上「行數、未儲存提示、Ctrl+S、Esc」。
 */
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Btn } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { ScriptCodeEditor } from '@/components/mod-editor/ScriptCodeEditor';

export interface ScriptFullEditorProps {
  title: string;
  value: string;
  onSave: (next: string) => void;
  onClose: () => void;
}

export function ScriptFullEditor({ title, value, onSave, onClose }: ScriptFullEditorProps) {
  const { t } = useTranslation();
  const s = t.studio.editor;
  const [draft, setDraft] = useState(value);
  const dirty = draft !== value;
  const lines = useMemo(() => draft.split('\n').length, [draft]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        onSave(draft);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [draft, onClose, onSave]);

  return createPortal(
    <div className="fixed inset-0 z-[200000] flex flex-col bg-[var(--cn-paper)]">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[var(--cn-line)] px-4">
        <span className="truncate font-mono text-[12px] font-bold text-[var(--cn-ink)]">{title}</span>
        <span className="shrink-0 font-mono text-[10px] text-[var(--cn-ink-3)]">
          {fillTemplate(s.lines, { count: String(lines) })}
        </span>
        {dirty && <span className="shrink-0 font-mono text-[10px] text-[var(--cn-caution-text)]">{s.dirty}</span>}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Btn size="sm" variant="ghost" onClick={onClose}>{s.cancel}</Btn>
          <Btn size="sm" variant="signal" onClick={() => onSave(draft)}>{s.save}</Btn>
        </div>
      </header>

      <div className="min-h-0 flex-1 p-4">
        <ScriptCodeEditor
          value={draft}
          onChange={setDraft}
          placeholder={s.placeholder}
          hint={s.hint}
          heightClass="h-full"
          className="h-full"
        />
      </div>

      <footer className="flex h-9 shrink-0 items-center gap-4 border-t border-[var(--cn-line-soft)] px-4 font-mono text-[10px] text-[var(--cn-ink-3)]">
        <span>{s.shortcutSave}</span>
        <span>{s.shortcutClose}</span>
        <span className="ml-auto">{s.escapeHint}</span>
      </footer>
    </div>,
    document.body,
  );
}
