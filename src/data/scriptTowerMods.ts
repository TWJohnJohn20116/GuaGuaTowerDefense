/**
 * 腳本對塔的增益／減益（action.modifyTower 的落地資料）
 *
 * 為什麼要獨立一支純函式模組：
 *  - updateTowers 每幀每塔都要算，不能在那裡做 map 查找以外的邏輯
 *  - 夾限與「全域 × 單塔種」的合成規則需要可測試，不能散在 store 與 UI
 *
 * 資料形狀：scope → 部分倍率。scope 用塔種 id，或 '*' 表示全部塔。
 * 合成規則：先取 '*' 的倍率，再乘上該塔種自己的倍率（兩者預設 1）。
 */

export interface ScriptTowerMod {
  damage: number;
  range: number;
  fireRate: number;
}

export type ScriptTowerModStat = keyof ScriptTowerMod;

/** scope（塔種 id 或 '*'）→ 部分倍率 */
export type ScriptTowerModMap = Record<string, Partial<ScriptTowerMod>>;

/** 全部塔的 scope */
export const ALL_TOWER_SCOPE = '*';

/** 倍率上下限：低於 0.1 等於廢塔，高於 5 會讓平衡直接崩掉 */
export const SCRIPT_TOWER_MOD_MIN = 0.1;
export const SCRIPT_TOWER_MOD_MAX = 5;

export const NEUTRAL_TOWER_MOD: ScriptTowerMod = { damage: 1, range: 1, fireRate: 1 };

export function clampTowerMod(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(SCRIPT_TOWER_MOD_MAX, Math.max(SCRIPT_TOWER_MOD_MIN, value));
}

/** 解析某個塔種目前的有效倍率（'*' 與塔種自身相乘） */
export function resolveScriptTowerMod(
  map: ScriptTowerModMap | null | undefined,
  towerType: string,
): ScriptTowerMod {
  if (!map) return NEUTRAL_TOWER_MOD;
  const all = map[ALL_TOWER_SCOPE];
  const own = map[towerType];
  const pick = (stat: ScriptTowerModStat): number =>
    clampTowerMod((all?.[stat] ?? 1) * (own?.[stat] ?? 1));
  return { damage: pick('damage'), range: pick('range'), fireRate: pick('fireRate') };
}

/** 疊加一次增益：把倍率乘進既有值（重複套用會累乘，符合「每波強化」的直覺） */
export function applyScriptTowerMod(
  map: ScriptTowerModMap | null | undefined,
  scope: string,
  stat: ScriptTowerModStat,
  multiplier: number,
): ScriptTowerModMap {
  const base: ScriptTowerModMap = { ...(map ?? {}) };
  const key = scope.trim() || ALL_TOWER_SCOPE;
  const current = base[key] ?? {};
  base[key] = { ...current, [stat]: clampTowerMod((current[stat] ?? 1) * multiplier) };
  return base;
}

/** 是否為空（沒有任何增益）；空的時候 updateTowers 可以走零成本路徑 */
export function isEmptyTowerModMap(map: ScriptTowerModMap | null | undefined): boolean {
  return !map || Object.keys(map).length === 0;
}
