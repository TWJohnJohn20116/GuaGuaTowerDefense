// 為什麼要獨立成一支模組：visual-check.mjs 已經負責開瀏覽器、截圖、產總表，
// 基準線比對（保留策略、找上一次 verify 目錄、報告差異）全是無副作用的計算，
// 抽出來才能直接驗，不必為了一個排序問題跑完整條 20 秒的截圖流程。
//
// 副作用邊界（刻意集中，方便審查）：
// - 讀：loadPreviousReport 讀 verify 目錄與 report.json；cleanupRuns 先 readdir/stat 讀目錄資訊。
// - 刪：cleanupRuns 會真的刪掉 verify 下超出保留數的時間戳目錄，不可逆。
// - 寫：ensureDir 建目錄、saveBaselineDataUrl 寫入單一圖檔；其餘函式純計算。
import fs from 'node:fs';
import path from 'node:path';

// verify 目錄名用 - 取代 :（Windows 檔名不允許冒號），所以比對規則寫死在這裡
const RUN_NAME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/;

/** 基準線圖檔的固定位置：以場景 + 尺寸為鍵，一個尺寸一份，避免互相覆蓋 */
export function baselinePath(root, scene, sizeKey, ext) {
  // 只做字串組合，不碰檔案系統；目錄建立交給 ensureDir，讓副作用集中在一處
  return path.join(root, '.shots', 'baseline', `${scene}-${sizeKey}.${ext}`);
}

/** 唯一的建目錄點；回傳原路徑，方便呼叫端一行接續使用 */
export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** 依 mtime 由新到舊保留前 keep 份，其餘列為待清理；不改動輸入陣列 */
export function planRetention(entries, keep) {
  const list = Array.isArray(entries) ? entries.slice() : [];
  // keep <= 0（含非法值）視為「不清理」：基準線是人工審查過的畫面，寧可留著也不要誤刪
  if (!Number.isFinite(keep) || keep <= 0) return { keep: list, prune: [] };
  // 先複製再排序，呼叫端手上的陣列順序不能被我們偷偷改掉
  list.sort((a, b) => (Number(b?.mtimeMs) || 0) - (Number(a?.mtimeMs) || 0));
  return { keep: list.slice(0, keep), prune: list.slice(keep) };
}

/** 從 verify 目錄名找出最新一次執行的時間戳；不合格式的一律忽略，沒有就回 null */
export function findBaselineRun(dirNames) {
  let latest = null;
  for (const name of Array.isArray(dirNames) ? dirNames : []) {
    // 目錄名是 ISO 時間戳，字典序即時間序，不需要真的解析成 Date
    if (typeof name !== 'string' || !RUN_NAME_RE.test(name)) continue;
    if (latest === null || name > latest) latest = name;
  }
  return latest;
}

// 幀的鍵固定用 scene|size：report.json 的 results 是扁平陣列，靠這條鍵才能配對前後兩次
function frameKey(frame) {
  return `${frame.scene}|${frame.size}`;
}

function indexFrames(report) {
  const map = new Map();
  const results = Array.isArray(report?.results) ? report.results : [];
  for (const frame of results) {
    if (!frame || typeof frame.scene !== 'string') continue;
    map.set(frameKey(frame), frame);
  }
  return map;
}

// warnings 是 [{kind,count}]，同類別可能出現多筆，所以按 kind 加總
function warnTotals(frame) {
  const totals = new Map();
  for (const warn of Array.isArray(frame?.warnings) ? frame.warnings : []) {
    const kind = warn?.kind ?? 'unknown';
    totals.set(kind, (totals.get(kind) ?? 0) + (Number(warn?.count) || 0));
  }
  return totals;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

// prev 缺席或為 0 時百分比沒有意義，直接回 0，避免 Infinity 污染報告
function percentOf(prev, curr) {
  if (!(prev > 0)) return 0;
  return round1(((curr - prev) / prev) * 100);
}

/** 比較前後兩份 report.json，回傳失敗變化、警告增量、位元漂移與耗時漂移 */
export function compareReports(prev, curr) {
  const currFrames = indexFrames(curr);
  // prev 為 null 代表第一次建立基準線：只能報「現在有哪些失敗」，沒有可比的歷史
  const prevFrames = indexFrames(prev);
  const keys = [...currFrames.keys()].sort();

  const newFails = [];
  const fixedFails = [];
  const newWarnings = [];
  const byteDrift = [];

  for (const key of keys) {
    const c = currFrames.get(key);
    const p = prevFrames.get(key);
    // pass 嚴格比較 false，缺欄位（undefined）不算失敗，避免誤報
    const currFails = c.pass === false;
    const prevFails = p?.pass === false;

    if (currFails && (p === undefined || p.pass === true)) newFails.push({ scene: c.scene, size: c.size });
    if (prevFails && c.pass === true) fixedFails.push({ scene: c.scene, size: c.size });

    if (p === undefined) continue;

    // 警告只在「同一個幀的同一類別變多」時列出，總量下降不算回歸
    const prevWarn = warnTotals(p);
    const currWarn = warnTotals(c);
    for (const kind of [...currWarn.keys()].sort()) {
      const before = prevWarn.get(kind) ?? 0;
      const after = currWarn.get(kind) ?? 0;
      if (after > before) {
        newWarnings.push({ scene: c.scene, size: c.size, kind, prev: before, curr: after, delta: after - before });
      }
    }

    // 位元變化超過 15% 才值得看；用絕對值，變小（畫面留白）同樣是訊號
    const prevBytes = Number(p.bytes) || 0;
    const currBytes = Number(c.bytes) || 0;
    if (prevBytes > 0 && Math.abs(currBytes - prevBytes) / prevBytes > 0.15) {
      byteDrift.push({ scene: c.scene, size: c.size, prev: prevBytes, curr: currBytes, percent: percentOf(prevBytes, currBytes) });
    }
  }

  const prevTotal = Number(prev?.timing?.totalSeconds) || 0;
  const currTotal = Number(curr?.timing?.totalSeconds) || 0;

  // 第一次建立基準線時，其餘陣列一律留空（沒有歷史就沒有「變化」）
  if (prev === null || prev === undefined) {
    return {
      newFails: [...currFrames.values()].filter((frame) => frame.pass === false).map((frame) => ({ scene: frame.scene, size: frame.size })),
      fixedFails: [],
      newWarnings: [],
      byteDrift: [],
      timingDrift: { prevTotal, currTotal, percent: percentOf(prevTotal, currTotal) },
    };
  }

  return { newFails, fixedFails, newWarnings, byteDrift, timingDrift: { prevTotal, currTotal, percent: percentOf(prevTotal, currTotal) } };
}

/* ------------------------------ 以下四支會碰到檔案系統（讀／刪／寫集中在此） */

/** 讀 verifyRoot 下的時間戳目錄；唯一讀目錄的地方，失敗一律當成空的 */
function listRuns(verifyRoot) {
  try {
    return fs
      .readdirSync(verifyRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && RUN_NAME_RE.test(entry.name))
      .map((entry) => {
        const full = path.join(verifyRoot, entry.name);
        let mtimeMs = 0;
        try {
          mtimeMs = fs.statSync(full).mtimeMs;
        } catch {
          // 目錄在 readdir 與 stat 之間被清掉就當最舊，讓 rmSync(force) 收尾
        }
        return { path: full, mtimeMs };
      });
  } catch {
    // 第一次跑（目錄還沒生）或無權限：當成沒有舊輪次，不要讓驗證流程炸掉
    return [];
  }
}

/** 清掉多餘的驗證輪次；這是全專案唯一會「刪目錄」的函式，不可逆，keep<=0 不刪 */
export function cleanupRuns(verifyRoot, keep) {
  const { keep: kept, prune } = planRetention(listRuns(verifyRoot), keep);
  const removedNames = [];
  for (const entry of prune) {
    const name = path.basename(entry.path);
    try {
      fs.rmSync(entry.path, { recursive: true, force: true });
      removedNames.push(name);
    } catch {
      // 單一目錄刪不掉不該讓整條驗證失敗，留給下次或人工處理
    }
  }
  return { kept: kept.length, removed: removedNames.length, removedNames };
}

/** 讀上一輪 report.json（排除本輪）；沒有上一輪或 JSON 壞掉都回 null，不拋錯 */
export function loadPreviousReport(verifyRoot, currentStamp) {
  const names = listRuns(verifyRoot)
    .map((entry) => path.basename(entry.path))
    .filter((name) => name !== currentStamp);
  const latest = findBaselineRun(names);
  if (latest === null) return null;
  const dir = path.join(verifyRoot, latest);
  try {
    // 報告只是比對用的資料，寫壞了就當沒有歷史，不要卡住整條流程
    return { dir, report: JSON.parse(fs.readFileSync(path.join(dir, 'report.json'), 'utf8')) };
  } catch {
    return null;
  }
}

/** 把 data URL 的 base64 直接落地成基準圖檔；格式不對只回 error，不拋錯 */
export function saveBaselineDataUrl(dir, destPath, dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return { bytes: 0, error: 'dataUrl 不是 data: 開頭' };
  }
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return { bytes: 0, error: 'dataUrl 缺少逗號分隔的 base64 內容' };
  if (!dataUrl.slice(5, comma).includes(';base64')) {
    return { bytes: 0, error: 'dataUrl 不是 base64 編碼' };
  }
  const base64 = dataUrl.slice(comma + 1);
  if (!base64) return { bytes: 0, error: 'dataUrl 的 base64 內容為空' };
  // 這裡是寫檔點：先確保目錄存在（重用 ensureDir），再寫入緩衝區
  ensureDir(dir);
  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(destPath, buffer);
  return { bytes: buffer.length };
}
