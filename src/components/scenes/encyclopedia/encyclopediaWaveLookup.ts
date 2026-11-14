/**
 * 圖鑑 · 敵人首次出現波次查詢（含 Mod 波次組）
 */
import { WAVE_CONFIGS } from '@/data/gameData';
import type { Mod } from '@/types/game';

export interface WaveAppearanceRef {
  waveNumber: number;
  source: 'base' | 'mod';
  modId?: string;
  waveSetId?: string;
  waveSetName?: string;
}

export function findEnemyWaveAppearance(
  enemyId: string,
  modId?: string,
  mods: Mod[] = [],
): WaveAppearanceRef | null {
  if (modId) {
    const mod = mods.find((m) => m.metadata.id === modId);
    const waveSets = mod?.content.waves ?? [];
    for (const ws of waveSets) {
      for (let i = 0; i < ws.waves.length; i++) {
        if (ws.waves[i].enemies.some((eg) => eg.type === enemyId)) {
          return {
            waveNumber: i + 1,
            source: 'mod',
            modId,
            waveSetId: ws.id,
            waveSetName: ws.name,
          };
        }
      }
    }
  }

  for (let i = 0; i < WAVE_CONFIGS.length; i++) {
    if (WAVE_CONFIGS[i].enemies.some((eg) => eg.type === enemyId)) {
      return { waveNumber: i + 1, source: 'base' };
    }
  }
  return null;
}
