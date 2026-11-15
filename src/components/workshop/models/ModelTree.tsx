/**
 * 部件樹
 *
 * 顯示 parentId 形成的階層（根層順序 = parts 陣列順序），支援：
 *  - 拖曳部件到另一個部件上 → 建立父子；拖到底部投放區 → 回到根層
 *  - 右鍵選單：複製、鏡像 X／Z、解除父子、刪除
 *  - 每列可切換隱藏／鎖定，雙擊名稱改名
 *  - 父節點可摺疊子樹
 */
import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from '@/i18n';
import type { Custom3DModel, Custom3DPart } from '@/types/game';
import { Btn, Input } from '@/components/hl';

export type MirrorAxis = 'x' | 'z';

interface ModelTreeProps {
  model: Custom3DModel;
  selectedIds: string[];
  onSelect: (ids: string[], additive: boolean) => void;
  onReparent: (childId: string, parentId: string | null) => void;
  /** 根層順序調整（拖到同層部件的上半部＝插到它前面） */
  onReorder: (fromIndex: number, toIndex: number) => void;
  onAddPart: (parentId: string | null) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onMirror: (id: string, axis: MirrorAxis) => void;
  onToggleHidden: (id: string) => void;
  onToggleLocked: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

interface MenuState {
  id: string;
  x: number;
  y: number;
}

export function ModelTree({
  model,
  selectedIds,
  onSelect,
  onReparent,
  onReorder,
  onAddPart,
  onDuplicate,
  onRemove,
  onMirror,
  onToggleHidden,
  onToggleLocked,
  onRename,
}: ModelTreeProps) {
  const { t } = useTranslation();
  const s = t.studio.models;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  /** 拖到列的上半部＝排序，其餘＝建立父子 */
  const [dropBefore, setDropBefore] = useState(false);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null);

  const { roots, childrenOf } = useMemo(() => {
    const ids = new Set(model.parts.map((part) => part.id));
    const map = new Map<string, Custom3DPart[]>();
    const rootParts: Custom3DPart[] = [];
    for (const part of model.parts) {
      const parent = part.parentId && ids.has(part.parentId) ? part.parentId : null;
      if (!parent) {
        rootParts.push(part);
        continue;
      }
      const bucket = map.get(parent) ?? [];
      bucket.push(part);
      map.set(parent, bucket);
    }
    return { roots: rootParts, childrenOf: map };
  }, [model.parts]);

  const toggleCollapse = (id: string): void => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const row = (part: Custom3DPart, depth: number): ReactNode => {
    const children = childrenOf.get(part.id) ?? [];
    const isCollapsed = collapsed[part.id] === true;
    const selected = selectedIds.includes(part.id);
    const isDrop = dropTarget === part.id;
    return (
      <div key={part.id}>
        <div
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData('text/plain', part.id);
            event.dataTransfer.effectAllowed = 'move';
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDropTarget(part.id);
            const rect = event.currentTarget.getBoundingClientRect();
            setDropBefore(event.clientY < rect.top + rect.height / 2);
          }}
          onDragLeave={() => setDropTarget((prev) => (prev === part.id ? null : prev))}
          onDrop={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const dragged = event.dataTransfer.getData('text/plain');
            const reorderMode = dropBefore;
            setDropTarget(null);
            setDropBefore(false);
            if (!dragged || dragged === part.id) return;
            const rootIds = roots.map((item) => item.id);
            const from = rootIds.indexOf(dragged);
            const to = rootIds.indexOf(part.id);
            // 兩者都在根層且拖在上半部 → 排序；否則視為建立父子
            if (reorderMode && from >= 0 && to >= 0) onReorder(from, to);
            else onReparent(dragged, part.id);
          }}
          onClick={(event) => {
            if (part.locked) return;
            onSelect([part.id], event.shiftKey);
          }}
          onDoubleClick={() => setRenaming({ id: part.id, value: part.name ?? part.shape })}
          onContextMenu={(event) => {
            event.preventDefault();
            onSelect([part.id], false);
            setMenu({ id: part.id, x: event.clientX, y: event.clientY });
          }}
          className={[
            'group flex cursor-pointer items-center gap-1 border px-1 py-[3px] text-[10.5px]',
            selected
              ? 'border-[var(--cn-signal)] bg-[var(--cn-signal-soft)] text-[var(--cn-ink)]'
              : 'border-transparent text-[var(--cn-ink-2)] hover:border-[var(--cn-line-soft)]',
            isDrop ? 'border-dashed border-[var(--cn-signal)]' : '',
            isDrop && dropBefore ? 'border-t-2 border-t-[var(--cn-signal)]' : '',
            part.hidden ? 'opacity-45' : '',
          ].join(' ')}
          style={{ paddingLeft: 4 + depth * 12 }}
        >
          <span
            className="w-3 shrink-0 text-center font-mono text-[9px] text-[var(--cn-ink-3)]"
            onClick={(event) => {
              if (children.length === 0) return;
              event.stopPropagation();
              toggleCollapse(part.id);
            }}
          >
            {children.length > 0 ? (isCollapsed ? '▸' : '▾') : '·'}
          </span>
          {renaming && renaming.id === part.id ? (
            <Input
              autoFocus
              value={renaming.value}
              onChange={(event) => setRenaming({ id: part.id, value: event.target.value })}
              onBlur={() => {
                onRename(part.id, renaming.value.trim() || part.shape);
                setRenaming(null);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onRename(part.id, renaming.value.trim() || part.shape);
                  setRenaming(null);
                }
                if (event.key === 'Escape') setRenaming(null);
              }}
              className="h-5 min-w-0 flex-1 px-1 text-[10px]"
            />
          ) : (
            <span className="min-w-0 flex-1 truncate">{part.name ?? part.shape}</span>
          )}
          <span className="shrink-0 font-mono text-[9px] text-[var(--cn-ink-3)]">{part.material}</span>
          <button
            type="button"
            aria-label={s.hidden}
            onClick={(event) => {
              event.stopPropagation();
              onToggleHidden(part.id);
            }}
            className="shrink-0 px-0.5 text-[10px] text-[var(--cn-ink-3)] hover:text-[var(--cn-ink)]"
          >
            {part.hidden ? '◌' : '◉'}
          </button>
          <button
            type="button"
            aria-label={s.locked}
            onClick={(event) => {
              event.stopPropagation();
              onToggleLocked(part.id);
            }}
            className="shrink-0 px-0.5 text-[10px] text-[var(--cn-ink-3)] hover:text-[var(--cn-ink)]"
          >
            {part.locked ? '▣' : '▢'}
          </button>
        </div>
        {!isCollapsed && children.map((child) => row(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {roots.length === 0 ? (
          <p className="px-1 py-2 font-mono text-[10px] text-[var(--cn-ink-3)]">{s.emptyModel}</p>
        ) : (
          roots.map((part) => row(part, 0))
        )}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDropTarget('__root__');
          }}
          onDragLeave={() => setDropTarget((prev) => (prev === '__root__' ? null : prev))}
          onDrop={(event) => {
            event.preventDefault();
            const dragged = event.dataTransfer.getData('text/plain');
            setDropTarget(null);
            if (dragged) onReparent(dragged, null);
          }}
          className={[
            'mt-1 border border-dashed px-1 py-1 text-center font-mono text-[9px]',
            dropTarget === '__root__'
              ? 'border-[var(--cn-signal)] text-[var(--cn-signal)]'
              : 'border-[var(--cn-line-soft)] text-[var(--cn-ink-3)]',
          ].join(' ')}
        >
          {s.dropToRoot}
        </div>
      </div>

      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} onContextMenu={(event) => event.preventDefault()} />
          <div
            className="fixed z-50 flex w-40 flex-col gap-0.5 border-2 border-[var(--cn-line)] bg-[var(--cn-card)] p-1 shadow-[4px_4px_0_var(--cn-line-soft)]"
            style={{ left: menu.x, top: menu.y }}
          >
            <Btn size="sm" variant="ghost" onClick={() => { onAddPart(menu.id); setMenu(null); }}>{s.addChild}</Btn>
            <Btn size="sm" variant="ghost" onClick={() => { onDuplicate(menu.id); setMenu(null); }}>{s.duplicate}</Btn>
            <Btn size="sm" variant="ghost" onClick={() => { onMirror(menu.id, 'x'); setMenu(null); }}>{s.mirrorX}</Btn>
            <Btn size="sm" variant="ghost" onClick={() => { onMirror(menu.id, 'z'); setMenu(null); }}>{s.mirrorZ}</Btn>
            <Btn size="sm" variant="ghost" onClick={() => { onReparent(menu.id, null); setMenu(null); }}>{s.unparent}</Btn>
            <Btn size="sm" variant="ghost" onClick={() => { onRemove(menu.id); setMenu(null); }}>{s.removePart}</Btn>
          </div>
        </>
      )}
    </div>
  );
}
