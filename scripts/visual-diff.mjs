/**
 * 像素比對表達式 — 供 scripts/visual-check.mjs 做視覺回歸 diff。
 *
 * 為什麼：視覺回歸不能只問「像不像空白」，還要問「跟基準圖差在哪、差多少、
 * 集中在哪個區塊」。截圖的 dataURL 只有瀏覽器解得開（Image + canvas），
 * 但呼叫端要的是可判定的數字，所以整段比對包成 async IIFE，丟給 CDP
 * Runtime.evaluate({ awaitPromise: true })，resolve 成 JSON 字串
 * （不是物件：跨 CDP 邊界用字串最不會掉精度，也讓呼叫端自己決定是否 parse）。
 *
 * 零依賴、零 DOM 副作用：只建立離線 canvas，絕不 append 到 document——
 * 量測工具一旦改變頁面佈局，後面拍的截圖就不可信。
 *
 * 契約：const expr = diffStatsExpr(baseUrl, curUrl, 16, [{ x, y, w, h }]);
 */

const MAX_EDGE = 640; // 比像素統計（480）高：diff 要看得出 1~2px 的位移
const DEFAULT_THRESHOLD = 16; // 每通道容差，吸收 JPEG 壓縮與次像素抗鋸齒
const GRID = 3; // 3x3 分區：回答「差異集中在哪」，而不是只有一個總數

/** dataURL 內嵌：JSON.stringify 處理引號與反斜線；U+2028/U+2029 另轉逸出，
 *  否則某些 eval 路徑會把它們當換行而切斷表達式（base64 剛好可能含）。 */
function embed(value) {
  return JSON.stringify(String(value == null ? '' : value)).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/** threshold 在 Node 端就夾成 0~255 整數：頁面裡只留一個常數，不必重複驗證 */
function normalizeThreshold(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(0, Math.min(255, Math.round(num))) : DEFAULT_THRESHOLD;
}

/** maskRects 只留四邊皆有限數、面積為正的矩形；其餘丟掉，避免 NaN 傳染整段比對 */
function normalizeRects(rects) {
  const out = [];
  for (const rect of Array.isArray(rects) ? rects : []) {
    const x = Number(rect && rect.x);
    const y = Number(rect && rect.y);
    const w = Number(rect && rect.w);
    const h = Number(rect && rect.h);
    if ([x, y, w, h].every(Number.isFinite) && w > 0 && h > 0) out.push({ x, y, w, h });
  }
  return out;
}

// ── 頁面端共用工具 ────────────────────────────────────────────────
// 為什麼是「行陣列」而不是一大段樣板字串：這些程式碼必須原樣 eval 到頁面，
// 在 Node 端執行沒有意義；拆成一行一字串才能在原始碼裡逐行註解。
const PAGE_HELPERS = [
  'const loadImage = (url) => new Promise((resolve, reject) => {',
  '  const el = new Image();',
  '  el.onload = () => resolve(el);',
  '  // 載入失敗必須 reject：吞錯會讓「圖沒載到」被誤判成「零差異」而默默過關',
  "  el.onerror = () => reject(new Error('visual-diff: 圖片載入失敗'));",
  '  el.src = url;',
  '});',
  'const sizeOf = (img) => ({ w: img.naturalWidth || img.width || 0, h: img.naturalHeight || img.height || 0 });',
  "const assertSize = (size, name) => { if (!size.w || !size.h) throw new Error('visual-diff: ' + name + ' 尺寸為 0'); };",
  '// 離線 canvas：不 append 到 document，量測不得反過來改變頁面',
  'const drawTo = (img, w, h) => {',
  "  const canvas = document.createElement('canvas');",
  '  canvas.width = w; canvas.height = h;',
  "  const ctx = canvas.getContext('2d', { willReadFrequently: true });",
  '  ctx.drawImage(img, 0, 0, w, h);',
  '  return { canvas, ctx };',
  '};',
  '// maskRects 是視口 CSS px；scale 取寬度比（等比縮放後兩軸同比例），沒有 window 時退回高度比。',
  'const buildMask = (w, h) => {',
  '  const flags = new Uint8Array(w * h);',
  '  if (!MASK_RECTS.length) return { flags, masked: 0 };',
  "  const cssW = (typeof window !== 'undefined' && window.innerWidth) || 0;",
  "  const cssH = (typeof window !== 'undefined' && window.innerHeight) || 0;",
  '  const scale = cssW > 0 ? w / cssW : (cssH > 0 ? h / cssH : 1);',
  '  let masked = 0;',
  '  for (let i = 0; i < MASK_RECTS.length; i++) {',
  '    const r = MASK_RECTS[i];',
  '    const x0 = Math.max(0, Math.floor(r.x * scale)), y0 = Math.max(0, Math.floor(r.y * scale));',
  '    const x1 = Math.min(w, Math.ceil((r.x + r.w) * scale)), y1 = Math.min(h, Math.ceil((r.y + r.h) * scale));',
  '    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {',
  '      const index = y * w + x;',
  '      if (!flags[index]) { flags[index] = 1; masked++; } // 重疊遮罩只算一次',
  '    }',
  '  }',
  '  return { flags, masked };',
  '};',
  'const isChanged = (a, b, p, t) => Math.abs(a[p] - b[p]) > t || Math.abs(a[p + 1] - b[p + 1]) > t || Math.abs(a[p + 2] - b[p + 2]) > t;',
  'const round = (v, d) => { const f = Math.pow(10, d); return Math.round(v * f) / f; };',
].join('\n');

// 載入 + 等比縮放 + 取像：兩個工廠共用，避免 mask 與尺寸的定義分岔
const PAGE_LOAD = [
  'const baseline = await loadImage(BASE_URL);',
  'const current = await loadImage(CUR_URL);',
  'const baseSize = sizeOf(baseline); const curSize = sizeOf(current);',
  "assertSize(baseSize, 'baseline'); assertSize(curSize, 'current');",
  '// 以 current 為基準等比縮放到同一尺寸（最長邊 <= MAX_EDGE）：不縮小會讓',
  '// getImageData 變秒級；尺寸不同無法逐像素比對，比例不同就拉伸對齊。',
  'const fit = Math.min(1, MAX_EDGE / Math.max(curSize.w, curSize.h));',
  'const W = Math.max(1, Math.round(curSize.w * fit));',
  'const H = Math.max(1, Math.round(curSize.h * fit));',
  'const a = drawTo(baseline, W, H).ctx.getImageData(0, 0, W, H).data;',
  'const b = drawTo(current, W, H).ctx.getImageData(0, 0, W, H).data;',
  'const mask = buildMask(W, H);',
  'const totalPixels = W * H;',
].join('\n');

// 統計主體：一次掃描同時累積總數、3x3 分區與 worst 的緊緻包圍盒
const STATS_BODY = [
  'const CELLS = GRID * GRID;',
  'const cellCompared = new Array(CELLS).fill(0);',
  'const cellChanged = new Array(CELLS).fill(0);',
  'const minX = new Array(CELLS).fill(-1); const minY = new Array(CELLS).fill(-1);',
  'const maxX = new Array(CELLS).fill(-1); const maxY = new Array(CELLS).fill(-1);',
  'let changedPixels = 0;',
  'for (let y = 0; y < H; y++) {',
  '  const row = Math.floor((y * GRID) / H);',
  '  for (let x = 0; x < W; x++) {',
  '    const index = y * W + x;',
  '    if (mask.flags[index]) continue; // mask 內不比對，但仍計入 totalPixels',
  '    const cell = row * GRID + Math.floor((x * GRID) / W);',
  '    cellCompared[cell]++;',
  '    const p = index * 4;',
  '    if (!isChanged(a, b, p, THRESHOLD)) continue;',
  '    changedPixels++;',
  '    cellChanged[cell]++;',
  '    if (minX[cell] < 0 || x < minX[cell]) minX[cell] = x;',
  '    if (minY[cell] < 0 || y < minY[cell]) minY[cell] = y;',
  '    if (x > maxX[cell]) maxX[cell] = x;',
  '    if (y > maxY[cell]) maxY[cell] = y;',
  '  }',
  '}',
  'const comparedPixels = totalPixels - mask.masked; const cells = []; let worstIndex = -1;',
  'for (let cell = 0; cell < CELLS; cell++) {',
  '  const compared = cellCompared[cell];',
  '  // 整格被 mask 蓋住時沒有分母：percent 記 0，別讓 NaN 變成 JSON 的 null',
  '  cells.push({ index: cell, row: Math.floor(cell / GRID), col: cell % GRID, changed: cellChanged[cell],',
  '    percent: compared ? round((cellChanged[cell] / compared) * 100, 2) : 0 });',
  '  if (cellChanged[cell] > 0 && (worstIndex < 0 || cellChanged[cell] > cellChanged[worstIndex])) worstIndex = cell;',
  '}',
  'const worst = worstIndex < 0 ? { x: 0, y: 0, w: 0, h: 0, changed: 0 } : {',
  '  x: minX[worstIndex], y: minY[worstIndex],',
  '  w: maxX[worstIndex] - minX[worstIndex] + 1,',
  '  h: maxY[worstIndex] - minY[worstIndex] + 1,',
  '  changed: cellChanged[worstIndex],',
  '};',
  'return JSON.stringify({ width: W, height: H, totalPixels, comparedPixels,',
  '  maskedPixels: mask.masked, changedPixels,',
  '  diffPercent: comparedPixels ? round((changedPixels / comparedPixels) * 100, 2) : 0,',
  '  grid: { cols: GRID, rows: GRID, cells }, worst });',
].join('\n');

// 差異圖：current 壓成灰階當底圖，changed 塗 #ff2d55，mask 塗 #303040
const IMAGE_BODY = [
  "const out = document.createElement('canvas');",
  'out.width = W; out.height = H;',
  "const outCtx = out.getContext('2d', { willReadFrequently: true });",
  'const image = outCtx.createImageData(W, H); const data = image.data;',
  'for (let index = 0; index < totalPixels; index++) {',
  '  const p = index * 4;',
  '  if (mask.flags[index]) { data[p] = 48; data[p + 1] = 48; data[p + 2] = 64; data[p + 3] = 255; continue; }',
  '  if (isChanged(a, b, p, THRESHOLD)) { data[p] = 255; data[p + 1] = 45; data[p + 2] = 85; data[p + 3] = 255; continue; }',
  '  // 灰階係數 0.299/0.587/0.114，再乘 0.35 壓到原亮度 35%，差異色才跳得出來',
  '  const gray = Math.round((0.299 * b[p] + 0.587 * b[p + 1] + 0.114 * b[p + 2]) * 0.35);',
  '  data[p] = gray; data[p + 1] = gray; data[p + 2] = gray; data[p + 3] = 255;',
  '}',
  'outCtx.putImageData(image, 0, 0);',
  "return JSON.stringify({ dataUrl: out.toDataURL('image/png'), width: W, height: H });",
].join('\n');

/** 組出表達式：常數（含 dataURL 字面值）→ 共用工具 → 載入 → 主體 */
function compose(baselineDataUrl, currentDataUrl, threshold, maskRects, body) {
  return [
    '(async () => {',
    '  const BASE_URL = ' + embed(baselineDataUrl) + ';',
    '  const CUR_URL = ' + embed(currentDataUrl) + ';',
    '  const THRESHOLD = ' + normalizeThreshold(threshold) + ';',
    '  const MASK_RECTS = ' + JSON.stringify(normalizeRects(maskRects)) + ';',
    '  const GRID = ' + GRID + ';',
    '  const MAX_EDGE = ' + MAX_EDGE + ';',
    PAGE_HELPERS,
    PAGE_LOAD,
    body,
    '})()',
  ].join('\n');
}

/** A. 統計：尺寸、總數、mask、changed、diffPercent、3x3 分區、worst 包圍盒 */
export function diffStatsExpr(baselineDataUrl, currentDataUrl, threshold, maskRects) {
  return compose(baselineDataUrl, currentDataUrl, threshold, maskRects, STATS_BODY);
}

/** B. 差異圖：resolve 成 { dataUrl, width, height }（dataUrl 為 image/png） */
export function diffImageExpr(baselineDataUrl, currentDataUrl, threshold, maskRects) {
  return compose(baselineDataUrl, currentDataUrl, threshold, maskRects, IMAGE_BODY);
}
