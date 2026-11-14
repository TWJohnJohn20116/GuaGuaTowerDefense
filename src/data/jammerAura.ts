/**
 * 干擾者光環：靠近塔時降低攻速（不疊乘，取最狠的一層）
 * jamRadius 單位為 px，50px = 1 格，與治療光環相同。
 */

export const JAMMER_CELL_PX = 50;

export interface JammerAura {
  x: number;
  y: number;
  radiusSq: number;
  fireRateMult: number;
}

export const JAMMER_SILENCE_DURATION = 1800;

const JAMMER_SUPPRESS_TYPES = new Set(['freeze', 'stun', 'petrify', 'silence']);

export interface JammerEffectLike {
  type: string;
  duration: number;
  startTime: number;
}

export interface JammerSource {
  type: string;
  x: number;
  y: number;
  health: number;
  effects?: JammerEffectLike[];
}

export interface JammerDataLike {
  ability?: string;
  jamRadius?: number;
  jamFireRateMult?: number;
}

export function isJammerSuppressed(enemy: JammerSource, now: number): boolean {
  const effects = enemy.effects;
  if (!effects) return false;
  for (const effect of effects) {
    if (!JAMMER_SUPPRESS_TYPES.has(effect.type)) continue;
    if (now - effect.startTime < effect.duration) return true;
  }
  return false;
}

/** 冰凍／暈眩／石化／沉默期間，干擾與治療等主動光環都會關閉 */
export const isAbilitySuppressed = isJammerSuppressed;

export function applyFrostSilenceToJammer(
  effects: JammerEffectLike[],
  towerType: string | undefined,
  enemyAbility: string | undefined,
  now: number,
): void {
  if (towerType !== 'frost' || enemyAbility !== 'jam') return;
  const existing = effects.find((effect) => effect.type === 'silence');
  if (existing) {
    existing.startTime = now;
    existing.duration = JAMMER_SILENCE_DURATION;
    return;
  }
  effects.push({ type: 'silence', duration: JAMMER_SILENCE_DURATION, startTime: now });
}

export function collectJammerAuras(
  enemies: JammerSource[],
  dataLookup: Record<string, JammerDataLike | undefined>,
  now?: number,
): JammerAura[] {
  const auras: JammerAura[] = [];
  for (const enemy of enemies) {
    if (enemy.health <= 0) continue;
    if (now !== undefined && isJammerSuppressed(enemy, now)) continue;
    const data = dataLookup[enemy.type];
    if (data?.ability !== 'jam') continue;
    const radiusPx = data.jamRadius;
    const fireRateMult = data.jamFireRateMult;
    if (!radiusPx || radiusPx <= 0 || !fireRateMult || fireRateMult >= 1) continue;
    const radiusCells = radiusPx / JAMMER_CELL_PX;
    auras.push({
      x: enemy.x,
      y: enemy.y,
      radiusSq: radiusCells * radiusCells,
      fireRateMult,
    });
  }
  return auras;
}

/**
 * 每幀快取版的 collectJammerAuras
 *
 * 同一個 `enemies` 陣列在一幀內會被 4 個地方各掃一次：
 * updateTowers（算攻速）、動態層繪製（畫干擾圈）、漂浮塔面板、戰術協議 HUD。
 * 壓測 7,587 隻敵人時就是每幀 3 萬次多餘比較 + 4 個陣列配置。
 *
 * 以陣列參考當 key：同一幀內（陣列還沒被換掉）只算一次，其餘全部命中快取。
 * 敵人陣列每幀都會被 updateEnemies / updateTowers 換新，所以快取自然每幀失效。
 */
let jammerAuraCacheSource: JammerSource[] | null = null;
let jammerAuraCacheValue: JammerAura[] = [];

export function collectJammerAurasCached(
  enemies: JammerSource[],
  dataLookup: Record<string, JammerDataLike | undefined>,
  now?: number,
): JammerAura[] {
  if (enemies === jammerAuraCacheSource) return jammerAuraCacheValue;

  jammerAuraCacheValue = collectJammerAuras(enemies, dataLookup, now);
  jammerAuraCacheSource = enemies;
  return jammerAuraCacheValue;
}

/** 回傳攻速倍率；未被干擾時為 1 */
export function getTowerJamFireRateMult(
  col: number,
  row: number,
  auras: JammerAura[],
): number {
  let best = 1;
  for (const aura of auras) {
    const dx = col - aura.x;
    const dy = row - aura.y;
    if (dx * dx + dy * dy <= aura.radiusSq && aura.fireRateMult < best) {
      best = aura.fireRateMult;
    }
  }
  return best;
}

export function isTowerJammed(col: number, row: number, auras: JammerAura[]): boolean {
  return getTowerJamFireRateMult(col, row, auras) < 1;
}

export function listJammedTowerIds(
  towers: { id: string; col: number; row: number }[],
  auras: JammerAura[],
): string[] {
  return towers.filter((tower) => isTowerJammed(tower.col, tower.row, auras)).map((tower) => tower.id);
}
