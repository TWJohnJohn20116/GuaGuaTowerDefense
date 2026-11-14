// 標籤面板 — HARDLINE：mono 標籤方塊 + 1px 輸入框
import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { Btn } from '@/components/hl';
import { CrossIcon, PlusIcon } from '@/components/ui/Icons';

interface ReplayTagsPanelProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function ReplayTagsPanel({ tags, onChange }: ReplayTagsPanelProps) {
  const { t } = useTranslation();
  const r = t.replay;
  const [draft, setDraft] = useState('');

  const handleAdd = () => {
    const v = draft.trim();
    if (!v || tags.includes(v)) {
      setDraft('');
      return;
    }
    onChange([...tags, v]);
    setDraft('');
  };

  const handleRemove = (tag: string) => {
    onChange(tags.filter((t2) => t2 !== tag));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="hl-label">{r.tags}</span>
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex h-6 items-center gap-1 border border-[var(--hl-line-strong)] px-2 font-mono text-[10.5px] text-[var(--hl-ink-2)]"
        >
          {tag}
          <button
            type="button"
            onClick={() => handleRemove(tag)}
            className="text-[var(--hl-ink-4)] transition-colors hover:text-[var(--hl-alarm)]"
            aria-label={tag}
          >
            <CrossIcon className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        placeholder={r.enterTag}
        className="hl-input h-6 w-32 text-[11px]"
      />
      <Btn
        variant="line"
        size="sm"
        onClick={handleAdd}
        disabled={!draft.trim()}
        title={r.addTag}
        className="w-7 px-0"
      >
        <PlusIcon className="h-3 w-3" />
      </Btn>
    </div>
  );
}
