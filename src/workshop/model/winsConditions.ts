// 勝負條件的純函式：正規化、合併（專案層 ← 關卡層）、序列化、判定。
//
// 這裡不碰 store、不碰 React，也不產生任何中文——UI 文案一律走 studio.* 的 i18n key。

import type {
  WinCondition,
  WorkshopMatchSnapshot,
  WorkshopOutcome,
  WorkshopScoreRule,
} from '@/types/workshop';

/** 新關卡的預設勝負條件（守住 10 波、基地 20 血、起手 150 金） */
export const DEFAULT_WIN_CONDITIONS: WinCondition = {
  surviveWaves: 10,
  baseHealth: 20,
  initialMoney: 150,
  waveIntervalSeconds: 8,
  bossKillRequired: false,
  scoreRules: [],
};

const SCORE_WEIGHT_LIMIT = 100;

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(min, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readInt(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.round(clampNumber(value, min, max));
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function normalizeScoreRules(raw: unknown): WorkshopScoreRule[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const rules: WorkshopScoreRule[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const id = typeof item.id === 'string' ? item.id.trim() : '';
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const label = typeof item.label === 'string' ? item.label : '';
    const weight = typeof item.weight === 'number' ? clampNumber(item.weight, -SCORE_WEIGHT_LIMIT, SCORE_WEIGHT_LIMIT) : 0;
    rules.push({ id, label, weight });
  }
  return rules;
}

/**
 * 把任意（可能來自舊存檔／手改 JSON）的值收斂成合法勝負條件。
 * 只保留有值的欄位，讓「未設定」與「設為 0」語意分得開。
 */
export function normalizeWinConditions(raw: unknown): WinCondition {
  const record = isRecord(raw) ? raw : {};
  const next: WinCondition = {};

  const surviveWaves = readInt(record.surviveWaves, 0, 9999);
  if (surviveWaves !== undefined) next.surviveWaves = surviveWaves;

  const surviveSeconds = readInt(record.surviveSeconds, 0, 86400);
  if (surviveSeconds !== undefined) next.surviveSeconds = surviveSeconds;

  const baseHealth = readInt(record.baseHealth, 1, 9999);
  if (baseHealth !== undefined) next.baseHealth = baseHealth;

  const initialMoney = readInt(record.initialMoney, 0, 999999);
  if (initialMoney !== undefined) next.initialMoney = initialMoney;

  const waveIntervalSeconds = readInt(record.waveIntervalSeconds, 0, 600);
  if (waveIntervalSeconds !== undefined) next.waveIntervalSeconds = waveIntervalSeconds;

  const bossKillRequired = readBoolean(record.bossKillRequired);
  if (bossKillRequired !== undefined) next.bossKillRequired = bossKillRequired;

  const maxLeaks = readInt(record.maxLeaks, 0, 9999);
  if (maxLeaks !== undefined) next.maxLeaks = maxLeaks;

  const timeLimitSeconds = readInt(record.timeLimitSeconds, 0, 86400);
  if (timeLimitSeconds !== undefined) next.timeLimitSeconds = timeLimitSeconds;

  const scoreRules = normalizeScoreRules(record.scoreRules);
  if (scoreRules.length > 0) next.scoreRules = scoreRules;

  return next;
}

/** 合併：patch 上有值的欄位覆寫 base，其餘繼承（關卡覆寫專案層就靠這支） */
export function mergeWinConditions(base: WinCondition, patch?: Partial<WinCondition> | null): WinCondition {
  const normalizedBase = normalizeWinConditions(base);
  const normalizedPatch = normalizeWinConditions(patch ?? {});
  const merged: WinCondition = { ...normalizedBase, ...normalizedPatch };
  const scoreRules = normalizedPatch.scoreRules ?? normalizedBase.scoreRules;
  if (scoreRules && scoreRules.length > 0) merged.scoreRules = scoreRules;
  else delete merged.scoreRules;
  return merged;
}

const SERIALIZE_KEYS = [
  'surviveWaves',
  'surviveSeconds',
  'baseHealth',
  'initialMoney',
  'waveIntervalSeconds',
  'bossKillRequired',
  'maxLeaks',
  'timeLimitSeconds',
] as const;

/** 穩定序列化：固定欄位順序、丟掉 undefined，方便比對與存入專案檔 */
export function serializeWinConditions(condition: WinCondition): string {
  const normalized = normalizeWinConditions(condition);
  const ordered: Record<string, unknown> = {};
  for (const key of SERIALIZE_KEYS) {
    const value = normalized[key];
    if (value !== undefined) ordered[key] = value;
  }
  const scoreRules = normalized.scoreRules ?? [];
  if (scoreRules.length > 0) {
    ordered.scoreRules = scoreRules.map((rule) => ({ id: rule.id, label: rule.label, weight: rule.weight }));
  }
  return JSON.stringify(ordered);
}

/** 反序列化：壞字串／非物件一律回 null，不丟例外 */
export function parseWinConditions(text: string): WinCondition | null {
  if (typeof text !== 'string' || text.trim().length === 0) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    if (!isRecord(parsed) || Array.isArray(parsed)) return null;
    return normalizeWinConditions(parsed);
  } catch {
    return null;
  }
}

/**
 * 判定當前局勢。
 *
 * 順序：先看失敗條件（基地歸零／漏怪超過上限／超時），再看勝利條件；
 * 兩邊都沒設定時回 ongoing（不設條件不代表第一幀就贏）。
 */
export function evaluateWinConditions(condition: WinCondition, snapshot: WorkshopMatchSnapshot): WorkshopOutcome {
  const normalized = normalizeWinConditions(condition);

  const baseHealth = normalized.baseHealth;
  if (baseHealth !== undefined && snapshot.baseHealth <= 0) return 'defeat';

  const maxLeaks = normalized.maxLeaks;
  if (maxLeaks !== undefined && snapshot.leaks > maxLeaks) return 'defeat';

  const timeLimitSeconds = normalized.timeLimitSeconds;
  if (timeLimitSeconds !== undefined && snapshot.secondsElapsed > timeLimitSeconds) return 'defeat';

  const requiredWaves = normalized.surviveWaves ?? 0;
  const requiredSeconds = normalized.surviveSeconds ?? 0;
  const requiresBoss = normalized.bossKillRequired === true;

  if (requiredWaves === 0 && requiredSeconds === 0 && !requiresBoss) return 'ongoing';

  const wavesDone = snapshot.wavesSurvived >= requiredWaves;
  const secondsDone = snapshot.secondsElapsed >= requiredSeconds;
  const bossDone = requiresBoss ? snapshot.bossKilled : true;

  return wavesDone && secondsDone && bossDone ? 'victory' : 'ongoing';
}
