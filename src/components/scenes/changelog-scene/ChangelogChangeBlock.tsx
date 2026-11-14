// 更新日誌 · 單一變更分類區塊（HARDLINE：每條變更前綴 mono 標籤 新增／修正／調整）
import type { ChangeItem, TableData, NumberedListItem } from '@/components/changelog';
import { ChangeTable, NumberedList, MarkdownText } from '@/components/changelog';
import { CHANGE_TAG_LABEL, resolveChangeTag, type ChangeTag } from '@/components/scenes/changelog-scene/changelogUtils';

interface ChangeBlockProps {
  title: string;
  items: ChangeItem[];
  index: number;
}

const TAG_TONE: Record<ChangeTag, string> = {
  add: 'text-[var(--hl-signal)]',
  fix: 'text-[var(--hl-vital)]',
  tune: 'text-[var(--hl-caution)]',
};

function renderChangeItem(item: ChangeItem, itemIndex: number) {
  if (item.type === 'table') {
    return <ChangeTable key={itemIndex} table={item.content as TableData} />;
  }
  if (item.type === 'numbered-list') {
    return <NumberedList key={itemIndex} items={item.content as NumberedListItem[]} />;
  }

  const content = item.content as string;
  const parts = content.split('\n  └ ');
  const mainItem = parts[0];
  const subItems = parts.slice(1);

  return (
    <div key={itemIndex}>
      <div className="text-[11.5px] leading-relaxed text-[var(--hl-ink-2)]">
        <MarkdownText text={mainItem} />
      </div>
      {subItems.length > 0 && (
        <div className="mt-1 space-y-0.5 border-l border-[var(--hl-line)] pl-3">
          {subItems.map((subItem, subIndex) => (
            <div key={subIndex} className="text-[11px] leading-relaxed text-[var(--hl-ink-3)]">
              <MarkdownText text={subItem} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChangelogChangeBlock({ title, items }: ChangeBlockProps) {
  const tag = resolveChangeTag(title);

  return (
    <div className="border-t border-[var(--hl-line)] first:border-t-0">
      {items.map((item, itemIndex) => (
        <div
          key={itemIndex}
          className="grid grid-cols-[54px_1fr] items-start gap-3 border-b border-[var(--hl-line)] py-2 last:border-b-0"
        >
          <span
            className={`pt-0.5 font-mono text-[10px] uppercase leading-none tracking-[0.08em] ${TAG_TONE[tag]}`}
            title={title}
          >
            {CHANGE_TAG_LABEL[tag]}
          </span>
          <div className="min-w-0">{renderChangeItem(item, itemIndex)}</div>
        </div>
      ))}
    </div>
  );
}
