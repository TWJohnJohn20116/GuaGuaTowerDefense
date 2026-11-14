#!/usr/bin/env node
/**
 * 視覺驗證工具 — 逐場景截圖 + DOM 健檢 + 對照表
 *
 * 用法：
 *   node scripts/visual-check.mjs
 *   node scripts/visual-check.mjs --scenes=pathSelection,mainMenu --sizes=1600x900,1280x800
 *   node scripts/visual-check.mjs --server=http://localhost:10050   # 重用既有 dev server
 *   node scripts/visual-check.mjs --no-dom                          # 跳過 DOM 健檢
 *   node scripts/visual-check.mjs --concurrency=6
 *
 * 效能：只啟動「一個」瀏覽器，每個場景用 CDP 開一個分頁截圖。
 *   CLI 版（每次啟動瀏覽器）：3 場景約 20s
 *   CDP 版：3 場景約 5–7s（只付一次瀏覽器冷啟動）
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/* ------------------------------------------------------------------ args */

const argv = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? 'true'];
  }),
);

const SIZES = (argv.sizes ?? '1600x900').split(',').map((s) => {
  const [w, h] = s.split('x').map(Number);
  return { w, h, key: `${w}x${h}` };
});
const OUT_ROOT = path.resolve(ROOT, argv.out ?? '.shots/verify');
const SETTLE_MS = Number(argv.settle ?? 450);
const CONCURRENCY = Math.max(1, Number(argv.concurrency ?? 4));
const WITH_DOM = argv['no-dom'] !== 'true';
const REUSE_SERVER = argv.server ?? null;

const log = (...a) => console.log('[visual-check]', ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* --------------------------------------------------------------- helpers */

function pickFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.once('error', reject);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function findBrowser() {
  const candidates = [
    process.env.EDGE_PATH,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  const hit = candidates.find((p) => existsSync(p));
  if (!hit) throw new Error('找不到 Edge／Chrome，請用 EDGE_PATH 指定執行檔路徑');
  return hit;
}

function readScenes() {
  const src = readFileSync(path.join(ROOT, 'src/types/game.ts'), 'utf8');
  const m = src.match(/export type GameScene =([\s\S]*?);/);
  if (!m) throw new Error('解析不到 GameScene 聯集');
  return [...m[1].matchAll(/'([a-zA-Z]+)'/g)].map((x) => x[1]);
}

/* ------------------------------------------------------------------ CDP */

async function launchBrowser(browser) {
  const userDir = path.join(os.tmpdir(), `vc-profile-${Date.now()}`);
  const child = spawn(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--remote-debugging-port=0',
      `--user-data-dir=${userDir}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );

  const wsUrl = await new Promise((resolve, reject) => {
    let buf = '';
    const timer = setTimeout(() => reject(new Error('瀏覽器 DevTools 沒起來（20s）')), 20000);
    child.stderr.on('data', (d) => {
      buf += d.toString();
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
  });

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', () => reject(new Error('CDP WebSocket 連線失敗')), { once: true });
  });

  let seq = 0;
  const pending = new Map();
  const waiters = new Map();

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message}`));
      else resolve(msg.result);
      return;
    }
    const key = `${msg.sessionId ?? ''}:${msg.method}`;
    const waiter = waiters.get(key);
    if (waiter) {
      waiters.delete(key);
      waiter(msg.params);
    }
  });

  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });

  const waitEvent = (method, sessionId, timeoutMs = 15000) =>
    new Promise((resolve, reject) => {
      const key = `${sessionId ?? ''}:${method}`;
      const timer = setTimeout(() => {
        waiters.delete(key);
        reject(new Error(`等待 ${method} 逾時`));
      }, timeoutMs);
      waiters.set(key, (params) => {
        clearTimeout(timer);
        resolve(params);
      });
    });

  return { child, ws, send, waitEvent, userDir };
}

async function captureScene(cdp, baseUrl, scene, size, file) {
  const { send, waitEvent } = cdp;
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

  try {
    await send('Page.enable', {}, sessionId);
    await send('Emulation.setDeviceMetricsOverride',
      { width: size.w, height: size.h, deviceScaleFactor: 1, mobile: false }, sessionId);

    const loaded = waitEvent('Page.loadEventFired', sessionId);
    await send('Page.navigate', { url: `${baseUrl}/?scene=${scene}` }, sessionId);
    await loaded;
    await sleep(SETTLE_MS); // 等 React 首次繪製 + 字型

    const { data } = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
    writeFileSync(file, Buffer.from(data, 'base64'));

    let domStats = null;
    if (WITH_DOM) {
      const { result } = await send(
        'Runtime.evaluate',
        {
          expression: `(() => {
            const root = document.getElementById('root');
            const html = document.documentElement.outerHTML;
            return JSON.stringify({
              rootLength: root ? root.innerHTML.length : 0,
              hasErrorOverlay: html.includes('vite-error-overlay'),
              crash: /Cannot read propert|is not a function|is not defined/.test(html),
            });
          })()`,
          returnByValue: true,
        },
        sessionId,
      );
      domStats = JSON.parse(result.value);
    }
    return domStats;
  } finally {
    await send('Target.closeTarget', { targetId }).catch(() => {});
  }
}

function pngSize(file) {
  const buf = readFileSync(file);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

async function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch {
      /* 還沒起來 */
    }
    await sleep(250);
  }
  return false;
}

async function pool(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        results[i] = await worker(items[i], i);
      }
    }),
  );
  return results;
}

/* ------------------------------------------------------------------ main */

const scenes = (argv.scenes ?? readScenes().join(',')).split(',').filter(Boolean);
const browserPath = findBrowser();
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const OUT_DIR = path.join(OUT_ROOT, stamp);
mkdirSync(OUT_DIR, { recursive: true });

let vite = null;
let cdp = null;
let baseUrl = REUSE_SERVER;
const t0 = Date.now();
let serverMs = 0;

try {
  if (!baseUrl) {
    const port = await pickFreePort();
    baseUrl = `http://localhost:${port}`;
    log(`啟動 dev server（${baseUrl}）…`);
    const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
    vite = spawn(process.execPath, [viteBin, '--port', String(port), '--strictPort'], {
      cwd: ROOT,
      stdio: ['ignore', 'ignore', 'ignore'],
    });
  }
  if (!(await waitForServer(baseUrl))) throw new Error(`dev server 沒起來：${baseUrl}`);
  serverMs = Date.now() - t0;

  log('啟動瀏覽器（單一實例，多分頁）…');
  cdp = await launchBrowser(browserPath);

  const jobs = scenes.flatMap((scene) => SIZES.map((size) => ({ scene, size })));
  const shotsStart = Date.now();

  const results = await pool(jobs, CONCURRENCY, async ({ scene, size }) => {
    const file = path.join(OUT_DIR, `${scene}-${size.key}.png`);
    const dom = await captureScene(cdp, baseUrl, scene, size, file);

    const png = existsSync(file) ? pngSize(file) : null;
    const bytes = png ? readFileSync(file).length : 0;
    const checks = {
      screenshot: Boolean(png),
      sizeMatches: Boolean(png && png.w === size.w && png.h === size.h),
      notBlank: bytes > 20000,
      ...(WITH_DOM && dom
        ? {
            rootFilled: dom.rootLength > 200,
            noErrorOverlay: !dom.hasErrorOverlay,
            noCrashText: !dom.crash,
          }
        : {}),
    };
    const pass = Object.values(checks).every(Boolean);
    log(`${pass ? 'PASS' : 'FAIL'}  ${scene} ${size.key}`);
    return { scene, size: size.key, file: path.relative(ROOT, file).replace(/\\/g, '/'), bytes, png, checks, pass };
  });

  const shotsMs = Date.now() - shotsStart;
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const passed = results.filter((r) => r.pass).length;

  writeFileSync(
    path.join(OUT_DIR, 'report.json'),
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        baseUrl,
        scenes,
        sizes: SIZES.map((s) => s.key),
        timing: { serverMs, shotsMs, totalSeconds: Number(elapsed) },
        summary: { total: results.length, passed, failed: results.length - passed },
        results,
      },
      null,
      2,
    ),
  );

  const rows = results
    .map(
      (r) => `    <figure class="${r.pass ? 'ok' : 'bad'}">
      <img src="${path.basename(r.file)}" alt="${r.scene} ${r.size}" loading="lazy" />
      <figcaption>
        <strong>${r.scene}</strong> · ${r.size} · ${(r.bytes / 1024).toFixed(0)} KB
        <span class="tag">${r.pass ? 'PASS' : 'FAIL'}</span>
        <ul>${Object.entries(r.checks)
          .map(([k, v]) => `<li class="${v ? 'y' : 'n'}">${v ? '✓' : '✗'} ${k}</li>`)
          .join('')}</ul>
      </figcaption>
    </figure>`,
    )
    .join('\n');

  writeFileSync(
    path.join(OUT_DIR, 'index.html'),
    `<!doctype html><meta charset="utf-8"><title>視覺驗證 ${stamp}</title>
<style>
  body{background:#1a1a22;color:#eee;font:13px/1.5 system-ui,"Noto Sans TC";margin:0;padding:20px}
  h1{font-size:18px;margin:0 0 4px}
  .summary{margin-bottom:16px;color:#9aa}
  figure{margin:0 0 20px;background:#24242e;border:1px solid #333;border-radius:10px;overflow:hidden}
  figure.ok{border-color:#2b6b46} figure.bad{border-color:#7a2b3a}
  img{display:block;width:100%;height:auto}
  figcaption{padding:8px 12px;display:flex;flex-wrap:wrap;gap:10px;align-items:center}
  .tag{margin-left:auto;font-weight:700}
  figure.ok .tag{color:#4ade80} figure.bad .tag{color:#f87171}
  ul{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;font-size:11px}
  li.y{color:#4ade80} li.n{color:#f87171}
</style>
<h1>視覺驗證 · ${stamp}</h1>
<div class="summary">${passed}/${results.length} 通過 · ${scenes.length} 場景 × ${SIZES.length} 尺寸 · 總 ${elapsed}s（server ${(serverMs / 1000).toFixed(1)}s / 截圖 ${(shotsMs / 1000).toFixed(1)}s）· ${baseUrl}</div>
${rows}`,
  );

  log(`${passed}/${results.length} 通過 · 總 ${elapsed}s（server ${(serverMs / 1000).toFixed(1)}s + 截圖 ${(shotsMs / 1000).toFixed(1)}s）`);
  log(`對照表：${path.relative(ROOT, path.join(OUT_DIR, 'index.html'))}`);
  process.exitCode = passed === results.length ? 0 : 1;
} finally {
  try {
    cdp?.ws.close();
    cdp?.child.kill();
    if (cdp) rmSync(cdp.userDir, { recursive: true, force: true });
  } catch {
    /* 清理失敗不影響結果 */
  }
  vite?.kill();
}
