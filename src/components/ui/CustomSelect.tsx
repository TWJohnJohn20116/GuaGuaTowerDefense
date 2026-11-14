/**
 * 自定義下拉選單組件（美化 + 優化版 · 支援預覽圖）
 * - SVG 圖標取代文字符號（▼ / ✓），符合無表情符號規範
 * - list / grid 兩種佈局，grid 支援每項 preview 預覽圖與群組標頭
 * - 可搜尋、5 種 variant、7 種 accent 強調色、3 種尺寸
 * - 面板可 absolute 浮層或 inline 內嵌（適用 overflow-hidden 容器）
 * - 完整鍵盤導航（方向鍵 / Home / End / 字首跳轉 / Enter / Esc / Tab）
 * - 無障礙 ARIA（listbox / option / aria-selected / aria-expanded）
 */

import { useState, useRef, useEffect, useCallback, useMemo, useId } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, CheckIcon, SearchIcon } from './Icons';
import {
  SIZE, VARIANT, ACCENT, VARIANT_DEFAULT_ACCENT, HIGHLIGHT_BG, TRANSPARENT_BG,
} from './customSelectStyles';
import type {
  SelectSize, SelectVariant, AccentToken, SizeStyle, AccentStyle,
} from './customSelectStyles';

export type { SelectSize, SelectVariant, AccentToken };

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
  /** 大型預覽圖（grid 卡片 / 觸發按鈕內顯示） */
  preview?: ReactNode;
  /** 預覽框背景色（如 `#ff000020`） */
  previewBg?: string;
  /** 額外資訊列（如數據統計），顯示於觸發按鈕與設定為顯示時的卡片 */
  meta?: ReactNode;
  /** 原生 title 提示（hover 顯示） */
  title?: string;
  /** 搜尋用補充關鍵字 */
  keywords?: string;
  /** 所屬群組 id（搭配 groups 使用） */
  group?: string;
}

export interface SelectGroup {
  id: string;
  label: string;
  /** 群組標頭文字色 class，如 `text-[var(--arc-vital)]` */
  color?: string;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  icon?: ReactNode;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  size?: SelectSize;
  variant?: SelectVariant;
  accent?: AccentToken;
  align?: 'left' | 'right';
  /** 面板定位：absolute 浮層（預設）/ inline 內嵌展開（適用 overflow-hidden 容器內） */
  position?: 'absolute' | 'inline';
  /** 佈局：list 清單（預設）/ grid 網格 */
  layout?: 'list' | 'grid';
  /** grid 欄數（預設 3） */
  columns?: number;
  /** grid 卡片排列：vertical 直式（預設）/ horizontal 橫式 */
  gridCardLayout?: 'vertical' | 'horizontal';
  /** grid 卡片是否顯示 meta */
  gridMeta?: boolean;
  /** 是否顯示搜尋框 */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** 群組定義（提供時依群組分區渲染並顯示標頭） */
  groups?: SelectGroup[];
  /** 底部自訂內容 */
  footer?: ReactNode;
  /** 無相符項目時的文字 */
  emptyText?: string;
}

// ── 純函式：建立群組排序後的渲染順序 ──────────────────────
function buildOrdered<T extends string>(
  options: SelectOption<T>[],
  groups?: SelectGroup[],
): SelectOption<T>[] {
  if (!groups || groups.length === 0) return options;
  const out: SelectOption<T>[] = [];
  const used = new Set<T>();
  for (const g of groups) {
    for (const o of options) {
      if (o.group === g.id) { out.push(o); used.add(o.value); }
    }
  }
  for (const o of options) if (!used.has(o.value)) out.push(o);
  return out;
}

// 從 from 往 dir 尋找下一個可用選項索引
function findEnabledIn<T extends string>(
  arr: SelectOption<T>[], dir: 1 | -1, from: number,
): number {
  const n = arr.length;
  if (n === 0) return -1;
  for (let step = 1; step <= n; step++) {
    const idx = (((from + dir * step) % n) + n) % n;
    if (!arr[idx].disabled) return idx;
  }
  return -1;
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = '請選擇',
  icon,
  className = '',
  menuClassName = '',
  disabled = false,
  size = 'md',
  variant = 'default',
  accent,
  align = 'left',
  position = 'absolute',
  layout = 'list',
  columns = 3,
  gridCardLayout = 'vertical',
  gridMeta = false,
  searchable = false,
  searchPlaceholder = '搜尋…',
  groups,
  footer,
  emptyText = '無相符項目',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const typeBuffer = useRef('');
  const typeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxId = useId();

  const sz: SizeStyle = SIZE[size];
  const vr = VARIANT[variant];
  const ac: AccentStyle = ACCENT[accent ?? VARIANT_DEFAULT_ACCENT[variant]];
  const isGrid = layout === 'grid';
  const isInline = position === 'inline';
  const gridNav = isGrid && !searchable;

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const visibleOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) =>
      o.label.toLowerCase().includes(q)
      || o.value.toLowerCase().includes(q)
      || (o.keywords?.toLowerCase().includes(q) ?? false));
  }, [options, searchable, query]);

  const ordered = useMemo(
    () => buildOrdered(visibleOptions, groups),
    [visibleOptions, groups],
  );

  const indexByValue = useMemo(() => {
    const m = new Map<T, number>();
    ordered.forEach((o, i) => m.set(o.value, i));
    return m;
  }, [ordered]);

  const selectedIdx = selectedOption ? indexByValue.get(selectedOption.value) ?? -1 : -1;

  const findEnabled = useCallback(
    (dir: 1 | -1, from: number) => findEnabledIn(ordered, dir, from),
    [ordered],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const open = useCallback(() => {
    if (disabled) return;
    setQuery('');
    const base = buildOrdered(options, groups);
    const sel = base.findIndex((o) => o.value === value && !o.disabled);
    setHighlightedIndex(sel >= 0 ? sel : findEnabledIn(base, 1, -1));
    setIsOpen(true);
  }, [disabled, options, groups, value]);

  const handleSelect = useCallback(
    (idx: number) => {
      const opt = ordered[idx];
      if (!opt || opt.disabled) return;
      onChange(opt.value);
      setIsOpen(false);
      setQuery('');
      triggerRef.current?.focus();
    },
    [ordered, onChange],
  );

  // 點擊外部關閉
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isOpen]);

  // 開啟時聚焦搜尋框
  useEffect(() => {
    if (isOpen && searchable) {
      const t = setTimeout(() => searchRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [isOpen, searchable]);

  // 搜尋字串變動時重設高亮
  useEffect(() => {
    if (isOpen && searchable) setHighlightedIndex(findEnabledIn(ordered, 1, -1));
  }, [query, isOpen, searchable, ordered]);

  // 鍵盤導航
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const isNext = e.key === 'ArrowDown' || (gridNav && e.key === 'ArrowRight');
      const isPrev = e.key === 'ArrowUp' || (gridNav && e.key === 'ArrowLeft');
      if (isNext) {
        e.preventDefault();
        setHighlightedIndex((p) => findEnabled(1, p));
        return;
      }
      if (isPrev) {
        e.preventDefault();
        setHighlightedIndex((p) => findEnabled(-1, p));
        return;
      }
      switch (e.key) {
        case 'Home':
          e.preventDefault();
          setHighlightedIndex(findEnabled(1, -1));
          break;
        case 'End':
          e.preventDefault();
          setHighlightedIndex(findEnabled(-1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0) handleSelect(highlightedIndex);
          break;
        case ' ':
          if (!searchable) {
            e.preventDefault();
            if (highlightedIndex >= 0) handleSelect(highlightedIndex);
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
        case 'Tab':
          setIsOpen(false);
          break;
        default:
          if (!searchable && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            typeBuffer.current += e.key.toLowerCase();
            if (typeTimer.current) clearTimeout(typeTimer.current);
            typeTimer.current = setTimeout(() => { typeBuffer.current = ''; }, 600);
            const match = ordered.findIndex(
              (o) => !o.disabled && o.label.toLowerCase().startsWith(typeBuffer.current),
            );
            if (match >= 0) setHighlightedIndex(match);
          }
          break;
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, highlightedIndex, ordered, gridNav, searchable, findEnabled, handleSelect, close]);

  // 滾動到高亮項
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-opt-index="${highlightedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, isOpen]);

  // 卸載清除計時器
  useEffect(() => () => {
    if (typeTimer.current) clearTimeout(typeTimer.current);
  }, []);

  const richTrigger = isGrid || options.some((o) => o.preview);

  const renderItem = (option: SelectOption<T>) => {
    const idx = indexByValue.get(option.value) ?? -1;
    const isSelected = idx === selectedIdx;
    const isHighlighted = idx === highlightedIndex;
    const common = {
      option, index: idx, isSelected, isHighlighted, accent: ac, sz,
      onSelect: handleSelect, onHover: setHighlightedIndex,
    };
    return isGrid
      ? <GridCard key={option.value} {...common} cardLayout={gridCardLayout} showMeta={gridMeta} />
      : <OptionRow key={option.value} {...common} />;
  };

  const gridStyle = { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };

  // 面板內容（搜尋列 + 選項區 + 底部），absolute / inline 共用
  const panel = (
    <>
      {searchable && (
        <div className="p-2.5 border-b border-[var(--cn-line-soft)] flex items-center gap-2 bg-[var(--cn-card-2)]">
          <SearchIcon className="w-3.5 h-3.5 text-[var(--arc-ink-4)] flex-shrink-0" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent border-none text-[11px] text-[var(--arc-ink)] placeholder:text-[var(--arc-ink-4)] focus:outline-none"
          />
        </div>
      )}

      <div
        ref={listRef}
        className={`
          max-h-72 overflow-y-auto
          scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent
          ${isGrid ? 'p-2.5 space-y-3' : 'py-1.5'}
        `}
      >
        {ordered.length === 0 && (
          <div className="text-center py-8 text-[10px] font-bold tracking-widest text-[var(--arc-ink-4)] uppercase">
            {emptyText}
          </div>
        )}

        {groups && groups.length > 0
          ? groups.map((g) => {
              const items = ordered.filter((o) => o.group === g.id);
              if (items.length === 0) return null;
              return (
                <div key={g.id}>
                  <h4 className={`arc-label text-[9px] font-extrabold tracking-widest mb-1.5 px-1 ${g.color ?? 'text-[var(--arc-ink-3)]'}`}>
                    {g.label}
                  </h4>
                  {isGrid ? (
                    <div className="grid gap-1.5" style={gridStyle}>{items.map(renderItem)}</div>
                  ) : (
                    items.map(renderItem)
                  )}
                </div>
              );
            })
          : isGrid
            ? <div className="grid gap-1.5" style={gridStyle}>{ordered.map(renderItem)}</div>
            : ordered.map(renderItem)}
      </div>

      {footer && (
        <div className="px-3 py-2 border-t border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] text-[9px] font-bold tracking-widest text-[var(--arc-ink-4)] uppercase">
          {footer}
        </div>
      )}
    </>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 觸發按鈕 */}
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-controls={isOpen ? listboxId : undefined}
        className={`
          w-full flex items-center justify-between transition-all duration-200
          ${richTrigger ? `gap-3 px-2.5 py-2  ${vr.trigger}` : `${sz.trigger} ${vr.trigger}`}
          ${isOpen ? (richTrigger ? ac.ring : vr.triggerOpen) : vr.triggerClosed}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={isOpen && richTrigger ? { boxShadow: `0 0 0 3px ${ac.glowSoft}` } : undefined}
        whileTap={disabled ? {} : { scale: 0.98 }}
      >
        {richTrigger ? (
          <span className="flex items-center gap-2.5 min-w-0 flex-1">
            {selectedOption?.preview && (
              <span
                className="flex-shrink-0 inline-flex items-center justify-center  p-0.5 border-[3px] border-[var(--cn-line-soft)] overflow-hidden"
                style={{ backgroundColor: selectedOption.previewBg }}
              >
                {selectedOption.preview}
              </span>
            )}
            <span className="flex-1 min-w-0 text-left">
              <span className={`block ${sz.richLabel} font-extrabold tracking-wider truncate ${selectedOption ? 'text-[var(--arc-ink)]' : 'text-[var(--arc-ink-4)]'}`}>
                {selectedOption?.label || placeholder}
              </span>
              {selectedOption?.description && (
                <span className="block text-[9px] text-[var(--arc-ink-4)] font-mono truncate mt-0.5">
                  {selectedOption.description}
                </span>
              )}
              {selectedOption?.meta && <span className="block mt-0.5">{selectedOption.meta}</span>}
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-2 truncate">
            {(selectedOption?.icon || icon) && (
              <span className="flex-shrink-0 inline-flex items-center">
                {selectedOption?.icon || icon}
              </span>
            )}
            <span className={`truncate ${selectedOption ? '' : 'opacity-50'}`}>
              {selectedOption?.label || placeholder}
            </span>
          </span>
        )}
        <motion.span
          className="flex-shrink-0 inline-flex items-center opacity-60"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className={sz.chevron} />
        </motion.span>
      </motion.button>

      {/* 下拉面板 */}
      <AnimatePresence>
        {isOpen && (
          isInline ? (
            <motion.div
              key="menu"
              role="listbox"
              id={listboxId}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={`mt-2 w-full  overflow-hidden ${vr.menu} ${menuClassName}`}
            >
              {panel}
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              role="listbox"
              id={listboxId}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`
                absolute z-[10000] mt-2 w-full min-w-[150px]
                ${align === 'right' ? 'right-0' : 'left-0'}
                 overflow-hidden
                ${vr.menu} ${menuClassName}
              `}
              style={{ boxShadow: '0 16px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04)' }}
            >
              {panel}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 清單列 ────────────────────────────────────────────────
interface ItemProps {
  option: SelectOption;
  index: number;
  isSelected: boolean;
  isHighlighted: boolean;
  accent: AccentStyle;
  sz: SizeStyle;
  onSelect: (index: number) => void;
  onHover: (index: number) => void;
}

function OptionRow({
  option, index, isSelected, isHighlighted, accent, sz, onSelect, onHover,
}: ItemProps) {
  return (
    <motion.button
      type="button"
      role="option"
      aria-selected={isSelected}
      data-opt-index={index}
      disabled={option.disabled}
      title={option.title}
      onClick={() => onSelect(index)}
      onMouseEnter={() => !option.disabled && onHover(index)}
      className={`
        ${sz.option}
        w-full flex items-center text-left transition-colors duration-100
        ${option.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${isSelected ? accent.text : 'text-[var(--arc-ink)]/85'}
      `}
      initial={false}
      animate={{
        backgroundColor: isSelected ? accent.rowBg : isHighlighted ? HIGHLIGHT_BG : TRANSPARENT_BG,
      }}
      transition={{ duration: 0.1 }}
    >
      {option.preview ? (
        <span
          className="flex-shrink-0 inline-flex items-center justify-center  p-0.5 border-[3px] border-[var(--cn-line-soft)] overflow-hidden"
          style={{ backgroundColor: option.previewBg }}
        >
          {option.preview}
        </span>
      ) : option.icon ? (
        <span className={`flex-shrink-0 inline-flex items-center ${sz.optIcon}`}>{option.icon}</span>
      ) : null}
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${isSelected ? accent.text : ''}`}>{option.label}</div>
        {option.description && (
          <div className="text-[10px] text-[var(--arc-ink-4)] truncate mt-0.5">{option.description}</div>
        )}
        {option.meta && <div className="mt-0.5">{option.meta}</div>}
      </div>
      <span
        className={`flex-shrink-0 inline-flex items-center transition-opacity ${
          isSelected ? `opacity-100 ${accent.text}` : 'opacity-0'
        }`}
      >
        <CheckIcon className={sz.check} />
      </span>
    </motion.button>
  );
}

// ── 網格卡片 ──────────────────────────────────────────────
function GridCard({
  option, index, isSelected, accent, onSelect, onHover, cardLayout, showMeta,
}: ItemProps & { cardLayout: 'vertical' | 'horizontal'; showMeta: boolean }) {
  const selectedStyle = isSelected
    ? { backgroundColor: accent.rowBg, boxShadow: `0 0 14px -4px ${accent.glow}` }
    : undefined;
  const base = `relative rounded-sm border text-left transition-all ${
    isSelected ? accent.ring : 'border-[var(--cn-line-soft)] bg-[var(--arc-deck-2)] hover:bg-[var(--arc-deck-3)] hover:border-[var(--arc-line-strong)]'
  } ${option.disabled ? 'opacity-40 cursor-not-allowed' : ''}`;

  if (cardLayout === 'horizontal') {
    return (
      <motion.button
        type="button"
        role="option"
        aria-selected={isSelected}
        data-opt-index={index}
        disabled={option.disabled}
        title={option.title}
        onClick={() => onSelect(index)}
        onMouseEnter={() => !option.disabled && onHover(index)}
        whileHover={option.disabled ? {} : { scale: 0.99 }}
        whileTap={option.disabled ? {} : { scale: 0.96 }}
        className={`${base} flex items-center gap-2 p-2`}
        style={selectedStyle}
      >
        {option.preview && (
          <span
            className="flex-shrink-0 inline-flex items-center justify-center  border-[3px] border-[var(--cn-line-soft)] overflow-hidden"
            style={{ backgroundColor: option.previewBg }}
          >
            {option.preview}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className={`text-[10px] font-extrabold tracking-wider truncate ${isSelected ? accent.text : 'text-[var(--arc-ink)]'}`}>
            {option.label}
          </div>
          {showMeta && option.meta
            ? <div className="mt-0.5">{option.meta}</div>
            : option.description && (
              <div className="text-[9px] text-[var(--arc-ink-4)] font-mono truncate mt-0.5">{option.description}</div>
            )}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      role="option"
      aria-selected={isSelected}
      data-opt-index={index}
      disabled={option.disabled}
      title={option.title}
      onClick={() => onSelect(index)}
      onMouseEnter={() => !option.disabled && onHover(index)}
      whileHover={option.disabled ? {} : { scale: 1.04, y: -1 }}
      whileTap={option.disabled ? {} : { scale: 0.96 }}
      className={`${base} aspect-square p-1.5 flex flex-col items-center justify-between`}
      style={selectedStyle}
    >
      {isSelected && (
        <span className={`absolute -top-1 -right-1 w-4 h-4  ${accent.badge} border-2 border-[#1a1d24] flex items-center justify-center`}>
          <CheckIcon className="w-2.5 h-2.5 text-[var(--arc-ink)]" />
        </span>
      )}
      <div
        className="w-full flex-1  flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: option.previewBg }}
      >
        {option.preview ?? option.icon}
      </div>
      <span className={`text-[9px] font-bold tracking-wider mt-1 truncate w-full text-center ${isSelected ? accent.text : 'text-[var(--arc-ink-3)]'}`}>
        {option.label}
      </span>
    </motion.button>
  );
}

export default CustomSelect;
