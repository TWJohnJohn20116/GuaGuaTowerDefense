// 新工坊（Studio）型別：專案／關卡／六類可重用資產／勝負條件／規則／編譯結果。
//
// 慣例：
// - 跨物件引用一律走 AssetRef（assetId + version），專案與關卡都不內嵌資產本體。
// - 這是純型別檔，不得出現執行期程式碼（AGENTS §4.1）。
// - 對外名稱由 lead 鎖定：WorkshopProject / WorkshopLevel / WorkshopAsset /
//   WorkshopAssetKind / AssetRef / WinCondition / WorkshopRuleSet。

import type {
  CustomEnemyData,
  CustomMapData,
  CustomTowerData,
  EnemyType,
  Mod,
  TowerType,
  WaveConfig,
} from './game';
import type { ModScriptHook, ModScriptPermission, ModSignature } from './modScript';

// ===== 引用 =====

/** 資產引用：只記 id 與版本，不複製內容（版本不符時編譯器給 warning） */
export interface AssetRef {
  assetId: string;
  version: string;
}

// ===== 資產六類 =====

export type WorkshopAssetKind = 'tower' | 'enemy' | 'map' | 'ruleSet' | 'script' | 'art';

interface WorkshopAssetMeta {
  id: string;
  kind: WorkshopAssetKind;
  /** 語意化版本字串（'1.0.0'）；AssetRef.version 對比的就是這個值 */
  version: string;
  name: string;
  /** 各 kind 的具體內容（見下方 WorkshopTowerData 等）；基底型別刻意開成 unknown */
  data: unknown;
  description?: string;
  /** 本資產直接依賴的其他資產 id（刪除時的阻擋依據之一） */
  dependsOn?: string[];
  tags?: string[];
  createdAt?: number;
  /** 最後修改時間（由編輯端寫入；store 原樣保存） */
  updatedAt?: number;
}

/** 塔資產內容：引擎 CustomTowerData 的數值面，去掉 id／modId／name／description */
export interface WorkshopTowerData extends Omit<CustomTowerData, 'id' | 'modId' | 'name' | 'description'> {
  /** 引擎基底塔型（getTowerData 的 key），決定預設行為與 2D／3D 外觀 */
  baseType: TowerType;
}

/** 敵人資產內容：引擎 CustomEnemyData 的數值面 */
export interface WorkshopEnemyData extends Omit<CustomEnemyData, 'id' | 'modId' | 'name' | 'description'> {
  baseType: EnemyType;
}

interface WorkshopGridSize {
  cols: number;
  rows: number;
}

/** 地圖資產內容：路徑／障礙格／分類，去掉 id／modId／name／description */
export interface WorkshopMapData extends Omit<CustomMapData, 'id' | 'modId' | 'name' | 'description'> {
  grid: WorkshopGridSize;
}

export type WorkshopRuleTrigger =
  | 'waveStart'
  | 'waveComplete'
  | 'bossSpawn'
  | 'bossKilled'
  | 'killCount'
  | 'moneyChanged'
  | 'baseDamaged';

export type WorkshopRuleActionKind =
  | 'addMoney'
  | 'enemyHealthScale'
  | 'enemySpeedScale'
  | 'waveRewardBonus'
  | 'grantTower'
  | 'runScript';

export interface WorkshopRuleCondition {
  trigger: WorkshopRuleTrigger;
  /** killCount／moneyChanged／baseDamaged 的門檻值 */
  threshold?: number;
}

export interface WorkshopRuleAction {
  kind: WorkshopRuleActionKind;
  value?: number;
  /** runScript：引用腳本模組資產 */
  scriptRef?: AssetRef;
  /** runScript 的內嵌 JS（與腳本同一 Worker 沙箱、同一權限模型） */
  inlineCode?: string;
}

export interface WorkshopRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: WorkshopRuleCondition;
  actions: WorkshopRuleAction[];
}

/** 規則集資產內容：可視化規則表的資料面（節點圖另存於腳本模組） */
export interface WorkshopRuleSet {
  rules: WorkshopRule[];
}

export type WorkshopScriptNodeKind = 'trigger' | 'condition' | 'action' | 'js';

export interface WorkshopScriptNode {
  id: string;
  kind: WorkshopScriptNodeKind;
  /** trigger／condition／action 的動作代號（白名單字串，非程式碼） */
  op: string;
  params: Record<string, string | number | boolean>;
  /** kind === 'js' 時為內嵌程式碼；靜態分析必須標記為不可分析 */
  inlineCode?: string;
  next: string[];
  position: { x: number; y: number };
}

export interface WorkshopScriptGraph {
  nodes: WorkshopScriptNode[];
  entryNodeIds: string[];
}

/** 靜態分析結論：含 JS 節點時 analyzable = false，UI 必須顯示「無法靜態分析」 */
export interface WorkshopStaticAnalysis {
  analyzable: boolean;
  inlineJsNodeIds: string[];
  nodeCount: number;
  hookCount: number;
}

/** 腳本模組資產內容：與 Mod 的 CustomScriptData 同語言、同沙箱、同權限模型 */
export interface WorkshopScriptData {
  code: string;
  hooks: ModScriptHook[];
  permissions: ModScriptPermission[];
  throttleMs?: number;
  enabled?: boolean;
  /** 節點圖來源（存在＝視覺化優先，code 是節點圖編譯產物） */
  graph?: WorkshopScriptGraph;
}

type WorkshopArtKind = 'icon' | 'thumbnail' | 'sound' | 'sprite' | 'model';

/** 美術資產內容：內嵌 data URL（.ggmod 封裝時直接放進 JSON 容器） */
export interface WorkshopArtData {
  artKind: WorkshopArtKind;
  mime: string;
  payload: string;
  width?: number;
  height?: number;
  durationMs?: number;
}

export interface WorkshopTowerAsset extends WorkshopAssetMeta {
  kind: 'tower';
  data: WorkshopTowerData;
}

export interface WorkshopEnemyAsset extends WorkshopAssetMeta {
  kind: 'enemy';
  data: WorkshopEnemyData;
}

export interface WorkshopMapAsset extends WorkshopAssetMeta {
  kind: 'map';
  data: WorkshopMapData;
}

export interface WorkshopRuleSetAsset extends WorkshopAssetMeta {
  kind: 'ruleSet';
  data: WorkshopRuleSet;
}

export interface WorkshopScriptAsset extends WorkshopAssetMeta {
  kind: 'script';
  data: WorkshopScriptData;
}

export interface WorkshopArtAsset extends WorkshopAssetMeta {
  kind: 'art';
  data: WorkshopArtData;
}

export type WorkshopAsset =
  | WorkshopTowerAsset
  | WorkshopEnemyAsset
  | WorkshopMapAsset
  | WorkshopRuleSetAsset
  | WorkshopScriptAsset
  | WorkshopArtAsset;

// ===== 勝負條件 =====

/** 自訂計分規則：欄位＋權重（負權重＝扣分） */
export interface WorkshopScoreRule {
  id: string;
  label: string;
  weight: number;
}

/**
 * 勝負條件。全部欄位可選；缺省＝該條件不啟用。
 * baseHealth／initialMoney 屬「關卡初始資源的覆寫值」：關卡 initial 為基底，
 * 這裡有值時以此為準（編譯器 resolve 後寫進編譯設定）。
 */
export interface WinCondition {
  /** 守住 N 波 */
  surviveWaves?: number;
  /** 守住 N 秒 */
  surviveSeconds?: number;
  /** 基地生命值 */
  baseHealth?: number;
  /** 初始金錢 */
  initialMoney?: number;
  /** 波次間隔（秒） */
  waveIntervalSeconds?: number;
  /** Boss 擊殺 */
  bossKillRequired?: boolean;
  /** 自訂失敗：漏怪數 > maxLeaks */
  maxLeaks?: number;
  /** 自訂失敗：超時（秒） */
  timeLimitSeconds?: number;
  /** 自訂計分 */
  scoreRules?: WorkshopScoreRule[];
}

export type WorkshopOutcome = 'ongoing' | 'victory' | 'defeat';

export interface WorkshopMatchSnapshot {
  wavesSurvived: number;
  secondsElapsed: number;
  baseHealth: number;
  leaks: number;
  bossKilled: boolean;
  score?: number;
}

// ===== 關卡與專案 =====

/** 關卡層規則覆寫的一筆（ruleOverrides 的合法成員；編譯器用型別守衛讀取） */
export interface WorkshopRuleOverride {
  /** 覆寫哪條規則（依 id）；null／缺省＝新增一條 */
  ruleId?: string | null;
  /** 覆寫後的規則；null＝刪除該條 */
  rule?: WorkshopRule | null;
}

export interface WorkshopStartingResources {
  money?: number;
  health?: number;
  /** 波次間隔倍率（1＝不變） */
  waveDelayMult?: number;
}

export interface WorkshopLevel {
  id: string;
  name: string;
  /** 以下皆為可選：其他線用最小物件建立關卡時不必補齊，讀取端一律給預設 */
  description?: string;
  /** 地圖資產 id（編譯時查 assets 解析成 CustomMapData；版本快照走發佈階段） */
  mapAssetId?: string | null;
  /** 波次直接用引擎的 WaveConfig；enemies[].type 可為內建 EnemyType 或敵人資產 id */
  waves: WaveConfig[];
  winConditions: WinCondition;
  /** 關卡覆寫專案層規則表；內容由編譯器的型別守衛解析（不合形狀＝忽略並 warning） */
  ruleOverrides?: unknown[];
  /** 戰役順序：要在哪一關之後才解鎖（null／缺省＝一開始就能玩） */
  requiresLevelId?: string | null;
  startingResources?: WorkshopStartingResources;
  /** 指向本關要用的規則集（缺省／null＝沿用專案層） */
  ruleSetRef?: AssetRef | null;
  /** 空陣列＝沿用專案層全部塔 */
  towerRefs?: AssetRef[];
  scriptRefs?: AssetRef[];
  artRefs?: AssetRef[];
  /** 關卡 BGM：引用音效類美術資產（artKind === 'sound'） */
  bgmArtRef?: AssetRef | null;
  createdAt?: number;
  updatedAt?: number;
}

export type WorkshopLicense =
  | 'all-rights-reserved'
  | 'cc-by-4.0'
  | 'cc-by-sa-4.0'
  | 'cc0-1.0'
  | 'mit';

export interface WorkshopProject {
  id: string;
  name: string;
  description: string;
  /** 縮圖 data URL（空字串＝未設定） */
  thumbnail: string;
  version: string;
  author: string;
  license: WorkshopLicense;
  /** ECDSA P-256 簽章（未簽章時 null） */
  signature: ModSignature | null;
  /** 專案層規則集（關卡可覆寫） */
  ruleSetRef: AssetRef | null;
  /** 專案層勝負條件預設（關卡有值時以關卡為準） */
  winConditions?: WinCondition;
  /** 專案層共用資產（塔／敵人／腳本／美術） */
  assetRefs: AssetRef[];
  levels: WorkshopLevel[];
  createdAt: number;
  updatedAt: number;
}

// ===== 編譯 =====

export type WorkshopCompileWarningCode =
  | 'missingAsset'
  | 'assetVersionMismatch'
  | 'assetKindMismatch'
  | 'duplicateRuntimeId'
  | 'missingMap'
  | 'invalidWaveGroup'
  | 'emptyWaves'
  | 'unsupportedRuleAction'
  | 'duplicateRuleId'
  | 'inlineJsNotAnalyzable';

export interface WorkshopCompileIssue {
  code: WorkshopCompileWarningCode;
  /** i18n key（studio.* 命名空間）；warnings 陣列放的就是這個 */
  key: string;
  levelId?: string;
  assetId?: string;
  params?: Record<string, string | number>;
}

/** 快照＋來源 id：編譯產物對應回工坊資產，發佈時可重建 */
export interface WorkshopAssetProvenance {
  runtimeId: string;
  assetId: string;
  version: string;
  kind: WorkshopAssetKind;
}

export interface WorkshopCompiledLevel {
  id: string;
  name: string;
  /** 編譯後的 CustomMapData id（缺地圖時 null） */
  mapId: string | null;
  /** 編譯後的 CustomWaveData id（沒有波次時 null） */
  waveSetId: string | null;
  initialMoney: number;
  baseHealth: number;
  waveIntervalSeconds: number;
  winConditions: WinCondition;
  /** 編譯後的 CustomTowerData id 白名單（空＝全部） */
  allowedTowerIds: string[];
}

/** Mod 形狀裝不下的資料（勝負條件／初始資源／來源快照）放這裡 */
export interface WorkshopCompiledSettings {
  projectId: string;
  levels: WorkshopCompiledLevel[];
  provenance: WorkshopAssetProvenance[];
}

export interface WorkshopCompileResult {
  mod: Mod;
  /** 去重的 i18n key 清單（可直接餵給 UI） */
  warnings: string[];
  issues: WorkshopCompileIssue[];
  settings: WorkshopCompiledSettings;
}

export interface WorkshopCompileOptions {
  loadOrder?: number;
  enabled?: boolean;
  /** Mod 的 gameVersion 欄位（預設 '1.2.0'；避免編譯器 import services） */
  gameVersion?: string;
}
