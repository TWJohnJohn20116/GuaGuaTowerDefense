import { useState, useEffect } from 'react';
import { useDevStore } from '@/store/devStore';
import { useGameStore } from '@/store/gameStore';
import { useTalentStore } from '@/store/talentStore';
import { useShopStore } from '@/store/shopStore';
import { TOWER_DATA } from '@/data/gameData';
import type { GameScene, TowerType } from '@/types/game';
import { useTranslation } from '@/i18n';
import {
  TrophyIcon, SkullIcon, RefreshIcon, PauseIcon, PlayIcon,
  HomeIcon, LightningIcon, GearIcon, SaveActionIcon, FolderIcon, ClipboardIcon, CheckIcon,
  BrainIcon, CoinIcon, PlusIcon, TrashIcon, TowerIcon, WarningIcon,
  EyeIcon, PaletteIcon,
} from '@/components/ui/Icons';
import { DevSection, DevButton, DevSelect, DevInfoRow, DevGroup } from './common';
import { ModTestSection } from './ModTestSection';
import { StressTestSection } from './StressTestSection';

const SNAPSHOT_KEY = 'guagua-td-dev-snapshot';

// ============================================================
// 場景測試
// ============================================================

// TD-09：場景清單的唯一真相是 types/game.ts 的 GameScene。
// 這裡不再手抄，改成 GameScene | ''（關閉測試）。
type SceneOption = GameScene | '';

const SceneTest = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const testScene = useDevStore((s) => s.testScene);
  const setTestScene = useDevStore((s) => s.setTestScene);

  // 以 Record<GameScene, string> 宣告：新增場景若沒補標籤，這裡就是型別錯誤，
  // 不會再出現「新增場景但 Dev 面板選單漏掉」的靜默缺漏。
  const sceneLabels: Record<GameScene, string> = {
    mainMenu: u.sceneMainMenu,
    pathSelection: u.scenePathSelection,
    game: u.sceneGame,
    settings: u.sceneSettings,
    tutorial: u.sceneTutorial,
    encyclopedia: u.sceneEncyclopedia,
    changelog: u.sceneChangelog,
    workshop: u.sceneWorkshop,
    achievements: u.sceneAchievements,
    skins: u.sceneSkins,
    shop: u.sceneShop,
    talentTree: u.sceneTalentTree,
    modEditor: u.sceneModEditor,
    modManager: u.sceneModManager,
    mapEditor: u.sceneMapEditor,
    replay: u.sceneReplay,
    statistics: u.sceneStatistics,
    gameOver: u.sceneGameOver,
    victory: u.sceneVictory,
  };

  const sceneOptions: { value: SceneOption; label: string }[] = [
    { value: '', label: u.sceneCloseTest },
    ...(Object.keys(sceneLabels) as GameScene[]).map((scene) => ({
      value: scene,
      label: sceneLabels[scene],
    })),
  ];

  return (
    <div className="space-y-2">
      <DevSelect<SceneOption>
        value={testScene ?? ''}
        onChange={(v) => setTestScene(v === '' ? null : v)}
        options={sceneOptions}
      />
      <div className="text-[10px] text-[var(--arc-ink-4)] px-1">
        {testScene ? u.testSceneActive.replace('{scene}', sceneLabels[testScene]) : u.testSceneIdle}
      </div>
    </div>
  );
};

// ============================================================
// Overlay 測試
// ============================================================

const OverlayTest = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const testScene = useDevStore((s) => s.testScene);
  const setTestScene = useDevStore((s) => s.setTestScene);

  // 勝利 / 失敗都已改為獨立場景，使用 testScene 機制預覽
  const toggleVictoryScene = () => {
    setTestScene(testScene === 'victory' ? null : 'victory');
  };
  const toggleGameOverScene = () => {
    setTestScene(testScene === 'gameOver' ? null : 'gameOver');
  };

  return (
    <div className="space-y-2">
      <DevButton
        icon={<TrophyIcon className="w-3.5 h-3.5" />}
        label={testScene === 'victory' ? u.overlayVictoryActive : u.overlayVictoryPreview}
        onClick={toggleVictoryScene}
        variant={testScene === 'victory' ? 'success' : 'default'}
      />
      <DevButton
        icon={<SkullIcon className="w-3.5 h-3.5" />}
        label={testScene === 'gameOver' ? u.overlayGameOverActive : u.overlayGameOverPreview}
        onClick={toggleGameOverScene}
        variant={testScene === 'gameOver' ? 'danger' : 'default'}
      />
      <div className="text-[10px] text-[var(--arc-ink-4)] px-1 leading-relaxed">
        {u.overlayHint}
      </div>
    </div>
  );
};

// ============================================================
// 遊戲速度
// ============================================================

const SpeedControl = () => {
  const gameSpeed = useGameStore((s) => s.gameSpeed);
  const setGameSpeed = useGameStore((s) => s.setGameSpeed);
  const speeds = [0.25, 0.5, 1, 2, 5, 10];

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {speeds.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setGameSpeed(s)}
          className={`py-1.5  text-[11px] font-bold tracking-widest border transition-all ${
            gameSpeed === s
              ? 'bg-[rgba(255,182,39,0.12)] border-[rgba(255,182,39,0.38)] text-[var(--arc-caution)]/90 '
              : 'bg-[var(--arc-deck-2)] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)] hover:bg-[var(--arc-deck-3)] hover:text-[var(--arc-ink)]'
          }`}
        >
          {s}x
        </button>
      ))}
    </div>
  );
};

// ============================================================
// 流程控制
// ============================================================

const FlowControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const isPaused = useGameStore((s) => s.isPaused);
  const isPlaying = useGameStore((s) => s.isPlaying);
  const pauseGame = useGameStore((s) => s.pauseGame);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const resetGame = useGameStore((s) => s.resetGame);
  const setScene = useGameStore((s) => s.setScene);
  const resetDevState = useDevStore((s) => s.resetDevState);

  return (
    <div className="space-y-2">
      <DevButton
        icon={isPaused ? <PlayIcon className="w-3.5 h-3.5" /> : <PauseIcon className="w-3.5 h-3.5" />}
        label={isPaused ? u.resumeGame : u.pauseGame}
        onClick={() => isPaused ? resumeGame() : pauseGame()}
        variant={isPaused ? 'success' : 'warning'}
        disabled={!isPlaying}
      />
      <DevButton
        icon={<RefreshIcon className="w-3.5 h-3.5" />}
        label={u.resetGame}
        onClick={resetGame}
        variant="danger"
      />
      <DevButton
        icon={<HomeIcon className="w-3.5 h-3.5" />}
        label={u.backToMenu}
        onClick={() => { resetGame(); setScene('mainMenu'); }}
        variant="default"
      />
      <div className="pt-2 mt-1 border-t border-[var(--cn-line-soft)]">
        <DevButton
          icon={<RefreshIcon className="w-3.5 h-3.5" />}
          label={u.resetDevSettings}
          onClick={resetDevState}
          variant="warning"
          title={u.resetDevSettingsTitle}
        />
      </div>
    </div>
  );
};

// ============================================================
// 狀態快照（save/load 整個 gameStore）
// ============================================================

const SnapshotControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setHasSnapshot(!!localStorage.getItem(SNAPSHOT_KEY));
  }, [feedback]);

  const showFeedback = (text: string) => {
    setFeedback(text);
    setTimeout(() => setFeedback(null), 1800);
  };

  const saveSnapshot = () => {
    try {
      const state = useGameStore.getState();
      // 僅保存可序列化的關鍵欄位
      const snapshot = {
        scene: state.scene,
        isPlaying: state.isPlaying,
        isPaused: state.isPaused,
        money: state.money,
        health: state.health,
        score: state.score,
        currentWave: state.currentWave,
        waveActive: state.waveActive,
        endlessMode: state.endlessMode,
        maxWaves: state.maxWaves,
        gameSpeed: state.gameSpeed,
        gameDifficulty: state.gameDifficulty,
        selectedPath: state.selectedPath,
        enemies: state.enemies,
        towers: state.towers,
        projectiles: state.projectiles,
        timestamp: Date.now(),
      };
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
      showFeedback(u.snapshotSaved);
    } catch (e) {
      showFeedback(u.snapshotSaveFail);
    }
  };

  const loadSnapshot = () => {
    try {
      const raw = localStorage.getItem(SNAPSHOT_KEY);
      if (!raw) return showFeedback(u.snapshotEmpty);
      const snapshot = JSON.parse(raw);
      // 排除 timestamp 後直接套用
      const { timestamp: _t, ...rest } = snapshot;
      void _t;
      useGameStore.setState(rest);
      showFeedback(u.snapshotLoaded);
    } catch (e) {
      showFeedback(u.snapshotLoadFail);
    }
  };

  const clearSnapshot = () => {
    localStorage.removeItem(SNAPSHOT_KEY);
    showFeedback(u.snapshotCleared);
  };

  return (
    <div className="space-y-2">
      <DevButton
        icon={<SaveActionIcon className="w-3.5 h-3.5" />}
        label={u.saveSnapshot}
        onClick={saveSnapshot}
        variant="success"
      />
      <DevButton
        icon={<FolderIcon className="w-3.5 h-3.5" />}
        label={hasSnapshot ? u.loadSnapshot : u.noSnapshot}
        onClick={loadSnapshot}
        variant="primary"
        disabled={!hasSnapshot}
      />
      <DevButton
        icon={<RefreshIcon className="w-3.5 h-3.5" />}
        label={u.clearSnapshot}
        onClick={clearSnapshot}
        variant="warning"
        disabled={!hasSnapshot}
      />
      {feedback && (
        <div className="text-[10px] text-[var(--arc-vital)]/90 font-bold tracking-widest uppercase text-center py-1 bg-[rgba(56,224,143,0.12)]  border border-[rgba(56,224,143,0.38)]">
          {feedback}
        </div>
      )}
    </div>
  );
};

// ============================================================
// 複製狀態到剪貼板
// ============================================================

const StateExport = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const [copied, setCopied] = useState(false);

  const copyState = async () => {
    const state = useGameStore.getState();
    const summary = {
      scene: state.scene,
      money: state.money,
      health: state.health,
      score: state.score,
      currentWave: state.currentWave,
      maxWaves: state.maxWaves,
      gameSpeed: state.gameSpeed,
      gameDifficulty: state.gameDifficulty,
      selectedPath: state.selectedPath,
      enemyCount: state.enemies.length,
      towerCount: state.towers.length,
      projectileCount: state.projectiles.length,
      towers: state.towers.map((t) => ({ id: t.id, type: t.type, level: t.level, kills: t.kills, totalDamage: t.totalDamage })),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // ignore
    }
  };

  return (
    <DevButton
      icon={copied ? <CheckIcon className="w-3.5 h-3.5" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
      label={copied ? u.copiedClipboard : u.copyStateJson}
      onClick={copyState}
      variant={copied ? 'success' : 'default'}
    />
  );
};

// ============================================================
// 天賦控制
// ============================================================

const TalentControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const talentPoints = useTalentStore((s) => s.talentPoints);
  const addTalentPoints = useTalentStore((s) => s.addTalentPoints);
  const resetTalents = useTalentStore((s) => s.resetTalents);

  return (
    <div className="space-y-2">
      <DevInfoRow label={u.talentPoints} value={talentPoints} color="purple" />
      <div className="grid grid-cols-3 gap-1.5">
        <DevButton label="+10" onClick={() => addTalentPoints(10)} variant="success" />
        <DevButton label="+50" onClick={() => addTalentPoints(50)} variant="success" />
        <DevButton label="+100" onClick={() => addTalentPoints(100)} variant="success" />
      </div>
      <DevButton
        icon={<TrashIcon className="w-3.5 h-3.5" />}
        label={u.resetTalentTree}
        onClick={resetTalents}
        variant="warning"
      />
    </div>
  );
};

// ============================================================
// 商店金幣
// ============================================================

const ShopControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const coins = useShopStore((s) => s.coins);
  const addCoins = useShopStore((s) => s.addCoins);

  return (
    <div className="space-y-2">
      <DevInfoRow label={u.shopCoins} value={coins} color="amber" />
      <div className="grid grid-cols-3 gap-1.5">
        <DevButton icon={<PlusIcon className="w-3 h-3" />} label="100" onClick={() => addCoins(100)} variant="success" />
        <DevButton icon={<PlusIcon className="w-3 h-3" />} label="500" onClick={() => addCoins(500)} variant="success" />
        <DevButton icon={<PlusIcon className="w-3 h-3" />} label="1000" onClick={() => addCoins(1000)} variant="success" />
      </div>
    </div>
  );
};

// ============================================================
// 快捷預設組合
// ============================================================

const PresetModes = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const applyPreset = (preset: 'cheat-all' | 'test' | 'visual-debug' | 'reset') => {
    const dev = useDevStore.getState();

    // 先全關
    const allOff = {
      infiniteMoney: false,
      infiniteHealth: false,
      godMode: false,
      maxTowerLevel: false,
      freeUpgrades: false,
      showDebugInfo: false,
      showFPS: false,
      showGrid: false,
      showPath: false,
      showHitboxes: false,
      showPerfMonitor: false,
    };

    if (preset === 'cheat-all') {
      useDevStore.setState({
        ...allOff,
        infiniteMoney: true,
        infiniteHealth: true,
        godMode: true,
        maxTowerLevel: true,
        freeUpgrades: true,
      });
    } else if (preset === 'test') {
      useDevStore.setState({
        ...allOff,
        infiniteMoney: true,
        showDebugInfo: true,
        showFPS: true,
        showPerfMonitor: true,
      });
      // perfMonitor 需手動 enable
      if (!dev.showPerfMonitor) {
        useDevStore.getState().togglePerfMonitor();
        // 再 togglePerfMonitor 會把它設為 true（因為剛剛 setState 為 true 但 setPerfEnabled 沒呼叫）
        useDevStore.setState({ showPerfMonitor: true });
      }
    } else if (preset === 'visual-debug') {
      useDevStore.setState({
        ...allOff,
        showDebugInfo: true,
        showGrid: true,
        showPath: true,
        showHitboxes: true,
      });
    } else if (preset === 'reset') {
      useDevStore.getState().resetDevState();
    }
  };

  return (
    <div className="space-y-2">
      <DevButton
        icon={<WarningIcon className="w-3.5 h-3.5" />}
        label={u.cheatAllOn}
        onClick={() => applyPreset('cheat-all')}
        variant="warning"
      />
      <DevButton
        icon={<BrainIcon className="w-3.5 h-3.5" />}
        label={u.testMode}
        onClick={() => applyPreset('test')}
        variant="primary"
      />
      <DevButton
        icon={<GearIcon className="w-3.5 h-3.5" />}
        label={u.visualDebug}
        onClick={() => applyPreset('visual-debug')}
        variant="default"
      />
      <DevButton
        icon={<RefreshIcon className="w-3.5 h-3.5" />}
        label={u.turnAllOff}
        onClick={() => applyPreset('reset')}
        variant="success"
      />
    </div>
  );
};

// ============================================================
// 解鎖所有塔 / 重置 localStorage
// ============================================================

const PersistenceControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const unlockedTowers = useShopStore((s) => s.unlockedTowers);
  const allTowerCount = Object.keys(TOWER_DATA).length;
  const [confirmReset, setConfirmReset] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (text: string) => {
    setFeedback(text);
    setTimeout(() => setFeedback(null), 1800);
  };

  const unlockAllTowers = () => {
    const allTypes = Object.keys(TOWER_DATA) as TowerType[];
    useShopStore.setState({ unlockedTowers: allTypes });
    showFeedback(u.unlockAllFeedback.replace('{count}', String(allTypes.length)));
  };

  const lockAllButBasic = () => {
    useShopStore.setState({ unlockedTowers: ['basic'] });
    showFeedback(u.resetTowersBasic);
  };

  const wipeLocalStorage = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    localStorage.clear();
    showFeedback(u.storageCleared);
    setConfirmReset(false);
  };

  return (
    <div className="space-y-2">
      <DevInfoRow label={u.unlockedTowers} value={`${unlockedTowers.length} / ${allTowerCount}`} color="cyan" />
      <DevButton
        icon={<TowerIcon className="w-3.5 h-3.5" />}
        label={u.unlockAllTowers}
        onClick={unlockAllTowers}
        variant="primary"
        disabled={unlockedTowers.length === allTowerCount}
      />
      <DevButton
        icon={<TrashIcon className="w-3.5 h-3.5" />}
        label={u.resetTowerUnlock}
        onClick={lockAllButBasic}
        variant="warning"
      />
      <div className="pt-2 mt-1 border-t border-[var(--cn-line-soft)]">
        <DevButton
          icon={<WarningIcon className="w-3.5 h-3.5" />}
          label={confirmReset ? u.confirmClearStorage : u.clearLocalStorage}
          onClick={wipeLocalStorage}
          variant="danger"
          title={u.clearStorageTitle}
        />
      </div>
      {feedback && (
        <div className="text-[10px] text-[var(--arc-vital)]/90 font-bold tracking-widest uppercase text-center py-1 bg-[rgba(56,224,143,0.12)]  border border-[rgba(56,224,143,0.38)]">
          {feedback}
        </div>
      )}
    </div>
  );
};

// ============================================================
// 主匯出
// ============================================================

export const ToolsSection = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  return (
    <div className="space-y-5">
      <DevGroup label={u.groupPresets} icon={<LightningIcon className="w-3 h-3" />} accent="amber">
        <DevSection
          title={t.dev.secPresets}
          icon={<LightningIcon className="w-4 h-4" />}
          accent="amber"
          keywords={['preset', 'cheat', 'quick', '預設', '作弊', '快捷']}
        >
          <PresetModes />
        </DevSection>
        <DevSection
          title={t.dev.secGameSpeed}
          icon={<LightningIcon className="w-4 h-4" />}
          accent="amber"
          keywords={['speed', 'fast', 'slow', '速度', '倍速']}
        >
          <SpeedControl />
        </DevSection>
      </DevGroup>

      <DevGroup label={u.groupFlowControl} icon={<RefreshIcon className="w-3 h-3" />} accent="rose">
        <DevSection
          title={t.dev.secFlowControl}
          icon={<RefreshIcon className="w-4 h-4" />}
          accent="rose"
          keywords={['pause', 'resume', 'reset', 'menu', '暫停', '重置', '返回', '繼續']}
        >
          <FlowControl />
        </DevSection>
      </DevGroup>

      <DevGroup label={u.groupSceneTest} icon={<EyeIcon className="w-3 h-3" />} accent="purple">
        <DevSection
          title={t.dev.secSceneTest}
          icon={<GearIcon className="w-4 h-4" />}
          accent="purple"
          keywords={['scene', 'test', 'preview', '場景', '測試', '預覽']}
        >
          <SceneTest />
        </DevSection>
        <DevSection
          title={t.dev.secOverlayTest}
          icon={<TrophyIcon className="w-4 h-4" />}
          accent="amber"
          keywords={['overlay', 'victory', 'gameover', 'win', 'lose', '勝利', '失敗', 'overlay']}
        >
          <OverlayTest />
        </DevSection>
        <DevSection
          title={t.dev.secModTest}
          icon={<PaletteIcon className="w-4 h-4" />}
          accent="violet"
          keywords={['mod', 'workshop', 'editor', 'test', '工坊', 'mod', '編輯器']}
        >
          <ModTestSection />
        </DevSection>
      </DevGroup>

      <DevGroup label={u.groupStressTest} icon={<LightningIcon className="w-3 h-3" />} accent="rose">
        <StressTestSection />
      </DevGroup>

      <DevGroup label={u.groupSnapshot} icon={<SaveActionIcon className="w-3 h-3" />} accent="emerald">
        <DevSection
          title={t.dev.secSnapshot}
          icon={<SaveActionIcon className="w-4 h-4" />}
          accent="emerald"
          keywords={['snapshot', 'save', 'load', '快照', '儲存', '載入']}
        >
          <SnapshotControl />
        </DevSection>
        <DevSection
          title={t.dev.secStateExport}
          icon={<ClipboardIcon className="w-4 h-4" />}
          accent="cyan"
          keywords={['export', 'json', 'copy', 'clipboard', '匯出', '複製', '剪貼']}
        >
          <StateExport />
        </DevSection>
      </DevGroup>

      <DevGroup label={u.groupAdvanced} icon={<BrainIcon className="w-3 h-3" />} accent="purple">
        <DevSection
          title={t.dev.secTalent}
          icon={<BrainIcon className="w-4 h-4" />}
          accent="purple"
          keywords={['talent', 'tree', 'skill', '天賦', '技能']}
        >
          <TalentControl />
        </DevSection>
        <DevSection
          title={t.dev.secShopCoins}
          icon={<CoinIcon className="w-4 h-4" />}
          accent="amber"
          keywords={['shop', 'coin', 'gold', 'currency', '商店', '金幣']}
        >
          <ShopControl />
        </DevSection>
        <DevSection
          title={t.dev.secPersistence}
          icon={<FolderIcon className="w-4 h-4" />}
          accent="rose"
          keywords={['unlock', 'persistence', 'localstorage', 'tower', '解鎖', '塔', '存檔']}
        >
          <PersistenceControl />
        </DevSection>
      </DevGroup>
    </div>
  );
};
