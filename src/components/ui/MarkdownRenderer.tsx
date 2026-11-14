/**
 * Markdown 渲染器元件
 * 支援 GitHub Flavored Markdown (GFM)
 * 用於在遊戲內顯示更新說明等 Markdown 內容
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  /** 是否為精簡模式（用於預覽） */
  compact?: boolean;
}

/** 遊戲風格的 Markdown 元件對應 */
const createComponents = (compact: boolean): Components => ({
  // 標題
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-nordic-text mb-3 mt-4 first:mt-0 pb-2 border-b border-nordic-border/30">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-nordic-text mb-2 mt-3 first:mt-0 flex items-center gap-2">
      <span className="w-1 h-5  bg-nordic-primary inline-block" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-nordic-text mb-2 mt-2 first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-nordic-text mb-1 mt-2 first:mt-0">
      {children}
    </h4>
  ),

  // 段落
  p: ({ children }) => (
    <p className={`text-sm text-nordic-muted leading-relaxed ${compact ? 'mb-1' : 'mb-2'}`}>
      {children}
    </p>
  ),

  // 粗體
  strong: ({ children }) => (
    <strong className="font-bold text-nordic-text">{children}</strong>
  ),

  // 斜體
  em: ({ children }) => (
    <em className="italic text-nordic-accent">{children}</em>
  ),

  // 行內程式碼
  code: ({ children, className }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className="block text-xs font-mono text-nordic-accent bg-nordic-bg/60 p-3  border border-nordic-border/30 overflow-x-auto whitespace-pre my-2">
          {children}
        </code>
      );
    }
    return (
      <code className="px-1.5 py-0.5  bg-nordic-primary/20 text-nordic-accent font-mono text-[0.85em]">
        {children}
      </code>
    );
  },

  // 程式碼區塊
  pre: ({ children }) => (
    <pre className="my-2  overflow-hidden">{children}</pre>
  ),

  // 無序列表
  ul: ({ children }) => (
    <ul className={`space-y-1 ${compact ? 'mb-1' : 'mb-2'} ml-1`}>{children}</ul>
  ),

  // 有序列表
  ol: ({ children }) => (
    <ol className={`space-y-1 ${compact ? 'mb-1' : 'mb-2'} ml-1 list-decimal list-inside`}>
      {children}
    </ol>
  ),

  // 列表項目
  li: ({ children }) => (
    <li className="text-sm text-nordic-muted flex items-start gap-2">
      <span className="text-nordic-primary mt-1.5 flex-shrink-0 w-1.5 h-1.5  bg-nordic-primary/60" />
      <span className="flex-1">{children}</span>
    </li>
  ),

  // 連結
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-nordic-primary hover:text-nordic-accent underline underline-offset-2 decoration-nordic-primary/30 hover:decoration-nordic-accent/50 transition-colors"
      onClick={(e) => {
        e.preventDefault();
        if (href) {
          // 嘗試使用 Tauri 開啟，降級使用 window.open
          import('@tauri-apps/plugin-shell')
            .then(({ open }) => open(href))
            .catch(() => window.open(href, '_blank'));
        }
      }}
    >
      {children}
    </a>
  ),

  // 引用區塊
  blockquote: ({ children }) => (
    <blockquote className="border-l-3 border-nordic-primary/50 pl-3 my-2 py-1 bg-nordic-primary/5 -r-lg">
      {children}
    </blockquote>
  ),

  // 水平線
  hr: () => (
    <hr className="my-3 border-none h-px bg-[var(--hl-deck-2)] from-transparent via-nordic-border/50 to-transparent" />
  ),

  // 表格
  table: ({ children }) => (
    <div className="overflow-x-auto my-2  border border-nordic-border/30">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-nordic-primary/15">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-nordic-border/20 last:border-b-0 even:bg-nordic-bg/20">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left text-nordic-accent font-semibold text-xs">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-nordic-muted text-xs">{children}</td>
  ),

  // 圖片
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || ''}
      className="max-w-full  border border-nordic-border/30 my-2"
      loading="lazy"
    />
  ),

  // 刪除線
  del: ({ children }) => (
    <del className="text-nordic-muted/50 line-through">{children}</del>
  ),

  // 核取方塊列表項
  input: ({ checked, type }) => {
    if (type === 'checkbox') {
      return (
        <span className={`inline-flex items-center justify-center w-4 h-4  border mr-2 flex-shrink-0 ${
          checked
            ? 'bg-[rgba(56,224,143,0.12)] border-[rgba(56,224,143,0.38)] text-[var(--hl-vital)]'
            : 'bg-nordic-bg/50 border-nordic-border/50'
        }`}>
          {checked && <span className="text-xs">✓</span>}
        </span>
      );
    }
    return null;
  },
});

export default function MarkdownRenderer({ content, className = '', compact = false }: MarkdownRendererProps) {
  if (!content || content.trim() === '') {
    return (
      <div className="text-sm text-nordic-muted/60 italic py-2">
        暫無內容
      </div>
    );
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={createComponents(compact)}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
