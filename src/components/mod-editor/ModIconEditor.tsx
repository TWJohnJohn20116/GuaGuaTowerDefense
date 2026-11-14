import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { CheckIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, PaletteIcon, EyeIcon, LockIcon, UndoIcon, RedoIcon, SearchIcon } from '@/components/ui/Icons';
import { getEmojiCategories, getIconBackgroundColors } from './modEditorIconI18n';
import { ModIconClearConfirmDialog } from './ModIconClearConfirmDialog';
import { Btn, Rule, SegHead } from '@/components/hl';

// 圖層型別擴充:含可見性、鎖定、色相
interface IconLayer {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  opacity?: number;
  flipX?: boolean;
  flipY?: boolean;
  hidden?: boolean;
  locked?: boolean;
  hue?: number;
}

export function ModIconEditor({
  initialData,
  onSave,
  onClose
}: {
  initialData?: string;
  onSave: (data: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const emojiCategories = useMemo(() => getEmojiCategories(m), [m]);
  const backgroundColors = useMemo(() => getIconBackgroundColors(m), [m]);
  const [icons, setIcons] = useState<IconLayer[]>(() => {
    if (!initialData) return [];
    try {
      const parsed = JSON.parse(initialData);
      if (parsed.type === 'advanced_icon') return parsed.icons || [];
      return [];
    } catch {
      const arr = Array.from(initialData);
      return arr.map((emoji, idx) => ({
        id: `icon-${Date.now()}-${idx}`,
        emoji,
        x: (idx % 2) * 20 - 10,
        y: Math.floor(idx / 2) * 20 - 10,
        scale: 1,
        rotation: 0,
        zIndex: idx
      }));
    }
  });
  
  // \u65b0\u589e:\u641c\u5c0b\u3001\u7da9\u8b70 (undo/redo)\u3001snap to grid
  const [searchQuery, setSearchQuery] = useState('');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [history, setHistory] = useState<IconLayer[][]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const isUndoRedoRef = useRef(false);

  const [backgroundColor, setBackgroundColor] = useState<string>(() => {
    if (!initialData) return 'transparent';
    try {
      const parsed = JSON.parse(initialData);
      return parsed.bgColor || 'transparent';
    } catch {
      return 'transparent';
    }
  });

  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // \u6bcf\u6b21 icons \u8b8a\u52d5\u63a8\u5165\u6b77\u53f2 (skip undo/redo \u89f8\u767c\u7684\u8b8a\u52d5)
  useEffect(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIdx + 1);
      const next = [...trimmed, icons];
      return next.length > 30 ? next.slice(next.length - 30) : next;
    });
    setHistoryIdx((prev) => Math.min(prev + 1, 29));
    // historyIdx 刻意不列 deps：它與 icons 永遠同批更新，icons 變動的那次 render 拿到的
    // 就是最新索引；列進來反而會在 undo/redo 之後多推一筆歷史（TD-17）
  }, [icons]);

  const canUndo = historyIdx > 0;
  const canRedo = historyIdx < history.length - 1;

  const performUndo = useCallback(() => {
    if (!canUndo) return;
    isUndoRedoRef.current = true;
    setHistoryIdx((prev) => {
      const next = prev - 1;
      setIcons(history[next] || []);
      return next;
    });
  }, [canUndo, history]);

  const performRedo = useCallback(() => {
    if (!canRedo) return;
    isUndoRedoRef.current = true;
    setHistoryIdx((prev) => {
      const next = prev + 1;
      setIcons(history[next] || []);
      return next;
    });
  }, [canRedo, history]);

  // \u9375\u76e4\u5feb\u6377\u9375: Del/Backspace=\u522a\u9664\u9078\u4e2d, Ctrl+Z=undo, Ctrl+Y/Ctrl+Shift+Z=redo, Ctrl+D=\u8907\u88fd, \u7bad\u982d=\u79fb\u52d5(shift+\u7bad\u982d=10px)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (confirmClearOpen) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); performUndo(); return; }
      if (ctrl && (e.key === 'y' || (e.key === 'Z' && e.shiftKey))) { e.preventDefault(); performRedo(); return; }
      if (!selectedIconId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        setIcons((prev) => prev.filter((i) => i.id !== selectedIconId));
        setSelectedIconId(null);
        return;
      }
      if (ctrl && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateLayer(selectedIconId); return; }
      const step = e.shiftKey ? 10 : 1;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
      };
      if (moves[e.key]) {
        e.preventDefault();
        const [dx, dy] = moves[e.key];
        setIcons((prev) => prev.map((i) => i.id === selectedIconId ? { ...i, x: i.x + dx, y: i.y + dy } : i));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // 三個函式都是 useCallback：識別變了就得重掛監聽，否則 Ctrl+Z／Ctrl+D 會用舊閉包（TD-17）
  }, [selectedIconId, performUndo, performRedo, duplicateLayer, confirmClearOpen]);

  // emoji \u641c\u5c0b\u7d50\u679c (\u8de8\u985e\u5225)
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return emojiCategories;
    return emojiCategories.map((cat) => ({
      name: cat.name,
      emojis: cat.emojis.filter((e) => e.includes(q) || cat.name.includes(q)),
    })).filter((cat) => cat.emojis.length > 0);
  }, [searchQuery, emojiCategories]);

  const handleEmojiClick = (emoji: string) => {
    if (icons.length >= 15) return;
    
    const newId = `icon-${Date.now()}-${Math.random()}`;
    const maxZ = icons.length > 0 ? Math.max(...icons.map(i => i.zIndex)) : -1;
    
    setIcons(prev => [
      ...prev,
      {
        id: newId,
        emoji,
        x: Math.floor(Math.random() * 40) - 20,
        y: Math.floor(Math.random() * 40) - 20,
        scale: 1,
        rotation: 0,
        zIndex: maxZ + 1
      }
    ]);
    setSelectedIconId(newId);
  };

  const handleRemoveIcon = (id: string) => {
    setIcons(prev => prev.filter(i => i.id !== id));
    if (selectedIconId === id) setSelectedIconId(null);
  };

  const updateSelectedIcon = (updates: Partial<IconLayer>) => {
    if (!selectedIconId) return;
    setIcons(prev => prev.map(icon => 
      icon.id === selectedIconId ? { ...icon, ...updates } : icon
    ));
  };

  const updateIcon = (id: string, updates: Partial<IconLayer>) => {
    setIcons(prev => prev.map(icon => 
      icon.id === id ? { ...icon, ...updates } : icon
    ));
  };

  // useCallback + [icons]：keydown 監聽器要靠這份識別才不會抓到舊的圖層清單（TD-17）
  const duplicateLayer = useCallback((id: string) => {
    if (icons.length >= 15) return; // increase max limit to 15
    const iconToCopy = icons.find(i => i.id === id);
    if (!iconToCopy) return;
    
    const newId = `icon-${Date.now()}-${Math.random()}`;
    const maxZ = icons.length > 0 ? Math.max(...icons.map(i => i.zIndex)) : -1;
    
    setIcons(prev => [
      ...prev,
      {
        ...iconToCopy,
        id: newId,
        x: iconToCopy.x + 10,
        y: iconToCopy.y + 10,
        zIndex: maxZ + 1
      }
    ]);
    setSelectedIconId(newId);
  }, [icons]);

  const clearCanvas = () => {
    setIcons([]);
    setSelectedIconId(null);
  };

  const handleResizeStart = (e: React.PointerEvent, iconId: string, iconScale: number, iconRotation: number, dirX: number, dirY: number) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Select icon when resizing
    setSelectedIconId(iconId);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = iconScale;
    const rad = (iconRotation * Math.PI) / 180;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.stopPropagation();
      moveEvent.preventDefault();
      
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const localDeltaX = deltaX * Math.cos(-rad) - deltaY * Math.sin(-rad);
      const localDeltaY = deltaX * Math.sin(-rad) + deltaY * Math.cos(-rad);

      const moveDist = (localDeltaX * dirX + localDeltaY * dirY);
      const newScale = Math.max(0.5, Math.min(15, startScale + moveDist / 64));
      
      setIcons(prev => prev.map(icon => 
        icon.id === iconId ? { ...icon, scale: newScale } : icon
      ));
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      upEvent.stopPropagation();
      upEvent.preventDefault();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });
  };

  const moveLayerUp = (id: string) => {
    setIcons(prev => {
      const sorted = [...prev].sort((a,b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex(i => i.id === id);
      if (idx === sorted.length - 1) return prev;
      
      const currentZ = sorted[idx].zIndex;
      const nextZ = sorted[idx+1].zIndex;
      
      return prev.map(i => {
        if (i.id === sorted[idx].id) return { ...i, zIndex: nextZ };
        if (i.id === sorted[idx+1].id) return { ...i, zIndex: currentZ };
        return i;
      });
    });
  };

  const moveLayerDown = (id: string) => {
    setIcons(prev => {
      const sorted = [...prev].sort((a,b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex(i => i.id === id);
      if (idx === 0) return prev;
      
      const currentZ = sorted[idx].zIndex;
      const prevZ = sorted[idx-1].zIndex;
      
      return prev.map(i => {
        if (i.id === sorted[idx].id) return { ...i, zIndex: prevZ };
        if (i.id === sorted[idx-1].id) return { ...i, zIndex: currentZ };
        return i;
      });
    });
  };

  const bringToFront = (id: string) => {
    setIcons((prev) => {
      const maxZ = Math.max(...prev.map((i) => i.zIndex));
      return prev.map((i) => (i.id === id ? { ...i, zIndex: maxZ + 1 } : i));
    });
  };

  const sendToBack = (id: string) => {
    setIcons((prev) => {
      const minZ = Math.min(...prev.map((i) => i.zIndex));
      return prev.map((i) => (i.id === id ? { ...i, zIndex: minZ - 1 } : i));
    });
  };

  const toggleVisibility = (id: string) => {
    setIcons((prev) => prev.map((i) => (i.id === id ? { ...i, hidden: !i.hidden } : i)));
  };

  const toggleLock = (id: string) => {
    setIcons((prev) => prev.map((i) => (i.id === id ? { ...i, locked: !i.locked } : i)));
  };

  const handleSave = () => {
    const advancedData = {
      type: 'advanced_icon',
      bgColor: backgroundColor,
      icons: icons
    };
    onSave(JSON.stringify(advancedData));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (confirmClearOpen) return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIconId) {
          e.preventDefault();
          setIcons((prev) => prev.filter((i) => i.id !== selectedIconId));
          setSelectedIconId(null);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedIconId) {
        e.preventDefault();
        duplicateLayer(selectedIconId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        performUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        performRedo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIconId, performUndo, performRedo, confirmClearOpen]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-8 pointer-events-auto"
      onPointerDown={(e) => e.stopPropagation()} // Prevent clicks from falling through to the layer below
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[rgba(6,7,10,0.82)]" onClick={onClose} />

      {/* Main Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative flex h-full max-h-[800px] w-full max-w-[1200px] flex-col overflow-hidden border border-[var(--hl-line-strong)] bg-[var(--hl-deck)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[var(--hl-line)] bg-[var(--hl-void)] px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--hl-line-strong)] text-[var(--hl-signal)]">
              <PaletteIcon className="h-4 w-4" />
            </span>
            <div className="flex min-w-0 flex-col justify-center">
              <span className="truncate font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--hl-ink-4)]">{m.iconWorkspaceSubtitle}</span>
              <span className="truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">{m.iconWorkspace}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Btn
              size="sm"
              variant="line"
              className="w-7 px-0"
              onClick={performUndo}
              disabled={!canUndo}
              title={m.undo}
              icon={<UndoIcon className="h-3.5 w-3.5" />}
            />
            <Btn
              size="sm"
              variant="line"
              className="w-7 px-0"
              onClick={performRedo}
              disabled={!canRedo}
              title={m.redo}
              icon={<RedoIcon className="h-3.5 w-3.5" />}
            />
            <Btn
              size="sm"
              variant={snapToGrid ? 'signal' : 'line'}
              onClick={() => setSnapToGrid((v) => !v)}
              title={m.snapToGrid}
            >
              8px
            </Btn>
            <Rule vertical className="mx-1 h-6" />
            <Btn size="sm" variant="ghost" onClick={onClose}>
              {m.cancel}
            </Btn>
            <Btn size="sm" variant="line" onClick={handleSave} icon={<CheckIcon className="h-3.5 w-3.5" />}>
              {m.saveApply}
            </Btn>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b border-[var(--hl-line)] bg-[var(--hl-void-2)] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
          <span>{m.iconShortcutHint}</span>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex flex-row overflow-hidden">
          
          {/* Left Panel: Layers */}
          <div className="z-10 flex w-60 shrink-0 flex-col border-r border-[var(--hl-line)] bg-[var(--hl-deck)]">
            <div className="flex h-10 shrink-0 items-center border-b border-[var(--hl-line)] px-3">
              <SegHead label={<span className="flex items-center gap-1.5"><PaletteIcon className="h-3 w-3" />{m.layers}</span>} />
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto p-2">
              <AnimatePresence>
                {[...icons].sort((a, b) => b.zIndex - a.zIndex).map((icon) => (
                  <motion.div
                    key={icon.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`group relative flex cursor-pointer items-center gap-2 border px-2 py-1.5 transition-colors ${
                      selectedIconId === icon.id
                        ? 'border-[var(--hl-signal-edge)] bg-[var(--hl-signal-veil)]'
                        : 'border-transparent hover:border-[var(--hl-line)] hover:bg-[var(--hl-deck-2)]'
                    }`}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setSelectedIconId(icon.id);
                    }}
                  >
                    <span className={`w-6 text-center text-lg transition-opacity ${icon.hidden ? 'opacity-30' : ''}`}>{icon.emoji}</span>
                    <span className={`flex-1 font-mono text-[10px] uppercase tracking-[0.08em] ${selectedIconId === icon.id ? 'text-[var(--hl-signal)]' : 'text-[var(--hl-ink-2)]'} ${icon.hidden ? 'line-through opacity-50' : ''}`}>
                      {m.layerNum.replace('{n}', String(icon.zIndex + 1))}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleVisibility(icon.id); }}
                        className={`p-1 transition-colors ${icon.hidden ? 'text-[var(--hl-ink-4)] hover:text-[var(--hl-ink)]' : 'text-[var(--hl-signal)] hover:text-[var(--hl-ink)] opacity-100'} ${selectedIconId === icon.id || icon.hidden ? '' : 'opacity-0 group-hover:opacity-100'}`}
                        title={icon.hidden ? m.showLayer : m.hideLayer}
                      >
                        <EyeIcon className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleLock(icon.id); }}
                        className={`p-1 transition-colors ${icon.locked ? 'text-[var(--hl-caution)] hover:text-[var(--hl-ink)]' : 'text-[var(--hl-ink-3)] hover:text-[var(--hl-ink)]'} ${selectedIconId === icon.id || icon.locked ? '' : 'opacity-0 group-hover:opacity-100'}`}
                        title={icon.locked ? m.unlockLayer : m.lockLayer}
                      >
                        <LockIcon className="w-3 h-3" />
                      </button>
                      <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveLayerUp(icon.id); }} className="p-1 text-[var(--hl-ink-3)] transition-colors hover:bg-[var(--hl-deck-3)] hover:text-[var(--hl-ink)]" title={m.moveLayerUp}>
                          <ChevronUpIcon className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveLayerDown(icon.id); }} className="p-1 text-[var(--hl-ink-3)] transition-colors hover:bg-[var(--hl-deck-3)] hover:text-[var(--hl-ink)]" title={m.moveLayerDown}>
                          <ChevronDownIcon className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveIcon(icon.id); }} className="p-1 text-[var(--hl-alarm)] transition-colors hover:bg-[rgba(255,75,62,0.12)] hover:text-[var(--hl-alarm)]" title={m.deleteLayer}>
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {icons.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--hl-ink-4)]">
                  <PaletteIcon className="h-7 w-7 text-[var(--hl-ink-4)]" />
                  <span className="hl-label">{m.noLayers}</span>
                </div>
              )}
            </div>
          </div>
      {/* Center Panel: Canvas Workspace */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-[var(--hl-void)]" onPointerDown={() => setSelectedIconId(null)}>
        {/* Top Toolbar overlayed on canvas */}
        <div className="pointer-events-none absolute left-1/2 top-4 z-20 flex -translate-x-1/2 justify-center">
          <div className="pointer-events-auto flex items-center gap-2 border border-[var(--hl-line)] bg-[var(--hl-deck)] px-2 py-1.5">
            <span className="hl-label mr-1">{m.canvasTools}</span>
            <Rule vertical className="h-4" />
            <Btn 
              size="sm"
              variant="line"
              onClick={(e) => {
                e.stopPropagation();
                if (selectedIconId) {
                  const icon = icons.find(i => i.id === selectedIconId);
                  if (icon) updateIcon(icon.id, { scale: Math.min(15, icon.scale + 0.5) });
                }
              }}
            >
              {m.zoomIn}
            </Btn>
            <Btn 
              size="sm"
              variant="line"
              onClick={(e) => {
                e.stopPropagation();
                if (selectedIconId) {
                  const icon = icons.find(i => i.id === selectedIconId);
                  if (icon) updateIcon(icon.id, { scale: Math.max(0.5, icon.scale - 0.5) });
                }
              }}
            >
              {m.zoomOut}
            </Btn>
            <Rule vertical className="h-4" />
            <Btn 
              size="sm"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                if (icons.length > 0) setConfirmClearOpen(true);
              }}
            >
              {m.clearCanvas}
            </Btn>
          </div>
        </div>

        {/* Canvas Container：1px 線 + 下沉底 */}
        <div 
          ref={containerRef}
          className="relative h-[400px] w-[400px] overflow-hidden border border-[var(--hl-line-strong)] bg-[var(--hl-void-2)]"
          style={{ backgroundColor: backgroundColor === 'transparent' ? '#080b0f' : backgroundColor }}
        >
              {/* Draggable Icons */}
              {[...icons].filter((i) => !i.hidden).sort((a,b) => a.zIndex - b.zIndex).map(icon => {
                const handleSize = 16 / icon.scale;
                const offset = -8 / icon.scale;
                const borderW = 3 / icon.scale;
                const boxBorderW = 2 / icon.scale;
                const ringOffset = 4 / icon.scale;

                return (
                  <motion.div
                    key={icon.id}
                    drag={!icon.locked}
                    dragMomentum={false}
                    dragConstraints={containerRef}
                    dragListener={selectedIconId !== icon.id && !icon.locked} // Disable main container drag when selected so we can drag the handles
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: icon.scale, opacity: icon.opacity ?? 1, x: icon.x, y: icon.y, rotate: icon.rotation }}
                    whileHover={{ filter: 'brightness(1.2)' }}
                    onDragStart={(e) => {
                      e.stopPropagation();
                    }}
                    onDragEnd={(_, info) => {
                      if (icon.locked) return;
                      setIcons(prev => prev.map(i => {
                        if (i.id !== icon.id) return i;
                        let nx = i.x + info.offset.x;
                        let ny = i.y + info.offset.y;
                        if (snapToGrid) {
                          nx = Math.round(nx / 8) * 8;
                          ny = Math.round(ny / 8) * 8;
                        }
                        return { ...i, x: nx, y: ny };
                      }));
                    }}
                    onWheel={(e) => {
                      if (icon.locked) return;
                      e.stopPropagation();
                      const delta = e.deltaY > 0 ? -0.1 : 0.1;
                      const newScale = Math.max(0.5, Math.min(15, icon.scale + delta));
                      updateIcon(icon.id, { scale: newScale });
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setSelectedIconId(icon.id);
                    }}
                    className={`absolute -ml-16 -mt-16 flex h-32 w-32 items-center justify-center left-1/2 top-1/2 text-8xl transition-colors ${icon.locked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'} ${
                      selectedIconId === icon.id ? 'z-50 bg-[var(--hl-signal-veil)]' : ''
                    }`}
                    style={{ zIndex: icon.zIndex, filter: icon.hue ? `hue-rotate(${icon.hue}deg)` : undefined }}
                  >
                    <div style={{ transform: `scaleX(${icon.flipX ? -1 : 1}) scaleY(${icon.flipY ? -1 : 1})` }}>
                      {icon.emoji}
                    </div>

                    {selectedIconId === icon.id && (
                      <>
                        {/* Drag Handle (Center) */}
                        <div 
                          className="absolute inset-0 z-40 cursor-grab active:cursor-grabbing"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault(); // prevent native drag
                            
                            // We need to implement custom dragging for the selected item
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const startIconX = icon.x;
                            const startIconY = icon.y;
                            
                            let hasMoved = false;

                            const handleMove = (moveEvent: PointerEvent) => {
                              moveEvent.stopPropagation();
                              moveEvent.preventDefault();
                              hasMoved = true;
                              const dx = moveEvent.clientX - startX;
                              const dy = moveEvent.clientY - startY;
                              setIcons(prev => prev.map(i => i.id === icon.id ? { ...i, x: startIconX + dx, y: startIconY + dy } : i));
                            };
                            
                            const handleUp = (upEvent: PointerEvent) => {
                              upEvent.stopPropagation();
                              upEvent.preventDefault();
                              window.removeEventListener('pointermove', handleMove);
                              window.removeEventListener('pointerup', handleUp);
                              
                              if (!hasMoved) {
                                // If it was just a click without moving, act as a normal click
                                setSelectedIconId(icon.id);
                              }
                            };
                            
                            window.addEventListener('pointermove', handleMove, { passive: false });
                            window.addEventListener('pointerup', handleUp, { passive: false });
                          }}
                        />

                        {/* Bounding Box */}
                        <div 
                          className="pointer-events-none absolute border-[var(--hl-signal)]"
                          style={{ 
                            top: -ringOffset, bottom: -ringOffset, left: -ringOffset, right: -ringOffset,
                            borderWidth: boxBorderW 
                          }}
                        />
                        
                        {/* Top Left */}
                        <div 
                          className="absolute z-50 cursor-nwse-resize border-[var(--hl-signal)] bg-[var(--hl-ink)]"
                          style={{ width: handleSize, height: handleSize, top: -ringOffset + offset, left: -ringOffset + offset, borderWidth: borderW }}
                          onPointerDown={(e) => { e.stopPropagation(); handleResizeStart(e, icon.id, icon.scale, icon.rotation, -1, -1); }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {/* Top Right */}
                        <div 
                          className="absolute z-50 cursor-nesw-resize border-[var(--hl-signal)] bg-[var(--hl-ink)]"
                          style={{ width: handleSize, height: handleSize, top: -ringOffset + offset, right: -ringOffset + offset, borderWidth: borderW }}
                          onPointerDown={(e) => { e.stopPropagation(); handleResizeStart(e, icon.id, icon.scale, icon.rotation, 1, -1); }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {/* Bottom Left */}
                        <div 
                          className="absolute z-50 cursor-nesw-resize border-[var(--hl-signal)] bg-[var(--hl-ink)]"
                          style={{ width: handleSize, height: handleSize, bottom: -ringOffset + offset, left: -ringOffset + offset, borderWidth: borderW }}
                          onPointerDown={(e) => { e.stopPropagation(); handleResizeStart(e, icon.id, icon.scale, icon.rotation, -1, 1); }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {/* Bottom Right */}
                        <div 
                          className="absolute z-50 cursor-nwse-resize border-[var(--hl-signal)] bg-[var(--hl-ink)]"
                          style={{ width: handleSize, height: handleSize, bottom: -ringOffset + offset, right: -ringOffset + offset, borderWidth: borderW }}
                          onPointerDown={(e) => { e.stopPropagation(); handleResizeStart(e, icon.id, icon.scale, icon.rotation, 1, 1); }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Hint */}
            <div className="pointer-events-none absolute bottom-5 border border-[var(--hl-line)] bg-[var(--hl-deck)] px-4 py-2 text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.08em] text-[var(--hl-ink-4)]">
              {m.iconCanvasHint}<br/>
              {m.iconCanvasHint2}
            </div>
          </div>

          {/* Right Panel: Properties & Library */}
          <div className="z-10 flex w-[320px] shrink-0 flex-col border-l border-[var(--hl-line)] bg-[var(--hl-deck)]">
            {/* Properties Inspector */}
            <div className="flex shrink-0 flex-col border-b border-[var(--hl-line)]">
              <div className="flex h-10 shrink-0 items-center border-b border-[var(--hl-line)] px-3">
                <SegHead label={selectedIconId ? m.iconLayerProps : m.iconCanvasSettings} />
              </div>
          <div className="max-h-[360px] overflow-y-auto p-4">
            {selectedIconId ? (
              <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="hl-label">{m.iconScaleLabel}</span>
                        <div className="flex gap-1">
                          <button onClick={() => updateSelectedIcon({scale: Math.max(0.5, (icons.find(i=>i.id===selectedIconId)?.scale || 1) - 0.5)})} className="w-7 border border-[var(--hl-line)] bg-[var(--hl-deck-2)] text-[10px] leading-none text-[var(--hl-ink-2)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]">-</button>
                          <span className="hl-num min-w-[36px] border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2 py-0.5 text-center text-[10px] text-[var(--hl-signal)]">
                            {icons.find(i=>i.id===selectedIconId)?.scale.toFixed(1)}x
                          </span>
                          <button onClick={() => updateSelectedIcon({scale: Math.min(15, (icons.find(i=>i.id===selectedIconId)?.scale || 1) + 0.5)})} className="w-7 border border-[var(--hl-line)] bg-[var(--hl-deck-2)] text-[10px] leading-none text-[var(--hl-ink-2)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]">+</button>
                        </div>
                      </div>
                      <input 
                        type="range" min="0.5" max="15" step="0.1" 
                        value={icons.find(i=>i.id===selectedIconId)?.scale || 1} 
                        onChange={(e) => updateSelectedIcon({scale: parseFloat(e.target.value)})} 
                        className="w-full accent-[var(--hl-signal)]" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="hl-label">{m.iconRotateLabel}</span>
                        <div className="flex gap-1">
                          <button onClick={() => updateSelectedIcon({rotation: (icons.find(i=>i.id===selectedIconId)?.rotation || 0) - 15})} className="w-7 border border-[var(--hl-line)] bg-[var(--hl-deck-2)] text-[10px] leading-none text-[var(--hl-ink-2)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]">-</button>
                          <span className="hl-num min-w-[40px] border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2 py-0.5 text-center text-[10px] text-[var(--hl-signal)]">
                            {icons.find(i=>i.id===selectedIconId)?.rotation}°
                          </span>
                          <button onClick={() => updateSelectedIcon({rotation: (icons.find(i=>i.id===selectedIconId)?.rotation || 0) + 15})} className="w-7 border border-[var(--hl-line)] bg-[var(--hl-deck-2)] text-[10px] leading-none text-[var(--hl-ink-2)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]">+</button>
                        </div>
                      </div>
                      <input 
                        type="range" min="-180" max="180" step="5" 
                        value={icons.find(i=>i.id===selectedIconId)?.rotation || 0} 
                        onChange={(e) => updateSelectedIcon({rotation: parseFloat(e.target.value)})} 
                        className="w-full accent-[var(--hl-signal)]" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="hl-label">{m.iconOpacityLabel}</span>
                        <span className="hl-num min-w-[40px] border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2 py-0.5 text-center text-[10px] text-[var(--hl-signal)]">
                          {((icons.find(i=>i.id===selectedIconId)?.opacity ?? 1) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <input 
                        type="range" min="0.1" max="1" step="0.1" 
                        value={icons.find(i=>i.id===selectedIconId)?.opacity ?? 1} 
                        onChange={(e) => updateSelectedIcon({opacity: parseFloat(e.target.value)})} 
                        className="w-full accent-[var(--hl-signal)]" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="hl-label">{m.hueRotation} (HUE)</span>
                        <span className="hl-num min-w-[40px] border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2 py-0.5 text-center text-[10px] text-[var(--hl-signal)]">
                          {(icons.find(i=>i.id===selectedIconId)?.hue ?? 0)}\u00b0
                        </span>
                      </div>
                      <input
                        type="range" min="0" max="360" step="15"
                        value={icons.find(i=>i.id===selectedIconId)?.hue ?? 0}
                        onChange={(e) => updateSelectedIcon({ hue: parseInt(e.target.value) })}
                        className="w-full accent-[var(--hl-signal)]"
                        style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--hl-line)]">
                      <button onClick={() => bringToFront(selectedIconId)} className="w-full border border-[var(--hl-line-strong)] bg-transparent px-2 py-2 text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-2)] transition-colors hover:bg-[var(--hl-deck-2)] hover:text-[var(--hl-ink)]">
                        \u2191\u2191 {m.bringToFront}
                      </button>
                      <button onClick={() => sendToBack(selectedIconId)} className="w-full border border-[var(--hl-line-strong)] bg-transparent px-2 py-2 text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-2)] transition-colors hover:bg-[var(--hl-deck-2)] hover:text-[var(--hl-ink)]">
                        \u2193\u2193 {m.sendToBack}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--hl-line)]">
                      <button onClick={() => updateSelectedIcon({x:0, y:0})} className="w-full border border-[var(--hl-line-strong)] bg-transparent px-2 py-2 text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-2)] transition-colors hover:bg-[var(--hl-deck-2)] hover:text-[var(--hl-ink)]">
                        {m.iconAlignCenter}
                      </button>
                      <button onClick={() => updateSelectedIcon({scale:1, rotation:0, opacity: 1, flipX: false, flipY: false})} className="w-full border border-[var(--hl-line-strong)] bg-transparent px-2 py-2 text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-2)] transition-colors hover:bg-[var(--hl-deck-2)] hover:text-[var(--hl-ink)]">
                        {m.iconResetTransform}
                      </button>
                      <button onClick={() => updateSelectedIcon({flipX: !(icons.find(i=>i.id===selectedIconId)?.flipX)})} className="w-full border border-[var(--hl-line-strong)] bg-transparent px-2 py-2 text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-2)] transition-colors hover:bg-[var(--hl-deck-2)] hover:text-[var(--hl-ink)]">
                        {m.iconFlipH}
                      </button>
                      <button onClick={() => updateSelectedIcon({flipY: !(icons.find(i=>i.id===selectedIconId)?.flipY)})} className="w-full border border-[var(--hl-line-strong)] bg-transparent px-2 py-2 text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-2)] transition-colors hover:bg-[var(--hl-deck-2)] hover:text-[var(--hl-ink)]">
                        {m.iconFlipV}
                      </button>
                      <button onClick={() => duplicateLayer(selectedIconId)} className="col-span-2 w-full border border-[var(--hl-signal)] bg-[var(--hl-signal)] px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--hl-signal-ink)] transition-colors hover:bg-[#e6ff74]">
                        {m.iconDuplicateLayer}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <span className="hl-label mb-2 block">{m.iconBgLabel}</span>
                    <div className="grid grid-cols-4 gap-3">
                      {backgroundColors.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => setBackgroundColor(c.value)} 
                          title={c.name} 
                          className={`flex aspect-square items-center justify-center border transition-colors ${
                            backgroundColor === c.value 
                              ? 'border-[var(--hl-signal)]' 
                              : 'border-[var(--hl-line)] hover:border-[var(--hl-line-hot)]'
                          }`} 
                          style={{ backgroundColor: c.value === 'transparent' ? 'var(--hl-void-2)' : c.value }}
                        >
                          {c.value === 'transparent' && <span className="text-[10px] font-bold text-[var(--hl-ink-4)]">{m.iconBgNone}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Library */}
            <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--hl-line)] bg-[var(--hl-deck)] px-3">
              <span className="hl-label shrink-0">{m.iconEmojiLibrary}</span>
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--hl-ink-4)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={m.searchEmoji}
                  className="hl-input pl-7 text-[11px]"
                />
              </div>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto p-3 pb-16">
              {filteredCategories.length === 0 ? (
                <div className="py-8 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
                  {m.noEmojiFound}
                </div>
              ) : filteredCategories.map(category => (
                <div key={category.name}>
                  <h4 className="mb-3 border-l-2 border-[var(--hl-signal)] pl-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)]">
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {category.emojis.map((emoji, idx) => {
                      const isIncluded = icons.some(i => i.emoji === emoji);
                      const isLimit = icons.length >= 15 && !isIncluded;
                      return (
                        <button
                          key={`${emoji}-${idx}`}
                          onClick={() => handleEmojiClick(emoji)}
                          disabled={isLimit}
                          title={isLimit ? m.iconLimit : emoji}
                          className={[
                            'flex aspect-square items-center justify-center border text-2xl transition-colors',
                            isIncluded
                              ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
                              : isLimit
                                ? 'cursor-not-allowed border-transparent bg-[var(--hl-deck-2)] opacity-30'
                                : 'border-transparent bg-[var(--hl-deck-2)] hover:border-[var(--hl-line-hot)] hover:bg-[var(--hl-deck-3)]',
                          ].join(' ')}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
      <ModIconClearConfirmDialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={() => {
          clearCanvas();
          setConfirmClearOpen(false);
        }}
      />
    </motion.div>
  );
}
