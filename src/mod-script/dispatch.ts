/**
 * 遊戲端唯一入口：派發事件給 mod 腳本
 *
 * 刻意做成 fire-and-forget：腳本慢不會拖住主迴圈（Worker + 看門狗）。
 * 用動態 import 載入執行器，讓 gameStore／主迴圈不必背 modStore 的靜態依賴。
 */
import type { ModScriptEventDetail, ModScriptHook } from '@/types/modScript';

export function notifyModScripts(
  hook: ModScriptHook,
  detail: Omit<ModScriptEventDetail, 'hook'> = {},
): void {
  void import('./runtime')
    .then(({ modScriptRuntime }) => {
      modScriptRuntime.dispatch(hook, { hook, ...detail });
    })
    .catch((error: unknown) => {
      console.error('[mod-script] 無法載入腳本執行器', error);
    });
}
