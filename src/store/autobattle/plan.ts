import type { AutoBattleLookahead } from '@/types/autobattle';
import type { EnemyType, TowerType } from '@/types/game';
import { WAVE_CONFIGS } from '@/data/gameData/waveData';
import { ENEMY_DATA, TOWER_DATA } from '@/data/gameData';
import { hasEnemyAbility } from '@/data/gameData/enemyAbilities';
import { getPreset } from '@/data/autobattle/presets';
import { getTowerBuildCost } from '@/data/towerCost';

interface LookaheadInput {
  wave: number;
  money: number;
  health: number;
  maxHealth: number;
  towerCount: number;
  costMult: number;
  presetId: string;
}

/** 取第 wave 波的敵人組成（1-based；超出表尾視為無盡模式的高壓波） */
const waveEnemiesOf = (wave: number): { type: EnemyType; count: number }[] => {
  const cfg = WAVE_CONFIGS[wave - 1];
  if (cfg) return cfg.enemies;
  // 表尾之後：用最後一波的組成當壓力上限
  const last = WAVE_CONFIGS[WAVE_CONFIGS.length - 1];
  return last ? last.enemies : [];
};

/** 該批敵人帶來的能力集合（用於前瞻加權與型別對位） */
const abilitiesOf = (enemies: { type: EnemyType }[]): string[] => {
  const keys = new Set<string>();
  for (const e of enemies) {
    const data = ENEMY_DATA[e.type];
    if (!data) continue;
    if (data.ability) keys.add(data.ability);
    for (const a of data.abilities ?? []) keys.add(a);
    if (hasEnemyAbility(data, 'flying')) keys.add('flying');
    if ((data.armorValue ?? 0) > 0) keys.add('armored');
  }
  return [...keys];
};

/**
 * 前瞻：下一波的組成、預期壓力、以及「至少要留多少錢」。
 * 保留金 = 三個最便宜可建塔的平均造價 × (1 + 壓力) × 預設檔 reserveRatio。
 */
export const buildLookahead = (input: LookaheadInput): AutoBattleLookahead => {
  const next = waveEnemiesOf(input.wave);
  const expectedEnemyCount = next.reduce((sum, e) => sum + e.count, 0);
  const expectedAbilities = abilitiesOf(next);
  const bossy = expectedAbilities.includes('miniboss') || next.some((e) => e.type === 'boss');
  const pressure = Math.min(1, (expectedEnemyCount / 30) * (bossy ? 1.35 : 1));

  const costs = (Object.keys(TOWER_DATA) as TowerType[])
    .map((t) => getTowerBuildCost(TOWER_DATA[t].cost, input.costMult))
    .sort((a, b) => a - b);
  const cheapest = costs.slice(0, 3);
  const avgCost = cheapest.length > 0 ? cheapest.reduce((s, c) => s + c, 0) / cheapest.length : 100;
  const preset = getPreset(input.presetId);
  const healthRatio = input.maxHealth > 0 ? input.health / input.maxHealth : 1;
  const moneyReserve = Math.round(avgCost * (1 + pressure) * preset.reserveRatio * (1 + (1 - healthRatio) * 0.3));

  return {
    moneyReserve,
    expectedAbilities,
    expectedEnemyCount,
    pressure,
    nextWaveTypes: next.map((e) => e.type),
  };
};
