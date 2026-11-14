import type { 
  GameScene, Enemy, Tower, Projectile, 
  GridPosition, TowerType, Tile, TargetPriority, KeyAction, KeyBindings,
  TowerData, UpgradePath, GameDifficulty, DifficultyModifiers,
  DamageText, ImpactParticle, DeathAnimation
} from '@/types/game';
import type { PlayerSkillId } from '@/data/playerSkillData';
import type { MutatorRules } from '@/types/mutatorChallenge';
import type { TacticalProtocol } from '@/data/tacticalProtocolData';
import type { StressSpawnResult } from './stressTestActions';

/** 從暫停／遊戲內跳轉百科時帶入的分頁與項目 */
export interface EncyclopediaDeepLink {
  tab: 'enemies' | 'towers' | 'maps' | 'difficulty' | 'effects' | 'skills';
  itemId: string;
}

// 玩家主動技能狀態
export interface PlayerSkillState {
  lastUsedTime: number;  // 上次釋放時間戳 (0 = 從未使用)
  activeUntil: number;   // 持續效果截止時間戳 (0 = 非持續性或已結束)
}

// 主動技能釋放動畫
export interface PlayerSkillAnimation {
  id: string;
  skillId: PlayerSkillId;
  startTime: number;
  duration: number;
  // 閃電鏈彈跳路徑（格座標，依序連線繪製）
  chainPath?: Array<{ x: number; y: number }>;
  // 傳送陷阱：每隻被傳送敵人的起點 / 終點（格座標，繪製雙端傳送門）
  warpJumps?: Array<{ fromX: number; fromY: number; toX: number; toY: number }>;
}

// 本局啟動參數快照：供「再玩一次 / 快速重試」完整復原設定
// （pathName 保存原始入參，戰役關卡為 'chX_lvY'，可正確走戰役分支）
export interface LastStartArgs {
  pathName: string;
  difficulty: GameDifficulty;
  endless: boolean;
  maxWaves: number;
  customModifiers?: DifficultyModifiers;
  customWaveSetId?: string;
  mutator?: { id: string; rules: MutatorRules };
}

export interface GameStore {
  // 场景状态
  scene: GameScene;
  // 場景歷史堆疊：用於 BackButton 智能返回（最舊在 0，最新在尾部）
  sceneHistory: GameScene[];
  setScene: (scene: GameScene) => void;
  // 返回上一個場景（pop history），若無則回到 mainMenu
  goBackScene: () => void;
  /** 百科深層連結（打開後由百科頁消費） */
  encyclopediaDeepLink: EncyclopediaDeepLink | null;
  /** 暫停介面內嵌圖鑑（不跳轉場景） */
  pauseEncyclopediaFocus: EncyclopediaDeepLink | null;
  /** 從暫停中的本局跳轉百科後，返回 game 時恢復暫停疊層 */
  resumePauseOnGameReturn: boolean;
  openEncyclopedia: (link: EncyclopediaDeepLink) => void;
  /** 從暫停介面（含內嵌圖鑑）跳轉完整設定，返回時恢復暫停 */
  openSettingsFromPause: () => void;
  openPauseEncyclopedia: (link: EncyclopediaDeepLink) => void;
  closePauseEncyclopedia: () => void;

  // 游戏状态
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  gameSpeed: number;
  
  // 難度
  gameDifficulty: GameDifficulty;
  difficultyModifiers: DifficultyModifiers;
  
  // 资源
  money: number;
  health: number;
  score: number;
  
  // 波次
  currentWave: number;
  waveActive: boolean;
  enemiesRemaining: number;
  endlessMode: boolean;
  endlessWaveConfig: { enemies: { type: string; count: number }[] } | null;
  allEnemiesSpawned: boolean;
  autoSkipWave: boolean;
  isCampaign?: boolean;
  campaignLevelId?: string;
  // 自訂波次組 ID (來自 mod.content.waves)
  customWaveSetId?: string;
  // 本局啟動參數（再玩一次時複用，避免丟失 maxWaves 等設定）
  lastStartArgs: LastStartArgs | null;
  // 突變挑戰：本局生效的規則與挑戰 id（非突變局為 null）
  mutatorRules: MutatorRules | null;
  mutatorChallengeId: string | null;
  
  // 地图
  selectedPath: string;
  grid: Tile[][];
  
  // 实体
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  
  // 选择状态
  selectedTowerType: TowerType | null;
  selectedTower: Tower | null;
  hoveredTile: GridPosition | null;
  // 多選 (群選)
  multiSelectedTowerIds: string[];
  
  // 放置系統
  placementHistory: { tower: Tower; cost: number }[];
  placementHistoryIndex: number;
  quickPlaceMode: boolean;
  placementStats: { totalPlaced: number; totalSold: number; totalSpent: number };
  showTacticalView: boolean;
  
  // 升級系統
  upgradeHistory: { towerId: string; fromLevel: number; toLevel: number; cost: number; path?: UpgradePath }[];
  upgradeStats: { totalUpgrades: number; totalSpent: number; maxLevelReached: number };
  autoUpgradeEnabled: boolean;
  autoUpgradePriority: 'damage' | 'range' | 'cost';
  
  // 升級動畫
  upgradeAnimations: { id: string; towerId: string; gridPos: GridPosition; newLevel: number; towerColor: string; startTime: number; isMaxLevel?: boolean }[];
  // 出售動畫
  sellAnimations: { id: string; gridPos: GridPosition; towerColor: string; startTime: number; refundAmount?: number }[];

  // 玩家主動技能系統
  playerSkillStates: Record<PlayerSkillId, PlayerSkillState>;
  playerSkillAnimations: PlayerSkillAnimation[];
  
  // 特效系統
  damageTexts: DamageText[];
  impactParticles: ImpactParticle[];
  deathAnimations: DeathAnimation[];
  shakeIntensity: number;
  
  // 自動戰鬥系統
  autoBattleEnabled: boolean;
  autoBattleStrategy: 'balanced' | 'economy' | 'aggressive' | 'defensive';
  autoBattleConfig: {
    useSkills: boolean;
    autoSkip: boolean;
    autoUpgrade: boolean;
    autoPlace: boolean;
    autoSell: boolean;
    autoFusion: boolean;
  };
  autoBattleStats: {
    towersPlaced: number;
    moneySpent: number;
    decisionsCount: number;
    towersSold?: number;
  };
  autoBattleLastDecision: number;
  autoBattleLogs: { id: string; time: number; type: 'place' | 'upgrade' | 'analysis' | 'skill' | 'skip' | 'sell'; message: string; details?: string; thinking?: string[] }[];
  
  // 设置
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  
  // 快捷鍵
  keyBindings: KeyBindings;

  // 操作方法
  startGame: (pathName: string, difficulty?: GameDifficulty, endless?: boolean, maxWaves?: number, customModifiers?: DifficultyModifiers, customWaveSetId?: string, mutator?: { id: string; rules: MutatorRules }) => Promise<void> | void;
  maxWaves: number; // 0 = 無限
  generateEndlessWave: (waveNumber: number) => { enemies: { type: string; count: number }[] };
  setVictory: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  setGameSpeed: (speed: number) => void;
  
  selectTowerType: (type: TowerType | null) => void;
  selectTower: (tower: Tower | null) => void;
  setHoveredTile: (pos: GridPosition | null) => void;
  // 多選操作
  toggleTowerInMultiSelect: (towerId: string) => void;
  clearMultiSelect: () => void;
  selectAllTowersOfType: (type: TowerType) => void;
  selectAllTowers: () => void;
  batchUpgradeSelected: () => { upgraded: number; cost: number };
  batchSellSelected: () => { sold: number; refund: number };
  // 鎖定保護
  toggleTowerLock: (towerId: string) => void;
  
  placeTower: (pos: GridPosition) => boolean;
  upgradeTower: (tower: Tower, path?: UpgradePath) => boolean;
  sellTower: (tower: Tower) => void;
  // 融合系統：雙塔合體
  fusionMode: boolean;
  fusionSourceId: string | null;
  /** 合體錢不夠時記下費用，提示條改顯示需要資金 */
  fusionFundsShort: number | null;
  fusionAnimations: Array<{ id: string; gridPos: GridPosition; resultType: TowerType; startTime: number; colorA: string; colorB: string }>;
  enterFusionMode: (towerId: string) => void;
  cancelFusion: () => void;
  fuseTowers: (sourceId: string, targetId: string) => boolean;
  setTowerPriority: (towerId: string, priority: TargetPriority) => void;
  renameTower: (towerId: string, name: string) => void;
  getTowerEffectiveStats: (tower: Tower) => TowerData | null;
  
  // 升級系統增強
  undoUpgrade: () => boolean;
  batchUpgrade: () => { upgraded: number; cost: number };
  toggleAutoUpgrade: () => void;
  setAutoUpgradePriority: (priority: 'damage' | 'range' | 'cost') => void;
  getUpgradePreview: (tower: Tower) => { stats: TowerData; cost: number } | null;
  
  // 放置系統
  undoPlacement: () => boolean;
  redoPlacement: () => boolean;
  toggleQuickPlaceMode: () => void;
  setQuickPlaceMode: (enabled: boolean) => void;
  toggleTacticalView: () => void;
  clearPlacementHistory: () => void;
  
  // 技能系統 (塔技能)
  activateSkill: (towerId: string) => boolean;
  updateSkills: () => void;

  // 玩家主動技能系統
  activatePlayerSkill: (skillId: PlayerSkillId) => boolean;
  isPlayerSkillReady: (skillId: PlayerSkillId) => boolean;
  isPlayerSkillActive: (skillId: PlayerSkillId) => boolean;
  getPlayerSkillCooldownRemaining: (skillId: PlayerSkillId) => number;
  updatePlayerSkills: () => void;
  
  startWave: () => void;
  skipWave: () => void;
  toggleAutoSkipWave: () => void;
  setAutoSkipWaveEnabled: (enabled: boolean) => void;
  setAllEnemiesSpawned: (spawned: boolean) => void;

  /** 波間戰術協議：待選三張；選定後本波生效 */
  pendingProtocolChoices: TacticalProtocol[] | null;
  activeProtocol: TacticalProtocol | null;
  protocolHistory: string[];
  protocolNextTowerDiscount: number;
  offerProtocolIfNeeded: () => void;
  chooseProtocol: (id: string) => boolean;
  
  addMoney: (amount: number) => void;
  takeDamage: (amount: number) => void;
  
  // 游戏循环更新
  spawnEnemy: (type: string) => void;
  updateEnemies: (deltaTime: number, tileSize: number) => void;
  updateTowers: (deltaTime: number) => void;
  updateProjectiles: (deltaTime: number) => void;
  removeEnemy: (id: string) => void;
  
  // 特效操作
  addDamageText: (x: number, y: number, value: number, isCrit?: boolean, color?: string) => void;
  addStatusText: (x: number, y: number, text: string, color?: string) => void;
  addMoneyText: (x: number, y: number, amount: number, isGain?: boolean) => void;
  addImpactParticles: (x: number, y: number, color: string, count?: number) => void;
  addDeathAnimation: (enemy: Enemy) => void;
  addShake: (intensity: number) => void;
  updateVisualEffects: (deltaTime: number) => void;
  
  // 设置
  toggleSound: () => void;
  toggleMusic: () => void;
  setSoundVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  
  // 快捷鍵
  setKeyBinding: (action: KeyAction, key: string) => void;
  resetKeyBindings: () => void;
  
  // 自動戰鬥系統（統一）
  toggleAutoBattle: () => void;
  setAutoBattleStrategy: (strategy: 'balanced' | 'economy' | 'aggressive' | 'defensive') => void;
  setAutoBattleConfig: (config: Partial<GameStore['autoBattleConfig']>) => void;
  addAutoBattleLog: (type: 'place' | 'upgrade' | 'analysis' | 'skill' | 'skip' | 'sell', message: string, details?: string, thinking?: string[]) => void;
  runAutoBattleLogic: () => void;

  // 壓力測試（Dev 面板）
  /** 一鍵灌入 N 隻敵人 + M 座塔，回傳實際生成數量 */
  spawnStressEntities: (enemyCount?: number, towerCount?: number) => StressSpawnResult;
  /** 清掉壓測實體（依固定 id 前綴辨識），不影響玩家自己放的塔 */
  clearStressEntities: () => StressSpawnResult;
  /** 目前場上有多少壓測實體 */
  countStressEntities: () => { enemies: number; towers: number };

  // 重置
  resetGame: () => void;
}
