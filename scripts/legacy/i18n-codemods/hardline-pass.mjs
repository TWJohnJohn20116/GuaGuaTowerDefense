/**
 * HARDLINE 機械化掃描 — 把舊玻璃語言換成硬線 token
 *
 * 用法：
 *   node scripts/hardline-pass.mjs            # 只統計
 *   node scripts/hardline-pass.mjs --apply    # 寫入
 *
 * 只處理 class 字串裡的樣式 token，不動邏輯、不動文案、不動 i18n key。
 * 測試檔與 data/ 不動。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const APPLY = process.argv.includes('--apply');

/** 依序套用的替換規則（長字串先處理，避免前綴吃掉後綴） */
const RULES = [
  // ---- 玻璃面 → 實色面 ----
  [/\bbg-white\/\[0\.0[1-4]\]/g, 'bg-[var(--hl-deck-2)]'],
  [/\bbg-white\/\[0\.0[5-9]\]/g, 'bg-[var(--hl-deck-3)]'],
  [/\bbg-white\/(8|12)\b/g, 'bg-[var(--hl-deck-3)]'],
  [/\bbg-white\/(25|30|40)\b/g, 'bg-[var(--hl-deck-4)]'],
  [/\bbg-white\/(80|90)\b/g, 'bg-[var(--hl-ink)]'],
  [/\bbg-white\b(?![/\w-])/g, 'bg-[var(--hl-ink)]'],
  [/\bbg-white\/(5|\[0\.05\])/g, 'bg-[var(--hl-deck-2)]'],
  [/\bbg-white\/(10|\[0\.1\])/g, 'bg-[var(--hl-deck-3)]'],
  [/\bbg-white\/(15|20)/g, 'bg-[var(--hl-deck-4)]'],
  [/\bborder-white\/(6|8|12|18|\[0\.03\])/g, 'border-[var(--hl-line)]'],
  [/\bborder-white\b(?![/\w-])/g, 'border-[var(--hl-line-strong)]'],
  [/\bborder-white\/(5|10|\[0\.0[5-9]\]|\[0\.1\])/g, 'border-[var(--hl-line)]'],
  [/\bborder-white\/(15|20|\[0\.15\]|\[0\.2\])/g, 'border-[var(--hl-line-strong)]'],
  [/\bborder-white\/(25|30|40)/g, 'border-[var(--hl-line-hot)]'],

  // ---- 模糊與陰影：這個系統不存在 ----
  [/\bbackdrop-blur(-[a-z0-9]+)?\b/g, ''],
  [/\bshadow-(2xl|xl|lg|md|sm)\b/g, ''],
  [/\bbackdrop-saturate-\d+\b/g, ''],

  // ---- 文字 ----
  [/\btext-white\/(90|95|\[0\.9\]|\[0\.95\])/g, 'text-[var(--hl-ink)]'],
  [/\btext-white\/(80|75|70|\[0\.8\]|\[0\.75\]|\[0\.7\])/g, 'text-[var(--hl-ink-2)]'],
  [/\btext-white\/(60|55|50|\[0\.6\]|\[0\.5\])/g, 'text-[var(--hl-ink-3)]'],
  [/\btext-white\/(40|35|30|20|\[0\.4\])/g, 'text-[var(--hl-ink-4)]'],
  [/\btext-white\b/g, 'text-[var(--hl-ink)]'],
  [/\btext-gray-(100|200|300)\b/g, 'text-[var(--hl-ink-2)]'],
  [/\btext-gray-(400|500)\b/g, 'text-[var(--hl-ink-3)]'],

  // ---- 舊北歐藍與其他散色 → 訊號色 / 線色 ----
  [/\b(?:bg|border|text)-\[#89c4dd\]/g, (m) => m.replace('#89c4dd', 'var(--hl-signal)')],
  [/\b(?:bg|border|text)-\[#3d4a5c\]/g, (m) => m.replace('#3d4a5c', 'var(--hl-line)')],
  [/\b(?:bg|border|text)-\[#1c2430\]/g, (m) => m.replace('#1c2430', 'var(--hl-deck)')],
  [/\b(?:bg|border|text)-\[#273140\]/g, (m) => m.replace('#273140', 'var(--hl-deck-2)')],
  [/\b(?:bg|border|text)-\[#0b0d11\]/g, (m) => m.replace('#0b0d11', 'var(--hl-void)')],
  [/\b(?:bg|border|text)-\[#f3f6fb\]/g, (m) => m.replace('#f3f6fb', 'var(--hl-ink)')],
  [/\b(?:bg|border|text)-\[#b4becc\]/g, (m) => m.replace('#b4becc', 'var(--hl-ink-2)')],
];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === 'node_modules') continue;
      walk(full, out);
    } else if (/\.(tsx?|jsx?)$/.test(name)) {
      if (/\.test\.|\.spec\./.test(name)) continue;
      if (full.includes(`${path.sep}data${path.sep}`)) continue;
      out.push(full);
    }
  }
  return out;
}

const files = walk(SRC);
let touched = 0;
let totalHits = 0;
const perRule = new Map();

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;

  for (const [pattern, replacement] of RULES) {
    const hits = (after.match(pattern) || []).length;
    if (!hits) continue;
    perRule.set(String(pattern), (perRule.get(String(pattern)) || 0) + hits);
    totalHits += hits;
    after = after.replace(pattern, replacement);
  }

  if (after !== before) {
    touched++;
    if (APPLY) fs.writeFileSync(file, after);
  }
}

console.log(`[hardline] ${APPLY ? 'APPLIED' : 'DRY RUN'}`);
console.log(`[hardline] ${touched} files changed, ${totalHits} token hits, ${files.length} scanned`);
for (const [rule, count] of [...perRule.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14)) {
  console.log(`  ${String(count).padStart(5)}  ${rule}`);
}
