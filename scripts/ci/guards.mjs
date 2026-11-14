/**
 * CI 守門：技術債棘輪（ratchet）+ bundle 大小預算
 *
 * 為什麼需要：42 項技術債（架構圖.html §21）最大的風險不是修不完，
 * 而是「邊修邊長新的」。這支腳本把現況寫成上限，只准降不准升。
 *
 * 用法：
 *   node scripts/ci/guards.mjs           # 兩項都檢查
 *   node scripts/ci/guards.mjs --debt    # 只檢查技術債計數（建置前就能跑）
 *   node scripts/ci/guards.mjs --bundle  # 只檢查 dist 主 chunk 大小（建置後跑）
 *
 * 修掉債之後，請把 BASELINE 的數字往下調（並在 commit 訊息引用 TD 編號）。
 * 永遠不要把上限調高。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(ROOT, 'src');
const DIST_ASSETS = path.join(ROOT, 'dist', 'assets');

/** 2026-11-14 實測基準。只能往下調。 */
const BASELINE = {
  'as any': 19,
  ': any': 14,
  '@ts-ignore': 0,
  '@ts-expect-error': 0,
  'eslint-disable': 0,
  'console.log': 1,
};

/**
 * 主 chunk 預算（bytes）。
 * 2026-11-14 TD-24 第一刀：DevPanel + MainMenu 改 lazy、移除 `@/components/ui` barrel，
 * 1,333,086 → 1,165,958（-12.5%）。這裡跟著收緊，只准再降。
 * 目標 < 900,000 需要先還 TD-20（Icons 132 KB）與成就資料 lazy 化。
 */
const BUNDLE_BUDGET_BYTES = 1_180_000;

const CODE_EXT = new Set(['.ts', '.tsx']);

/** 遞迴收集 src 下的 ts/tsx */
function collectFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, out);
    } else if (CODE_EXT.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function checkDebt() {
  const files = collectFiles(SRC_DIR);
  const corpus = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

  const rows = [];
  let failed = false;

  for (const [pattern, limit] of Object.entries(BASELINE)) {
    const actual = corpus.split(pattern).length - 1;
    const over = actual > limit;
    if (over) failed = true;
    rows.push({
      pattern,
      limit,
      actual,
      status: over ? `✗ 超出 ${actual - limit}` : actual < limit ? `✓ 可下調至 ${actual}` : '✓ 持平',
    });
  }

  console.log(`\n[技術債棘輪] 掃描 ${files.length} 個 ts/tsx 檔\n`);
  console.log('項目'.padEnd(20) + '上限'.padStart(6) + '實測'.padStart(8) + '  狀態');
  for (const r of rows) {
    console.log(r.pattern.padEnd(20) + String(r.limit).padStart(6) + String(r.actual).padStart(8) + '  ' + r.status);
  }

  const lowerable = rows.filter((r) => r.actual < r.limit);
  if (lowerable.length > 0) {
    console.log(
      `\n提示：${lowerable.map((r) => r.pattern).join(', ')} 已低於上限，請把 BASELINE 調降以鎖住成果。`,
    );
  }
  if (failed) {
    console.error('\n✗ 有技術債計數超過上限——請修掉，或提出理由並在 PR 說明（不可默默調高上限）。');
  }
  return !failed;
}

function checkBundle() {
  if (!fs.existsSync(DIST_ASSETS)) {
    console.log('\n[bundle 預算] 找不到 dist/assets，先跑 npm run build 再檢查。跳過。');
    return true;
  }
  const mains = fs
    .readdirSync(DIST_ASSETS)
    .filter((f) => /^index-.*\.js$/.test(f))
    .map((f) => ({ file: f, size: fs.statSync(path.join(DIST_ASSETS, f)).size }))
    .sort((a, b) => b.size - a.size);

  if (mains.length === 0) {
    console.log('\n[bundle 預算] dist/assets 沒有 index-*.js。跳過。');
    return true;
  }

  const main = mains[0];
  const pct = ((main.size / BUNDLE_BUDGET_BYTES) * 100).toFixed(1);
  const over = main.size > BUNDLE_BUDGET_BYTES;

  console.log('\n[bundle 預算]\n');
  console.log(`  ${main.file}`);
  console.log(`  實測 ${main.size.toLocaleString()} bytes / 預算 ${BUNDLE_BUDGET_BYTES.toLocaleString()} bytes (${pct}%)`);
  if (over) {
    console.error(`  ✗ 超出 ${(main.size - BUNDLE_BUDGET_BYTES).toLocaleString()} bytes`);
    console.error('  常見原因：新增大型圖示字串、把 React 元素塞進 data/、少用 lazy 載入。');
  } else {
    console.log('  ✓ 在預算內');
  }
  return !over;
}

const argv = process.argv.slice(2);
const wantDebt = argv.length === 0 || argv.includes('--debt');
const wantBundle = argv.length === 0 || argv.includes('--bundle');

let ok = true;
if (wantDebt) ok = checkDebt() && ok;
if (wantBundle) ok = checkBundle() && ok;

if (!ok) {
  process.exitCode = 1;
} else {
  console.log('\n✓ 守門檢查全部通過\n');
}
