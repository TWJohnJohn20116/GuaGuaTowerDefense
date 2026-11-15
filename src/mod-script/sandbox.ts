/**
 * 腳本沙箱（Worker 內執行；本檔不含任何 store／React 依賴，可單測）
 *
 * 契約：腳本用「具名函式」宣告 hook，例如
 *   function onWaveStart(ctx, api) { api.addMoney(10); }
 * 腳本只能透過 api 產生「指令」，指令由主執行緒驗證權限後才落地。
 */
import type {
  ModScriptCommand,
  ModScriptEventDetail,
  ModScriptHook,
  ModScriptPermission,
  ModScriptStateSnapshot,
  ModScriptStatusEffect,
  ScriptStateRecord,
  ScriptStateValue,
} from '@/types/modScript';
import { MOD_SCRIPT_HOOKS, MOD_SCRIPT_LIMITS, SHADOWED_GLOBAL_NAMES } from './limits';
import { createScriptRng } from './rng';
import { SCRIPT_TOWER_MOD_MAX, SCRIPT_TOWER_MOD_MIN } from '@/data/scriptTowerMods';
import { canRunCommand, requiredPermission } from './permissions';

type ScriptHandler = (ctx: ModScriptEventDetail, api: SandboxApi) => void;
export type ScriptHandlerMap = Partial<Record<ModScriptHook, ScriptHandler>>;

interface SandboxApi {
  readonly state: ModScriptStateSnapshot;
  log: (message: string, level?: 'debug' | 'info' | 'warn') => void;
  rng: () => number;
  rngInt: (min: number, max: number) => number;
  chance: (probability: number) => boolean;
  pick: <T>(items: readonly T[]) => T | null;
  money: { add: (amount: number) => void };
  base: { heal: (amount: number) => void; damage: (amount: number) => void };
  spawn: { enemy: (enemyType: string, count?: number, intervalMs?: number) => void };
  score: { add: (amount: number) => void };
  tower: {
    /** scope 用塔種 id 或 '*'；stat 是 damage／range／fireRate；multiplier 是倍率 */
    modify: (scope: string, stat: 'damage' | 'range' | 'fireRate', multiplier: number) => void;
    upgrade: (row: number, col: number) => void;
    sell: (row: number, col: number) => void;
  };
  status: {
    apply: (
      effect: ModScriptStatusEffect,
      durationMs: number,
      value?: number,
      target?: { enemyType?: string },
    ) => void;
  };
  store: {
    get: (key: string) => ScriptStateValue | undefined;
    set: (key: string, value: ScriptStateValue) => void;
    all: () => ScriptStateRecord;
  };
}

interface SandboxHost {
  permissions: readonly ModScriptPermission[];
  snapshot: ModScriptStateSnapshot;
  seed: number;
  /** 回傳 false 代表超出單次事件指令上限（後續指令全部丟棄） */
  emit: (command: ModScriptCommand) => boolean;
  /** 權限不足或參數不合法時的提示（走 log 通道） */
  warn: (message: string) => void;
}

const STATUS_EFFECTS: readonly ModScriptStatusEffect[] = [
  'slow',
  'poison',
  'burn',
  'stun',
  'weakness',
  'exposed',
  'root',
];

function finite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isStatusEffect(value: string): value is ModScriptStatusEffect {
  return (STATUS_EFFECTS as readonly string[]).includes(value);
}

const TOWER_STATS = ['damage', 'range', 'fireRate'] as const;

function isTowerStat(value: string): value is (typeof TOWER_STATS)[number] {
  return (TOWER_STATS as readonly string[]).includes(value);
}

/** 建立一支腳本專屬的 api 物件（host 負責收指令與上限） */
export function createSandboxApi(host: SandboxHost): SandboxApi {
  const state = host.snapshot;
  const rng = createScriptRng(host.seed);
  let exhausted = false;
  let emitted = 0;

  const push = (command: ModScriptCommand): void => {
    if (exhausted) return;
    // 上限在沙箱內就先擋：Worker 端與測試端都不必再各自重複計算
    if (emitted >= MOD_SCRIPT_LIMITS.maxCommandsPerEvent) {
      exhausted = true;
      return;
    }
    if (!canRunCommand(host.permissions, command)) {
      host.warn(`權限不足：${command.kind} 需要「${requiredPermission(command.kind)}」`);
      return;
    }
    emitted += 1;
    if (!host.emit(command)) exhausted = true;
  };

  return {
    state,
    log: (message, level = 'info') => {
      push({ kind: 'log', level, message: String(message).slice(0, 400) });
    },
    rng: () => rng.next(),
    rngInt: (min, max) => rng.int(min, max),
    chance: (probability) => rng.chance(probability),
    pick: (items) => rng.pick(items),
    money: {
      add: (amount) => {
        const delta = Math.round(clamp(finite(amount, 0), -MOD_SCRIPT_LIMITS.maxMoneyDelta, MOD_SCRIPT_LIMITS.maxMoneyDelta));
        if (delta === 0) return;
        push({ kind: 'addMoney', amount: delta });
      },
    },
    base: {
      heal: (amount) => {
        const delta = Math.round(clamp(finite(amount, 0), 0, MOD_SCRIPT_LIMITS.maxMoneyDelta));
        if (delta <= 0) return;
        push({ kind: 'healBase', amount: delta });
      },
      damage: (amount) => {
        const delta = Math.round(clamp(finite(amount, 0), 0, MOD_SCRIPT_LIMITS.maxMoneyDelta));
        if (delta <= 0) return;
        push({ kind: 'damageBase', amount: delta });
      },
    },
    spawn: {
      enemy: (enemyType, count = 1, intervalMs = 200) => {
        const n = Math.round(clamp(finite(count, 1), 1, MOD_SCRIPT_LIMITS.maxSpawnCount));
        const gap = Math.round(clamp(finite(intervalMs, 200), 0, 10000));
        push({ kind: 'spawnEnemy', enemyType: String(enemyType), count: n, intervalMs: gap });
      },
    },
    score: {
      add: (amount) => {
        const delta = Math.round(clamp(finite(amount, 0), -MOD_SCRIPT_LIMITS.maxMoneyDelta, MOD_SCRIPT_LIMITS.maxMoneyDelta));
        if (delta === 0) return;
        push({ kind: 'addScore', amount: delta });
      },
    },
    tower: {
      modify: (scope, stat, multiplier) => {
        if (!isTowerStat(stat)) {
          host.warn(`未知塔屬性：${String(stat)}`);
          return;
        }
        const value = clamp(finite(multiplier, 1), SCRIPT_TOWER_MOD_MIN, SCRIPT_TOWER_MOD_MAX);
        push({ kind: 'modifyTower', scope: String(scope || '*').slice(0, 32), stat, multiplier: value });
      },
      upgrade: (row, col) => {
        push({ kind: 'upgradeTowerAt', row: Math.round(finite(row, 0)), col: Math.round(finite(col, 0)) });
      },
      sell: (row, col) => {
        push({ kind: 'sellTowerAt', row: Math.round(finite(row, 0)), col: Math.round(finite(col, 0)) });
      },
    },
    status: {
      apply: (effect, durationMs, value = 0, target = {}) => {
        if (!isStatusEffect(effect)) {
          host.warn(`未知狀態效果：${String(effect)}`);
          return;
        }
        const duration = Math.round(clamp(finite(durationMs, 1000), 1, MOD_SCRIPT_LIMITS.maxStatusDurationMs));
        push({
          kind: 'applyStatus',
          effect,
          durationMs: duration,
          value: finite(value, 0),
          ...(target.enemyType ? { enemyType: String(target.enemyType) } : {}),
        });
      },
    },
    store: {
      get: (key) => state.scriptState[String(key)],
      set: (key, value) => {
        const name = String(key).slice(0, 64);
        if (!name) {
          host.warn('狀態鍵不可為空');
          return;
        }
        const existingKeys = Object.keys(state.scriptState);
        if (!existingKeys.includes(name) && existingKeys.length >= MOD_SCRIPT_LIMITS.maxScriptStateKeys) {
          host.warn(`腳本狀態最多 ${MOD_SCRIPT_LIMITS.maxScriptStateKeys} 個鍵`);
          return;
        }
        let normalized: ScriptStateValue;
        if (typeof value === 'string') {
          normalized = value.slice(0, MOD_SCRIPT_LIMITS.maxScriptStateValueLength);
        } else if (typeof value === 'number') {
          normalized = Number.isFinite(value) ? value : 0;
        } else if (typeof value === 'boolean' || value === null) {
          normalized = value;
        } else {
          host.warn('腳本狀態只接受字串／數字／布林／null');
          return;
        }
        push({ kind: 'setScriptState', key: name, value: normalized });
      },
      all: () => ({ ...state.scriptState }),
    },
  };
}

function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * 把腳本原始碼編譯成 hook 表。
 * 只支援「具名函式」宣告，不支援 import/export——模組語法在 new Function 內本來就不可用。
 */
function constructScriptFactory(code: string): (...args: unknown[]) => unknown {
  if (code.length > MOD_SCRIPT_LIMITS.maxCodeLength) {
    throw new Error(`腳本過長（上限 ${MOD_SCRIPT_LIMITS.maxCodeLength} 字元）`);
  }
  const returns = MOD_SCRIPT_HOOKS.map(
    (hook) => `${hook}: typeof ${hook} === 'function' ? ${hook} : undefined`,
  ).join(',');
  const body = `"use strict";\n${code}\n;return {${returns}};`;
  // 只建構（= 解析語法），不呼叫；呼叫會執行使用者的頂層程式碼
  return new Function(...SHADOWED_GLOBAL_NAMES, body) as unknown as (...args: unknown[]) => unknown;
}

export function compileScriptHandlers(code: string): ScriptHandlerMap {
  const factory = constructScriptFactory(code);
  const shadowValues = SHADOWED_GLOBAL_NAMES.map(() => undefined);
  const raw = factory(...shadowValues);
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('腳本沒有回傳 hook 表');
  }
  const record = raw as Record<string, unknown>;
  const handlers: ScriptHandlerMap = {};
  for (const hook of MOD_SCRIPT_HOOKS) {
    const candidate = record[hook];
    if (typeof candidate === 'function') {
      handlers[hook] = candidate as ScriptHandler;
    }
  }
  return handlers;
}

/**
 * 語法檢查：回傳錯誤訊息，沒有錯就 null。
 * 只建構 Function（解析）不呼叫——編輯器每次按鍵都會跑這支，不能執行使用者程式碼。
 */
export function checkScriptSyntax(code: string): string | null {
  try {
    constructScriptFactory(code);
    return null;
  } catch (error) {
    return extractMessage(error);
  }
}

/** 執行單一 hook；回傳執行期例外訊息（無錯則 null） */
export function runScriptHook(
  handlers: ScriptHandlerMap,
  hook: ModScriptHook,
  ctx: ModScriptEventDetail,
  api: SandboxApi,
): string | null {
  const handler = handlers[hook];
  if (!handler) return null;
  try {
    handler(ctx, api);
    return null;
  } catch (error) {
    return extractMessage(error);
  }
}
