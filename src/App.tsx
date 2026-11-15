import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { FADE_OUT, SPRING_SOFT } from '@/utils/motionTokens';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useDevStore } from '@/store/devStore';
import { PATHS } from '@/data/gameData';
import { useSkinStore } from '@/store/skinStore';
import { useAchievementStore } from '@/store/achievementStore';
import { ALL_SKINS } from '@/data/skinData';
import { applyTheme } from '@/services/themeService';
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

// 主選單也走 lazy：它連同 menu 專屬資料（挑戰清單、MenuHomeHero…）約 100 KB，
// 但 App 已經有 <Suspense>，多一次本地 chunk 讀取對桌面程式沒有體感成本（TD-24）。
const MainMenu = lazy(() => import('@/components/scenes/MainMenu'));

const PathSelection = lazy(() => import('@/components/scenes/PathSelection'));
const Game = lazy(() => import('@/components/scenes/GameScene'));
const Settings = lazy(() => import('@/components/scenes/Settings'));
const Tutorial = lazy(() => import('@/components/scenes/Tutorial'));
const Encyclopedia = lazy(() => import('@/components/scenes/Encyclopedia'));
const Changelog = lazy(() => import('@/components/scenes/Changelog'));
const Workshop = lazy(() => import('@/components/scenes/Workshop'));
const Achievements = lazy(() => import('@/components/scenes/Achievements'));
const Skins = lazy(() => import('@/components/scenes/Skins'));
const Shop = lazy(() => import('@/components/scenes/Shop'));

const TalentTree = lazy(() => import('@/components/scenes/TalentTree'));
const Replay = lazy(() => import('@/components/scenes/Replay'));
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
  workshop: Workshop,
  achievements: Achievements,
  skins: Skins,
  shop: Shop,
  // 舊的 Mod 編輯器／管理器／地圖編輯器已由新工坊取代；保留場景 id 以免舊連結斷掉
  modEditor: Workshop,
  modManager: Workshop,
  mapEditor: Workshop,
  talentTree: TalentTree,
  replay: Replay,
  statistics: Statistics,
  gameOver: GameOver,
  victory: Victory,
};

function App() {
  const scene = useGameStore((state) => state.scene);
  const isPaused = useGameStore((state) => state.isPaused);
  const animationsEnabled = useSettingsStore((s) => s.visual.animationsEnabled);
  const themeId = useSettingsStore((s) => s.themeId);
  const testScene = useDevStore((state) => state.testScene);

  useEffect(() => {
    document.documentElement.classList.toggle('no-anim', !animationsEnabled);
  }, [animationsEnabled]);

  // 主題唯一的 DOM 寫入點（色票 → html 行內 CSS 變數 + data-theme-mode）
  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  // 開發用：?scene=xxx 或 #<scene> 直接跳場景（僅 dev 生效）
  //
  // hash 形式是給視覺驗證工具用的：同一分頁改 hash 就能換場景，
  // 不必重新載入（Vite dev 對原始碼送 no-cache，每次重載要抓上千個模組，單頁 4–5 秒）。
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    // 視覺驗證鉤子：讓截圖腳本可以真的開波／放塔，而不是只拍空盤
    Reflect.set(window, '__guaguaStore', useGameStore);
    const apply = () => {
      const target =
        window.location.hash.replace(/^#/, '') ||
        new URLSearchParams(window.location.search).get('scene');
      if (!target) return;
      useGameStore.getState().setScene(target as GameScene);
      useDevStore.getState().setTestScene(null);
      // 視覺驗證／除錯：直跳 game 時若還沒有對局，就開一局，
      // 否則 canvas 沒有地圖，截圖只會拍到一張空紙（過去的驗證一直在驗空畫面）。
      if (target === 'game' && useGameStore.getState().towers.length === 0) {
        void useGameStore.getState().startGame(Object.keys(PATHS)[0], 'normal', false, 15);
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
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

  // dev-only 預覽：?preview=loading 直接渲染載入畫面，方便截圖驗證（正式版不會走到這裡）
  if (
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get('preview') === 'loading'
  ) {
    return <Loading progress={42} />;
  }

  return (
    <MotionConfig reducedMotion={animationsEnabled ? 'never' : 'always'}>
      <div className="w-full h-full overflow-hidden no-select">
        {/* 場景轉場：所有 19 個場景共用同一套入退場，不再硬切 */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeScene ?? 'mainMenu'}
            className="h-full w-full"
            initial={{ opacity: 0, y: 10, scale: 0.996 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.998, transition: FADE_OUT }}
            transition={SPRING_SOFT}
          >
            <Suspense fallback={<Loading />}>
              <Scene />
            </Suspense>
          </motion.div>
        </AnimatePresence>
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
