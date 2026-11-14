import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { useTranslation } from '@/i18n';
import { Sidebar } from '@/components/game/Sidebar';
import { WaveBanner } from '@/components/game/WaveBanner';
import { TacticalProtocolOverlay } from '@/components/game/TacticalProtocolOverlay';
import { ProtocolHud } from '@/components/game/ProtocolHud';
import { PauseOverlay } from '@/components/ui';
import { PauseBuildHud } from '@/components/ui/PauseBuildHud';
import { InteractiveTutorialOverlay } from '@/components/ui/InteractiveTutorialOverlay';
import { PerfOverlay } from '@/components/ui/PerfOverlay';
import { StressTestHud } from '@/components/ui/StressTestHud';
import { GameCanvas } from './game-scene/GameCanvas';
import { FloatingTowerPanel } from '@/components/game/FloatingTowerPanel';
import { FusionModeBanner } from '@/components/game/FusionModeBanner';
import { SellConfirmModal } from '@/components/game/SellConfirmModal';
import { MultiSelectPanel } from '@/components/game/MultiSelectPanel';
import { BossWarning } from '@/components/game/BossWarning';
import { useGameSceneEffects } from './game-scene/useGameSceneEffects';
import { useReplayRecorder } from '@/hooks/useReplayRecorder';
import { INTERACTIVE_TUTORIAL_STEPS } from '@/store/tutorialStore';
import { useEffect, useState, lazy, Suspense } from 'react';
import { ViewModeToggle } from './game-scene/three/ViewModeToggle';
import { shouldShowFullPauseOverlay, shouldShowPauseBuildHud } from '@/store/pauseBuildMode';

// 3D 渲染器延遲載入（three.js 較大，只在切換 3D 時載入）
const GameScene3D = lazy(() => import('./game-scene/three/GameScene3D'));

// 主游戏场景
export default function GameScene() {
  const { t } = useTranslation();
  // 自動錄製回放
  useReplayRecorder();
  const isPaused = useGameStore((s) => s.isPaused);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const isVictory = useGameStore((s) => s.isVictory);
  const currentWave = useGameStore((s) => s.currentWave);
  // 只訂閱 enemies.length（避免每幀都因為 enemies 陣列 reference 變動而重渲染整個 GameScene）
  const enemiesCount = useGameStore((s) => s.enemies.length);
  const waveActive = useGameStore((s) => s.waveActive);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const resetGame = useGameStore((s) => s.resetGame);
  const setScene = useGameStore((s) => s.setScene);
  const tutorialActive = useTutorialStore((s) => s.isActive);

  const [pauseMenuOpen, setPauseMenuOpen] = useState(false);
  const buildWhilePaused = useSettingsStore((s) => s.gameplay.buildWhilePaused);
  // 2D / 3D 視圖模式（偏好持久化到設定；教學模式強制 2D，確保引導拾取正常）
  const [viewMode, setViewMode] = useState<'2d' | '3d'>(
    () => (useSettingsStore.getState().visual.prefer3DView ? '3d' : '2d'),
  );
  const effectiveViewMode = tutorialActive ? '2d' : viewMode;
  const prefer3DView = useSettingsStore((s) => s.visual.prefer3DView);

  useEffect(() => {
    if (!isPaused) setPauseMenuOpen(false);
  }, [isPaused]);

  // 暫停選單或設定頁切換 3D 偏好時，同步本局視圖（教學中維持 2D）
  useEffect(() => {
    if (tutorialActive) return;
    setViewMode(prefer3DView ? '3d' : '2d');
  }, [prefer3DView, tutorialActive]);
  // 視圖切換閃光特效（時間戳作 key，每次切換重播）
  const [switchFx, setSwitchFx] = useState(0);

  const toggleViewMode = () => {
    setSwitchFx(Date.now());
    setViewMode((m) => {
      const next = m === '2d' ? '3d' : '2d';
      const s = useSettingsStore.getState();
      s.setAll({ visual: { ...s.visual, prefer3DView: next === '3d' } });
      return next;
    });
  };

  const { countdown, showCountdown } = useGameSceneEffects();

  // 勝利：直接切結算場景（戰役對話已移除，所有模式共用同一條路徑）
  useEffect(() => {
    if (!isVictory) return;
    setScene('victory');
  }, [isVictory, setScene]);

  useEffect(() => {
    if (isGameOver && tutorialActive) {
      useTutorialStore.getState().endTutorial({ awardGold: false });
    }
  }, [isGameOver, tutorialActive]);

  // 鍵盤快捷鍵: Ctrl+A 全選塔（Esc 取消選取由 useGameSceneEffects 處理，避免同時暫停）
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        useGameStore.getState().selectAllTowers();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // 檢查教學的 "wait_wave_end" 條件
  useEffect(() => {
    const tutorialState = useTutorialStore.getState();
    if (tutorialState.isActive) {
      const step = INTERACTIVE_TUTORIAL_STEPS[tutorialState.currentStepIndex];
      if (step?.action === 'wait_wave_end') {
        // 如果目前是第一波，而且敵人已經全部清空，且波次不再 active
        if (currentWave === 1 && !waveActive && enemiesCount === 0) {
          useTutorialStore.getState().checkAction('wait_wave_end');
        }
      } else if (step?.action === 'start_wave' && waveActive) {
        // 如果設定了「自動開始波次」，波次會自動啟動，此時自動幫玩家完成點擊動作
        useTutorialStore.getState().checkAction('start_wave', step.targetId);
      }
    }
  }, [currentWave, waveActive, enemiesCount]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--arc-void)] text-[var(--arc-ink)]">
      <div className="absolute inset-x-0 bottom-11 top-11 z-0 overflow-hidden" style={{ perspective: 1400 }}>
        {/* 2D ↔ 3D 透視翻轉過渡：平面傾斜立起的隱喻動畫 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={effectiveViewMode}
            className="absolute inset-0"
            initial={{ opacity: 0, rotateX: effectiveViewMode === '3d' ? 14 : -10, scale: 0.96 }}
            animate={{ opacity: 1, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, rotateX: effectiveViewMode === '3d' ? -8 : 10, scale: 1.025 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'center 62%' }}
          >
            {effectiveViewMode === '3d' ? (
              <Suspense fallback={<GameCanvas />}>
                <GameScene3D />
                {/* 2D 視圖中這些面板由 GameCanvas 內部渲染；3D 視圖在此補上 */}
                <FloatingTowerPanel tileSize={0} offsetX={0} offsetY={0} dock />
                <FusionModeBanner />
                <MultiSelectPanel />
                <BossWarning />
              </Suspense>
            ) : (
              <GameCanvas />
            )}
          </motion.div>
        </AnimatePresence>

        {/* 切換提示：訊號色 1px 掃描線，一次掃過（每次切換重播一次） */}
        <AnimatePresence>
          {switchFx > 0 && (
            <motion.div
              key={switchFx}
              className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              onAnimationComplete={() => setSwitchFx(0)}
            >
              <motion.span
                className="absolute inset-x-0 h-px bg-[var(--arc-gold)]"
                initial={{ top: '-2%' }}
                animate={{ top: '102%' }}
                transition={{ duration: 0.4, ease: [0.3, 0, 0.4, 1] }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2D / 3D 視圖切換（教學模式中隱藏） */}
      {!tutorialActive && (
        <div className="pointer-events-none absolute left-3 top-[52px] z-30">
          <ViewModeToggle mode={effectiveViewMode} onToggle={toggleViewMode} />
        </div>
      )}

      <div className="absolute inset-0 z-10 pointer-events-none">
        <Sidebar />
      </div>

      {/* 倒數顯示 */}
      <AnimatePresence>
        {showCountdown && (
          <motion.div
            className="absolute left-1/2 top-[52px] z-30 -translate-x-1/2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="flex items-center gap-3 border border-[var(--arc-line-strong)] border-l-2 border-l-[var(--arc-gold)] bg-[var(--arc-void-2)] px-4 py-2">
              <span className="arc-label whitespace-nowrap">
                {currentWave === 0 ? t.common.start : t.game.nextWave} · {t.game.countdown}
              </span>
              <motion.span
                className="font-mono text-[22px] font-semibold leading-none tabular-nums text-[var(--arc-gold)]"
                key={countdown}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {countdown}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 波次開始大標題動畫 */}
      <WaveBanner />
      <ProtocolHud />
      <TacticalProtocolOverlay />

      {/* 新手引導遮罩 */}
      <InteractiveTutorialOverlay />

      {/* 性能監視器 (開發者面板可切換) */}
      <PerfOverlay />
      {/* 壓測 HUD：只有 Dev 面板的壓力測試模式開啟時才顯示 */}
      <StressTestHud />
      <SellConfirmModal />

      {/* 暫停：設定開啟時只顯示精簡條，戰場仍可放塔；選單仍可打開完整暫停頁 */}
      {shouldShowPauseBuildHud({
        isPaused,
        buildWhilePaused,
        pauseMenuOpen,
        isGameOver,
      }) && (
        <PauseBuildHud
          onOpenMenu={() => setPauseMenuOpen(true)}
          onResume={resumeGame}
        />
      )}
      <AnimatePresence>
        {shouldShowFullPauseOverlay({
          isPaused,
          buildWhilePaused,
          pauseMenuOpen,
          isGameOver,
        }) && (
          <PauseOverlay 
            onResume={resumeGame}
            onQuit={() => {
              resetGame();
              setScene('mainMenu');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
