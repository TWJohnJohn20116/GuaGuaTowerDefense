/**
 * 頁面內視覺稽核表達式（給 scripts/visual-check.mjs 以 CDP Runtime.evaluate 執行）
 *
 * 為什麼匯出「字串」而不是函式：稽核得在真實頁面的渲染環境跑（getComputedStyle、
 * elementsFromPoint、innerText 都只在渲染環境有意義），但入口是 Node 端，所以只交付一條
 * 可直接 eval 的表達式；兩邊共用同一份真相，也不必為了在 Node 跑而在頁面裡加分支。
 * 為什麼外層不包 try：整段若被吞掉，壞掉的結果會長得跟「掃過但全空」一樣，比直接拋錯難查；
 * 只有單一元素解析失敗才 continue。全程只讀：不改 DOM、不寫任何全域變數。
 */
export const AUDIT_EXPR = String.raw`(() => {
  'use strict';
  const MAX_ELEMENTS = 6000, MAX_TEXT_NODES = 3000, MAX_LIST = 200, MAX_TARGETS = 400, EPS = 1e-6;
  const counts = { elements: 0, textNodes: 0, contrast: 0, truncated: 0, overflow: 0, occlusion: 0 };
  const skipped = { unknownBg: 0, hidden: 0, capped: false };
  const contrast = [], truncated = [], overflow = [], occlusion = [];

  // getComputedStyle 會強制結算樣式，同一個元素只允許取一次
  const cache = new Map();
  const styleOf = (node) => {
    let s = cache.get(node);
    if (!s) { s = getComputedStyle(node); cache.set(node, s); }
    return s;
  };
  const round = (v, d) => Math.round(v * Math.pow(10, d)) / Math.pow(10, d);
  const box = (r) => ({ x: round(r.left, 1), y: round(r.top, 1), w: round(r.width, 1), h: round(r.height, 1) });

  // computed color 只會是 rgb()/rgba()/color(srgb ...)；其他寫法一律當成無法判定
  const parseColor = (raw) => {
    if (typeof raw !== 'string') return null;
    const s = raw.trim().toLowerCase();
    if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
    const m = s.match(/^rgba?\(([^)]*)\)$/);
    if (m) {
      const parts = m[1].split(/[\s,\/]+/).filter((p) => p.length > 0);
      if (parts.length < 3) return null;
      const num = parts.map((p, i) => {
        const v = parseFloat(p);
        if (!Number.isFinite(v)) return NaN;
        return p.endsWith('%') ? (v / 100) * (i < 3 ? 255 : 1) : v;
      });
      if (num.some((v) => !Number.isFinite(v))) return null;
      return { r: num[0], g: num[1], b: num[2], a: num.length > 3 ? num[3] : 1 };
    }
    const c = s.match(/^color\(srgb\s+([^)]*)\)$/);
    if (!c) return null;
    const parts = c[1].split(/[\s\/]+/).filter((p) => p.length > 0);
    if (parts.length < 3) return null;
    const ch = parts.slice(0, 3).map((p) => {
      const v = parseFloat(p);
      if (!Number.isFinite(v)) return NaN;
      return p.endsWith('%') ? (v / 100) * 255 : v * 255;
    });
    if (ch.some((v) => !Number.isFinite(v))) return null;
    const a = parts.length > 3 ? parseFloat(parts[3]) : 1;
    return { r: ch[0], g: ch[1], b: ch[2], a: Number.isFinite(a) ? a : 1 };
  };
  // WCAG 亮度必須先做 sRGB → 線性轉換；直接平均 0–255 會高估亮色、低估暗色
  const lin = (v) => {
    const c = Math.min(255, Math.max(0, v)) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratioOf = (fg, bg) => {
    const a = lum(fg), b = lum(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  // 元素自身多半是 transparent：真正底色來自祖先；中途遇到背景圖就無法判定
  const findBg = (node) => {
    let cur = node;
    while (cur && cur.nodeType === 1) {
      const c = styleOf(cur);
      const bg = parseColor(c.backgroundColor);
      if (bg && bg.a >= 0.99) return { raw: c.backgroundColor, rgb: bg };
      if (c.backgroundImage !== 'none') return null;
      cur = cur.parentElement;
    }
    return null;
  };
  // Tailwind 的 w-[220px] 這類 class 放進選擇器只讓輸出難讀，也不會更精準
  const NOISY = /[:\[\/]/;
  const classesOf = (node) => {
    const raw = typeof node.getAttribute === 'function' ? node.getAttribute('class') : '';
    if (!raw) return [];
    return raw.trim().split(/\s+/).filter((c) => c.length > 0 && c.length <= 24 && !NOISY.test(c)).slice(0, 2);
  };
  // 只用 tag/id/class、最多 5 層且不含 nth-child：同一頁重跑必得同一字串
  const cssPath = (node) => {
    if (!node || node.nodeType !== 1) return '';
    if (node === document.documentElement) return 'html';
    if (node === document.body) return 'body';
    const parts = [];
    let cur = node;
    while (cur && cur.nodeType === 1 && parts.length < 5) {
      const tag = (cur.tagName || 'node').toLowerCase();
      if (cur === document.documentElement) { parts.unshift('html'); break; }
      if (cur === document.body) { parts.unshift('body'); break; }
      if (cur.id) { parts.unshift(tag + '#' + cur.id); break; }
      const tokens = classesOf(cur);
      parts.unshift(tokens.length ? tag + '.' + tokens.join('.') : tag);
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  };
  const isHidden = (c) =>
    c.display === 'none' || c.visibility === 'hidden' || parseFloat(c.opacity) < 0.05;

  const CRITICAL = 'button, a, [role="button"], h1, h2, h3, [role="dialog"], input, select, textarea, [data-testid]';
  const OCCLUDABLE = 'button, a, [role="button"], h1, h2, h3, h4, [role="tab"], [role="dialog"], input, select, textarea, [data-testid]';
  const critical = new Set(document.querySelectorAll(CRITICAL));
  const occludable = new Set(document.querySelectorAll(OCCLUDABLE));
  const all = document.querySelectorAll('*');
  if (all.length > MAX_ELEMENTS) skipped.capped = true;
  const scanLimit = Math.min(all.length, MAX_ELEMENTS);
  const targets = [];
  const peLayers = [];
  for (let i = 0; i < scanLimit; i++) {
    const el = all[i];
    try {
      counts.elements++;
      const rect = el.getBoundingClientRect();
      // 先看 rect 再取 computed：display:none 的元素 rect 是 0，能省一次昂貴結算
      if (rect.width < 2 || rect.height < 2) { skipped.hidden++; continue; }
      const c = styleOf(el);
      if (isHidden(c)) { skipped.hidden++; continue; }
      // pointer-events:none 的浮層不會出現在 elementsFromPoint 裡，先自己收集 rect 補回
      if (c.pointerEvents === 'none' && peLayers.length < 120 &&
          (c.position === 'fixed' || c.position === 'absolute' || c.position === 'sticky')) {
        peLayers.push({ el, rect });
      }

      // 只認直接文字節點：祖先會把子孫文字一起算進去，重複計算會灌爆清單
      let nodes = 0;
      let text = '';
      for (let k = 0; k < el.childNodes.length; k++) {
        const n = el.childNodes[k];
        if (n.nodeType !== 3) continue;
        const t = (n.nodeValue || '').trim();
        if (t.length <= 1) continue;
        nodes++;
        text = text ? text + ' ' + t : t;
      }
      if (nodes > 0 && counts.textNodes < MAX_TEXT_NODES) {
        counts.textNodes += nodes;
        const fg = parseColor(c.color);
        const bg = findBg(el);
        if (!fg || !bg) skipped.unknownBg++;
        else {
          const size = parseFloat(c.fontSize) || 0;
          const bold = c.fontWeight === 'bold' || parseFloat(c.fontWeight) >= 700;
          const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
          const ratio = ratioOf(fg, bg.rgb);
          if (ratio < need - EPS) {
            contrast.push({
              selector: cssPath(el), text: text.slice(0, 80), color: c.color, bg: bg.raw,
              ratio: round(ratio, 2), fontSize: round(size, 2), bold, required: need,
            });
          }
        }
      }

      // 截斷：先做便宜的 scroll/client 比較，真的溢出才呼叫 innerText（它會觸發 layout）。
      // 每個元素都檢查自己，子孫在迴圈裡各自被檢查，等同「元素或其子孫」。
      if (truncated.length < MAX_LIST) {
        const cutX = /hidden|clip/.test(c.overflowX) || /ellipsis/.test(c.textOverflow);
        const cutY = /hidden|clip/.test(c.overflowY);
        const overX = el.scrollWidth > el.clientWidth + 1 && cutX;
        const overY = el.scrollHeight > el.clientHeight + 1 && cutY;
        if (overX || overY) {
          const raw = (el.innerText || '').trim();
          if (raw.length > 0) {
            truncated.push({
              selector: cssPath(el), text: raw.slice(0, 80),
              clientWidth: el.clientWidth, scrollWidth: el.scrollWidth,
              clientHeight: el.clientHeight, scrollHeight: el.scrollHeight,
            });
          }
        }
      }

      // 溢出視口：只報關鍵互動元素，否則一條上百項的清單沒人看得完
      if (overflow.length < MAX_LIST && critical.has(el)) {
        const vw = window.innerWidth, vh = window.innerHeight;
        // 可滾動祖先內的東西本來就會停在視口外（橫向卡片列），那是設計不是溢出
        let inScroller = false;
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          if (p.scrollWidth > p.clientWidth + 1 || p.scrollHeight > p.clientHeight + 1) { inScroller = true; break; }
        }
        if (!inScroller) {
          if (rect.right > vw + 1) overflow.push({ selector: cssPath(el), side: 'right', rect: box(rect) });
          if (rect.left < -1) overflow.push({ selector: cssPath(el), side: 'left', rect: box(rect) });
          if (rect.bottom > vh + 1) overflow.push({ selector: cssPath(el), side: 'bottom', rect: box(rect) });
          if (rect.top < -1) overflow.push({ selector: cssPath(el), side: 'top', rect: box(rect) });
        }
      }
      // 遮擋要等所有元素掃完才有完整的 peLayers 可用，先排隊
      if (occludable.has(el) && targets.length < MAX_TARGETS) {
        targets.push({ el, rect, path: cssPath(el) });
      }
    } catch {
      continue;
    }
  }
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  const area = (r) => Math.max(0, r.width) * Math.max(0, r.height);
  const overlapArea = (a, b) => {
    const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return x > 0 && y > 0 ? x * y : 0;
  };
  const related = (a, b) => a === b || a.contains(b) || b.contains(a);
  // 小面積、aria-hidden 的裝飾層（光暈、遮罩）不是資訊遮擋，報了只會製造噪音
  const decorative = (node, r) =>
    typeof node.closest === 'function' && node.closest('[aria-hidden="true"]') !== null && area(r) < vw * vh * 0.01;

  for (let i = 0; i < targets.length && occlusion.length < MAX_LIST; i++) {
    const t = targets[i];
    const tr = t.rect;
    if (tr.right <= 0 || tr.bottom <= 0 || tr.left >= vw || tr.top >= vh) continue;
    if (area(tr) <= 0) continue;
    const pts = [
      [(tr.left + tr.right) / 2, (tr.top + tr.bottom) / 2],
      [tr.left + 2, tr.top + 2],
      [tr.right - 2, tr.top + 2],
      [tr.left + 2, tr.bottom - 2],
      [tr.right - 2, tr.bottom - 2],
    ];
    let best = null;
    for (let p = 0; p < pts.length; p++) {
      const x = Math.min(vw - 1, Math.max(0, pts[p][0]));
      const y = Math.min(vh - 1, Math.max(0, pts[p][1]));
      const stack = document.elementsFromPoint(x, y);
      if (!stack || stack.length === 0) continue;
      let by = null;
      let pe = false;
      if (!related(t.el, stack[0])) by = stack[0];
      else {
        for (let k = 0; k < peLayers.length; k++) {
          const lay = peLayers[k];
          const lr = lay.rect;
          if (x < lr.left || x > lr.right || y < lr.top || y > lr.bottom) continue;
          if (related(t.el, lay.el)) continue;
          by = lay.el; pe = true; break;
        }
      }
      if (!by) continue;
      const br = by.getBoundingClientRect();
      if (area(br) <= 0 || decorative(by, br)) continue;
      // 面積超過半個視口的是版面容器／背景層，它「包住」不等於「蓋住」內容
      if (area(br) > vw * vh * 0.5) continue;
      const cover = overlapArea(tr, br) / area(tr);
      if (cover > 0.15 && (!best || cover > best.cover)) best = { by, br, cover, pe };
    }
    // 同一 target 只留覆蓋率最高的一筆：五個取樣點會重複命中同一個遮擋者
    if (best) {
      const label = cssPath(best.by) + (best.pe ? ' (pointer-events:none)' : '');
      occlusion.push({
        target: t.path, by: label, overlap: round(best.cover, 2),
        targetRect: box(tr), byRect: box(best.br),
      });
    }
  }
  counts.contrast = contrast.length; counts.truncated = truncated.length;
  counts.overflow = overflow.length; counts.occlusion = occlusion.length;
  return JSON.stringify({ counts, contrast, truncated, overflow, occlusion, skipped });
})()`;
