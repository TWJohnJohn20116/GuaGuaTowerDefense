/**
 * PauseOverlay 暫停介面（HARDLINE Modal）
 *
 * 遮罩 bg-[rgba(6,7,10,0.82)] + 一張 Deck notch；左側是訊號左緣的分頁軌，
 * 主內容區用 mono 標籤與等寬數值；主要行動直向全寬。
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import {
  HomeIcon, ChartIcon, GearIcon,
  WaveIcon, HeartIcon, CoinIcon,
  EyeIcon, StarIcon,
} from '@/components/ui/Icons';
import {
  MainSection,
  BattleStatusSection,
  PreviewSection,
  SettingsSection,
  StrategyModeView,
} from './pause/PauseSections';
import { PauseEncyclopediaSheet } from './pause/PauseEncyclopediaSheet';
import { Deck, Num } from '@/components/hl';

interface PauseOverlayProps {
  onResume: () => void;
  onQuit: () => void;
}

type TabId = 'main' | 'battle' | 'preview' | 'settings';

export const PauseOverlay = ({ onResume, onQuit }: PauseOverlayProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('main');
  const [strategyMode, setStrategyMode] = useState(false);

  const money = useGameStore((s) => s.money);
  const health = useGameStore((s) => s.health);
  const currentWave = useGameStore((s) => s.currentWave);
  const maxWaves = useGameStore((s) => s.maxWaves);
  const endlessMode = useGameStore((s) => s.endlessMode);
  const score = useGameStore((s) => s.score);
  const isPaused = useGameStore((s) => s.isPaused);
  const pauseEncyclopediaFocus = useGameStore((s) => s.pauseEncyclopediaFocus);
  const closePauseEncyclopedia = useGameStore((s) => s.closePauseEncyclopedia);

  // 內嵌圖鑑開啟時，ESC 先關閉圖鑑而非恢復遊戲
  useEffect(() => {
    if (!pauseEncyclopediaFocus) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        closePauseEncyclopedia();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [pauseEncyclopediaFocus, closePauseEncyclopedia]);

  const waveHeader = endlessMode || maxWaves <= 0
    ? String(currentWave)
    : `${currentWave}/${maxWaves}`;

  if (strategyMode) {
    return <StrategyModeView onResume={onResume} onBackToMenu={() => setStrategyMode(false)} />;
  }

  const tabs: { id: TabId; icon: React.FC<{ className?: string }>; label: string }[] = [
    { id: 'main', icon: HomeIcon, label: t.game.pauseMenu },
    { id: 'battle', icon: ChartIcon, label: t.game.pauseTabBattle },
    { id: 'preview', icon: EyeIcon, label: t.game.pauseTabPreview },
    { id: 'settings', icon: GearIcon, label: t.common.settings },
  ];

  return (
    <motion.div
      className={`absolute inset-0 z-40 flex items-center justify-center bg-[rgba(6,7,10,0.82)] p-3 sm:p-6 ${!isPaused ? 'pointer-events-none' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
    >
      <motion.div
        className="w-full max-w-[880px]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8, transition: { duration: 0.12 } }}
        transition={{ duration: 0.16 }}
      >
        <Deck notch className="flex max-h-[86vh] flex-col overflow-hidden">
          {/* 標題列：mono 小標 + 17px 標題 + 儀表格 */}
          <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--hl-line)] px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="hl-label">theater / paused</div>
              <h2 className="mt-1 truncate text-[17px] font-semibold leading-tight text-[var(--hl-ink)]">
                {t.game.paused}
              </h2>
            </div>

            <div className="flex items-stretch border border-[var(--hl-line)]">
              {[
                { icon: <WaveIcon className="h-3 w-3" />, label: t.game.wave, value: waveHeader },
                { icon: <HeartIcon className="h-3 w-3" />, label: t.game.health, value: health },
                { icon: <CoinIcon className="h-3 w-3" />, label: t.game.money, value: `$${money}` },
                { icon: <StarIcon className="h-3 w-3" />, label: t.game.score, value: score.toLocaleString() },
              ].map((cell) => (
                <div
                  key={cell.label}
                  className="flex min-w-[62px] flex-col gap-1 border-r border-[var(--hl-line)] px-2.5 py-1.5 last:border-r-0"
                >
                  <span className="hl-label flex items-center gap-1">{cell.icon}{cell.label}</span>
                  <Num value={cell.value} size="sm" />
                </div>
              ))}
            </div>

            <span className="hidden font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)] sm:inline">
              {t.game.pauseResumeHint}
            </span>
          </header>

          {/* 左分頁軌 + 內容 */}
          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            <nav className="flex shrink-0 gap-0 overflow-x-auto border-b border-[var(--hl-line)] bg-[var(--hl-void-2)] no-scrollbar sm:w-[176px] sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (pauseEncyclopediaFocus) closePauseEncyclopedia();
                      setActiveTab(tab.id);
                    }}
                    className={`relative flex flex-1 items-center gap-2 whitespace-nowrap border-b border-[var(--hl-line)] px-3 py-2.5 text-left transition-colors duration-[110ms] sm:flex-none ${
                      isActive
                        ? 'bg-[var(--hl-deck-2)] text-[var(--hl-ink)]'
                        : 'text-[var(--hl-ink-2)] hover:bg-[var(--hl-deck-2)] hover:text-[var(--hl-ink)]'
                    }`}
                  >
                    {/* 選中：左緣 2px 訊號條 */}
                    <span
                      className={`absolute left-0 top-0 h-full w-[2px] ${isActive ? 'bg-[var(--hl-signal)]' : 'bg-transparent'}`}
                    />
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[var(--hl-signal)]' : ''}`} />
                    <span className={`text-[12px] ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <AnimatePresence mode="wait">
                {activeTab === 'main' && (
                  <MainSection
                    onResume={onResume}
                    onQuit={onQuit}
                    onStrategy={() => setStrategyMode(true)}
                  />
                )}
                {activeTab === 'battle' && <BattleStatusSection />}
                {activeTab === 'preview' && <PreviewSection />}
                {activeTab === 'settings' && <SettingsSection />}
              </AnimatePresence>
            </div>
          </div>
        </Deck>
      </motion.div>

      {/* 圖鑑底部抽屜（覆蓋整個暫停遮罩，不嵌在內容區） */}
      <AnimatePresence>
        {pauseEncyclopediaFocus && (
          <PauseEncyclopediaSheet
            focus={pauseEncyclopediaFocus}
            onClose={closePauseEncyclopedia}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PauseOverlay;
