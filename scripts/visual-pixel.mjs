/**
 * 像素統計表達式 — 供 scripts/visual-check.mjs 透過 CDP 執行
 *
 * 為什麼要這個：視覺驗證不能只靠「#root 有內容」，那只能證明畫面有東西。
 * 這裡把「畫面本身」量化成三個客觀指標，讓「一片奶油色」「整張糊掉」「空狀態破圖」
 * 能被程式抓到：
 *   - uniqueColors：顏色多樣性（RGB 各量化到 4 bit，抗 JPEG 壓縮雜訊）
 *   - edgeDensity ：相鄰像素亮度差 > 24 的比例（有沒有可辨識的邊界／文字）
 *   - lumaVariance / meanLuma：整體亮度分佈
 *
 * 使用方式（呼叫端固定這樣用）：
 *   await send('Runtime.evaluate', { expression: pixelStatsExpr(dataUrl), awaitPromise: true });
 * 回傳值是 JSON 字串，呼叫端需自行 JSON.parse。
 */

const MAX_EDGE = 480; // 最長邊上限：1600x900 → 480x270（約 13 萬像素），getImageData 才不會拖慢整個流程
const EDGE_LUMA_GAP = 24; // 相鄰亮度差超過這個值算一條邊（雜訊以下的差異不計）
const BLANK_COLORS = 16; // 量化後顏色種類少於此 → 可能是單色底
const BLANK_EDGE = 0.002; // 邊緣密度低於此 → 沒有可辨識內容

/**
 * 產生在頁面內執行的 async IIFE 表達式字串。
 * @param {string} dataUrl base64 JPEG / PNG 的 data URL
 * @returns {string} 可直接丟給 Runtime.evaluate 的表達式（解析為 JSON 字串）
 */
export function pixelStatsExpr(dataUrl) {
  // dataURL 動輒 200~400 KB，用 JSON.stringify 內嵌可安全處理引號與反斜線。
  // U+2028 / U+2029 在舊引擎會被當成換行而斷掉字串，先轉義。
  const literal = JSON.stringify(String(dataUrl))
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return `(async () => {
  const DATA_URL = ${literal};
  // 載入失敗必須 reject：靜默回傳空統計會讓壞圖看起來「通過」
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('pixelStats: 圖片載入失敗'));
    el.src = DATA_URL;
  });

  const w0 = img.naturalWidth || img.width;
  const h0 = img.naturalHeight || img.height;
  if (!w0 || !h0) throw new Error('pixelStats: 圖片尺寸為 0');

  // 等比縮到最長邊 <= MAX_EDGE，大圖才不會把 getImageData 拖成秒級
  const ratio = Math.min(1, ${MAX_EDGE} / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * ratio));
  const h = Math.max(1, Math.round(h0 * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);

  const px = ctx.getImageData(0, 0, w, h).data;
  const n = w * h;
  const luma = new Float32Array(n);
  const colors = new Set();
  let sum = 0;
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const r = px[p];
    const g = px[p + 1];
    const b = px[p + 2];
    // RGB 各留高 4 bit：12 bit 一組，最多 4096 色，且不受 JPEG 微小色偏影響
    colors.add(((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4));
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    luma[i] = y;
    sum += y;
  }

  const mean = sum / n;
  let sq = 0;
  for (let i = 0; i < n; i++) {
    const d = luma[i] - mean;
    sq += d * d;
  }
  const variance = sq / n; // 母體變異數（除以 N，不是 N-1）

  // 邊緣密度：水平對 (w-1)*h 組 + 垂直對 w*(h-1) 組，一起當分母
  let edges = 0;
  let pairs = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 1; x < w; x++) {
      pairs++;
      if (Math.abs(luma[y * w + x] - luma[y * w + x - 1]) > ${EDGE_LUMA_GAP}) edges++;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 1; y < h; y++) {
      pairs++;
      if (Math.abs(luma[y * w + x] - luma[(y - 1) * w + x]) > ${EDGE_LUMA_GAP}) edges++;
    }
  }

  const round = (v, d) => {
    const f = Math.pow(10, d);
    return Math.round(v * f) / f;
  };
  const uniqueColors = colors.size;
  const edgeDensity = round(pairs ? edges / pairs : 0, 4);
  const payload = {
    uniqueColors,
    edgeDensity,
    lumaVariance: round(variance, 1),
    meanLuma: round(mean, 1),
    // 用四捨五入後的 edgeDensity 判定，讓回傳值本身就能被驗算
    isBlank: uniqueColors < ${BLANK_COLORS} && edgeDensity < ${BLANK_EDGE},
    sampled: n,
  };
  return JSON.stringify(payload);
})()`;
}
