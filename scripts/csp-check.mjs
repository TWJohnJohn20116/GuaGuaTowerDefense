#!/usr/bin/env node
/**
 * 桌面版 CSP 靜態檢核（不能取代實機驗證）
 *
 * AGENTS §13.9 禁止在本機啟動桌面版，所以這支只檢查「設定檔有沒有漏掉必要指令」；
 * 真正的驗收仍要在桌面版點過音樂、更新、圖片與腳本 Worker。
 */
import fs from 'node:fs';

const REQUIRED = [
  ["script-src", "'self'"],
  ["script-src", "'unsafe-eval'"],
  ["script-src", "blob:"],
  ["worker-src", "blob:"],
  ["connect-src", "ipc:"],
  ["connect-src", "https://api.github.com"],
  ["img-src", "data:"],
  ["media-src", "https:"],
];

const raw = fs.readFileSync('src-tauri/tauri.conf.json', 'utf8');
const config = JSON.parse(raw);
const csp = config?.app?.security?.csp;

if (typeof csp !== 'string' || csp.trim() === '') {
  console.error('✗ security.csp 是 null／空字串：桌面版等於沒有 CSP');
  process.exitCode = 1;
} else {
  const directives = new Map(
    csp.split(';').map((part) => part.trim()).filter(Boolean).map((part) => {
      const [name, ...values] = part.split(/\s+/);
      return [name, values];
    }),
  );
  let failed = 0;
  for (const [name, value] of REQUIRED) {
    const values = directives.get(name) ?? [];
    if (!values.includes(value)) {
      console.error('✗ ' + name + ' 缺少 ' + value);
      failed += 1;
    }
  }
  if (failed === 0) console.log('✓ CSP 具備 ' + REQUIRED.length + ' 項必要指令（仍需桌面版實機驗證）');
  else process.exitCode = 1;
}
