/**
 * 腳本程式碼編輯器：高亮疊層 + 透明 textarea + Ctrl+Space 自動完成
 *
 * 疊層做法是編輯器的標準技巧：<pre> 負責顯示顏色，textarea 只負責輸入與選取，
 * 兩者字型、行高、內距必须完全一致，否則游標會與文字錯位。
 */
import { useMemo, useRef, useState } from 'react';
import { SCRIPT_TOKEN_CLASS, matchApiEntries, tokenizeScript, wordAtCursor } from './scriptHighlight';

interface ScriptCodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
}

const SHARED = 'font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap break-words';

export function ScriptCodeEditor({ value, onChange, placeholder, hint }: ScriptCodeEditorProps) {
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);
  const [query, setQuery] = useState<string | null>(null);

  const tokens = useMemo(() => tokenizeScript(value), [value]);
  const matches = useMemo(() => (query === null ? [] : matchApiEntries(query).slice(0, 8)), [query]);

  const openCompletion = () => {
    const area = areaRef.current;
    if (!area) return;
    const { word } = wordAtCursor(area.value, area.selectionStart);
    setQuery(word);
  };

  const insert = (snippet: string) => {
    const area = areaRef.current;
    if (!area) return;
    const { start } = wordAtCursor(area.value, area.selectionStart);
    const caret = area.selectionStart;
    const next = area.value.slice(0, start) + snippet + area.value.slice(caret);
    onChange(next);
    setQuery(null);
    requestAnimationFrame(() => {
      area.focus();
      const position = start + snippet.length;
      area.setSelectionRange(position, position);
    });
  };

  return (
    <div className="relative">
      <div className="relative h-64 w-full overflow-hidden border border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
        <pre
          ref={preRef}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 m-0 overflow-hidden p-2.5 ${SHARED}`}
        >
          {tokens.map((token, index) => (
            <span key={index} className={SCRIPT_TOKEN_CLASS[token.kind]}>
              {token.text}
            </span>
          ))}
          {'\n'}
        </pre>
        <textarea
          ref={areaRef}
          value={value}
          spellCheck={false}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onScroll={(e) => {
            const pre = preRef.current;
            if (!pre) return;
            pre.scrollTop = e.currentTarget.scrollTop;
            pre.scrollLeft = e.currentTarget.scrollLeft;
          }}
          onKeyDown={(e) => {
            if (e.key === ' ' && e.ctrlKey) {
              e.preventDefault();
              openCompletion();
              return;
            }
            if (query !== null && e.key === 'Escape') {
              e.preventDefault();
              setQuery(null);
              return;
            }
            if (query !== null && (e.key === 'Enter' || e.key === 'Tab') && matches.length > 0) {
              e.preventDefault();
              insert(matches[0].insert);
            }
          }}
          className={`absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent p-2.5 text-transparent caret-[var(--arc-gold)] outline-hidden placeholder:text-[var(--arc-ink-4)] ${SHARED}`}
        />
      </div>

      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          onClick={openCompletion}
          className="border border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[9.5px] text-[var(--arc-ink-3)] transition-colors hover:border-[var(--arc-line)] hover:text-[var(--arc-ink)]"
        >
          Ctrl+Space
        </button>
        <span className="font-mono text-[9.5px] text-[var(--arc-ink-4)]">{hint}</span>
      </div>

      {query !== null && (
        <div className="absolute bottom-9 left-0 z-20 max-h-48 w-[min(460px,100%)] overflow-y-auto border border-[var(--arc-line-strong)] bg-[var(--arc-void-2)]">
          {matches.length === 0 ? (
            <div className="px-2 py-1.5 font-mono text-[10px] text-[var(--arc-ink-4)]">沒有符合的 API</div>
          ) : (
            matches.map((entry) => (
              <button
                key={entry.label}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insert(entry.insert);
                }}
                className="flex w-full items-center justify-between gap-2 border-b border-[var(--cn-line-soft)] px-2 py-1 text-left last:border-b-0 hover:bg-[var(--arc-deck-2)]"
              >
                <span className="font-mono text-[10.5px] text-[var(--arc-ink)]">{entry.label}</span>
                <span className="shrink-0 font-mono text-[9px] text-[var(--arc-ink-4)]">
                  {entry.permission ?? '—'}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
