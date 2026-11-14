// 標籤面板 — HARDLINE：mono 標籤方塊 + 1px 輸入框
import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { IconBtn, Input } from '@/components/hl';
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
      <span className="arc-label">{r.tags}</span>
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex h-6 items-center gap-1 border border-[var(--arc-line-strong)] px-2 font-mono text-[10.5px] text-[var(--arc-ink-2)]"
        >
          {tag}
          <IconBtn
            label={tag}
            onClick={() => handleRemove(tag)}
            className="text-[var(--arc-ink-4)] hover:text-[var(--arc-alert)]"
          >
            <CrossIcon className="h-2.5 w-2.5" />
          </IconBtn>
        </span>
      ))}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        placeholder={r.enterTag}
        className="h-6 w-32 text-[11px]"
      />
      <IconBtn
        label={r.addTag}
        onClick={handleAdd}
        disabled={!draft.trim()}
        className="w-7"
      >
        <PlusIcon className="h-3 w-3" />
      </IconBtn>
    </div>
  );
}
