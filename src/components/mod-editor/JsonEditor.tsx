import { useRef, useCallback } from 'react';
import { useTranslation } from '@/i18n';
import { CheckIcon, XIcon, ClipboardIcon, SlidersIcon } from '@/components/ui/Icons';
import { Btn, SegHead } from '@/components/hl';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// JSON 語法高亮
const highlightJson = (json: string): string => {
  if (!json) return '';
  
  // 轉義 HTML
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // 語法高亮規則
  return escaped
    // 字串 (綠色)
    .replace(/"([^"\\]|\\.)*"/g, (match) => {
      // 檢查是否是鍵
      if (match.endsWith('":') || /^"[^"]*"\s*:/.test(match)) {
        return match;
      }
      return `<span class="json-string">${match}</span>`;
    })
    // 鍵名 (淺藍色)
    .replace(/"([^"\\]|\\.)*"\s*:/g, (match) => {
      const key = match.slice(0, -1);
      return `<span class="json-key">${key}</span>:`;
    })
    // 數字 (橙色)
    .replace(/\b(-?\d+\.?\d*)\b/g, '<span class="json-number">$1</span>')
    // 布林值 (紫色)
    .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
    // null (紅色)
    .replace(/\bnull\b/g, '<span class="json-null">null</span>')
    // 括號 (黃色)
    .replace(/([{}\[\]])/g, '<span class="json-bracket">$1</span>');
};

export const JsonEditor = ({ value, onChange, placeholder }: JsonEditorProps) => {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // 同步滾動
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // 格式化 JSON
  const formatJson = () => {
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
    } catch {
      // 格式化失敗時不做任何事
    }
  };

  // 檢查 JSON 有效性
  const isValidJson = useCallback(() => {
    if (!value.trim()) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }, [value]);

  const valid = isValidJson();

  return (
    <div className="mb-4 flex flex-1 flex-col">
      {/* 工具欄：mono 標籤 → 結構線 → 狀態 + 動作 */}
      <div className="mb-2">
        <SegHead
          label={m.jsonEditorTitle}
          right={
            <div className="flex items-center gap-2">
              {value && (
                <span
                  className={[
                    'inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]',
                    valid
                      ? 'border-[rgba(53,224,138,0.4)] text-[var(--arc-vital)]'
                      : 'border-[rgba(255,61,113,0.4)] text-[var(--arc-alert)]',
                  ].join(' ')}
                >
                  {valid ? <CheckIcon className="h-2.5 w-2.5" /> : <XIcon className="h-2.5 w-2.5" />}
                  {valid ? m.jsonValid : m.jsonInvalid}
                </span>
              )}
              <Btn
                size="sm"
                variant="line"
                onClick={formatJson}
                disabled={!valid}
                icon={<SlidersIcon className="h-3.5 w-3.5" />}
              >
                {m.jsonFormatBtn}
              </Btn>
            </div>
          }
        />
      </div>

      {/* 編輯器容器：1px 線 + 下沉底，無陰影 */}
      <div
        className={[
          'relative min-h-[300px] flex-1 overflow-hidden border bg-[var(--arc-void-2)] transition-colors',
          valid ? 'border-[var(--cn-line-soft)]' : 'border-[rgba(255,61,113,0.38)]',
        ].join(' ')}
      >
        {/* 行號 */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-10 overflow-hidden border-r border-[var(--cn-line-soft)] bg-[var(--arc-deck)]">
          <div className="p-3 font-mono text-xs leading-6 text-[var(--arc-ink-4)]">
            {(value || placeholder || '').split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        </div>

        {/* 語法高亮層 */}
        <div
          ref={highlightRef}
          className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-all p-3 pl-12 font-mono text-sm leading-6"
          dangerouslySetInnerHTML={{ 
            __html: highlightJson(value) || `<span class="text-[var(--arc-ink-4)]">${placeholder || ''}</span>`
          }}
        />

        {/* 輸入層 */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          className="absolute inset-0 resize-none bg-transparent p-3 pl-12 font-mono text-sm leading-6 text-transparent caret-[var(--arc-gold)] outline-none"
          placeholder=""
          spellCheck={false}
        />

        {/* 空狀態提示 */}
        {!value && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center pl-12">
            <div className="text-center text-[var(--arc-ink-3)]">
              <ClipboardIcon className="mx-auto mb-2 h-10 w-10 text-[var(--arc-ink-4)]" />
              <div className="text-[13px]">{m.jsonPasteHint}</div>
            </div>
          </div>
        )}
      </div>

      {/* 語法高亮樣式：只用 HARDLINE 資料色 */}
      <style>{`
        .json-key { color: var(--arc-reach); }
        .json-string { color: var(--arc-vital); }
        .json-number { color: var(--arc-caution); }
        .json-boolean { color: var(--arc-gold); }
        .json-null { color: var(--arc-alert); }
        .json-bracket { color: var(--arc-ink-2); font-weight: 600; }
      `}</style>
    </div>
  );
};

export default JsonEditor;
