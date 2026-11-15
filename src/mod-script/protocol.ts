/**
 * 主執行緒 ↔ 腳本 Worker 的訊息協定（判別式 union，兩邊共用）
 */
import type {
  ModScriptCommand,
  ModScriptEventDetail,
  ModScriptHook,
  ModScriptPermission,
  ModScriptStateSnapshot,
} from '@/types/modScript';

export interface WorkerInitMessage {
  kind: 'init';
  scriptId: string;
  code: string;
  permissions: ModScriptPermission[];
  hooks: ModScriptHook[];
  seed: number;
}

export interface WorkerEventMessage {
  kind: 'event';
  requestId: number;
  hook: ModScriptHook;
  detail: ModScriptEventDetail;
  snapshot: ModScriptStateSnapshot;
}

export type HostToWorkerMessage = WorkerInitMessage | WorkerEventMessage;

export interface WorkerReadyMessage {
  kind: 'ready';
  handlerCount: number;
}

export interface WorkerResultMessage {
  kind: 'result';
  requestId: number;
  commands: ModScriptCommand[];
}

export interface WorkerErrorMessage {
  kind: 'error';
  requestId?: number;
  phase: 'init' | 'event';
  message: string;
}

export type WorkerToHostMessage = WorkerReadyMessage | WorkerResultMessage | WorkerErrorMessage;
