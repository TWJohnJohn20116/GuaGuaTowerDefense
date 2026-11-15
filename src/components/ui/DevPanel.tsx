import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useSettingsStore } from '@/store/settingsStore';
import { useDevStore } from '@/store/devStore';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import {
  WrenchIcon, CrossIcon, GearIcon,
  ChartIcon, EyeIcon, FlameIcon, CoinIcon, SearchIcon, HeartIcon,
  ShieldIcon, LightningIcon, RobotIcon, MapIcon, BrainIcon,
} from './Icons';
import { StateSection } from './dev-panel/StateSection';
import { CombatSection } from './dev-panel/CombatSection';
import { VisualSection } from './dev-panel/VisualSection';
import { ToolsSection } from './dev-panel/ToolsSection';
import { InfoSection } from './dev-panel/InfoSection';
import { SceneJumpSection } from './dev-panel/SceneJumpSection';
import { SaveSection } from './dev-panel/SaveSection';
import { PerfSection } from './dev-panel/PerfSection';
import { DevSearchContext } from './dev-panel/common';
import { IconBtn } from '@/components/hl';
import { DEV_TAB_SEARCH_ENTRIES, pickDevTabForQuery, tabHasMatch } from '@/data/devSearch';

/** 開發按鈕位置記憶：純 UI 偏好，不進 store（不是世界狀態） */
const DEV_BTN_POS_KEY = 'guagua.devButtonPos';
const DEV_PANEL_RECT_KEY = 'guagua.devPanelRect';
const DEV_BTN_W = 104;
const DEV_BTN_H = 44;
const PANEL_MIN_W = 380;
const PANEL_MIN_H = 320;
const GRIP_DOTS = [0, 1, 2, 3, 4, 5];

function clampNum(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), Math.max(lo, hi));
}

function clampDevPos(x: number, y: number) {
  return {
    x: clampNum(x, 0, window.innerWidth - DEV_BTN_W),
    y: clampNum(y, 0, window.innerHeight - DEV_BTN_H),
  };
}

function readDevButtonPos(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(DEV_BTN_POS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as { x?: unknown }).x === 'number' &&
      typeof (parsed as { y?: unknown }).y === 'number'
    ) {
      return { x: (parsed as { x: number }).x, y: (parsed as { y: number }).y };
    }
  } catch {
    // 壞資料就回預設位置：開發按鈕不該因為 localStorage 壞掉而整個消失
  }
  return null;
}

interface PanelRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function clampPanelRect(rect: PanelRect): PanelRect {
  const w = clampNum(rect.w, PANEL_MIN_W, window.innerWidth - 16);
  const h = clampNum(rect.h, PANEL_MIN_H, window.innerHeight - 16);
  return {
    x: clampNum(rect.x, 8, window.innerWidth - w - 8),
    y: clampNum(rect.y, 8, window.innerHeight - h - 8),
    w,
    h,
  };
}

function readPanelRect(): PanelRect {
  try {
    const raw = localStorage.getItem(DEV_PANEL_RECT_KEY);
    if (raw) {
      const p: unknown = JSON.parse(raw);
      if (
        typeof p === 'object' &&
        p !== null &&
        typeof (p as Partial<PanelRect>).x === 'number' &&
        typeof (p as Partial<PanelRect>).y === 'number' &&
        typeof (p as Partial<PanelRect>).w === 'number' &&
        typeof (p as Partial<PanelRect>).h === 'number'
      ) {
        return clampPanelRect(p as PanelRect);
      }
    }
  } catch {
    // 壞資料回預設：面板位置不該讓整個開發工具開不起來
  }
  const w = 460;
  const h = Math.min(660, window.innerHeight - 120);
  return { x: Math.max(16, window.innerWidth - w - 24), y: 72, w, h };
}

function savePanelRect(rect: PanelRect) {
  try {
    localStorage.setItem(DEV_PANEL_RECT_KEY, JSON.stringify(rect));
  } catch {
    // 私密模式或配額滿：記不住位置不影響功能
  }
}

interface DevPanelProps {
  isOpen?: boolean;
}

type DevTabId = 'state' | 'tools' | 'combat' | 'visual' | 'info';

export function DevPanel({ isOpen: externalOpen }: DevPanelProps) {
  const { t } = useTranslation();
  const TABS = useMemo<{ id: DevTabId; label: string; icon: React.ReactNode; accent: string }[]>(() => [
    { id: 'state', label: t.dev.tabState, icon: <CoinIcon className="h-3.5 w-3.5" />, accent: 'text-[var(--arc-caution)]' },
    { id: 'tools', label: t.dev.tabTools, icon: <GearIcon className="h-3.5 w-3.5" />, accent: 'text-[var(--arc-reach)]' },
    { id: 'combat', label: t.dev.tabCombat, icon: <FlameIcon className="h-3.5 w-3.5" />, accent: 'text-[var(--arc-alert)]' },
    { id: 'visual', label: t.dev.tabVisual, icon: <EyeIcon className="h-3.5 w-3.5" />, accent: 'text-[var(--arc-vital)]' },
    { id: 'info', label: t.dev.tabInfo, icon: <ChartIcon className="h-3.5 w-3.5" />, accent: 'text-[var(--arc-cyan)]' },
  ], [t]);

  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DevTabId>('state');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const draggingRef = useRef(false);
  const dragControls = useDragControls();

  const [btnPos, setBtnPos] = useState(() => {
    const stored = readDevButtonPos();
    // 預設落在 Hero 卡片右上角：那裡是 section 不是按鈕，不會壓到可點元素
    return stored ? clampDevPos(stored.x, stored.y) : clampDevPos(window.innerWidth - 500, 16);
  });

  const [panelRect, setPanelRect] = useState<PanelRect>(readPanelRect);
  const panelRectRef = useRef(panelRect);
  useEffect(() => {
    panelRectRef.current = panelRect;
  }, [panelRect]);

  // 視窗縮小後把按鈕與面板拉回可視範圍，否則記住的位置會跑到畫面外
  useEffect(() => {
    const onResize = () => {
      setBtnPos((p) => clampDevPos(p.x, p.y));
      setPanelRect((p) => clampPanelRect(p));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const showDevButton = useSettingsStore((s) => s.gameplay.showDevButton);

  const isOpen = externalOpen ?? internalOpen;
  const isControlled = externalOpen !== undefined;

  const resolvedTab = pickDevTabForQuery(searchQuery, activeTab);
  const searchMiss = Boolean(searchQuery.trim()) && !tabHasMatch(resolvedTab, searchQuery, DEV_TAB_SEARCH_ENTRIES);

  useEffect(() => {
    if (resolvedTab !== activeTab) setActiveTab(resolvedTab);
  }, [resolvedTab, activeTab]);

  const toggleOpen = () => {
    if (isControlled) return;
    setInternalOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  useEffect(() => {
    if (isControlled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setInternalOpen(false);
        return;
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setInternalOpen((prev) => !prev);
        return;
      }
      if (!isOpen) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditing = tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable;
      if (isEditing) return;

      if (!e.ctrlKey && !e.metaKey && !e.altKey && /^[1-5]$/.test(e.key)) {
        e.preventDefault();
        const idx = Number(e.key) - 1;
        if (TABS[idx]) setActiveTab(TABS[idx].id);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isControlled, TABS]);

  /** 右下角縮放：pointer 事件直接改 rect，放手才寫 localStorage（避免每幀寫入） */
  const onResizeStart = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = panelRectRef.current.w;
    const startH = panelRectRef.current.h;
    const onMove = (ev: PointerEvent) => {
      setPanelRect((p) =>
        clampPanelRect({
          ...p,
          w: startW + (ev.clientX - startX),
          h: startH + (ev.clientY - startY),
        }),
      );
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      savePanelRect(panelRectRef.current);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const activeTabMeta = useMemo(() => TABS.find((tab) => tab.id === activeTab) || TABS[0], [activeTab, TABS]);
  const searchContextValue = useMemo(() => ({ query: searchQuery }), [searchQuery]);

  return (
    <>
      {/* 浮動觸發按鈕 — 受 settings.showDevButton 控制 */}
      {(showDevButton || isControlled) && (
        <motion.button
          type="button"
          drag
          dragMomentum={false}
          dragElastic={0}
          onDragStart={() => {
            draggingRef.current = true;
          }}
          onDragEnd={(_, info) => {
            const next = clampDevPos(info.point.x, info.point.y);
            setBtnPos(next);
            try {
              localStorage.setItem(DEV_BTN_POS_KEY, JSON.stringify(next));
            } catch {
              // 私密模式或配額滿：記不住位置不影響功能
            }
            setTimeout(() => {
              draggingRef.current = false;
            }, 0);
          }}
          onClick={(e) => {
            if (draggingRef.current) return;
            e.preventDefault();
            e.stopPropagation();
            toggleOpen();
          }}
          animate={{ x: btnPos.x, y: btnPos.y }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{ position: 'fixed', left: 0, top: 0 }}
          className={[
            'z-[9999] flex cursor-grab items-center gap-1.5 rounded-full border-[3px] px-3 py-1.5',
            'font-mono text-[10.5px] font-extrabold uppercase tracking-[0.14em]',
            'shadow-[0_3px_0_var(--cn-line)] transition-colors active:cursor-grabbing',
            isOpen
              ? 'border-[var(--cn-line)] bg-[var(--cn-sun)] text-[var(--cn-on-sun)]'
              : 'border-[var(--cn-line-soft)] bg-[var(--cn-card)] text-[var(--cn-ink-2)] hover:border-[var(--cn-line)] hover:text-[var(--cn-ink)]',
          ].join(' ')}
          title={t.dev.triggerTitle}
        >
          <WrenchIcon className="h-3.5 w-3.5" />
          <span>Dev</span>
          <span aria-hidden="true" className="ml-0.5 grid grid-cols-2 gap-[2px] opacity-45">
            {GRIP_DOTS.map((dot) => (
              <span key={dot} className="h-[3px] w-[3px] rounded-full bg-current" />
            ))}
          </span>
        </motion.button>
      )}

      {/* 浮動視窗 — 可拖曳、可縮放、無背景遮罩（除錯時要看得到遊戲） */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="dev-panel"
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: panelRect.x, y: panelRect.y }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onDragEnd={(_, info) => {
              const next = clampPanelRect({ ...panelRectRef.current, x: info.point.x, y: info.point.y });
              setPanelRect(next);
              savePanelRect(next);
            }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: panelRect.w,
              height: panelRect.h,
            }}
            className="dev-shell z-[9998] flex flex-col overflow-hidden rounded-[12px] border-[2px] border-[var(--arc-line-strong)] bg-[var(--arc-deck)] text-[var(--arc-ink)] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
            aria-label={t.dev.title}
          >
            {/* 標題列：整個 header 就是拖曳把手 */}
            <header
              onPointerDown={(e) => dragControls.start(e)}
              className="flex shrink-0 cursor-grab items-center gap-2 border-b border-[var(--arc-line)] bg-[var(--arc-deck-2)] px-2.5 py-2 active:cursor-grabbing"
            >
              <span aria-hidden="true" className="grid grid-cols-2 gap-[2px] opacity-40">
                {GRIP_DOTS.map((dot) => (
                  <span key={dot} className="h-[3px] w-[3px] rounded-full bg-[var(--arc-ink-3)]" />
                ))}
              </span>
              <WrenchIcon className="h-3.5 w-3.5 text-[var(--arc-caution)]" />
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em]">{t.dev.title}</span>
              <span className="ml-auto font-mono text-[9px] tracking-[0.1em] text-[var(--arc-ink-4)]">
                CTRL+SHIFT+D
              </span>
              <motion.button
                type="button"
                onClick={toggleOpen}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="flex h-6 w-6 items-center justify-center rounded-[5px] text-[var(--arc-ink-3)] transition-colors hover:bg-[rgba(255,93,115,0.14)] hover:text-[var(--arc-alert)]"
                aria-label={t.dev.close}
                title={t.dev.close}
              >
                <CrossIcon className="h-3.5 w-3.5" />
              </motion.button>
            </header>

            <div className="flex min-h-0 flex-1">
              {/* 左側垂直導覽 */}
              <nav className="flex w-[54px] shrink-0 flex-col gap-1 border-r border-[var(--arc-line)] bg-[var(--arc-deck-2)] p-1.5">
                {TABS.map((tab, idx) => {
                  const isActive = resolvedTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      aria-current={isActive ? 'true' : undefined}
                      title={tab.label + ' (' + (idx + 1) + ')'}
                      className={[
                        'relative flex flex-col items-center gap-1 rounded-[6px] py-2 transition-colors',
                        isActive
                          ? 'bg-[var(--arc-deck-3)] text-[var(--arc-ink)] shadow-[inset_2px_0_0_var(--arc-caution)]'
                          : 'text-[var(--arc-ink-4)] hover:bg-[var(--arc-deck-3)]/60 hover:text-[var(--arc-ink-2)]',
                      ].join(' ')}
                    >
                      <span className="font-mono text-[8px] opacity-60">{idx + 1}</span>
                      <span className={isActive ? tab.accent : ''}>{tab.icon}</span>
                      <span className="text-[9px] font-bold tracking-wider">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* 右側：搜尋 → 狀態 → 內容 → 頁尾 */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="shrink-0 px-2 pt-2">
                  <div
                    className={[
                      'flex items-center gap-2 rounded-[6px] border px-2.5 py-1.5 transition-colors',
                      searchQuery
                        ? 'border-[var(--arc-caution)]/60 bg-[var(--arc-deck-3)]'
                        : 'border-[var(--arc-line)] bg-[var(--arc-deck-2)] hover:border-[var(--arc-line-strong)]',
                    ].join(' ')}
                  >
                    <SearchIcon className="h-3.5 w-3.5 shrink-0 text-[var(--arc-ink-4)]" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.dev.searchPlaceholder}
                      className="min-w-0 flex-1 bg-transparent text-[11px] font-bold tracking-wider text-[var(--arc-ink)] placeholder:text-[var(--arc-ink-4)] focus:outline-none"
                    />
                    {searchQuery && (
                      <IconBtn
                        label={t.dev.clearSearch}
                        onClick={() => setSearchQuery('')}
                        className="flex h-5 w-5 shrink-0 items-center justify-center text-[var(--arc-ink-4)] transition-colors hover:bg-[var(--arc-deck-3)] hover:text-[var(--arc-alert)]"
                      >
                        <CrossIcon className="h-3 w-3" />
                      </IconBtn>
                    )}
                  </div>
                </div>

                <DevStatusBar />

                <DevSearchContext.Provider value={searchContextValue}>
                  <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={resolvedTab}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.14 }}
                      >
                        {resolvedTab === 'state' && <StateSection />}
                        {resolvedTab === 'combat' && <CombatSection />}
                        {resolvedTab === 'visual' && <VisualSection />}
                        {resolvedTab === 'tools' && (
                          <>
                            <SceneJumpSection />
                            <SaveSection />
                            <ToolsSection />
                          </>
                        )}
                        {resolvedTab === 'info' && (
                          <>
                            <PerfSection />
                            <InfoSection />
                          </>
                        )}
                        {searchMiss && (
                          <p className="px-2 py-8 text-center text-[11px] font-bold tracking-widest text-[var(--arc-ink-4)]">
                            {t.dev.searchEmpty}
                          </p>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </DevSearchContext.Provider>

                <footer className="flex shrink-0 items-center justify-between border-t border-[var(--arc-line)] bg-[var(--arc-deck-2)] px-2.5 py-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--arc-ink-4)]">
                    guagua-td · dev · 1-5 · ctrl+f
                  </span>
                  <span className={['font-mono text-[9px] font-black uppercase tracking-[0.14em]', activeTabMeta.accent].join(' ')}>
                    {activeTabMeta.label}
                  </span>
                </footer>
              </div>
            </div>

            {/* 右下角縮放把手 */}
            <span
              onPointerDown={onResizeStart}
              aria-hidden="true"
              className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
            >
              <span className="absolute bottom-1 right-1 h-2 w-2 border-b-2 border-r-2 border-[var(--arc-ink-4)]" />
            </span>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

export default DevPanel;

// ============================================================
// 狀態指示條 — 顯示目前被開啟的重要 dev 開關
// ============================================================

interface StatusIndicator {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  accent: string;
  title: string;
}

const DevStatusBar = () => {
  const { t } = useTranslation();
  const infiniteMoney = useDevStore((s) => s.infiniteMoney);
  const infiniteHealth = useDevStore((s) => s.infiniteHealth);
  const godMode = useDevStore((s) => s.godMode);
  const maxTowerLevel = useDevStore((s) => s.maxTowerLevel);
  const freeUpgrades = useDevStore((s) => s.freeUpgrades);
  const showFPS = useDevStore((s) => s.showFPS);
  const showGrid = useDevStore((s) => s.showGrid);
  const showPath = useDevStore((s) => s.showPath);
  const showHitboxes = useDevStore((s) => s.showHitboxes);
  const showPerfMonitor = useDevStore((s) => s.showPerfMonitor);
  const testScene = useDevStore((s) => s.testScene);
  const autoBattleEnabled = useGameStore((s) => s.autoBattleEnabled);

  const indicators: StatusIndicator[] = [
    { id: 'money', label: '$∞', icon: <CoinIcon className="h-3 w-3" />, active: infiniteMoney, accent: 'amber', title: '無限金錢' },
    { id: 'hp', label: 'HP∞', icon: <HeartIcon className="h-3 w-3" />, active: infiniteHealth, accent: 'rose', title: '無限生命' },
    { id: 'god', label: 'GOD', icon: <ShieldIcon className="h-3 w-3" />, active: godMode, accent: 'emerald', title: '上帝模式' },
    { id: 'maxlv', label: 'MAX', icon: <LightningIcon className="h-3 w-3" />, active: maxTowerLevel, accent: 'purple', title: '新塔自動滿級' },
    { id: 'free', label: 'FREE', icon: <BrainIcon className="h-3 w-3" />, active: freeUpgrades, accent: 'purple', title: '免費升級' },
    { id: 'ai', label: 'AI', icon: <RobotIcon className="h-3 w-3" />, active: autoBattleEnabled, accent: 'emerald', title: 'AI 自動戰鬥' },
    { id: 'fps', label: 'FPS', icon: <LightningIcon className="h-3 w-3" />, active: showFPS, accent: 'cyan', title: '顯示 FPS' },
    { id: 'perf', label: 'PERF', icon: <LightningIcon className="h-3 w-3" />, active: showPerfMonitor, accent: 'amber', title: '效能監視器' },
    { id: 'grid', label: 'GRID', icon: <MapIcon className="h-3 w-3" />, active: showGrid, accent: 'emerald', title: '顯示網格' },
    { id: 'path', label: 'PATH', icon: <MapIcon className="h-3 w-3" />, active: showPath, accent: 'emerald', title: '顯示路徑' },
    { id: 'hit', label: 'HIT', icon: <EyeIcon className="h-3 w-3" />, active: showHitboxes, accent: 'cyan', title: '顯示碰撞框' },
    { id: 'scene', label: testScene ?? '', icon: <GearIcon className="h-3 w-3" />, active: !!testScene, accent: 'purple', title: testScene ? '場景測試：' + testScene : '' },
  ];

  const activeIndicators = indicators.filter((ind) => ind.active);

  const accentMap: Record<string, string> = {
    amber: 'bg-[rgba(255,182,39,0.14)] text-[var(--arc-caution)] border-[rgba(255,182,39,0.4)]',
    rose: 'bg-[rgba(255,93,115,0.14)] text-[var(--arc-alert)] border-[rgba(255,93,115,0.4)]',
    emerald: 'bg-[rgba(63,214,138,0.14)] text-[var(--arc-vital)] border-[rgba(63,214,138,0.4)]',
    purple: 'bg-[var(--arc-deck-3)] text-[var(--arc-ink-2)] border-[var(--arc-line-strong)]',
    cyan: 'bg-[rgba(88,196,221,0.14)] text-[var(--arc-cyan)] border-[rgba(88,196,221,0.4)]',
  };

  return (
    <div className="shrink-0 px-2 pt-1.5">
      {activeIndicators.length === 0 ? (
        <div className="py-1 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--arc-ink-4)]">
          {t.dev.noActiveToggles}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-0.5 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[var(--arc-ink-4)]">
            {t.dev.activeLabel}
          </span>
          {activeIndicators.map((ind) => (
            <span
              key={ind.id}
              title={ind.title}
              className={[
                'inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider',
                accentMap[ind.accent] ?? accentMap.cyan,
              ].join(' ')}
            >
              {ind.icon}
              <span>{ind.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};