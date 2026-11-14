/**
 * 金錢塔金庫光環：光環內擊殺額外賞金（不疊加）
 */

export const MONEY_AURA_BASE_RANGE = 3;
export const MONEY_AURA_RANGE_PER_LEVEL = 0.25;
export const MONEY_KILL_BONUS_MULT = 0.3;

export interface MoneyAura {
  x: number;
  y: number;
  radiusSq: number;
}

export interface MoneyAuraTower {
  type: string;
  gridPos: { col: number; row: number };
  level?: number;
}

export function getMoneyAuraRange(level: number): number {
  return MONEY_AURA_BASE_RANGE + Math.max(0, level - 1) * MONEY_AURA_RANGE_PER_LEVEL;
}

export function collectMoneyAuras(towers: MoneyAuraTower[]): MoneyAura[] {
  const auras: MoneyAura[] = [];
  for (const tower of towers) {
    if (tower.type !== 'money') continue;
    const range = getMoneyAuraRange(tower.level ?? 1);
    auras.push({
      x: tower.gridPos.col,
      y: tower.gridPos.row,
      radiusSq: range * range,
    });
  }
  return auras;
}

export function isInsideMoneyAura(x: number, y: number, auras: MoneyAura[]): boolean {
  for (const aura of auras) {
    const dx = x - aura.x;
    const dy = y - aura.y;
    if (dx * dx + dy * dy <= aura.radiusSq) return true;
  }
  return false;
}

/** 光環內擊殺的額外賞金；重疊不疊加，圈外為 0 */
export function getKillBountyBonus(
  x: number,
  y: number,
  reward: number,
  auras: MoneyAura[],
): number {
  if (reward <= 0 || auras.length === 0) return 0;
  if (!isInsideMoneyAura(x, y, auras)) return 0;
  return Math.max(1, Math.round(reward * MONEY_KILL_BONUS_MULT));
}
