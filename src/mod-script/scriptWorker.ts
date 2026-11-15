/**
 * Mod 腳本 Worker 入口
 *
 * 這裡是全專案唯一執行使用者程式碼的地方：
 * - 只回傳「指令」，不碰 store、不碰 DOM（沙箱內連 fetch／setTimeout 都被遮蔽）
 * - 單次事件最多 MOD_SCRIPT_LIMITS.maxCommandsPerEvent 條指令，超過就整批丟棄
 */
import type { ModScriptCommand, ModScriptHook, ModScriptPermission } from '@/types/modScript';
import type { HostToWorkerMessage, WorkerToHostMessage } from './protocol';
import { MOD_SCRIPT_HOOKS, MOD_SCRIPT_LIMITS } from './limits';
import { createSandboxApi, compileScriptHandlers, runScriptHook, type ScriptHandlerMap } from './sandbox';

interface WorkerScope {
  onmessage: ((event: { data: HostToWorkerMessage }) => void) | null;
  postMessage: (message: WorkerToHostMessage) => void;
}

const scope = self as unknown as WorkerScope;

let handlers: ScriptHandlerMap = {};
let permissions: ModScriptPermission[] = [];
let hooks: ModScriptHook[] = [];
let seed = 0;
let eventIndex = 0;

function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

scope.onmessage = (event) => {
  const message = event.data;

  if (message.kind === 'init') {
    try {
      handlers = compileScriptHandlers(message.code);
      permissions = message.permissions;
      hooks = message.hooks;
      seed = message.seed >>> 0;
      eventIndex = 0;
      const handlerCount = MOD_SCRIPT_HOOKS.filter((hook) => handlers[hook] !== undefined).length;
      scope.postMessage({ kind: 'ready', handlerCount });
    } catch (error) {
      scope.postMessage({ kind: 'error', phase: 'init', message: extractMessage(error) });
    }
    return;
  }

  const { requestId, hook, detail, snapshot } = message;
  if (!hooks.includes(hook) || handlers[hook] === undefined) {
    scope.postMessage({ kind: 'result', requestId, commands: [] });
    return;
  }

  const commands: ModScriptCommand[] = [];
  const api = createSandboxApi({
    permissions,
    snapshot,
    seed: (seed + eventIndex) >>> 0,
    emit: (command) => {
      if (commands.length >= MOD_SCRIPT_LIMITS.maxCommandsPerEvent) return false;
      commands.push(command);
      return true;
    },
    warn: (text) => {
      if (commands.length >= MOD_SCRIPT_LIMITS.maxCommandsPerEvent) return;
      commands.push({ kind: 'log', level: 'warn', message: text.slice(0, 400) });
    },
  });

  eventIndex += 1;
  const runtimeError = runScriptHook(handlers, hook, detail, api);
  if (runtimeError) {
    scope.postMessage({ kind: 'error', requestId, phase: 'event', message: runtimeError });
    return;
  }
  scope.postMessage({ kind: 'result', requestId, commands });
};
