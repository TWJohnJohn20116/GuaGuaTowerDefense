/**
 * 測試用的實體工廠
 *
 * 之前各測試檔自己手寫 Enemy/Tower 物件再 `as Enemy` / `as Tower` 硬轉，
 * 結果 fixture 帶了型別上根本不存在、程式也讀不到的欄位（goldReward、waypointIndex），
 * 而真正必填的 reward / size / health 反而缺。這裡收斂成唯一一份，
 * 新增欄位時只要改這裡，所有測試自動跟上。
 */
import type {
  Enemy,
  EnemyType,
  StatusEffect,
  Tower,
  TowerSkillState,
  TowerType,
} from '@/types/game';

export const makeEnemy = (overrides: Partial<Enemy> & { id: string }): Enemy => ({
  type: 'normal' as EnemyType,
  x: 0,
  y: 0,
  health: 100,
  maxHealth: 100,
  speed: 1,
  pathIndex: 0,
  progress: 0,
  effects: [] as StatusEffect[],
  reward: 10,
  size: 30,
  ...overrides,
});

export const makeTower = (overrides: Partial<Tower> & { id: string; type: TowerType }): Tower => ({
  gridPos: { col: 0, row: 0 },
  x: 0,
  y: 0,
  level: 1,
  upgradePath: null,
  rotation: 0,
  target: null,
  lastFireTime: 0,
  kills: 0,
  totalDamage: 0,
  targetPriority: 'first',
  health: 100,
  maxHealth: 100,
  ...overrides,
});

export const makeSkill = (overrides: Partial<TowerSkillState> & Pick<TowerSkillState, 'skillId'>): TowerSkillState => ({
  lastUsedTime: 0,
  isActive: false,
  activeUntil: 0,
  ...overrides,
});
