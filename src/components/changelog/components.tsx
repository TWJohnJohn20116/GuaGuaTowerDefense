import type { TableData, NumberedListItem } from './types';

// 渲染 Markdown 格式文字 (支援 **粗體** 和 `代碼`)
export const MarkdownText = ({ text }: { text: string }) => {
  // 解析 markdown 格式
  const parseMarkdown = (input: string) => {
    const parts: { type: 'text' | 'bold' | 'code'; content: string }[] = [];
    // 正則表達式匹配 **bold** 和 `code`
    const regex = /(\*\*(.+?)\*\*)|(`([^`]+)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(input)) !== null) {
      // 添加匹配前的普通文字
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: input.slice(lastIndex, match.index) });
      }

      if (match[1]) {
        // **bold**
        parts.push({ type: 'bold', content: match[2] });
      } else if (match[3]) {
        // `code`
        parts.push({ type: 'code', content: match[4] });
      }

      lastIndex = match.index + match[0].length;
    }

    // 添加剩餘的普通文字
    if (lastIndex < input.length) {
      parts.push({ type: 'text', content: input.slice(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: 'text' as const, content: input }];
  };

  const parts = parseMarkdown(text);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.type === 'bold') {
          return (
            <span key={index} className="font-semibold text-[var(--arc-ink)]">
              {part.content}
            </span>
          );
        } else if (part.type === 'code') {
          return (
            <code
              key={index}
              className="rounded-[10px] border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] px-1.5 font-mono text-[0.92em] text-[var(--arc-ink-2)]"
            >
              {part.content}
            </code>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
};

// 渲染表格（HARDLINE：1px 格線，表頭 mono 標籤）
export const ChangeTable = ({ table }: { table: TableData }) => (
  <div className="my-3 overflow-x-auto rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)]">
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)]">
          {table.headers.map((header, idx) => (
            <th
              key={idx}
              className="border-r-2 border-[var(--cn-line-soft)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--arc-ink-3)] last:border-r-0"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, rowIdx) => (
          <tr
            key={rowIdx}
            className="border-b-[3px] border-[var(--cn-line-soft)] transition-colors last:border-b-0 hover:bg-[var(--cn-card-2)]"
          >
            {row.map((cell, cellIdx) => (
              <td
                key={cellIdx}
                className="border-r-2 border-[var(--cn-line-soft)] px-2.5 py-1.5 text-[11.5px] text-[var(--arc-ink-2)] last:border-r-0"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// 渲染編號列表（HARDLINE：mono 編號欄）
export const NumberedList = ({ items }: { items: NumberedListItem[] }) => (
  <div className="my-3 rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)]">
    {items.map((item) => (
      <div key={item.number} className="flex items-start gap-2.5 border-b-[3px] border-[var(--cn-line-soft)] px-2.5 py-1.5 last:border-b-0">
        <span className="mt-px w-4 shrink-0 text-right font-mono text-[10px] leading-[18px] tabular-nums text-[var(--arc-ink-4)]">
          {item.number}
        </span>
        <span className="text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{item.text}</span>
      </div>
    ))}
  </div>
);
