/**
 * HARDLINE 第二波掃描：清掉殘留的圓角、陰影、漸層與白色透明面
 *
 * 用法：node scripts/hardline-pass2.mjs [--apply]
 * 只處理 src/components/ui 與 src/components/game 底下的 .tsx。
 * 排除 ColorPicker / ModIconEditor（色相條本身就是漸層控件）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const DIRS = ['src/components/ui', 'src/components/game'];
const SKIP = /ColorPicker|ModIconEditor|hue|HueSlider/i;

const PALETTE =
  '(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)';

const RULES = [
  // 圓角：全部移除（config 已把它們映射成 0，這裡是為了讓原始碼乾淨）
  [/\brounded-\[[^\]]+\]/g, ''],
  [/\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\b/g, ''],
  [/\brounded\b/g, ''],

  // 陰影與模糊
  [/\bshadow-(2xl|xl|lg|md|sm|inner|none)\b/g, ''],
  [/\bbackdrop-blur(-[a-z0-9]+)?\b/g, ''],

  // 漸層底
  [/\bbg-gradient-to-[a-z]{1,2}\b/g, 'bg-[var(--hl-deck-2)]'],
  [new RegExp(`\\b(from|via|to)-${PALETTE}-\\d{2,3}\\b`, 'g'), ''],
  [new RegExp(`\\b(from|via|to)-${PALETTE}/\\d{1,3}\\b`, 'g'), ''],

  // 舊色票直接換資料色
  [/\btext-(emerald|green)-\d{3}\b/g, 'text-[var(--hl-vital)]'],
  [/\btext-(red|rose)-\d{3}\b/g, 'text-[var(--hl-alarm)]'],
  [/\btext-(amber|yellow|orange)-\d{3}\b/g, 'text-[var(--hl-caution)]'],
  [/\btext-(sky|blue|cyan|indigo)-\d{3}\b/g, 'text-[var(--hl-reach)]'],
  [/\bbg-(emerald|green)-\d{3}\/\d{1,3}\b/g, 'bg-[rgba(56,224,143,0.12)]'],
  [/\bbg-(red|rose)-\d{3}\/\d{1,3}\b/g, 'bg-[rgba(255,75,62,0.12)]'],
  [/\bbg-(amber|yellow|orange)-\d{3}\/\d{1,3}\b/g, 'bg-[rgba(255,182,39,0.12)]'],
  [/\bbg-(sky|blue|cyan|indigo)-\d{3}\/\d{1,3}\b/g, 'bg-[rgba(111,168,255,0.12)]'],
  [/\bborder-(emerald|green)-\d{3}\/\d{1,3}\b/g, 'border-[rgba(56,224,143,0.38)]'],
  [/\bborder-(red|rose)-\d{3}\/\d{1,3}\b/g, 'border-[rgba(255,75,62,0.38)]'],
  [/\bborder-(amber|yellow|orange)-\d{3}\/\d{1,3}\b/g, 'border-[rgba(255,182,39,0.38)]'],
  [/\bborder-(sky|blue|cyan|indigo)-\d{3}\/\d{1,3}\b/g, 'border-[rgba(111,168,255,0.38)]'],
  [/\bborder-(purple|violet|fuchsia|pink)-\d{3}\/\d{1,3}\b/g, 'border-[var(--hl-line-strong)]'],
  [/\btext-(purple|violet|fuchsia|pink)-\d{3}\b/g, 'text-[var(--hl-ink-2)]'],
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(name) && !/\.test\./.test(name) && !SKIP.test(full)) out.push(full);
  }
  return out;
}

const files = DIRS.flatMap((d) => walk(path.join(ROOT, d)));
let touched = 0;
let hits = 0;
const stats = new Map();

for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  let after = before;
  for (const [re, rep] of RULES) {
    const n = (after.match(re) || []).length;
    if (!n) continue;
    hits += n;
    stats.set(String(re), (stats.get(String(re)) || 0) + n);
    after = after.replace(re, rep);
  }
  if (after !== before) {
    touched++;
    if (APPLY) fs.writeFileSync(f, after, 'utf8');
  }
}

console.log(`[hardline2] ${APPLY ? 'APPLIED' : 'DRY'} files=${files.length} touched=${touched} hits=${hits}`);
for (const [k, v] of [...stats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${String(v).padStart(5)}  ${k}`);
}
