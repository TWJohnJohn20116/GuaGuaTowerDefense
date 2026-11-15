/**
 * 新關卡的預設值（集中在這裡，store 與 UI 都不要各自複製一份）
 *
 * 形狀對齊 src/types/workshop.ts：winConditions 是單一物件、關卡欄位全部必填。
 */
import type { WorkshopLevel } from '@/types/workshop';

export function createDefaultLevel(name: string): WorkshopLevel {
  const now = Date.now();
  return {
    id: `level_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    description: '',
    mapAssetId: null,
    waves: [{ enemies: [{ type: 'normal', count: 5, delay: 0 }], reward: 50 }],
    winConditions: { surviveWaves: 10 },
    ruleOverrides: [],
    startingResources: { money: 500, health: 10, waveDelayMult: 1 },
    ruleSetRef: null,
    towerRefs: [],
    scriptRefs: [],
    artRefs: [],
    createdAt: now,
    updatedAt: now,
  };
}
