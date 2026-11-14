/**
 * 塔鎖定規則：優先級 + 標記 + 威脅（干擾／治療等）
 */

import type { TargetPriority } from '@/types/game';

export interface TargetEffectLike {
  type: string;
  duration: number;
  startTime: number;
}

export interface TargetCandidate {
  id: string;
  type: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  pathIndex: number;
  progress: number;
  effects?: TargetEffectLike[];
}

export interface AbilityLookupEntry {
  ability?: string;
}

const THREAT_SCORE: Record<string, number> = {
  jam: 50,
  healing: 40,
  escort: 35,
  explode: 30,
  sabotage: 30,
  spawning: 20,
};

export function getThreatScore(
  ability?: string,
  data?: AbilityLookupEntry,
): number {
  const key = ability ?? data?.ability;
  if (!key) return 0;
  return THREAT_SCORE[key] ?? 0;
}

export function isEnemyMarked(enemy: TargetCandidate, now: number): boolean {
  const effects = enemy.effects;
  if (!effects) return false;
  for (const effect of effects) {
    if (effect.type !== 'marked') continue;
    if (now - effect.startTime < effect.duration) return true;
  }
  return false;
}

export function defaultTargetPriority(towerType: string): TargetPriority {
  if (towerType === 'sniper' || towerType === 'frost') return 'threat';
  return 'first';
}

function isBetter(
  candidate: TargetCandidate,
  current: TargetCandidate,
  priority: TargetPriority,
  towerCol: number,
  towerRow: number,
  abilityLookup: Record<string, AbilityLookupEntry | undefined>,
  now: number,
): boolean {
  const candMarked = isEnemyMarked(candidate, now);
  const curMarked = isEnemyMarked(current, now);
  if (candMarked !== curMarked) return candMarked;

  switch (priority) {
    case 'last':
      return candidate.pathIndex < current.pathIndex
        || (candidate.pathIndex === current.pathIndex && candidate.progress < current.progress);
    case 'strongest':
      return candidate.health > current.health;
    case 'weakest':
      return candidate.health < current.health;
    case 'fastest':
      return candidate.speed > current.speed;
    case 'highestPercent':
      return candidate.health / candidate.maxHealth > current.health / current.maxHealth;
    case 'lowestPercent':
      return candidate.health / candidate.maxHealth < current.health / current.maxHealth;
    case 'closest': {
      const candDist = (candidate.x - towerCol) ** 2 + (candidate.y - towerRow) ** 2;
      const curDist = (current.x - towerCol) ** 2 + (current.y - towerRow) ** 2;
      return candDist < curDist;
    }
    case 'threat': {
      const candThreat = getThreatScore(abilityLookup[candidate.type]?.ability);
      const curThreat = getThreatScore(abilityLookup[current.type]?.ability);
      if (candThreat !== curThreat) return candThreat > curThreat;
      return candidate.pathIndex > current.pathIndex
        || (candidate.pathIndex === current.pathIndex && candidate.progress > current.progress);
    }
    case 'first':
    default:
      return candidate.pathIndex > current.pathIndex
        || (candidate.pathIndex === current.pathIndex && candidate.progress > current.progress);
  }
}

export function pickTowerTarget<T extends TargetCandidate>(
  enemies: T[],
  priority: TargetPriority,
  towerCol: number,
  towerRow: number,
  abilityLookup: Record<string, AbilityLookupEntry | undefined>,
  now: number,
): T | null {
  if (enemies.length === 0) return null;
  let best = enemies[0];
  for (let i = 1; i < enemies.length; i++) {
    if (isBetter(enemies[i], best, priority, towerCol, towerRow, abilityLookup, now)) {
      best = enemies[i];
    }
  }
  return best;
}
