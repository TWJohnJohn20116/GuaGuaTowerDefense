import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { EnemyType, GameScene, TowerType } from '@/types/game';
import { setPerfEnabled } from '@/utils/perfMonitor';

// 已移除 testOverlay：勝利與失敗皆為獨立場景，請使用 testScene 機制

// TD-09：場景清單的唯一真相是 types/game.ts 的 GameScene。
// 這裡只做別名，不要手抄一份清單——新增場景漏改會讓 Dev 面板的測試清單少一個。
type SceneName = GameScene;

interface DevState {
  // ============================================================
  // 全域作弊
  // ============================================================
  infiniteMoney: boolean;
  infiniteHealth: boolean;
  godMode: boolean;

  // ============================================================
  // 塔修飾器
  // ============================================================
  maxTowerLevel: boolean;
  freeUpgrades: boolean;

  // ============================================================
  // 敵人生成器
  // ============================================================
  spawnEnemyType: EnemyType;
  spawnEnemyCount: number;

  // ============================================================
  // 塔生成器
  // ============================================================
  spawnTowerType: TowerType;
  spawnTowerCount: number;

  // ============================================================
  // 視覺除錯
  // ============================================================
  showDebugInfo: boolean;
  showFPS: boolean;
  showGrid: boolean;
  showPath: boolean;
  showHitboxes: boolean;
  showPerfMonitor: boolean;
  forceShowAllRanges: boolean;

  // ============================================================
  // 場景測試（勝利與失敗皆為獨立場景，使用此機制預覽）
  // ============================================================
  testScene: SceneName | null;

  // ============================================================
  // 壓力測試（一鍵灌入 10,000 敵人 + 100 塔）
  // ============================================================
  /** 壓測 HUD 是否顯示 */
  stressTestActive: boolean;
  /** 上次執行壓測的結果快照，給面板顯示 */
  stressTestLastRun: {
    enemies: number;
    towers: number;
    at: number;
    reason?: 'not-in-game' | 'no-path';
  } | null;
  setStressTestActive: (active: boolean) => void;
  setStressTestLastRun: (run: NonNullable<DevState['stressTestLastRun']>) => void;

  // ============================================================
  // 動作 — 切換
  // ============================================================
  toggleInfiniteMoney: () => void;
  toggleInfiniteHealth: () => void;
  toggleGodMode: () => void;
  toggleMaxTowerLevel: () => void;
  toggleFreeUpgrades: () => void;
  toggleDebugInfo: () => void;
  toggleFPS: () => void;
  toggleGrid: () => void;
  togglePath: () => void;
  toggleHitboxes: () => void;
  togglePerfMonitor: () => void;
  toggleForceShowAllRanges: () => void;

  // ============================================================
  // 動作 — 設置
  // ============================================================
  setSpawnEnemyType: (type: EnemyType) => void;
  setSpawnEnemyCount: (count: number) => void;
  setSpawnTowerType: (type: TowerType) => void;
  setSpawnTowerCount: (count: number) => void;
  setTestScene: (scene: SceneName | null) => void;

  // ============================================================
  // 動作 — 重置全部 dev 設定回預設
  // ============================================================
  resetDevState: () => void;
}

const DEFAULT_STATE = {
  infiniteMoney: false,
  infiniteHealth: false,
  godMode: false,

  maxTowerLevel: false,
  freeUpgrades: false,

  spawnEnemyType: 'normal' as EnemyType,
  spawnEnemyCount: 1,

  spawnTowerType: 'basic' as TowerType,
  spawnTowerCount: 1,

  showDebugInfo: false,
  showFPS: false,
  showGrid: false,
  showPath: false,
  showHitboxes: false,
  showPerfMonitor: false,
  forceShowAllRanges: false,

  testScene: null,

  stressTestActive: false,
  stressTestLastRun: null,
};

export const useDevStore = create<DevState>()(
  devtools(
    (set) => ({
      ...DEFAULT_STATE,

      toggleInfiniteMoney: () => set((s) => ({ infiniteMoney: !s.infiniteMoney })),
      toggleInfiniteHealth: () => set((s) => ({ infiniteHealth: !s.infiniteHealth })),
      toggleGodMode: () => set((s) => ({ godMode: !s.godMode })),
      toggleMaxTowerLevel: () => set((s) => ({ maxTowerLevel: !s.maxTowerLevel })),
      toggleFreeUpgrades: () => set((s) => ({ freeUpgrades: !s.freeUpgrades })),
      toggleDebugInfo: () => set((s) => ({ showDebugInfo: !s.showDebugInfo })),
      toggleFPS: () => set((s) => ({ showFPS: !s.showFPS })),
      toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
      togglePath: () => set((s) => ({ showPath: !s.showPath })),
      toggleHitboxes: () => set((s) => ({ showHitboxes: !s.showHitboxes })),
      togglePerfMonitor: () => set((s) => {
        const next = !s.showPerfMonitor;
        setPerfEnabled(next);
        return { showPerfMonitor: next };
      }),
      toggleForceShowAllRanges: () => set((s) => ({ forceShowAllRanges: !s.forceShowAllRanges })),

      setSpawnEnemyType: (type) => set({ spawnEnemyType: type }),
      setSpawnEnemyCount: (count) => set({ spawnEnemyCount: Math.max(1, Math.min(200, count)) }),
      setSpawnTowerType: (type) => set({ spawnTowerType: type }),
      setSpawnTowerCount: (count) => set({ spawnTowerCount: Math.max(1, Math.min(100, count)) }),
      setTestScene: (scene) => set({ testScene: scene }),

      setStressTestActive: (active) => set({ stressTestActive: active }),
      setStressTestLastRun: (run) => set({ stressTestLastRun: run }),

      resetDevState: () => {
        setPerfEnabled(false);
        set(DEFAULT_STATE);
      },
    }),
    { name: 'devStore' }
  )
);

// 暴露給 legacy 引用 window.__DEV_STORE__
if (typeof window !== 'undefined') {
  (window as unknown as { __DEV_STORE__: typeof useDevStore }).__DEV_STORE__ = useDevStore;
}
