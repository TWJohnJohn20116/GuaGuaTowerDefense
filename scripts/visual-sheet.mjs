/**
 * 總表排版規劃 — 供 scripts/visual-check.mjs 產生 contact-sheet 用
 *
 * 為什麼要分組：桌機（1600x900）與手機（390x844）的長寬比差太多，
 * 硬塞同一組欄位會讓手機截圖被縮成一小條、字完全看不見。
 * 這裡依尺寸分組：寬的用 3 欄、窄的用 4 欄並給更高的圖框。
 *
 * 純函式：不改動輸入陣列（不 sort、不 push 原陣列），回傳全新結構。
 */

const SHEET_WIDTH = 1860; // 與現行總表一致（renderSheet 的 width）
const WIDE_MIN_W = 800; // 這個寬度以上算「寬版」
const WIDE_COLS = 3;
const NARROW_COLS = 4;
const WIDE_IMG_H = 330; // 寬版圖框高（現行值）
const NARROW_IMG_H = 420; // 窄版圖框高（長條圖需要更高才看得清）
const CAPTION_H = 44; // 圖說高度（scene · size · FAIL）
const GROUP_PAD = 56; // 每組額外留白（組標題列 + 組間距）
const SHEET_PAD = 72; // 整張表額外留白（header 與外距，現行 +72）

/** 解析 "1600x900" → { w, h }；解析不到就給 0（後續會落到窄版分支，寧可圖大不要圖小） */
function parseSize(text) {
  const m = /^\s*(\d+)\s*[xX×]\s*(\d+)\s*$/.exec(String(text ?? ''));
  if (!m) return { w: 0, h: 0 };
  return { w: Number(m[1]), h: Number(m[2]) };
}

/**
 * @param {Array<{ scene: string, size: string, file: string, pass: boolean }>} items
 * @returns {{ groups: Array<{ size: string, items: Array<object>, cols: number, imgH: number, rowHeight: number, rows: number, height: number }>, width: number, height: number }}
 */
export function planSheet(items) {
  const groups = [];
  const bySize = new Map(); // 只做索引，不動輸入

  for (const item of items) {
    const size = String(item.size);
    let group = bySize.get(size);
    if (!group) {
      const { w, h } = parseSize(size);
      const wide = w >= WIDE_MIN_W;
      const cols = wide ? WIDE_COLS : NARROW_COLS;
      const imgH = wide ? WIDE_IMG_H : NARROW_IMG_H;
      group = {
        size, // 保留原始字串（分組鍵），w/h 只在本模組內使用
        items: [], // 新陣列；元素沿用原物件參考，不複製、不改寫
        cols,
        imgH,
        rowHeight: imgH + CAPTION_H,
        rows: 0,
        height: 0,
      };
      bySize.set(size, group);
      groups.push(group); // 依首次出現順序
    }
    group.items.push(item);
  }

  for (const group of groups) {
    group.rows = Math.ceil(group.items.length / group.cols);
    group.height = group.rows * group.rowHeight + GROUP_PAD;
  }

  const height = groups.reduce((acc, g) => acc + g.height, 0) + SHEET_PAD;
  return { groups, width: SHEET_WIDTH, height };
}
