import type { ModType } from '@/types/game';

// Mod 類型選項
export const modTypes: { value: ModType; label: string; icon: string }[] = [
  { value: 'tower', label: '塔 Mod', icon: '🗼' },
  { value: 'enemy', label: '敵人 Mod', icon: '👾' },
  { value: 'map', label: '地圖 Mod', icon: '🗺️' },
  { value: 'full', label: '完整 Mod', icon: '📦' },
];

// 塔模板
export const towerTemplates = [
  { name: '基礎塔', damage: 25, range: 150, fireRate: 1, cost: 100, color: '#5b9bd5' },
  { name: '狙擊塔', damage: 80, range: 250, fireRate: 0.5, cost: 200, color: '#8e44ad' },
  { name: '機槍塔', damage: 8, range: 120, fireRate: 5, cost: 150, color: '#27ae60' },
  { name: '冰凍塔', damage: 15, range: 130, fireRate: 1, cost: 180, color: '#00bfff', slowEffect: true, slowAmount: 0.5, slowDuration: 2000 },
  { name: '毒塔', damage: 10, range: 140, fireRate: 0.8, cost: 200, color: '#2ecc71', poisonEffect: true, poisonDamage: 8, poisonDuration: 3000 },
  { name: '加農炮', damage: 60, range: 160, fireRate: 0.6, cost: 250, color: '#e67e22', splash: true, splashRadius: 60 },
];

// 敵人模板
export const enemyTemplates = [
  { name: '普通敵人', health: 100, speed: 1, reward: 10, size: 12, color: '#e74c3c' },
  { name: '快速敵人', health: 60, speed: 2, reward: 15, size: 10, color: '#f39c12' },
  { name: '坦克敵人', health: 400, speed: 0.5, reward: 30, size: 18, color: '#9b59b6' },
  { name: '治療敵人', health: 150, speed: 0.8, reward: 25, size: 14, color: '#2ecc71', ability: '每秒治療周圍敵人' },
  { name: '分裂敵人', health: 200, speed: 1, reward: 20, size: 16, color: '#3498db', ability: '死亡時分裂成小敵人' },
  { name: 'Boss', health: 2000, speed: 0.3, reward: 100, size: 24, color: '#c0392b', ability: '免疫減速效果' },
];

// 能力預設
export const abilityPresets = [
  { name: '治療光環', description: '每秒治療周圍敵人 5 HP' },
  { name: '護盾', description: '每 10 秒獲得護盾，吸收 50 傷害' },
  { name: '分裂', description: '死亡時分裂成 2 個小敵人' },
  { name: '加速', description: '每 5 秒獲得短暫加速' },
  { name: '隱身', description: '每 8 秒隱身 2 秒' },
  { name: '反傷', description: '反彈 10% 受到的傷害' },
];
