import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_THEME_ID, isThemeId, type ThemeId } from '@/data/themeData';

type VisualSettingKey = 'animationsEnabled' | 'showTowerRange' | 'screenShake' | 'showDamageNumbers' | 'showHealthBars' | 'bloomEnabled';
type ShadowQuality = 'off' | 'low' | 'medium' | 'high';
type ParticleDensity = 'low' | 'medium' | 'high';
type GameplaySettingKey = 'autoStartWave' | 'showTips' | 'quickPlaceDefault' | 'confirmSell' | 'buildWhilePaused' | 'showEnemyPath' | 'autoUpgradeTowers' | 'showDevButton';
type AudioSettingKey = 'sfxAttack' | 'sfxBuild' | 'sfxDeath' | 'sfxUI';
type ControlsSettingKey = 'edgePanning' | 'mouseSensitivity' | 'zoomSpeed';

export type SfxType = 'attack' | 'build' | 'death' | 'ui';

// ============ HUD 佈局設定 ============
export type HudHorizontalPosition = 'left' | 'center' | 'right';
export type HudVerticalPosition = 'top' | 'middle' | 'bottom';
export type HudSidePosition = 'left' | 'right';
export type HudUiScale = 'compact' | 'normal' | 'large';
export type HudCornerStyle = 'pill' | 'rounded' | 'square';
export type HudBlurIntensity = 'heavy' | 'medium' | 'light' | 'none';
export type HudAccentColor = 'default' | 'cyan' | 'purple' | 'amber' | 'rose' | 'emerald';
export type TowerListColumns = 1 | 2 | 3;
export type TowerButtonSize = 'small' | 'medium' | 'large';
export type TowerDisplayMode = 'compact' | 'normal' | 'detailed';
export type TowerListSpacing = 'tight' | 'normal' | 'wide';

// 波次橫幅尺寸（影響字級與內距）
export type WaveBannerSize = 'compact' | 'normal' | 'large';

export interface HudLayoutState {
  /** 頂部資訊列水平位置 */
  statsBar: HudHorizontalPosition;
  /** 塔列表側邊欄左 / 右 */
  towerPanel: HudSidePosition;
  /** 底部控制條水平位置 */
  bottomControls: HudHorizontalPosition;
  /** UI 縮放 */
  uiScale: HudUiScale;
  /** HUD 不透明度（0.4 ~ 1.0） */
  opacity: number;
  // ----- 顯示開關 -----
  /** 顯示頂部資訊列 */
  showStatsBar: boolean;
  /** 顯示塔列表側邊欄 */
  showTowerPanel: boolean;
  /** 顯示底部控制條 */
  showBottomControls: boolean;
  /** 顯示右側戰場資訊欄（波次進度、在場單位、選中塔） */
  showIntelPanel: boolean;
  // ----- 外觀風格 -----
  /** 圓角風格：pill / rounded / square */
  cornerStyle: HudCornerStyle;
  /** 模糊強度：heavy / medium / light / none */
  blurIntensity: HudBlurIntensity;
  /** 點綴顏色（影響邊框與陰影） */
  accentColor: HudAccentColor;
  // ----- 塔列表排版 -----
  /** 塔列表欄位數量 1 / 2 / 3 */
  towerListColumns: TowerListColumns;
  /** 塔按鈕大小 */
  towerButtonSize: TowerButtonSize;
  /** 塔按鈕資訊密度：compact 只圖示 / normal 圖示+名稱+價格 / detailed 多顯示傷害 */
  towerDisplayMode: TowerDisplayMode;
  /** 塔列表間距 */
  towerListSpacing: TowerListSpacing;
  /** 顯示分類標籤（基本 / 特殊 / 模組） */
  showTowerCategories: boolean;
  /** 顯示玩家技能列 */
  showTowerSkillBar: boolean;
  /** 顯示底部工具列（快速放置、戰術視圖、復原、重做、AI、進階） */
  showTowerToolbar: boolean;
  // ----- 波次橫幅（WaveBanner） -----
  /** 顯示波次開始大標題 */
  showWaveBanner: boolean;
  /** 波次橫幅垂直位置：top / middle / bottom */
  waveBannerVertical: HudVerticalPosition;
  /** 波次橫幅水平位置：left / center / right */
  waveBannerHorizontal: HudHorizontalPosition;
  /** 波次橫幅尺寸：compact / normal / large */
  waveBannerSize: WaveBannerSize;
}

export const DEFAULT_HUD_LAYOUT: HudLayoutState = {
  statsBar: 'center',
  towerPanel: 'left',
  bottomControls: 'center',
  uiScale: 'normal',
  opacity: 1,
  showStatsBar: true,
  showTowerPanel: true,
  showBottomControls: true,
  showIntelPanel: true,
  cornerStyle: 'pill',
  blurIntensity: 'heavy',
  accentColor: 'default',
  towerListColumns: 1,
  towerButtonSize: 'small',
  towerDisplayMode: 'normal',
  towerListSpacing: 'normal',
  showTowerCategories: true,
  showTowerSkillBar: true,
  showTowerToolbar: true,
  showWaveBanner: true,
  waveBannerVertical: 'top',
  waveBannerHorizontal: 'center',
  waveBannerSize: 'normal',
};

export interface SettingsState {
  visual: {
    animationsEnabled: boolean;
    showTowerRange: boolean;
    screenShake: boolean;
    showDamageNumbers: boolean;
    showHealthBars: boolean;
    /** 進入遊戲時預設使用 3D 視圖 */
    prefer3DView: boolean;
    /** 3D Bloom 光暈效果 */
    bloomEnabled: boolean;
    /** 3D 陰影品質 */
    shadowQuality: ShadowQuality;
    /** 3D 粒子密度 */
    particleDensity: ParticleDensity;
  };
  gameplay: {
    autoStartWave: boolean;
    showTips: boolean;
    quickPlaceDefault: boolean;
    confirmSell: boolean;
    buildWhilePaused: boolean;
    showEnemyPath: boolean;
    autoUpgradeTowers: boolean;
    showDevButton: boolean;
  };
  audio: {
    sfxAttack: boolean;
    sfxBuild: boolean;
    sfxDeath: boolean;
    sfxUI: boolean;
  };
  controls: {
    edgePanning: boolean;
    mouseSensitivity: number;
    zoomSpeed: number;
  };
  hudLayout: HudLayoutState;
  /** 主題色：只存 id，色票本身在 src/data/themeData.ts */
  themeId: ThemeId;
  /** 切換主題（實際套用由 App 的 effect 呼叫 themeService） */
  setTheme: (id: ThemeId) => void;
  toggleVisual: (key: VisualSettingKey) => void;
  toggleGameplay: (key: GameplaySettingKey) => void;
  toggleAudio: (key: AudioSettingKey) => void;
  toggleControls: (key: Extract<ControlsSettingKey, 'edgePanning'>) => void;
  setControlValue: (key: Extract<ControlsSettingKey, 'mouseSensitivity' | 'zoomSpeed'>, value: number) => void;
  setVisualValue: <K extends 'shadowQuality' | 'particleDensity'>(key: K, value: SettingsState['visual'][K]) => void;
  setHudLayout: <K extends keyof HudLayoutState>(key: K, value: HudLayoutState[K]) => void;
  resetHudLayout: () => void;
  setAll: (partial: Partial<Pick<SettingsState, 'themeId' | 'visual' | 'gameplay' | 'audio' | 'controls' | 'hudLayout'>>) => void;
  /** 重置全部設定回預設值 */
  resetAll: () => void;
}

const defaultState = {
  visual: {
    animationsEnabled: true,
    showTowerRange: true,
    screenShake: true,
    showDamageNumbers: true,
    showHealthBars: true,
    prefer3DView: false,
    bloomEnabled: true,
    shadowQuality: 'medium' as ShadowQuality,
    particleDensity: 'medium' as ParticleDensity,
  },
  gameplay: {
    autoStartWave: true,
    showTips: true,
    quickPlaceDefault: false,
    confirmSell: false,
    buildWhilePaused: true,
    showEnemyPath: true,
    autoUpgradeTowers: false,
    showDevButton: true,
  },
  audio: {
    sfxAttack: true,
    sfxBuild: true,
    sfxDeath: true,
    sfxUI: true,
  },
  controls: {
    edgePanning: true,
    mouseSensitivity: 1,
    zoomSpeed: 1,
  },
  hudLayout: { ...DEFAULT_HUD_LAYOUT },
  themeId: DEFAULT_THEME_ID as ThemeId,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultState,
      setTheme: (id) =>
        set(() => ({
          themeId: isThemeId(id) ? id : DEFAULT_THEME_ID,
        })),
      toggleVisual: (key) =>
        set((state) => ({
          visual: { ...state.visual, [key]: !state.visual[key] },
        })),
      toggleGameplay: (key) =>
        set((state) => ({
          gameplay: { ...state.gameplay, [key]: !state.gameplay[key] },
        })),
      toggleAudio: (key) =>
        set((state) => ({
          audio: { ...state.audio, [key]: !state.audio[key] },
        })),
      toggleControls: (key) =>
        set((state) => ({
          controls: { ...state.controls, [key]: !state.controls[key] },
        })),
      setControlValue: (key, value) =>
        set((state) => ({
          controls: { ...state.controls, [key]: value },
        })),
      setVisualValue: (key, value) =>
        set((state) => ({
          visual: { ...state.visual, [key]: value },
        })),
      setHudLayout: (key, value) =>
        set((state) => ({
          hudLayout: { ...state.hudLayout, [key]: value },
        })),
      resetHudLayout: () =>
        set(() => ({
          hudLayout: { ...DEFAULT_HUD_LAYOUT },
        })),
      setAll: (partial) =>
        set((state) => ({
          themeId: isThemeId(partial.themeId) ? partial.themeId : state.themeId,
          visual: { ...state.visual, ...(partial.visual || {}) },
          gameplay: { ...state.gameplay, ...(partial.gameplay || {}) },
          audio: { ...state.audio, ...(partial.audio || {}) },
          controls: { ...state.controls, ...(partial.controls || {}) },
          hudLayout: { ...state.hudLayout, ...(partial.hudLayout || {}) },
        })),
      resetAll: () =>
        set(() => ({
          visual: { ...defaultState.visual },
          gameplay: { ...defaultState.gameplay },
          audio: { ...defaultState.audio },
          controls: { ...defaultState.controls },
          hudLayout: { ...DEFAULT_HUD_LAYOUT },
          themeId: DEFAULT_THEME_ID,
        })),
    }),
    {
      name: 'guagua-settings',
      partialize: (state) => ({
        visual: state.visual,
        gameplay: state.gameplay,
        audio: state.audio,
        controls: state.controls,
        hudLayout: state.hudLayout,
        themeId: state.themeId,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<SettingsState>;
        return {
          ...currentState,
          visual: { ...defaultState.visual, ...(persisted.visual || {}) },
          gameplay: { ...defaultState.gameplay, ...(persisted.gameplay || {}) },
          audio: { ...defaultState.audio, ...(persisted.audio || {}) },
          controls: { ...defaultState.controls, ...(persisted.controls || {}) },
          hudLayout: { ...DEFAULT_HUD_LAYOUT, ...(persisted.hudLayout || {}) },
          themeId: isThemeId(persisted.themeId) ? persisted.themeId : DEFAULT_THEME_ID,
        };
      },
    }
  )
);

export const canPlaySfx = (type: SfxType): boolean => {
  const { audio } = useSettingsStore.getState();
  switch (type) {
    case 'attack':
      return audio.sfxAttack;
    case 'build':
      return audio.sfxBuild;
    case 'death':
      return audio.sfxDeath;
    case 'ui':
      return audio.sfxUI;
    default:
      return true;
  }
};

