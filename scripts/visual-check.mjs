#!/usr/bin/env node
/**
 * 視覺驗證工具 — 逐場景截圖 + DOM 健檢 + 對照表
 *
 * 用法：
 *   node scripts/visual-check.mjs                       # 全部場景，1600x900
 *   node scripts/visual-check.mjs --scenes=pathSelection,mainMenu --sizes=1600x900,1280x800
 *   node scripts/visual-check.mjs --server=http://localhost:10050   # 重用已在跑的 dev server
 *
 * 產出：
 *   .shots/verify/<timestamp>/<scene>-<WxH>.png   截圖
 *   .shots/verify/<timestamp>/report.json         每張的檢查結果
 *   .shots/verify/<timestamp>/index.html          對照表（開瀏覽器看）
 *
 * 為什麼需要它：UI 改動沒有真實畫面就是盲改。這支工具把「開 server → 截圖 → 檢查」自動化，
 * 讓每次樣式改動都能留下可比較的證據（AGENTS §13.9 的截圖驗證例外）。
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import net from 'node:net';
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
const BUDGET_MS = Number(argv.budget ?? 7000);
const REUSE_SERVER = argv.server ?? null;

/* --------------------------------------------------------------- helpers */

const log = (...a) => console.log('[visual-check]', ...a);

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

/** 從 types/game.ts 讀出 GameScene 聯集，避免手抄場景清單 */
function readScenes() {
  const src = readFileSync(path.join(ROOT, 'src/types/game.ts'), 'utf8');
  const m = src.match(/export type GameScene =([\s\S]*?);/);
  if (!m) throw new Error('解析不到 GameScene 聯集');
  return [...m[1].matchAll(/'([a-zA-Z]+)'/g)].map((x) => x[1]);
}

/** 從 PNG 檔頭取實際尺寸，確認視窗大小真的生效 */
function pngSize(file) {
  const buf = readFileSync(file);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function run(browser, args, { capture = false } = {}) {
  return new Promise((resolve) => {
    const child = spawn(browser, args, { cwd: ROOT });
    let out = '';
    if (capture) child.stdout.on('data', (d) => (out += d.toString()));
    child.on('close', (code) => resolve({ code, out }));
  });
}

async function waitForServer(url, timeoutMs = 45000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch {
      /* 還沒起來 */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

/* ------------------------------------------------------------------ main */

const scenes = (argv.scenes ?? readScenes().join(',')).split(',').filter(Boolean);
const browser = findBrowser();
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const OUT_DIR = path.join(OUT_ROOT, stamp);
mkdirSync(OUT_DIR, { recursive: true });

let server = null;
let baseUrl = REUSE_SERVER;

if (!baseUrl) {
  const port = await pickFreePort();
  baseUrl = `http://localhost:${port}`;
  log(`啟動 dev server（${baseUrl}）…`);
  // 直接跑 vite 的進入點，不用 shell；
  // 用 shell 時外層 cmd 不會被 kill，背景工作永遠不結束
  const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
  server = spawn(process.execPath, [viteBin, '--port', String(port), '--strictPort'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', () => {});
  server.stderr.on('data', () => {});
}

const results = [];
try {
  const up = await waitForServer(baseUrl);
  if (!up) throw new Error(`dev server 沒起來：${baseUrl}`);

  for (const scene of scenes) {
    for (const size of SIZES) {
      const file = path.join(OUT_DIR, `${scene}-${size.key}.png`);
      const url = `${baseUrl}/?scene=${scene}`;
      await run(browser, [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        `--window-size=${size.w}, ${size.h}`.replace(' ', ''),
        `--virtual-time-budget=${BUDGET_MS}`,
        `--screenshot=${file}`,
        url,
      ]);

      const domRun = await run(
        browser,
        ['--headless=new', '--disable-gpu', `--virtual-time-budget=${BUDGET_MS}`, '--dump-dom', url],
        { capture: true },
      );

      const dom = domRun.out ?? '';
      const png = existsSync(file) ? pngSize(file) : null;
      const bytes = png ? readFileSync(file).length : 0;

      const checks = {
        screenshot: Boolean(png),
        sizeMatches: Boolean(png && png.w === size.w && png.h === size.h),
        notBlank: bytes > 20000,
        hasRoot: dom.includes('id="root"'),
        rootFilled: /id="root"[^>]*>[\s\S]{200,}/.test(dom),
        noErrorOverlay: !dom.includes('vite-error-overlay'),
        noCrashText: !/Cannot read propert|is not a function|is not defined/.test(dom),
      };

      results.push({
        scene,
        size: size.key,
        file: path.relative(ROOT, file).replace(/\\/g, '/'),
        bytes,
        png,
        checks,
        pass: Object.values(checks).every(Boolean),
      });
      log(`${checks && Object.values(checks).every(Boolean) ? 'PASS' : 'FAIL'}  ${scene} ${size.key}`);
    }
  }
} finally {
  if (server) server.kill();
}

/* ---------------------------------------------------------------- report */

const passed = results.filter((r) => r.pass).length;
const report = {
  createdAt: new Date().toISOString(),
  baseUrl,
  scenes,
  sizes: SIZES.map((s) => s.key),
  summary: { total: results.length, passed, failed: results.length - passed },
  results,
};
writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));

const rows = results
  .map(
    (r) => `    <figure class="${r.pass ? 'ok' : 'bad'}">
      <img src="${path.basename(r.file)}" alt="${r.scene} ${r.size}" />
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
<div class="summary">${passed}/${results.length} 通過 · ${scenes.length} 場景 × ${SIZES.length} 尺寸 · server ${baseUrl}</div>
${rows}`,
);

log(`${passed}/${results.length} 通過`);
log(`對照表：${path.relative(ROOT, path.join(OUT_DIR, 'index.html'))}`);
process.exit(passed === results.length ? 0 : 1);
