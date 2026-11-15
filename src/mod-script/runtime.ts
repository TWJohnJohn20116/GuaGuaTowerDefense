/**
 * 腳本執行器（主執行緒）
 *
 * 責任：把已啟用 mod 的腳本各自開一個 Worker、依 hook 派發事件、看門狗超時就砍、
 * 收指令後交給 commands 落地。任何腳本錯誤都不影響遊戲主迴圈。
 */
import type { Mod } from '@/types/game';
import type {
  CustomScriptData,
  ModScriptEventDetail,
  ModScriptHook,
  ModScriptRuntimeStatus,
  ModScriptStateSnapshot,
} from '@/types/modScript';
import { useModStore } from '@/store/modStore';
import { useModScriptStore } from '@/store/modScriptStore';
import { MOD_SCRIPT_LIMITS } from './limits';
import { hashString } from './rng';
import type { HostToWorkerMessage, WorkerToHostMessage } from './protocol';
import { applyModScriptCommands } from './commands';
import { verifyModSignature } from './signing';

interface RunnerEntry {
  script: CustomScriptData;
  worker: Worker;
  requestId: number;
  timer: ReturnType<typeof setTimeout> | null;
  ready: boolean;
  signature: string;
  seed: number;
  status: ModScriptRuntimeStatus;
}

function signatureOf(script: CustomScriptData): string {
  return [script.code, script.hooks.join('|'), script.permissions.join('|'), String(script.throttleMs ?? 0)].join('\u0000');
}

function toScriptList(mods: Mod[]): CustomScriptData[] {
  return mods
    .filter((mod) => mod.enabled)
    .slice()
    .sort((a, b) => a.loadOrder - b.loadOrder)
    .flatMap((mod) => (mod.content.scripts ?? []).filter((script) => script.enabled !== false));
}

class ModScriptRuntime {
  private entries = new Map<string, RunnerEntry>();
  private disabledIds = new Set<string>();
  private syncedSignature = '';
  private disposed = false;
  /** 金錢變動監聽（onMoneyChanged 用；一次訂閱、全域節流） */
  private moneyUnsub: (() => void) | null = null;
  private lastMoneyNotify = 0;
  /** modId → 是否可執行腳本（簽章模式下的驗簽快取） */
  private trustCache = new Map<string, boolean>();
  private trustPending = new Set<string>();
  private lastPolicy = '';

  /** 依目前 mod 清單與總開關，重建 Worker 集合（內容沒變就跳過） */
  sync(): void {
    if (this.disposed) return;
    const enabled = useModScriptStore.getState().enabled;
    const mods = useModStore.getState().mods;
    const policy = `${useModScriptStore.getState().trustMode}:${useModScriptStore
      .getState()
      .trustedKeyFingerprints.join(',')}`;
    if (policy !== this.lastPolicy) {
      this.lastPolicy = policy;
      this.trustCache.clear();
    }
    const signature = `${enabled ? '1' : '0'}:${policy}:${mods
      .map((mod) => `${mod.metadata.id}:${mod.enabled ? 1 : 0}:${mod.loadOrder}`)
      .join(',')}:${mods
      .map((mod) => (mod.content.scripts ?? []).map((script) => `${script.id}@${signatureOf(script)}`).join('+'))
      .join(',')}`;
    if (signature === this.syncedSignature) return;
    this.syncedSignature = signature;

    const desired = enabled
      ? toScriptList(mods).filter((script) => {
          const owner = mods.find((mod) => mod.metadata.id === script.modId);
          return owner ? this.isModTrusted(owner) : true;
        })
      : [];
    const desiredIds = new Set(desired.map((script) => script.id));

    for (const [scriptId, entry] of this.entries) {
      const next = desired.find((script) => script.id === scriptId);
      if (!next || signatureOf(next) !== entry.signature) {
        this.terminate(scriptId, entry);
      }
    }

    for (const script of desired) {
      if (this.entries.has(script.id) || this.disabledIds.has(script.id)) continue;
      this.spawn(script);
    }

    if (this.entries.size > 0) this.ensureMoneyWatcher();

    for (const scriptId of this.disabledIds) {
      if (!desiredIds.has(scriptId)) this.disabledIds.delete(scriptId);
    }

    this.publishStatuses();
  }

  dispatch(hook: ModScriptHook, detail: ModScriptEventDetail): void {
    if (this.disposed) return;
    this.sync();
    if (this.entries.size === 0) return;
    void this.dispatchAsync(hook, detail);
  }

  dispose(): void {
    this.disposed = true;
    for (const [scriptId, entry] of this.entries) this.terminate(scriptId, entry);
    this.entries.clear();
    this.moneyUnsub?.();
    this.moneyUnsub = null;
    this.publishStatuses();
  }

  /**
   * 金錢變動的單一訂閱點。
   *
   * 不在每個 setState 現場插樁（那會散落在幾十處、且容易漏），
   * 而是訂閱 store 的 money 欄位變化，再依 moneyNotifyIntervalMs 節流。
   */
  private ensureMoneyWatcher(): void {
    if (this.moneyUnsub) return;
    void import('@/store/gameStore')
      .then(({ useGameStore }) => {
        if (this.disposed || this.moneyUnsub) return;
        this.moneyUnsub = useGameStore.subscribe((state, prevState) => {
          if (state.money === prevState.money) return;
          const now = Date.now();
          if (now - this.lastMoneyNotify < MOD_SCRIPT_LIMITS.moneyNotifyIntervalMs) return;
          this.lastMoneyNotify = now;
          this.dispatch('onMoneyChanged', {
            hook: 'onMoneyChanged',
            amount: state.money - prevState.money,
          });
        });
      })
      .catch((error: unknown) => {
        console.error('[mod-script] 金錢監聽建立失敗', error);
      });
  }

  /**
   * 信任判定：'all' 直接放行；'signed' 需「簽章有效 + 公鑰指紋已信任」。
   * 驗簽是非同步的，第一次會先回 false 並在完成後重跑 sync()。
   */
  private isModTrusted(mod: Mod): boolean {
    const cached = this.trustCache.get(mod.metadata.id);
    if (cached !== undefined) return cached;
    if (useModScriptStore.getState().trustMode === 'all') {
      this.trustCache.set(mod.metadata.id, true);
      return true;
    }
    if (this.trustPending.has(mod.metadata.id)) return false;
    this.trustPending.add(mod.metadata.id);
    void verifyModSignature(mod)
      .then((result) => {
        const trusted = useModScriptStore.getState().trustedKeyFingerprints;
        const ok = result.status === 'valid' && !!result.fingerprint && trusted.includes(result.fingerprint);
        this.trustCache.set(mod.metadata.id, ok);
        this.trustPending.delete(mod.metadata.id);
        if (!ok) {
          useModScriptStore.getState().pushLog({
            at: Date.now(),
            level: 'warn',
            message: result.status === 'unsigned'
              ? '目前是「僅簽章」模式，此 mod 沒有簽章，腳本不會執行'
              : `簽章驗證未通過（${result.status}${result.error ? `：${result.error}` : ''}）`,
            scriptId: `trust:${mod.metadata.id}`,
            scriptName: mod.metadata.name,
          });
        }
        this.syncedSignature = '';
        this.sync();
      })
      .catch(() => {
        this.trustPending.delete(mod.metadata.id);
      });
    return false;
  }

  private spawn(script: CustomScriptData): void {
    let worker: Worker;
    try {
      worker = new Worker(new URL('./scriptWorker.ts', import.meta.url), { type: 'module' });
    } catch (error) {
      useModScriptStore.getState().pushLog({
        at: Date.now(),
        level: 'error',
        message: `無法建立腳本 Worker：${error instanceof Error ? error.message : String(error)}`,
        scriptId: script.id,
        scriptName: script.name,
      });
      return;
    }

    const entry: RunnerEntry = {
      script,
      worker,
      requestId: 0,
      timer: null,
      ready: false,
      signature: signatureOf(script),
      seed: hashString(script.id),
      status: {
        scriptId: script.id,
        scriptName: script.name,
        state: 'idle',
        crashes: 0,
        calls: 0,
        lastAt: 0,
      },
    };

    worker.onmessage = (event: MessageEvent<WorkerToHostMessage>) => {
      this.handleMessage(entry, event.data);
    };
    worker.onerror = (event) => {
      this.fail(entry, event.message || 'Worker 未捕捉的錯誤', true);
    };
    this.lastKnown.set(script.id, { name: script.name });

    const initMessage: HostToWorkerMessage = {
      kind: 'init',
      scriptId: script.id,
      code: script.code,
      permissions: script.permissions,
      hooks: script.hooks,
      seed: entry.seed,
    };
    worker.postMessage(initMessage);
    this.armTimer(entry, MOD_SCRIPT_LIMITS.initTimeoutMs, '初始化逾時');
    this.entries.set(script.id, entry);
  }

  private handleMessage(entry: RunnerEntry, message: WorkerToHostMessage): void {
    this.clearTimer(entry);
    if (message.kind === 'ready') {
      entry.ready = true;
      entry.status.state = 'running';
      this.publishStatuses();
      return;
    }
    if (message.kind === 'error') {
      this.fail(entry, message.message, false);
      return;
    }
    entry.status.calls += 1;
    entry.status.lastAt = Date.now();
    entry.status.state = 'running';
    void applyModScriptCommands(message.commands, {
      scriptId: entry.script.id,
      scriptName: entry.script.name,
    });
    this.publishStatuses();
  }

  /**
   * 記錄一次錯誤。
   * fatal（逾時／Worker 崩潰）＝該 Worker 已不可信，直接砍掉並停用到下次啟動；
   * 非 fatal（腳本自己 throw）＝保留 Worker，累積到 crashLimit 才停用。
   */
  private fail(entry: RunnerEntry, text: string, fatal: boolean): void {
    this.clearTimer(entry);
    entry.status.crashes += 1;
    entry.status.lastError = text;
    entry.status.state = 'error';
    const known = this.lastKnown.get(entry.script.id);
    this.lastKnown.set(entry.script.id, { name: known?.name ?? entry.script.name, lastError: text });
    useModScriptStore.getState().pushLog({
      at: Date.now(),
      level: 'error',
      message: text,
      scriptId: entry.script.id,
      scriptName: entry.script.name,
    });
    if (fatal || entry.status.crashes >= MOD_SCRIPT_LIMITS.crashLimit) {
      entry.status.state = 'disabled';
      this.disabledIds.add(entry.script.id);
      this.terminate(entry.script.id, entry);
    }
    this.publishStatuses();
  }

  private armTimer(entry: RunnerEntry, ms: number, reason: string): void {
    this.clearTimer(entry);
    entry.timer = setTimeout(() => {
      entry.timer = null;
      // 逾時代表腳本卡住（while(true)、大量迴圈）：Worker 已不可信，直接停用
      this.fail(entry, `${reason}（>${ms}ms），已終止該腳本`, true);
    }, ms);
  }

  private clearTimer(entry: RunnerEntry): void {
    if (entry.timer !== null) {
      clearTimeout(entry.timer);
      entry.timer = null;
    }
  }

  private terminate(scriptId: string, entry: RunnerEntry): void {
    this.clearTimer(entry);
    entry.worker.onmessage = null;
    entry.worker.onerror = null;
    entry.worker.terminate();
    this.entries.delete(scriptId);
  }

  private async dispatchAsync(hook: ModScriptHook, detail: ModScriptEventDetail): Promise<void> {
    let snapshot: ModScriptStateSnapshot;
    try {
      snapshot = await buildSnapshot();
    } catch {
      return;
    }
    if (this.disposed) return;
    const scriptStates = useModScriptStore.getState().scriptState;
    for (const entry of [...this.entries.values()]) {
      if (!entry.ready) continue;
      if (!entry.script.hooks.includes(hook)) continue;
      const perScriptSnapshot: ModScriptStateSnapshot = {
        ...snapshot,
        scriptState: scriptStates[entry.script.id] ?? {},
      };
      const throttle = entry.script.throttleMs ?? 0;
      if (throttle > 0 && entry.status.lastAt > 0 && Date.now() - entry.status.lastAt < throttle) continue;
      entry.requestId += 1;
      const message: HostToWorkerMessage = {
        kind: 'event',
        requestId: entry.requestId,
        hook,
        detail,
        snapshot: perScriptSnapshot,
      };
      entry.worker.postMessage(message);
      this.armTimer(entry, MOD_SCRIPT_LIMITS.dispatchTimeoutMs, '事件處理逾時');
    }
  }

  private publishStatuses(): void {
    const statuses = [...this.entries.values()].map((entry) => ({ ...entry.status }));
    for (const scriptId of this.disabledIds) {
      if (statuses.some((status) => status.scriptId === scriptId)) continue;
      const known = this.lastKnown.get(scriptId);
      statuses.push({
        scriptId,
        scriptName: known?.name ?? scriptId,
        state: 'disabled',
        crashes: MOD_SCRIPT_LIMITS.crashLimit,
        calls: 0,
        lastAt: 0,
        ...(known?.lastError ? { lastError: known.lastError } : {}),
      });
    }
    useModScriptStore.getState().setStatuses(statuses);
  }

  /** 停用腳本的名稱快取（Worker 已終止，狀態列仍要看得到名字） */
  private lastKnown = new Map<string, { name: string; lastError?: string }>();
}

/** 建立給腳本的唯讀快照（動態 import，避免 store↔runtime 靜態循環） */
async function buildSnapshot(): Promise<ModScriptStateSnapshot> {
  const { useGameStore } = await import('@/store/gameStore');
  const state = useGameStore.getState();
  const enemiesByType: Record<string, number> = {};
  for (const enemy of state.enemies) {
    enemiesByType[enemy.type] = (enemiesByType[enemy.type] ?? 0) + 1;
  }
  return {
    scene: state.scene,
    wave: state.currentWave,
    maxWaves: state.maxWaves,
    endless: state.endlessMode,
    money: state.money,
    health: state.health,
    towerCount: state.towers.length,
    enemyCount: state.enemies.length,
    enemiesByType,
    towerTypes: [...new Set(state.towers.map((tower) => tower.type))],
    difficulty: state.lastStartArgs?.difficulty ?? 'normal',
    pathName: state.selectedPath,
    elapsedMs: Date.now(),
    // 每支腳本看到的是自己那份；派發時再由 dispatchAsync 覆寫
    scriptState: {},
  };
}

export const modScriptRuntime = new ModScriptRuntime();
