import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { MotionConfig } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useDevStore } from '@/store/devStore';
import { useSkinStore } from '@/store/skinStore';
import { useAchievementStore } from '@/store/achievementStore';
import { ALL_SKINS } from '@/data/skinData';
import { getDefaultSkinId } from '@/data/skinData';
import { initAudio } from '@/services/audioService';
import { initMusic, syncMusic } from '@/services/musicService';
import { prefetchSelectedMenuAlbum } from '@/services/music/menuMusicPlayback';
import type { GameScene, TowerType } from '@/types/game';
import Loading from '@/components/ui/Loading';
import AchievementNotification from '@/components/ui/AchievementNotification';
import UpdateNotification from '@/components/ui/UpdateNotification';

// 調適面板 lazy 載入：它連同 dev-panel/* 與 CustomSelect 約 100 KB，
// 但只有玩家真的按「調適」才會用到，不該擋在首屏。
// 另外**不要**從 '@/components/ui' barrel 匯入——那條 barrel 會把整個 UI 目錄
// （含沒用到的元件）一起拉進 entry chunk（TD-24）。
const DevPanel = lazy(() =>
  import('@/components/ui/DevPanel').then((m) => ({ default: m.DevPanel })),
);

// 主選單也走 lazy：它連同 menu 專屬資料（挑戰清單、MenuHomeRail…）約 100 KB，
// 但 App 已經有 <Suspense>，多一次本地 chunk 讀取對桌面程式沒有體感成本（TD-24）。
const MainMenu = lazy(() => import('@/components/scenes/MainMenu'));

const PathSelection = lazy(() => import('@/components/scenes/PathSelection'));
const Game = lazy(() => import('@/components/scenes/GameScene'));
const Settings = lazy(() => import('@/components/scenes/Settings'));
const Tutorial = lazy(() => import('@/components/scenes/Tutorial'));
const Encyclopedia = lazy(() => import('@/components/scenes/Encyclopedia'));
const Changelog = lazy(() => import('@/components/scenes/Changelog'));
const CreativeWorkshop = lazy(() => import('@/components/scenes/CreativeWorkshop'));
const Achievements = lazy(() => import('@/components/scenes/Achievements'));
const DailyChallenge = lazy(() => import('@/components/scenes/DailyChallenge'));
const MutatorChallenge = lazy(() => import('@/components/scenes/MutatorChallenge'));
const Skins = lazy(() => import('@/components/scenes/Skins'));
const Shop = lazy(() => import('@/components/scenes/Shop'));
const ModEditor = lazy(() => import('@/components/scenes/ModEditor'));
const ModManager = lazy(() => import('@/components/scenes/ModManager'));
const MapEditor = lazy(() => import('@/components/scenes/MapEditor'));
const TalentTree = lazy(() => import('@/components/scenes/TalentTree'));
const Replay = lazy(() => import('@/components/scenes/Replay'));
const Memorial = lazy(() => import('@/components/scenes/Memorial'));
const Statistics = lazy(() => import('@/components/scenes/Statistics'));
const GameOver = lazy(() => import('@/components/scenes/GameOver'));
const Victory = lazy(() => import('@/components/scenes/Victory'));

/**
 * 場景分派表（唯一真相來源）
 *
 * 原本 App.tsx 內有兩份幾乎相同的 switch：正式場景一份、Dev 場景測試一份，
 * 而且第二份漏了 modEditor / modManager / mapEditor，導致 Dev 面板測不到編輯器。
 * 現在兩邊共用這張表，新增場景只會有一個地方要改。
 */
const SCENE_COMPONENTS: Record<GameScene, ComponentType> = {
  mainMenu: MainMenu,
  pathSelection: PathSelection,
  game: Game,
  settings: Settings,
  tutorial: Tutorial,
  encyclopedia: Encyclopedia,
  changelog: Changelog,
  workshop: CreativeWorkshop,
  achievements: Achievements,
  dailyChallenge: DailyChallenge,
  mutatorChallenge: MutatorChallenge,
  skins: Skins,
  shop: Shop,
  modEditor: ModEditor,
  modManager: ModManager,
  mapEditor: MapEditor,
  talentTree: TalentTree,
  replay: Replay,
  memorial: Memorial,
  statistics: Statistics,
  gameOver: GameOver,
  victory: Victory,
};

function App() {
  const scene = useGameStore((state) => state.scene);
  const isPaused = useGameStore((state) => state.isPaused);
  const animationsEnabled = useSettingsStore((s) => s.visual.animationsEnabled);
  const testScene = useDevStore((state) => state.testScene);

  useEffect(() => {
    document.documentElement.classList.toggle('no-anim', !animationsEnabled);
  }, [animationsEnabled]);

  // 開發用：?scene=xxx 直接跳場景，方便逐畫面驗收（僅 dev 生效）
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const target = new URLSearchParams(window.location.search).get('scene');
    if (!target) return;
    useGameStore.getState().setScene(target as GameScene);
    useDevStore.getState().setTestScene(null);
  }, []);

  // 初始化音效 / BGM 引擎（含 API 背景預取）
  useEffect(() => {
    initAudio();
    initMusic();
    void prefetchSelectedMenuAlbum();
  }, []);

  // 場景或暫停狀態變化時同步 BGM
  useEffect(() => {
    syncMusic(scene);
  }, [scene, isPaused]);

  useEffect(() => {
    const { unlockedSkins, equippedSkins } = useSkinStore.getState();
    const totalSkins = ALL_SKINS.filter((s) => !s.hidden).length;
    let nonDefaultEquipped = 0;
    Object.entries(equippedSkins).forEach(([towerType, skinId]) => {
      const defaultId = getDefaultSkinId(towerType as TowerType);
      if (skinId && skinId !== defaultId) nonDefaultEquipped++;
    });
    useAchievementStore.getState().syncSkinStats(
      unlockedSkins.length,
      nonDefaultEquipped,
      totalSkins,
    );
    useAchievementStore.getState().checkTimeBasedAchievements();
  }, []);

  const activeScene: GameScene | null = testScene ?? scene;
  const Scene = activeScene ? SCENE_COMPONENTS[activeScene] ?? MainMenu : MainMenu;

  return (
    <MotionConfig reducedMotion={animationsEnabled ? 'never' : 'always'}>
      <div className="w-full h-full overflow-hidden no-select">
        <Suspense fallback={<Loading />}>
          <Scene />
        </Suspense>
        <AchievementNotification />
        <UpdateNotification />
        {/* 調適介面：左下角「調適」按鈕，任何場景都可打開（lazy，載入完成才出現） */}
        <Suspense fallback={null}>
          <DevPanel />
        </Suspense>
      </div>
    </MotionConfig>
  );
}

export default App;
