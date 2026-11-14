import type { TowerData } from '@/types/game';

// 擴展的塔資料（包含 MOD 資訊）
export interface GameTowerData extends TowerData {
  id: string;
  isModContent: boolean;
  modName?: string;
}
