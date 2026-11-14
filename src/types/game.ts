// 游戏核心类型定义

// 遊戲難度
export type GameDifficulty = 'easy' | 'normal' | 'hard' | 'nightmare' | 'impossible' | 'custom';

// 難度修飾器
export interface DifficultyModifiers {
  enemyHealthMult: number;      // 敵人血量倍率
  enemySpeedMult: number;       // 敵人速度倍率
  enemyRewardMult: number;      // 敵人獎勵倍率
  startingMoney: number;        // 初始金錢
  startingHealth: number;       // 初始生命
  towerCostMult: number;        // 塔費用倍率
  waveDelayMult: number;        // 波次間隔倍率
}

export interface Position {
  x: number;
  y: number;
}

export interface GridPosition {
  col: number;
  row: number;
}

// 敌人类型
export type EnemyType = 
  | 'normal' | 'fast' | 'elite' | 'speedy' 
  | 'tank' | 'heavy' | 'boss' | 'flyer' 
  | 'healer' | 'spawner'
  | 'shield' | 'stealth' | 'berserker' | 'armored'
  | 'mage' | 'miniboss' | 'swarm' | 'ghost' | 'bomber' | 'saboteur' | 'jammer' | 'escort';

// 塔类型
export type TowerType = 
  | 'basic' | 'sniper' | 'cannon' | 'machine' | 'shotgun' | 'ballista'
  | 'frost' | 'poison' | 'laser' | 'lightning' | 'flame'
  | 'money' | 'wind' | 'pulse'
  // 融合塔（由兩座塔合體產生，可再升級 / 有技能）
  | 'storm' | 'plague' | 'demolisher' | 'tempest';

// 敌人数据结构
export interface EnemyData {
  name: string;
  health: number;
  speed: number;
  reward: number;
  size: number;
  color: string;
  description: string;
  ability?: string;
  healRadius?: number;
  healAmount?: number;
  spawnOnDeath?: { type: EnemyType; count: number };
  shieldAmount?: number;
  shieldRegen?: number;
  stealthDuration?: number;
  stealthCooldown?: number;
  berserkThreshold?: number;
  berserkSpeedBoost?: number;
  armorValue?: number;
  teleportDistance?: number;
  teleportCooldown?: number;
  phaseDuration?: number;
  phaseCooldown?: number;
  explosionRadius?: number;
  explosionDamage?: number;
  jamRadius?: number;
  jamFireRateMult?: number;
  escortRadius?: number;
  escortArmor?: number;
}

// 塔数据结构
export interface TowerData {
  name: string;
  damage: number;
  damagePerSecond?: number;
  range: number;
  fireRate?: number;
  cost: number;
  color: string;
  projectileColor: string;
  highlightColor: string;
  description: string;
  projectileSpeed?: number;
  projectileSize?: number;
  instantHit?: boolean;
  splash?: boolean;
  splashRadius?: number;
  slowEffect?: boolean;
  slowAmount?: number;
  slowDuration?: number;
  poisonEffect?: boolean;
  poisonDamage?: number;
  poisonDuration?: number;
  laserEffect?: boolean;
  lightningEffect?: boolean;
  chainCount?: number;
  chainDamageReduction?: number;
  flameEffect?: boolean;
  moneyGeneration?: boolean;
  moneyPerSecond?: number;
  // 風塔效果
  windEffect?: boolean;
  windKnockbackDistance?: number;  // 擊退距離（格子數）
  // 脈衝塔效果
  pulseEffect?: boolean;
  // 暴擊系統
  critChance?: number;             // 暴擊率 (0-1)
  critMultiplier?: number;         // 暴擊倍率 (預設 2.0)
}

// 敌人实例
export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  pathIndex: number;
  progress: number;
  effects: StatusEffect[];
  reward: number;
  size: number;
  spawnTime?: number;                  // 出生時間戳（用於出生動畫，Date.now()）
  // 護盾敵人（shield）：需先擊破護盾才能傷到本體，護盾隨時間再生
  shield?: number;                     // 目前護盾值
  maxShield?: number;                  // 護盾上限
  // 突變挑戰：per-enemy 額外裝甲（每次受擊固定減傷，經統一傷害管線生效）
  armorBonus?: number;
  // 護航光環：本幀由護航者光環寫入的額外裝甲
  escortArmor?: number;
  // 法師敵人（teleport）：上次傳送時間戳
  lastTeleportTime?: number;
  // 進階地圖（叉路系統）
  currentSegmentId?: string;           // 目前路段 ID
  segmentWaypointIndex?: number;       // 路段內路徑點索引
  // 風塔擊退（吹離路徑）
  isDisplaced?: boolean;               // 是否被吹離路徑
  displacedTargetX?: number;           // 回歸目標 X（路徑點）
  displacedTargetY?: number;           // 回歸目標 Y（路徑點）
  returnPathIndex?: number;            // 回到路徑後繼續的 pathIndex
  returnSegmentId?: string;            // 進階地圖：回歸路段 ID
  returnWaypointIndex?: number;        // 進階地圖：回歸路徑點索引
}

// 狀態效果類型
export type StatusEffectType = 
  | 'slow'      // 減速：降低移動速度
  | 'poison'    // 中毒：持續傷害
  | 'burn'      // 燃燒：持續傷害，可疊加
  | 'freeze'    // 冰凍：完全停止移動
  | 'stun'      // 眩暈：無法行動
  | 'bleed'     // 流血：移動時受傷
  | 'weakness'  // 虛弱：受到傷害增加
  | 'marked'    // 標記：被攻擊優先級提高
  | 'exposed'   // 暴露：降低防禦
  | 'fear'      // 恐懼：隨機改變方向
  | 'root'      // 定身：無法移動但可被攻擊
  | 'curse'     // 詛咒：治療效果降低
  | 'shield'    // 護盾：吸收傷害
  | 'regen'     // 再生：持續恢復生命
  | 'haste'     // 加速：提高移動速度
  | 'berserk'   // 狂暴：速度和傷害提高
  | 'immune'    // 免疫：免疫負面效果
  | 'confuse'   // 混亂：攻擊友軍
  | 'silence'   // 沉默：無法使用技能
  | 'petrify'   // 石化：完全無法行動，受傷減半
  | 'wind'      // 狂風：被吹退
  | 'frostbite'; // 冰霜疊層：連打後轉凍結

// 状态效果
export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  startTime: number;
  value?: number;        // 效果數值（減速百分比、傷害等）
  stacks?: number;       // 疊加層數
  source?: string;       // 來源（塔ID）
  maxStacks?: number;    // 最大疊加層數
}

// 狀態效果數據
export interface StatusEffectData {
  name: string;
  description: string;
  icon: string;
  color: string;
  isDebuff: boolean;     // 是否為負面效果
  canStack: boolean;     // 是否可疊加
  maxStacks: number;     // 最大疊加數
}

// 塔目標優先級
export type TargetPriority = 'first' | 'strongest' | 'weakest' | 'closest' | 'last' | 'fastest' | 'highestPercent' | 'lowestPercent' | 'threat';

// 快捷鍵動作
export type KeyAction = 
  | 'pause'
  | 'back'
  | 'speed1'
  | 'speed2'
  | 'speed3'
  | 'cycleSpeed'
  | 'startWave'
  | 'sellTower'
  | 'upgradeTower';

// 快捷鍵綁定
export interface KeyBindings {
  pause: string;
  back: string;
  speed1: string;
  speed2: string;
  speed3: string;
  cycleSpeed: string;
  startWave: string;
  sellTower: string;
  upgradeTower: string;
}

// 升級路線類型
export type UpgradePath = 'A' | 'B' | null;

// 分支升級加成
export interface UpgradeBranchBonus {
  name: string;
  description: string;
  icon: string;
  damageMultiplier?: number;
  rangeMultiplier?: number;
  fireRateMultiplier?: number;
  splashRadiusMultiplier?: number;
  slowAmountMultiplier?: number;
  poisonDamageMultiplier?: number;
  chainCountBonus?: number;
  specialEffect?: string;
}

// 塔升級分支定義
export interface TowerUpgradeBranches {
  pathA: {
    name: string;
    description: string;
    icon: string;
    level2: UpgradeBranchBonus;
    level3: UpgradeBranchBonus;
  };
  pathB: {
    name: string;
    description: string;
    icon: string;
    level2: UpgradeBranchBonus;
    level3: UpgradeBranchBonus;
  };
}

// ===== 塔技能系統 =====

// 技能類型
export type SkillType = 
  | 'overcharge'     // 超載：短時間內大幅提升攻擊速度
  | 'precision'      // 精準：下次攻擊必定暴擊
  | 'barrage'        // 彈幕：同時攻擊範圍內所有敵人
  | 'freeze_blast'   // 冰凍爆發：凍結範圍內所有敵人
  | 'toxic_cloud'    // 毒雲：釋放持續傷害區域
  | 'chain_surge'    // 連鎖激流：電擊連鎖數量翻倍
  | 'inferno'        // 地獄火：創建火焰區域
  | 'sniper_focus'   // 狙擊專注：大幅提升傷害但降低攻速
  | 'repair'         // 修復：回復周圍塔的冷卻
  | 'storm_surge'    // 暴風雷暴：融合塔技能
  | 'plague_burst'   // 瘟疫爆發：融合塔技能
  | 'siege_volley'   // 攻城齊射：融合塔技能
  | 'tempest_blast'; // 颶風爆破：融合塔技能

// 技能定義
export interface TowerSkill {
  id: SkillType;
  name: string;
  description: string;
  icon: string;
  cooldown: number;       // 冷卻時間 (毫秒)
  duration: number;       // 持續時間 (毫秒)，0表示瞬發
  manaCost?: number;      // 魔力消耗（未來擴展）
  damage?: number;        // 技能傷害
  range?: number;         // 技能範圍
  effectMultiplier?: number; // 效果倍率
}

// 塔技能實例（追蹤技能狀態）
export interface TowerSkillState {
  skillId: SkillType;
  lastUsedTime: number;   // 上次使用時間
  isActive: boolean;      // 是否正在生效
  activeUntil: number;    // 生效截止時間
}

// 漂浮文字（傷害 / 金錢 / 通用）
export interface DamageText {
  id: string;
  x: number;
  y: number;
  // 數字傷害值；狀態文字（如「免疫」）以空字串 + prefix 呈現
  value: number | string;
  color: string;
  isCrit?: boolean;
  // 可選前綴/後綴（例如 +$ / +）。預設無
  prefix?: string;
  suffix?: string;
  // 是否為金錢類，影響繪製時的字型粗細與光暈
  isMoney?: boolean;
  startTime: number;
  duration: number;
}

// 命中粒子特效
export interface ImpactParticle {
  id: string;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  startTime: number;
  duration: number;
}

/**
 * 死亡碎片：用於「物理裂解」風格的死亡動畫。
 * 每個碎片是一個三角形扇區（從敵人圓形模型切出），帶有
 * 自身的初速度、角速度、重力、顏色與旋轉。渲染端依
 * `elapsed` 做純函式運算（拋物線位置 + 線性旋轉 + alpha 衰減）。
 */
export interface DeathShard {
  /** 三角扇區起始角度（弧度） */
  angleStart: number;
  /** 三角扇區結束角度（弧度） */
  angleEnd: number;
  /** 水平初速度（px/s） */
  vx: number;
  /** 垂直初速度（px/s，負值=向上飛） */
  vy: number;
  /** 角速度（rad/s） */
  vRot: number;
  /** 起始旋轉角度（弧度） */
  rotation: number;
  /** 重力加速度（px/s²，向下為正） */
  gravity: number;
  /** 半徑倍率（讓碎片大小有差異） */
  sizeMul: number;
  /** 碎片填色（每片略有明暗差異） */
  color: string;
  /** 碎片描邊色（暗色，營造硬邊感） */
  strokeColor: string;
}

// 敵人死亡動畫
export interface DeathAnimation {
  id: string;
  x: number;
  y: number;
  enemyType: EnemyType | string;
  modelType: string;
  color: string;
  size: number;
  glowColor: string | null;
  glowIntensity: number;
  isBoss: boolean;
  isElite: boolean;
  startTime: number;
  duration: number;
  /** 碎裂後的所有碎片 */
  shards: DeathShard[];
  /** 噴濺粒子（暗色點，模擬「血」與「殘骸末屑」） */
  splashSeed: number;
}

// 塔实例
export interface Tower {
  id: string;
  type: TowerType;
  gridPos: GridPosition;
  x: number;
  y: number;
  level: number;
  upgradePath: UpgradePath;
  rotation: number;
  target: Enemy | null;
  lastFireTime: number;
  kills: number;
  totalDamage: number;
  targetPriority: TargetPriority;
  // 自訂名稱
  customName?: string;
  // 技能系統
  skill?: TowerSkillState;
  // 錢塔專用 - 累計產生的金幣
  moneyGenerated?: number;
  // 動畫系統
  placedAt?: number;       // 放置時間戳（建造動畫）
  lastAttackTime?: number; // 最近一次攻擊時間（後座力動畫）
  lastUpgradeTime?: number; // 最近一次升級時間（升級脈動動畫）
  // 鎖定保護 (防誤出售)
  locked?: boolean;
  // 生命值（可被破壞的塔）
  health: number;
  maxHealth: number;
  // 融合塔：記錄合體前的兩座來源塔型別（僅展示用）
  fusedFrom?: [TowerType, TowerType];
}

// 投射物
export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetId: string;
  targetX: number;
  targetY: number;
  damage: number;
  speed: number;
  size: number;
  color: string;
  towerId: string;
  towerType: TowerType;
  isInstant?: boolean;
  isCrit?: boolean;
  createdAt?: number;
  instantDamageApplied?: boolean;  // 瞬間命中是否已結算傷害（避免低幀率下錯過結算窗口）
  // 子彈優化屬性
  rotation?: number;           // 子彈旋轉角度
  prevX?: number;              // 上一幀位置 (用於軌跡)
  prevY?: number;
  trailPoints?: { x: number; y: number; alpha: number }[];  // 軌跡點
  homingStrength?: number;     // 追蹤強度 (0-1)
  curveOffset?: number;        // 曲線偏移
  lifetime?: number;           // 生存時間
  maxLifetime?: number;        // 最大生存時間
  piercing?: boolean;          // 是否具有穿透能力（碰到敵人不消失）
  hitEnemyIds?: string[];      // 已擊中的敵人 ID（穿透用，避免重複判定）
  hitEffect?: 'normal' | 'explosive' | 'electric' | 'ice' | 'poison' | 'fire';
  effects?: {
    slow?: { amount: number; duration: number };
    poison?: { damage: number; duration: number };
    chain?: { count: number; damageReduction: number };
    splash?: { radius: number };
    wind?: { knockbackDistance: number };
  };
}

// 地圖分類
export type MapCategory = 'normal' | 'advanced';

// 路段：進階地圖的基本單位
export interface PathSegment {
  id: string;
  waypoints: GridPosition[];  // 至少 2 個點
  next: string[];             // 下一段 ID（多個 = 叉路）
}

// 路径配置
export interface PathConfig {
  name: string;
  description: string;
  difficulty: string;
  category?: MapCategory;              // 地圖分類（預設 normal）
  waypoints: GridPosition[];           // 普通地圖用
  segments?: PathSegment[];            // 進階地圖用（叉路系統）
  startSegmentId?: string;             // 進階地圖起始路段 ID
  /** Mod 地圖障礙格子（不可建造） */
  blockedCells?: GridPosition[];
}

// 波次配置
export interface WaveConfig {
  enemies: { type: EnemyType; count: number; delay: number }[];
  reward: number;
}

// 地图格子类型
export type TileType = 'empty' | 'path' | 'start' | 'end' | 'blocked' | 'fork';

// 地图格子
export interface Tile {
  type: TileType;
  row: number;
  col: number;
  /**
   * 這一格上駐紮的塔 id。
   *
   * 以前這裡存的是整份 Tower 複本，導致 `state.towers` 與 `grid[r][c].tower`
   * 兩份真相、74 處手動雙寫（忘記同步就會出現「畫面上有、點不到」的幽靈塔）。
   * 現在格子只記 id，塔的資料只有 `state.towers` 一份；
   * 存取一律走 `@/store/gridTower`。
   */
  towerId: string | null;
}

// 游戏状态
export type GameState = 
  | 'menu' | 'pathSelection' | 'playing' | 'paused' 
  | 'gameOver' | 'victory' | 'settings' | 'tutorial' 
  | 'changelog' | 'encyclopedia' | 'editor';

// 游戏场景
export type GameScene =
  | 'mainMenu' | 'pathSelection' | 'talentTree' | 'game' | 'settings'
  | 'tutorial' | 'changelog' | 'encyclopedia' | 'workshop'
  | 'achievements' | 'skins' | 'shop' | 'statistics'
  | 'modEditor' | 'modManager' | 'mapEditor' | 'replay'
  | 'memorial' | 'gameOver' | 'victory' | 'dailyChallenge' | 'mutatorChallenge';


// ===== Mod 系統 =====

// Mod 類型
export type ModType = 'tower' | 'enemy' | 'map' | 'wave' | 'full';

// Mod 元數據
export interface ModMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  type: ModType;
  gameVersion: string;
  icon?: string;
  tags?: string[];
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

// 自訂塔 Mod
// 自訂 3D 模型部件（模組 3D 模型編輯器產生）
export interface Custom3DPart {
  id: string;
  /** 幾何種類（towerModels3d TOWER_PART_SHAPES 的 key） */
  shape: string;
  /** 材質角色：機身金屬 / 暗色金屬件 / 主題色 / 發光件 / 金色 */
  material: 'metal' | 'trim' | 'accent' | 'glow' | 'gold';
  x: number;
  y: number;
  z: number;
  /** 旋轉（弧度） */
  rx: number;
  ry: number;
  rz: number;
  /** 等比縮放（0.2~3） */
  scale: number;
  /** 加入持續旋轉組（遊戲內繞 Y 軸自轉） */
  spin?: boolean;
}

// 自訂 3D 模型（部件組合）
export interface Custom3DModel {
  parts: Custom3DPart[];
}

export interface CustomTowerData extends TowerData {
  id: string;
  modId: string;
  // 模型設定
  modelType?: string;         // 使用的模型類型（basic, sniper, cannon 等）
  modelScale?: number;        // 模型縮放（0.5~2.0，預設 1）
  glowColor?: string;         // 光暈顏色（空字串=無光暈）
  glowIntensity?: number;     // 光暈強度（0~1）
  barrelLength?: number;      // 砲管長度倍率（0.5~2.0，預設 1）
  /** 自訂 3D 模型（存在時優先於 modelType，由 3D 模型編輯器產生） */
  custom3d?: Custom3DModel;
  // 進階設定
  damageMultiplier?: number;  // 每級傷害增加百分比
  rangeMultiplier?: number;   // 每級射程增加百分比
  fireRateMultiplier?: number;// 每級攻速增加百分比
}

// 自訂敵人 Mod
export interface CustomEnemyData extends EnemyData {
  id: string;
  modId: string;
  // 模型設定
  modelType?: string;         // 使用的模型類型（normal, boss, flyer 等）
  modelScale?: number;        // 模型縮放（0.5~2.0，預設 1）
  glowColor?: string;         // 光暈顏色（空字串=無光暈）
  glowIntensity?: number;     // 光暈強度（0~1）
  // 進階設定
  tags?: string[];            // 敵人類型標籤
  slowResistance?: number;    // 減速抗性百分比 (0-100)
  poisonResistance?: number;  // 毒素抗性百分比 (0-100)
  damageToBase?: number;      // 到達終點造成的傷害
}

// 自訂地圖 Mod
export interface CustomMapData extends PathConfig {
  id: string;
  modId: string;
  thumbnail?: string;
  /** 不可建造格子（障礙物繪製） */
  blockedCells?: GridPosition[];
}

// 自訂波次 Mod
export interface CustomWaveData {
  id: string;
  modId: string;
  name: string;
  description: string;
  waves: WaveConfig[];
}

// Mod 內容
export interface ModContent {
  towers?: CustomTowerData[];
  enemies?: CustomEnemyData[];
  maps?: CustomMapData[];
  waves?: CustomWaveData[];
}

// 完整 Mod 定義
export interface Mod {
  metadata: ModMetadata;
  content: ModContent;
  enabled: boolean;
  loadOrder: number;
}

// Mod 驗證結果
export type ModValidationTab = 'settings' | 'towers' | 'enemies' | 'maps' | 'waves';

export interface ModValidationFlag {
  tab: ModValidationTab;
  index?: number;
  level: 'error' | 'warning';
}

export interface ModValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  flags?: ModValidationFlag[];
}

// 戰役狀態 (Campaign State)
export interface CampaignState {
  isCampaign?: boolean;
  campaignLevelId?: string;
}

