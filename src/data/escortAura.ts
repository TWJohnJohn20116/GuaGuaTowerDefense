/**
 * 護航光環：靠近護航者的敵人獲得額外裝甲（不疊加，取最高一層）
 * escortRadius 單位為 px，50px = 1 格，與治療／干擾光環相同。
 */

import { isAbilitySuppressed } from '@/data/jammerAura';

export const ESCORT_CELL_PX = 50;

export interface EscortAura {
  x: number;
  y: number;
  radiusSq: number;
  armor: number;
}

export interface EscortSource {
  type: string;
  x: number;
  y: number;
  health: number;
  effects?: { type: string; duration: number; startTime: number }[];
}

export interface EscortDataLike {
  ability?: string;
  escortRadius?: number;
  escortArmor?: number;
}

export function collectEscortAuras(
  enemies: EscortSource[],
  dataLookup: Record<string, EscortDataLike | undefined>,
  now?: number,
): EscortAura[] {
  const auras: EscortAura[] = [];
  for (const enemy of enemies) {
    if (enemy.health <= 0) continue;
    if (now !== undefined && isAbilitySuppressed(enemy, now)) continue;
    const data = dataLookup[enemy.type];
    if (data?.ability !== 'escort') continue;
    const radiusPx = data.escortRadius;
    const armor = data.escortArmor;
    if (!radiusPx || radiusPx <= 0 || !armor || armor <= 0) continue;
    const radiusCells = radiusPx / ESCORT_CELL_PX;
    auras.push({
      x: enemy.x,
      y: enemy.y,
      radiusSq: radiusCells * radiusCells,
      armor,
    });
  }
  return auras;
}

/** 回傳額外裝甲值；未被護航時為 0 */
export function getEscortArmorAdd(
  x: number,
  y: number,
  auras: EscortAura[],
): number {
  let best = 0;
  for (const aura of auras) {
    const dx = x - aura.x;
    const dy = y - aura.y;
    if (dx * dx + dy * dy <= aura.radiusSq && aura.armor > best) {
      best = aura.armor;
    }
  }
  return best;
}
