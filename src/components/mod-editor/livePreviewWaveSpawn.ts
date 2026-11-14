/**
 * LivePreview 波次生成排程
 */
import type { CustomEnemyData, CustomWaveData } from '@/types/game';

export interface SpawnScheduleEntry {
  atTick: number;
  templateIndex: number;
}

export interface BattleInstance {
  id: number;
  templateIndex: number;
}

function resolveEnemyTemplateIndex(type: string, enemies: CustomEnemyData[]): number {
  if (enemies.length === 0) return -1;
  const byId = enemies.findIndex((e) => e.id === type);
  if (byId >= 0) return byId;
  const byModel = enemies.findIndex((e) => e.modelType === type);
  if (byModel >= 0) return byModel;
  const lower = type.toLowerCase();
  const byName = enemies.findIndex((e) => e.name.toLowerCase().includes(lower));
  if (byName >= 0) return byName;
  return 0;
}

export function buildWaveSpawnSchedule(
  waveSet: CustomWaveData,
  waveIndex: number,
  enemies: CustomEnemyData[],
  tickMs = 50,
): SpawnScheduleEntry[] {
  const wave = waveSet.waves[waveIndex];
  if (!wave || enemies.length === 0) return [];

  const schedule: SpawnScheduleEntry[] = [];
  let tick = 10;
  wave.enemies.forEach((group) => {
    const templateIndex = resolveEnemyTemplateIndex(group.type, enemies);
    if (templateIndex < 0) return;
    for (let i = 0; i < group.count; i++) {
      schedule.push({ atTick: tick, templateIndex });
      tick += Math.max(2, Math.round(group.delay / tickMs));
    }
    tick += 8;
  });
  return schedule;
}

export function pickWaveSet(waves: CustomWaveData[], index = 0): CustomWaveData | null {
  const valid = waves.filter((w) => w.waves.length > 0);
  return valid[index] ?? valid[0] ?? null;
}

export function getValidWaveSets(waves: CustomWaveData[]): CustomWaveData[] {
  return waves.filter((w) => w.waves.length > 0);
}

export function getNextWaveIndex(current: number, total: number, autoCycle: boolean): number | null {
  if (total <= 0) return null;
  const next = current + 1;
  if (next < total) return next;
  return autoCycle ? 0 : null;
}

export const INTER_WAVE_DELAY_TICKS = 80;

export function buildStaticInstances(enemies: CustomEnemyData[]): BattleInstance[] {
  return enemies.map((_, i) => ({ id: i, templateIndex: i }));
}
