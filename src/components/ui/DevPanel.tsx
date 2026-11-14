import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { DevSearchContext } from './dev-panel/common';
import { DEV_TAB_SEARCH_ENTRIES, pickDevTabForQuery, tabHasMatch } from '@/data/devSearch';

interface DevPanelProps {
  isOpen?: boolean;
}

type DevTabId = 'state' | 'tools' | 'combat' | 'visual' | 'info';

export function DevPanel({ isOpen: externalOpen }: DevPanelProps) {
  const { t } = useTranslation();
  const TABS = useMemo<{ id: DevTabId; label: string; icon: React.ReactNode; accent: string }[]>(() => [
    { id: 'state', label: t.dev.tabState, icon: <CoinIcon className="w-3.5 h-3.5" />, accent: 'text-[var(--hl-caution)]' },
    { id: 'tools', label: t.dev.tabTools, icon: <GearIcon className="w-3.5 h-3.5" />, accent: 'text-[var(--hl-ink-2)]' },
    { id: 'combat', label: t.dev.tabCombat, icon: <FlameIcon className="w-3.5 h-3.5" />, accent: 'text-[var(--hl-alarm)]' },
    { id: 'visual', label: t.dev.tabVisual, icon: <EyeIcon className="w-3.5 h-3.5" />, accent: 'text-[var(--hl-reach)]' },
    { id: 'info', label: t.dev.tabInfo, icon: <ChartIcon className="w-3.5 h-3.5" />, accent: 'text-[var(--hl-vital)]' },
  ], [t]);
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DevTabId>('state');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const activeTabMeta = useMemo(() => TABS.find((tab) => tab.id === activeTab) || TABS[0], [activeTab, TABS]);
  const searchContextValue = useMemo(() => ({ query: searchQuery }), [searchQuery]);

  return (
    <>
      {/* 浮動觸發按鈕 — 受 settings.showDevButton 控制 */}
      {(showDevButton || isControlled) && (
        <motion.button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleOpen();
          }}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`fixed bottom-4 left-4 z-[9999] flex items-center gap-2 px-3.5 py-2  border shadow-[0_4px_20px_rgba(0,0,0,0.4)] text-[11px] font-extrabold tracking-widest uppercase transition-colors  ${
            isOpen
              ? 'bg-[rgba(255,182,39,0.12)] border-[rgba(255,182,39,0.38)] text-[var(--hl-caution)]'
              : 'bg-[#1a1d24]/80 hover:bg-[rgba(255,182,39,0.12)] border-[rgba(255,182,39,0.38)] hover:border-[rgba(255,182,39,0.38)] text-[var(--hl-caution)]/90 hover:text-[var(--hl-caution)]'
          }`}
          title="開發者工具 (Ctrl+Shift+D / ESC)"
        >
          <WrenchIcon className="w-4 h-4" />
          <span>Dev</span>
        </motion.button>
      )}

      {/* 抽屜面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 + 光暈裝飾 */}
            <motion.button
              type="button"
              className="fixed inset-0 z-[9997]"
              onClick={toggleOpen}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              aria-label="關閉開發者工具"
            >
              <div className="absolute inset-0 bg-black/60 " />
              {/* 動態光暈 */}
              <motion.div
                className="absolute top-1/4 right-[180px] w-96 h-96  pointer-events-none bg-[rgba(255,182,39,0.12)]"
                style={{ filter: 'blur(80px)' }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.button>

            {/* 主面板 — 參考 ModEditor / ModManager 的風格 */}
            <motion.aside
              initial={{ x: 380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 380, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 h-full w-[380px] max-w-[94vw] z-[9998] flex flex-col bg-[#1a1d24]/95  border-l border-[var(--hl-line)] shadow-[-12px_0_60px_rgba(0,0,0,0.6)]"
            >
              {/* 頂部裝飾光暈 */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-24 bg-amber-500/[0.08] blur-3xl pointer-events-none" />

              {/* 標題列 */}
              <header className="relative px-5 py-4 border-b border-[var(--hl-line)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11  bg-[rgba(255,182,39,0.12)] border border-[rgba(255,182,39,0.38)] flex items-center justify-center ">
                    <WrenchIcon className="w-5 h-5 text-[var(--hl-caution)]/90" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold tracking-widest text-[var(--hl-ink)] uppercase">{t.dev.title}</h2>
                    <p className="text-[10px] text-[var(--hl-ink-4)] tracking-widest uppercase mt-0.5">
                      Ctrl+Shift+D · ESC · 1–5
                    </p>
                  </div>
                </div>
                <motion.button
                  type="button"
                  onClick={toggleOpen}
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9  bg-[var(--hl-deck-2)] hover:bg-[rgba(255,75,62,0.12)] border border-[var(--hl-line)] hover:border-[rgba(255,75,62,0.38)] flex items-center justify-center text-[var(--hl-ink-3)] hover:text-[var(--hl-alarm)] transition-colors"
                  aria-label="關閉"
                  title="關閉 (ESC)"
                >
                  <CrossIcon className="w-4 h-4" />
                </motion.button>
              </header>

              {/* 狀態指示條 — 一眼看到目前哪些重要開關是開的 */}
              <DevStatusBar />

              {/* 浮動 Tab 列 — 參考創意工坊風格 */}
              <div className="relative px-3 pt-3 pb-2 border-b border-[var(--hl-line)]">
                <div className="flex items-center gap-1 bg-black/40  border border-[var(--hl-line)]  p-1 ">
                  {TABS.map((tab, idx) => {
                    const isActive = resolvedTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        aria-current={isActive ? 'true' : undefined}
                        title={`${tab.label} (${idx + 1})`}
                        className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2  text-[10px] font-extrabold tracking-widest uppercase transition-all ${
                          isActive
                            ? 'bg-[var(--hl-deck-3)] text-[var(--hl-ink)]  border border-[var(--hl-line)]'
                            : 'text-[var(--hl-ink-4)] hover:text-[var(--hl-ink-2)] hover:bg-[var(--hl-deck-2)] border border-transparent'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 right-1 w-3.5 h-3.5  text-[8px] font-black flex items-center justify-center font-mono ${
                            isActive ? 'bg-[var(--hl-deck-4)] text-[var(--hl-ink-2)]' : 'bg-[var(--hl-deck-2)] text-[var(--hl-ink-4)]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className={isActive ? tab.accent : 'text-[var(--hl-ink-4)]'}>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 搜尋欄 */}
              <div className="relative px-3 pb-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5  border bg-black/30 transition-colors ${
                    searchQuery ? 'border-[rgba(255,182,39,0.38)]' : 'border-[var(--hl-line)] hover:border-[var(--hl-line-strong)]'
                  }`}
                >
                  <SearchIcon className={`w-3.5 h-3.5 flex-shrink-0 ${searchQuery ? 'text-[var(--hl-caution)]/90' : 'text-[var(--hl-ink-4)]'}`} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋區塊（Ctrl+F）"
                    className="flex-1 min-w-0 bg-transparent text-[var(--hl-ink)]/85 text-[11px] font-bold tracking-wider placeholder:text-[var(--hl-ink-4)] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="w-5 h-5  text-[var(--hl-ink-4)] hover:text-[var(--hl-alarm)] hover:bg-[var(--hl-deck-2)] flex items-center justify-center transition-colors flex-shrink-0"
                      aria-label="清除搜尋"
                    >
                      <CrossIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* 內容區（捲動） */}
              <DevSearchContext.Provider value={searchContextValue}>
                <div className="relative flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-white/10 no-scrollbar">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={resolvedTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                    >
                      {resolvedTab === 'state' && <StateSection />}
                      {resolvedTab === 'combat' && <CombatSection />}
                      {resolvedTab === 'visual' && <VisualSection />}
                      {resolvedTab === 'tools' && <ToolsSection />}
                      {resolvedTab === 'info' && <InfoSection />}
                      {searchMiss && (
                        <p className="px-2 py-8 text-center text-[11px] font-bold tracking-widest text-[var(--hl-ink-4)]">
                          {t.dev.searchEmpty}
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </DevSearchContext.Provider>

              {/* 頁尾 */}
              <footer className="relative px-4 py-2.5 border-t border-[var(--hl-line)] bg-black/30 flex items-center justify-between">
                <div className="text-[10px] text-[var(--hl-ink-4)] tracking-widest uppercase font-mono">
                  guagua-td · dev · 1–5 · Ctrl+F
                </div>
                <div className={`text-[10px] font-extrabold tracking-widest uppercase ${activeTabMeta.accent}`}>
                  {activeTabMeta.label}
                </div>
              </footer>
            </motion.aside>
          </>
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
    { id: 'money', label: '$∞', icon: <CoinIcon className="w-3 h-3" />, active: infiniteMoney, accent: 'amber', title: '無限金錢' },
    { id: 'hp', label: 'HP∞', icon: <HeartIcon className="w-3 h-3" />, active: infiniteHealth, accent: 'rose', title: '無限生命' },
    { id: 'god', label: 'GOD', icon: <ShieldIcon className="w-3 h-3" />, active: godMode, accent: 'emerald', title: '上帝模式' },
    { id: 'maxlv', label: 'MAX', icon: <LightningIcon className="w-3 h-3" />, active: maxTowerLevel, accent: 'purple', title: '新塔自動滿級' },
    { id: 'free', label: 'FREE', icon: <BrainIcon className="w-3 h-3" />, active: freeUpgrades, accent: 'purple', title: '免費升級' },
    { id: 'ai', label: 'AI', icon: <RobotIcon className="w-3 h-3" />, active: autoBattleEnabled, accent: 'emerald', title: 'AI 自動戰鬥' },
    { id: 'fps', label: 'FPS', icon: <LightningIcon className="w-3 h-3" />, active: showFPS, accent: 'cyan', title: '顯示 FPS' },
    { id: 'perf', label: 'PERF', icon: <LightningIcon className="w-3 h-3" />, active: showPerfMonitor, accent: 'amber', title: '效能監視器' },
    { id: 'grid', label: 'GRID', icon: <MapIcon className="w-3 h-3" />, active: showGrid, accent: 'emerald', title: '顯示網格' },
    { id: 'path', label: 'PATH', icon: <MapIcon className="w-3 h-3" />, active: showPath, accent: 'emerald', title: '顯示路徑' },
    { id: 'hit', label: 'HIT', icon: <EyeIcon className="w-3 h-3" />, active: showHitboxes, accent: 'cyan', title: '顯示碰撞框' },
    { id: 'scene', label: testScene ?? '', icon: <GearIcon className="w-3 h-3" />, active: !!testScene, accent: 'purple', title: testScene ? `場景測試：${testScene}` : '' },
  ];

  const activeIndicators = indicators.filter((ind) => ind.active);

  const accentMap: Record<string, string> = {
    amber: 'bg-[rgba(255,182,39,0.12)] text-[var(--hl-caution)] border-[rgba(255,182,39,0.38)]',
    rose: 'bg-[rgba(255,75,62,0.12)] text-[var(--hl-alarm)] border-[rgba(255,75,62,0.38)]',
    emerald: 'bg-[rgba(56,224,143,0.12)] text-[var(--hl-vital)] border-[rgba(56,224,143,0.38)]',
    purple: 'bg-purple-500/15 text-[var(--hl-ink-2)] border-[var(--hl-line-strong)]',
    cyan: 'bg-[rgba(111,168,255,0.12)] text-[var(--hl-reach)] border-[rgba(111,168,255,0.38)]',
  };

  return (
    <div className="relative px-3 pt-2 pb-1 border-b border-[var(--hl-line)]">
      {activeIndicators.length === 0 ? (
        <div className="text-[9px] text-[var(--hl-ink-4)] tracking-widest uppercase text-center py-1 font-bold">
          目前無啟用中的開關
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[9px] font-black tracking-[0.3em] text-[var(--hl-ink-4)] uppercase mr-0.5">啟用</span>
          {activeIndicators.map((ind) => (
            <span
              key={ind.id}
              title={ind.title}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5  border text-[9px] font-black tracking-widest uppercase ${
                accentMap[ind.accent] ?? accentMap.cyan
              }`}
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
