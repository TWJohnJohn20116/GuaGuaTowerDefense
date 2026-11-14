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
 *   node scripts/visual-check.mjs --js-file=/tmp/pre.js  # 截圖前執行的頁面腳本（;; 分隔多段）
 *
 * 注意：--js 只適合單純運算式。含 => 或引號的腳本請用 --js-file，
 * 否則會被 shell 吃掉（實測 exit 0 卻完全沒有輸出）。
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
import { createShots } from './visual-shots.mjs';
import { planSheet } from './visual-sheet.mjs';
import {
  baselinePath,
  cleanupRuns,
  compareReports,
  loadPreviousReport,
  saveBaselineDataUrl,
} from './visual-baseline.mjs';

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
const SETTLE_MS = Number(argv.settle ?? 250);
const SETTLE_MAX_MS = Number(argv['settle-max'] ?? 15000);
const SETTLE_POLL_MS = 120;
// 實測：8 反而比 5 慢（vite transform 與 8 個分頁搶 CPU），5 是最佳點
// 實測：5→16.0s、7→15.4s、10→19.8s（分頁搶 CPU），7 是甜蜜點
const CONCURRENCY = Math.max(1, Number(argv.concurrency ?? 7));
const WITH_DOM = argv['no-dom'] !== 'true';
// JPEG 比 PNG 快 3–5 倍、檔案小 4 倍；驗證看的是版面不是像素級精度
const FORMAT = argv.format === 'png' ? 'png' : 'jpeg';
const EXT = FORMAT === 'png' ? 'png' : 'jpg';
// 截圖前要執行的頁面腳本（可多段，用 ;; 分隔）：用來打開 details／modal／切 tab
// 複雜運算式（含 => 或引號）在 shell 裡很容易被吃掉，改用 --js-file 指定檔案
const PRE_SCRIPT = (() => {
  const raw = argv['js-file']
    ? readFileSync(String(argv['js-file']), 'utf8')
    : argv.js
      ? String(argv.js)
      : '';
  return raw.split(';;').map((s) => s.trim()).filter(Boolean);
})();
const REUSE_SERVER = argv.server ?? null;
// 裝置像素比：Retina/2x 下的模糊與 1px 邊框問題只有 dpr=2 才看得出來
const DPR = Math.max(1, Math.min(3, Number(argv.dpr ?? 1)));
// 整頁長圖：抓「主行動鍵被推到摺疊線以下」這類只有長圖看得到的版面問題
const FULL_PAGE = argv['full-page'] === 'true';
// 局部特寫：--clip=<selector> 只拍某個 Modal／卡片，總表縮圖看不出圓角與邊界
const CLIP_SELECTOR = argv.clip ?? null;
// 警告升級：CI 用。預設 warnings 只記錄不判 FAIL，避免第一次跑就一片紅
const STRICT = argv.strict === 'true';
const WITH_AUDIT = argv['no-audit'] !== 'true';
// P1 視覺回歸：--baseline 建立基準線、--diff 與基準線逐幀比對
const WRITE_BASELINE = argv.baseline === 'true';
const DIFF_BASELINE = argv.diff === 'true';
// 每通道容差（0-255）：JPEG 有損壓縮，容差太低會把壓縮噪聲當成版面變化
const TOLERANCE = Math.max(0, Math.min(255, Number(argv.tolerance ?? 16)));
// 變化比例超過這個才算回歸（百分比）
const DIFF_LIMIT_PERCENT = Number(argv['diff-limit'] ?? 0.5);
// 遮罩：canvas 戰鬥區、計時器這類每幀都不同的區域，用選擇器塗掉再比
const MASK_SELECTORS = String(argv.mask ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const RETRY = Math.max(0, Number(argv.retry ?? 0));
// 0 = 不清理；>0 只留最近 N 輪
const KEEP = Number(argv.keep ?? 0);
const COMPARE_LAST = argv['compare-last'] === 'true';
// 戰鬥場景的 canvas 每幀都不同：用 --mask=canvas 把動態區塗掉再比（headless 的虛擬時間凍結實測會卡住截圖）

const log = (...a) => console.log('[visual-check]', ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// 截圖與稽核的五個動作抽在 visual-shots.mjs：主檔要守住 §3 的 888 行上限
const shots = createShots({ FORMAT, DPR, sleep });
const truncate = (s, n) => (s.length > n ? `${s.slice(0, n)}…` : s);

// CDP 的 console 參數是 RemoteObject：字串在 value，其他型別只有 description
function remoteArgText(a) {
  if (!a) return '';
  if (a.type === 'string') return String(a.value ?? '');
  return String(a.description ?? a.value ?? '');
}

// 只過濾明確的雜訊來源；不要用寬鬆規則，否則會把真錯誤一起吃掉
const CONSOLE_NOISE = ['[vite]', 'Download the React DevTools', 'React DevTools']
function isIgnorableConsole(text) {
  const head = text.slice(0, 120);
  return CONSOLE_NOISE.some((s) => head.includes(s));
}

/**
 * 字型就緒 + 兩帧：中文字型沒載完就截圖，拍到的是 fallback 字重，
 * 字級與對比度判斷會全部失真（固定 sleep 250ms 擋不住）。
 */
async function waitFontsAndFrames(cdp, sessionId) {
  await cdp
    .send(
      'Runtime.evaluate',
      {
        expression:
          '(async () => { try { await document.fonts.ready; } catch (e) {} await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return true; })()',
        awaitPromise: true,
      },
      sessionId,
    )
    .catch(() => {});
}

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
  // 持久監聽：waiters 是一次性的，console／網路錯誤要跨整個 lane 持續收
  const persistent = new Map();

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
    const hs = persistent.get(key);
    if (hs) for (const h of [...hs]) h(msg.params);
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

  const on = (sessionId, method, handler) => {
    const key = `${sessionId ?? ''}:${method}`;
    if (!persistent.has(key)) persistent.set(key, new Set());
    persistent.get(key).add(handler);
    return () => persistent.get(key)?.delete(handler);
  };

  return { child, ws, send, waitEvent, on, userDir };
}

/** 開一個分頁當 worker：整條 lane 共用，之後只換 hash，不重新載入 */
async function openWorker(cdp) {
  const { send } = cdp;
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send('Log.enable', {}, sessionId);
  await send('Network.enable', {}, sessionId);

  // 用 CDP 事件取代正則嗅探 innerHTML：正則抓不到 React warning、chunk 404、CSP 拒絕
  const events = [];
  // loadingFailed 只給 requestId，沒有 URL；要自己建表才查得出是哪個資源掛了
  const reqUrls = new Map();
  cdp.on(sessionId, 'Network.requestWillBeSent', (p) => {
    if (p.requestId && p.request?.url) reqUrls.set(p.requestId, p.request.url);
  });
  cdp.on(sessionId, 'Runtime.consoleAPICalled', (p) => {
    if (p.type !== 'error' && p.type !== 'warning' && p.type !== 'assert') return;
    const text = (p.args ?? '').map(remoteArgText).join(' ').trim();
    if (!text || text === '%c' || isIgnorableConsole(text)) return;
    // dev 環境的更新檢查會撞 GitHub API 限流（403），那是環境不是畫面問題：降成警告
    const level = text.includes('[更新檢查]') ? 'update' : p.type === 'assert' ? 'error' : p.type;
    events.push({ kind: 'console', level, text: truncate(text, 400) });
  });
  cdp.on(sessionId, 'Log.entryAdded', (p) => {
    const e = p.entry ?? {};
    if (e.level !== 'error' && e.level !== 'warning') return;
    const text = String(e.text ?? '').trim();
    const url = String(e.url ?? '');
    if (!text || isIgnorableConsole(text)) return;
    // favicon 在 dev 幾乎必然 404，報它只會訓練使用者忽略紅字
    if (/\/favicon\.ico(\?|$)/.test(url)) return;
    events.push({ kind: 'log', level: e.level, source: e.source ?? '', text: truncate(text, 400), url });
  });
  cdp.on(sessionId, 'Network.loadingFailed', (p) => {
    // ERR_ABORTED 是 hash 切場景與主動取消造成的正常現象，不算錯誤
    if (p.errorText === 'net::ERR_ABORTED') return;
    const url = reqUrls.get(p.requestId) ?? '';
    if (/\/favicon\.ico(\?|$)/.test(url)) return;
    events.push({
      kind: 'network',
      level: 'error',
      text: `${p.type ?? 'resource'} ${p.errorText ?? 'failed'}`,
      url,
    });
  });

  return { targetId, sessionId, warm: false, events };
}

/** 切場景：第一張用 Page.navigate（冷啟），之後改 location.hash 由 App 的 dev 監聽接手 */
async function switchScene(cdp, baseUrl, worker, scene, size) {
  const { send, waitEvent } = cdp;
  await send('Emulation.setDeviceMetricsOverride',
    { width: size.w, height: size.h, deviceScaleFactor: DPR, mobile: false }, worker.sessionId);

  if (!worker.warm) {
    const loaded = waitEvent('Page.loadEventFired', worker.sessionId);
    await send('Page.navigate', { url: `${baseUrl}/?scene=${scene}` }, worker.sessionId);
    await loaded;
    worker.warm = true;
  } else {
    await send('Runtime.evaluate',
      { expression: `location.hash = ${JSON.stringify(scene)}` }, worker.sessionId);
  }
}

async function captureScene(cdp, baseUrl, worker, scene, size, file) {
  const { send } = cdp;
  const sessionId = worker.sessionId;
  worker.events.length = 0; // 每個場景只收自己的錯誤，避免跨場景污染

  try {
    await switchScene(cdp, baseUrl, worker, scene, size);

    // 場景是 React.lazy 載入的：loadEventFired 時 chunk 還沒到，
    // 固定 sleep 會拍到「載入中」的空畫面（且 DOM 仍非空，程式檢查抓不到）。
    // 改成輪詢 root 的 DOM 長度，連續 3 次不變才視為穩定。
    // 用「可讀文字長度」判斷就緒：載入中的骨架 HTML 很長但幾乎沒有文字
    const rootLenExpr =
      'JSON.stringify({ text: (document.body.innerText || "").trim().length, html: document.getElementById("root")?.innerHTML.length ?? 0 })';
    // 穩定耗時本身就是指標：某個場景突然變慢，通常代表它多了重繪或載入了大資源
    const settleStart = Date.now();
    const deadline = settleStart + SETTLE_MAX_MS;
    let lastLen = -1;
    let stable = 0;
    while (Date.now() < deadline) {
      const { result } = await send('Runtime.evaluate', { expression: rootLenExpr, returnByValue: true }, sessionId);
      const { text: textLen } = JSON.parse(result.value);
      stable = textLen === lastLen ? stable + 1 : 0;
      lastLen = textLen;
      // 骨架／載入中也是「穩定」的，所以必須等到畫面上真的出現文字（>120 字）才算就緒
      if (stable >= 2 && textLen > 120) break;
      await sleep(SETTLE_POLL_MS);
    }
    const settleMs = Date.now() - settleStart;
    await sleep(SETTLE_MS); // 穩定後再留一點時間給字型與動畫
    await waitFontsAndFrames(cdp, sessionId); // 字型沒就緒就截圖，字級與對比度判斷會失真

    // 需要拍「開啟後」的狀態時，先在頁面內執行腳本（例如點開 details、modal）
    if (PRE_SCRIPT.length) {
      for (const expr of PRE_SCRIPT) {
        await send('Runtime.evaluate', { expression: expr, awaitPromise: true }, sessionId).catch(() => {});
        await sleep(350);
      }
    }

    // mask 選擇器的視口座標，diff 會用它把每幀都變動的區域（canvas、計時器）塗掉
    const maskRects = MASK_SELECTORS.length ? await shots.collectMaskRects(cdp, sessionId, MASK_SELECTORS) : [];

    // 稽核放在 PRE_SCRIPT 之後：要檢查的是使用者真正看到的狀態（modal／展開後）
    const audit = WITH_AUDIT ? await shots.runAudit(cdp, sessionId) : null;

    // 凍結動畫：避免截到一半的過場，也省掉持續重繪
    await send('Runtime.evaluate', {
      expression:
        "(() => { const s = document.createElement('style'); s.textContent = '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}'; document.head.appendChild(s); })()",
    }, sessionId).catch(() => {});

    // 動畫已凍結：視口截圖與像素統計都吃同一張 dataURL，不必另外解碼檔案
    const shotData = await shots.captureViewport(cdp, sessionId);
    writeFileSync(file, Buffer.from(shotData, 'base64'));
    const stats = await shots.samplePixels(cdp, sessionId, shotData);

    // 額外幀（長圖／局部）也在凍結狀態下拍，否則會比主幀先抖動
    const extras = [];
    const stem = file.replace(/\.[a-z]+$/i, '');
    if (FULL_PAGE) {
      const fullFile = `${stem}.full.${EXT}`;
      const full = await shots.captureFullPage(cdp, sessionId, fullFile).catch((e) => ({ error: String(e?.message ?? e) }));
      if (full.error) extras.push({ scene, size: size.key, kind: 'full', error: full.error });
      else
        extras.push({
          scene,
          size: size.key,
          kind: 'full',
          file: path.relative(ROOT, fullFile).split(path.sep).join('/'),
          bytes: existsSync(fullFile) ? readFileSync(fullFile).length : 0,
          height: full.height,
        });
    }
    if (CLIP_SELECTOR) {
      const clipFile = `${stem}.clip.${EXT}`;
      const clip = await shots.captureClip(cdp, sessionId, CLIP_SELECTOR, clipFile);
      if (clip.error) extras.push({ scene, size: size.key, kind: 'clip', error: clip.error });
      else
        extras.push({
          scene,
          size: size.key,
          kind: 'clip',
          file: path.relative(ROOT, clipFile).split(path.sep).join('/'),
          bytes: existsSync(clipFile) ? readFileSync(clipFile).length : 0,
          rect: clip.rect,
        });
    }

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
              textLength: (document.body.innerText || '').trim().length,
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
    // shotData 只給 baseline 與 diff 用，不進 report（否則 19 幀會讓 JSON 多出好幾 MB）
    return { domStats, audit, stats, extras, shotData, maskRects, settleMs, events: [...worker.events] };
  } catch (error) {
    // 單一場景失敗不拖垮整條 lane；原因一定要留下，否則 report 只有 FAIL，查不出為什麼
    return { error: String(error?.message ?? error), events: [...worker.events] };
  }
}







/**
 * 把對照表本身截成一張總表圖。
 * 為什麼要有它：程式檢查只能抓「空白／崩潰」，看不出「醜」與「錯位」；
 * 真正的視覺驗證必須有人（或 agent 的看圖能力）實際看過每一格。
 * 19 張分開看太慢，一頁 3 欄拼成一張最快。
 */
async function renderSheet(cdp, outDir, items, cols = 3) {
  // 總表按尺寸分組：390x844 與 1600x900 混排時，窄版會被 object-fit 縮成一小塊，
  // 檢查表第 12 項（窄版擠壓）在總表上根本看不出來。
  // 排版模組是同 repo 維護的必然存在，不再保留缺檔降級分支
  const plan = planSheet(items);

  const width = plan.width;
  const height = plan.height;

  const sections = plan.groups
    .map((g) => {
      const cells = g.items
        .map(
          (r) => `<figure class="${r.pass ? (r.warnings?.length ? 'warn' : 'ok') : 'bad'}">
        <img src="${path.basename(r.file)}" style="height:${g.imgH}px" />
        <figcaption>${r.scene}${r.pass ? '' : ' · FAIL'}${r.warnings?.length ? ` · ${r.warnings.length} 警告` : ''}</figcaption>
      </figure>`,
        )
        .join('');
      return `<section><h2>${g.size} · ${g.items.length} 幀</h2>
<div class="grid" style="grid-template-columns:repeat(${g.cols},1fr)">${cells}</div></section>`;
    })
    .join('');

  const html = `<!doctype html><meta charset="utf-8">
<style>
  *{box-sizing:border-box}
  body{margin:0;padding:12px;background:#12121a;font:12px/1.4 system-ui,"Noto Sans TC"}
  header{color:#9aa;margin:0 0 10px 4px}
  h2{color:#c8c8d8;font-size:13px;margin:12px 0 6px 4px;font-weight:600}
  .grid{display:grid;gap:10px}
  figure{margin:0;background:#1c1c26;border:2px solid #2b4a3a;border-radius:8px;overflow:hidden}
  figure.warn{border-color:#7a6b2b}
  figure.bad{border-color:#7a2b3a}
  img{display:block;width:100%;object-fit:contain;background:#0c0c12}
  figcaption{padding:4px 8px;color:#e6e6f0;font-weight:600}
  figure.warn figcaption{color:#f7c871}
  figure.bad figcaption{color:#f87171}
</style>
<header>視覺驗證總表 · ${items.length} 幀 · ${plan.groups.length} 種尺寸</header>
${sections}`;

  const sheetHtml = path.join(outDir, 'sheet.html');
  writeFileSync(sheetHtml, html);

  const { send, waitEvent } = cdp;
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  try {
    await send('Page.enable', {}, sessionId);
    // 視口先給一個夠高的工作區；真正截圖高度用內容尺寸算，避免最後一組被切掉
    await send('Emulation.setDeviceMetricsOverride',
      { width, height: Math.min(height, 4000), deviceScaleFactor: 1, mobile: false }, sessionId);
    const fileUrl = 'file:///' + sheetHtml.replace(/\\\\/g, '/');
    const loaded = waitEvent('Page.loadEventFired', sessionId);
    await send('Page.navigate', { url: fileUrl }, sessionId);
    await loaded;
    await sleep(400);
    const metrics = await send('Page.getLayoutMetrics', {}, sessionId);
    const cs = metrics.cssContentSize ?? metrics.contentSize;
    const { data } = await send(
      'Page.captureScreenshot',
      {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: Math.ceil(cs.width), height: Math.ceil(cs.height), scale: 1 },
      },
      sessionId,
    );
    const out = path.join(outDir, 'contact-sheet.png');
    writeFileSync(out, Buffer.from(data, 'base64'));
    return out;
  } finally {
    await send('Target.closeTarget', { targetId }).catch(() => {});
  }
}

/** 讀 PNG 或 JPEG 的實際像素尺寸（截圖格式可能是 jpeg，不能用 PNG 的固定偏移） */
function imageSize(file) {
  const buf = readFileSync(file);
  if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      // SOF0–SOF15（扣除 DHT/JPG/DAC）
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      const len = buf.readUInt16BE(i + 2);
      if (len <= 0) break;
      i += 2 + len;
    }
  }
  return null;
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

  // 分 lane：一條 lane 一個分頁，第一張冷啟（約 4 秒），其餘用 hash 切場景（約 0.5 秒）
  const lanes = Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, () => []);
  jobs.forEach((job, i) => lanes[i % lanes.length].push(job));

  const collected = [];
  await Promise.all(
    lanes.map(async (lane) => {
      const worker = await openWorker(cdp);
      try {
        for (const { scene, size } of lane) {
          const file = path.join(OUT_DIR, `${scene}-${size.key}.${EXT}`);
          let frame = (await captureScene(cdp, baseUrl, worker, scene, size, file)) ?? {};
          // React.lazy 的 chunk 偶爾會慢過 settle 上限，重試一次比直接判 FAIL 合理
          for (let attempt = 0; attempt < RETRY && frame.error; attempt++) {
            log(`重試 ${scene} ${size.key}（第 ${attempt + 1} 次）：${frame.error}`);
            await sleep(600);
            frame = (await captureScene(cdp, baseUrl, worker, scene, size, file)) ?? {};
          }
          const { domStats: dom = null, audit = null, stats = null, extras = [], shotData = '', maskRects = [], settleMs = 0, events = [], error = '' } = frame;

          // 外部服務（音樂 API、CDN）掛掉不影響本頁版面，算警告不算失敗；
          // 只有本站資源與 console error 才是硬失敗
          const origin = new URL(baseUrl).origin;
          const isLocal = (u) => {
            try {
              return new URL(u).origin === origin;
            } catch {
              return false;
            }
          };
          const hardErrors = events.filter((e) => {
            if (e.kind === 'console') return e.level === 'error';
            return isLocal(e.url);
          });
          const externalErrors = events.filter(
            (e) => (e.kind === 'log' || e.kind === 'network') && !isLocal(e.url),
          );

          // 基準線：--baseline 存檔、--diff 讀檔；兩者互斥，同時給也只會存不會比
          let baselineDataUrl = null;
          if (shotData && (WRITE_BASELINE || DIFF_BASELINE)) {
            const baseFile = baselinePath(ROOT, scene, size.key, EXT);
            const mime = FORMAT === 'png' ? 'png' : 'jpeg';
            if (WRITE_BASELINE) {
              const saved = saveBaselineDataUrl(path.dirname(baseFile), baseFile, `data:image/${mime};base64,${shotData}`);
              if (saved.error) log(`基準線寫入失敗 ${scene} ${size.key}：${saved.error}`);
            } else if (existsSync(baseFile)) {
              baselineDataUrl = `data:image/${EXT === 'png' ? 'png' : 'jpeg'};base64,${readFileSync(baseFile).toString('base64')}`;
            }
          }

          // 只有存在基準線才比對：首次跑沒有基準就跳過，不當成回歸
          const diff = DIFF_BASELINE && baselineDataUrl
            ? await shots.compareWithBaseline(cdp, worker.sessionId, { baselineDataUrl, currentBase64: shotData, tolerance: TOLERANCE, maskRects, diffOutFile: `${file.replace(/\.[a-z]+$/i, '')}.diff.png` })
            : null;
          const diffOk = !DIFF_BASELINE || !baselineDataUrl || !diff?.stats || diff.stats.diffPercent <= DIFF_LIMIT_PERCENT;

          const img = existsSync(file) ? imageSize(file) : null;
          const bytes = img ? readFileSync(file).length : 0;
          // dpr=2 時圖是 CSS 尺寸的兩倍，尺寸比對要按比例放大，否則整排誤判 FAIL
          const checks = {
            screenshot: Boolean(img),
            sizeMatches: Boolean(img && img.w === size.w * DPR && img.h === size.h * DPR),
            // 像素判空優於位元組門檻：純色頁 PNG 只有幾 KB，會被 >20000 誤殺
            notBlankPixel: stats ? !stats.isBlank : bytes > 20000,
            ...(WITH_DOM && dom
              ? {
                  textRich: dom.textLength > 120,
                  noErrorOverlay: !dom.hasErrorOverlay,
                  noCrashText: !dom.crash,
                }
              : {}),
            noRuntimeErrors: hardErrors.length === 0,
            diffOk,
          };

          // 稽核結果是「警告級」：專案本來就有刻意的 truncate 與低對比設計，
          // 一律判 FAIL 會讓工具永遠紅、失去訊號。要當閘門請加 --strict。
          const warnings = [];
          if (audit?.error) warnings.push({ kind: 'audit', count: 1, items: [{ text: `稽核失敗：${audit.error}` }] });
          for (const kind of ['contrast', 'truncated', 'overflow', 'occlusion']) {
            const items = audit?.[kind];
            if (items?.length) warnings.push({ kind, count: items.length, items: items.slice(0, 12) });
          }
          const consoleWarn = events.filter((e) => e.kind === 'console' && e.level !== 'error');
          if (externalErrors.length) warnings.push({ kind: 'external', count: externalErrors.length, items: externalErrors.slice(0, 12) });
          if (consoleWarn.length) warnings.push({ kind: 'console', count: consoleWarn.length, items: consoleWarn.slice(0, 12) });

          if (diff?.stats && diff.stats.diffPercent > DIFF_LIMIT_PERCENT)
            warnings.push({ kind: 'diff', count: 1, items: [{ text: `與基準線差異 ${diff.stats.diffPercent}%` }] });
          const pass = Object.values(checks).every(Boolean) && (!STRICT || warnings.length === 0);
          const badge = pass ? (warnings.length ? 'PASS!' : 'PASS') : 'FAIL';
          log(
            `${badge}  ${scene} ${size.key}` +
              (warnings.length ? `  (${warnings.map((w) => `${w.kind}:${w.count}`).join(' ')})` : '') +
              (error ? `  ✗ ${error}` : ''),
          );
          collected.push({
            scene,
            size: size.key,
            file: path.relative(ROOT, file).split(path.sep).join('/'),
            bytes,
            png: img,
            checks,
            warnings,
            stats,
            settleMs,
            audit,
            extras,
            events,
            diff,
            error,
            pass,
          });
        }
      } finally {
        await cdp.send('Target.closeTarget', { targetId: worker.targetId }).catch(() => {});
      }
    }),
  );

  // 依原始 jobs 順序輸出，報表才穩定可 diff
  const order = new Map(jobs.map((j, i) => [`${j.scene}|${j.size.key}`, i]));
  const results = collected.sort(
    (a, b) => (order.get(`${a.scene}|${a.size}`) ?? 0) - (order.get(`${b.scene}|${b.size}`) ?? 0),
  );

  const shotsMs = Date.now() - shotsStart;
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const passed = results.filter((r) => r.pass).length;

  // report.json 是給程式讀的：稽核明細裁到 40 條，避免一個場景幾百筆把檔案撐爆
  const reportResults = results.map((r) => ({
    ...r,
    events: r.events.slice(0, 20),
    audit: r.audit
      ? {
          counts: r.audit.counts ?? null,
          skipped: r.audit.skipped ?? null,
          error: r.audit.error ?? null,
          contrast: (r.audit.contrast ?? []).slice(0, 40),
          truncated: (r.audit.truncated ?? []).slice(0, 40),
          overflow: (r.audit.overflow ?? []).slice(0, 40),
          occlusion: (r.audit.occlusion ?? []).slice(0, 40),
        }
      : null,
  }));
  const warnTotals = results.reduce((acc, r) => {
    for (const w of r.warnings) acc[w.kind] = (acc[w.kind] ?? 0) + w.count;
    return acc;
  }, {});

  writeFileSync(
    path.join(OUT_DIR, 'report.json'),
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        baseUrl,
        scenes,
        sizes: SIZES.map((s) => s.key),
        dpr: DPR,
        fullPage: FULL_PAGE,
        clip: CLIP_SELECTOR,
        strict: STRICT,
        timing: { serverMs, shotsMs, totalSeconds: Number(elapsed) },
        summary: { total: results.length, passed, failed: results.length - passed, warnings: warnTotals },
        results: reportResults,
      },
      null,
      2,
    ),
  );

  // 清舊輪次：一輪 19 幀，.shots/verify 會無限長大
  if (KEEP > 0 && cleanupRuns(OUT_ROOT, KEEP).removed) log(`已清理舊輪次（保留最近 ${KEEP} 輪）`);

  // 與上一輪比較：要看的是「這次比上次多了什麼」，不是絕對數字
  if (COMPARE_LAST) {
    const prev = loadPreviousReport(OUT_ROOT, stamp);
    if (!prev) log('--compare-last：找不到上一輪報告，略過');
    else {
      const d = compareReports(prev.report, { results, timing: { totalSeconds: Number(elapsed) } });
      writeFileSync(path.join(OUT_DIR, 'compare.json'), JSON.stringify({ against: prev.dir, ...d }, null, 2));
      log(`對比 ${path.basename(prev.dir)}：新失敗 ${d.newFails.length}｜修好 ${d.fixedFails.length}｜新警告 ${d.newWarnings.length}｜漂移 ${d.byteDrift.length} 幀｜耗時 ${d.timingDrift.percent}%`);
    }
  }
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
        ${r.warnings.length ? `<ul>${r.warnings.map((w) => `<li class="n">! ${w.kind} × ${w.count}</li>`).join('')}</ul>` : ''}
        ${r.error ? `<p class="err">✗ ${r.error}</p>` : ''}
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
  .err{color:#f87171;margin:0;font-size:12px}
</style>
<h1>視覺驗證 · ${stamp}</h1>
<div class="summary">${passed}/${results.length} 通過 · ${scenes.length} 場景 × ${SIZES.length} 尺寸 · 總 ${elapsed}s（server ${(serverMs / 1000).toFixed(1)}s / 截圖 ${(shotsMs / 1000).toFixed(1)}s）· ${baseUrl}</div>
${rows}`,
  );

  log(`${passed}/${results.length} 通過 · 總 ${elapsed}s（server ${(serverMs / 1000).toFixed(1)}s + 截圖 ${(shotsMs / 1000).toFixed(1)}s）`);
  log(`對照表：${path.relative(ROOT, path.join(OUT_DIR, 'index.html'))}`);

  if (cdp) {
    const sheet = await renderSheet(cdp, OUT_DIR, results);
    log(`總表：${path.relative(ROOT, sheet)}`);
  }
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
