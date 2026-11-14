/**
 * 暫停主控台 · 下波經濟估算工具
 */

import { ENEMY_DATA, WAVE_CONFIGS, generateEndlessWaveConfig } from '@/data/gameData';
import type { EnemyType } from '@/types/game';
import { findPlayableWaveSet } from '@/utils/waveSets';

export interface WaveConfigLike {
  enemies: { type: EnemyType; count: number }[];
}

export function resolveNextWaveConfig(
  currentWave: number,
  endlessMode: boolean,
  maxWaves: number,
  customWaveSetId?: string | null,
): WaveConfigLike | null {
  const nextWave = currentWave + 1;
  if (customWaveSetId) {
    const wave = findPlayableWaveSet(customWaveSetId)?.waves[nextWave - 1];
    if (!wave) return null;
    return { enemies: wave.enemies };
  }
  if (endlessMode) return generateEndlessWaveConfig(nextWave);
  if (maxWaves > 0 && currentWave >= maxWaves) return null;
  const idx = nextWave - 1;
  if (idx >= 0 && idx < WAVE_CONFIGS.length) return WAVE_CONFIGS[idx];
  return generateEndlessWaveConfig(nextWave);
}

/** 下波擊殺敵人預估總賞金（不含通關波次固定獎勵） */
export function estimateWaveKillBounty(
  config: WaveConfigLike,
  enemyRewardMult: number,
): number {
  return config.enemies.reduce((sum, group) => {
    const base = ENEMY_DATA[group.type as keyof typeof ENEMY_DATA]?.reward ?? 0;
    const perKill = Math.round(base * enemyRewardMult);
    return sum + perKill * group.count;
  }, 0);
}

/** 自訂波次組：完成「當前進行中波次」後的固定獎勵 */
export function getCustomWaveClearBonus(
  customWaveSetId: string | null | undefined,
  currentWave: number,
): number | null {
  if (!customWaveSetId) return null;
  const ws = findPlayableWaveSet(customWaveSetId);
  const reward = ws?.waves[currentWave - 1]?.reward;
  return typeof reward === 'number' && reward > 0 ? reward : null;
}

export function countWaveEnemies(config: WaveConfigLike): number {
  return config.enemies.reduce((s, g) => s + g.count, 0);
}
