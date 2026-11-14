/**
 * 圖鑑 · 檔案管理員左側資料夾樹
 */

import { useMemo, useState } from 'react';
import { ChevronRightIcon, FolderIcon } from '@/components/ui/Icons';
import { IconBtn } from '@/components/hl';
import { buildFolderTree, type FolderTreeNode } from './srcFolderTree';
import { useTranslation } from '@/i18n';

interface FileManagerTreeProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function FileManagerTree({ currentPath, onNavigate }: FileManagerTreeProps) {
  const { t } = useTranslation();
  const root = useMemo(() => buildFolderTree(), []);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['src']));

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const openFolder = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      let p = path;
      while (p) {
        next.add(p);
        if (p === 'src') break;
        p = p.substring(0, p.lastIndexOf('/'));
      }
      return next;
    });
    onNavigate(path);
  };

  return (
    <div className="flex h-full min-h-0 w-[200px] shrink-0 flex-col overflow-hidden  border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] sm:w-[220px]">
      <div className="border-b border-[var(--cn-line-soft)] px-3 py-2.5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">{t.encyclopedia.fileTreeTitle}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-2 pr-1 scrollbar-thin ">
        <TreeNode
          node={root}
          depth={0}
          currentPath={currentPath}
          expanded={expanded}
          onToggle={toggle}
          onOpen={openFolder}
        />
      </div>
    </div>
  );
}

function TreeNode({
  node,
  depth,
  currentPath,
  expanded,
  onToggle,
  onOpen,
}: {
  node: FolderTreeNode;
  depth: number;
  currentPath: string;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onOpen: (path: string) => void;
}) {
  const { t } = useTranslation();
  const isOpen = expanded.has(node.path);
  const isActive = currentPath === node.path;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center pr-2"
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        <IconBtn
          label={isOpen ? t.common.treeCollapse : t.common.treeExpand}
          onClick={() => hasChildren && onToggle(node.path)}
          className={`h-5 w-5 shrink-0 transition-colors ${
            hasChildren ? 'text-[var(--arc-ink-4)] hover:text-[var(--arc-ink-2)]' : 'pointer-events-none opacity-0'
          }`}
        >
          <ChevronRightIcon
            className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          />
        </IconBtn>
        <button
          type="button"
          onClick={() => onOpen(node.path)}
          className={`flex min-w-0 flex-1 items-center gap-1.5  px-1.5 py-1 text-left transition-all ${
            isActive
              ? 'bg-[var(--arc-deck-2)] text-[var(--arc-caution)]'
              : 'text-[var(--arc-ink-3)] hover:bg-[var(--arc-deck-2)] hover:text-[var(--arc-ink)]'
          }`}
        >
          <FolderIcon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[var(--arc-caution)]' : 'text-[var(--arc-caution)]'}`} />
          <span className="truncate text-[11px] font-semibold">{node.name}</span>
        </button>
      </div>

      {isOpen &&
        node.children.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={depth + 1}
            currentPath={currentPath}
            expanded={expanded}
            onToggle={onToggle}
            onOpen={onOpen}
          />
        ))}
    </div>
  );
}
