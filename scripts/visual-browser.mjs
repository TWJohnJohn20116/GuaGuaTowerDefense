/**
 * 瀏覽器與 dev server 的收尾：孤兒程序清理、profile 目錄清掃。
 *
 * 為什麼拆成獨立檔：visual-check.mjs 已到 865 行（§3 上限 888），而這裡要處理的
 * 是 Windows 特有的兩個洩漏，塞回主檔會直接撞線。
 *
 * 兩個洩漏的實際代價（2026-11-15 實測）：
 *   %TEMP% 積了 82 份 vc-profile-*（每次跑都留一份，每份數十 MB）
 *   系統上留著 56 支沒有視窗的 chrome 孤兒程序
 * 症狀是使用者看到「截圖工具開了一堆空白視窗」，其實是進程沒人收。
 */
import { spawn } from 'node:child_process';
import { readdirSync, rmSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Windows 的 child.kill() 只終止直接子程序：Chrome 會把工作分給 renderer／gpu／
 * crashpad 這些孫程序，殺掉 launcher 之後它們繼續活著，下次執行再開一份就疊上去。
 * 用 taskkill /T 從根砍整棵樹；非 Windows 維持原本的 signal 行為。
 */
export function killTree(child) {
  if (!child?.pid || child.exitCode !== null) return;
  if (process.platform === 'win32') {
    try {
      spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }).on('error', () => {});
    } catch {
      /* 程序已經結束，沒有東西可殺 */
    }
    return;
  }
  try {
    child.kill('SIGKILL');
  } catch {
    /* 程序已經結束 */
  }
}

/**
 * 刪掉單次執行用的瀏覽器 profile。
 * Chrome 剛結束時還握著 profile 裡的檔案鎖，rmSync 會拋 EBUSY／EPERM；
 * 呼叫端要自己重試（見 visual-check.mjs 的 finally），這裡只回報成功與否。
 */
export function removeProfileDir(dir) {
  if (!dir) return true;
  try {
    rmSync(dir, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

const PROFILE_PREFIX = 'vc-profile-';
// 一小時內的 profile 可能屬於同時在跑的另一個實例，不要動
const STALE_MS = 60 * 60 * 1000;

/**
 * 清掃 %TEMP% 裡過期的 profile。
 * Ctrl+C、CI 逾時、程序被砍這幾種中斷都不會走 finally，profile 就永遠留在磁碟上；
 * 下次執行開頭掃一遍，才不會每跑一次就多一份。
 */
export function sweepStaleProfiles(now = Date.now()) {
  const root = os.tmpdir();
  let names = [];
  try {
    names = readdirSync(root);
  } catch {
    return 0;
  }
  let removed = 0;
  for (const name of names) {
    if (!name.startsWith(PROFILE_PREFIX)) continue;
    const target = path.join(root, name);
    try {
      if (now - statSync(target).mtimeMs < STALE_MS) continue;
      rmSync(target, { recursive: true, force: true });
      removed += 1;
    } catch {
      /* 還被別的實例占用就跳過，留給下一輪 */
    }
  }
  return removed;
}
