/**
 * 掃描 src 目錄並產生檔案清單 manifest（含行數、import 引用）
 * 執行：node scripts/generate-src-file-manifest.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const OUT_DIR = path.join(ROOT, 'src/components/scenes/encyclopedia');
const MANIFEST_OUT = path.join(OUT_DIR, 'srcFileManifest.json');
const MAP_SOURCES_OUT = path.join(OUT_DIR, 'encyclopediaMapSources.json');

const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function countLines(absPath, content) {
  if (!content) return 0;
  return content.split(/\r?\n/).length;
}

function resolveToSrcPath(spec, fromRelPath) {
  if (!spec.startsWith('@/') && !spec.startsWith('.')) return null;

  let baseAbs;
  if (spec.startsWith('@/')) {
    baseAbs = path.join(SRC_DIR, spec.slice(2));
  } else {
    const fromAbs = path.join(ROOT, fromRelPath);
    baseAbs = path.resolve(path.dirname(fromAbs), spec);
  }

  if (!baseAbs.startsWith(SRC_DIR)) return null;

  const candidates = [];
  if (path.extname(baseAbs)) {
    candidates.push(baseAbs);
  } else {
    for (const ext of CODE_EXTENSIONS) candidates.push(baseAbs + ext);
    for (const ext of CODE_EXTENSIONS) candidates.push(path.join(baseAbs, `index${ext}`));
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return `src/${path.relative(SRC_DIR, candidate).replace(/\\/g, '/')}`;
    }
  }
  return null;
}

function parseImports(content, fromRelPath) {
  const specs = new Set();
  const patterns = [
    /\bfrom\s+['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bimport\s+['"]([^'"]+)['"]/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      specs.add(match[1]);
    }
  }

  const imports = new Set();
  for (const spec of specs) {
    const resolved = resolveToSrcPath(spec, fromRelPath);
    if (resolved && resolved !== fromRelPath) imports.add(resolved);
  }
  return [...imports].sort((a, b) => a.localeCompare(b, 'en'));
}

function walk(dir, base = 'src') {
  const entries = [];
  for (const name of fs.readdirSync(dir)) {
    // 編輯工具會在目錄裡留下 .XXX.tmpdir 暫存夾，裡面的檔案常被鎖住，直接跳過
    if (name.startsWith('.') || name.endsWith('.tmpdir') || name.endsWith('.tmp')) continue;
    const full = path.join(dir, name);
    const rel = `${base}/${name}`.replace(/\\/g, '/');
    let stat;
    try {
      stat = fs.statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      entries.push(...walk(full, rel));
    } else {
      let content;
      try {
        content = fs.readFileSync(full, 'utf8');
      } catch {
        continue;
      }
      const imports = /\.(tsx?|jsx?)$/.test(name) ? parseImports(content, rel) : [];
      entries.push({ path: rel, lines: countLines(full, content), imports });
    }
  }
  return entries;
}

function buildMapSources() {
  const mapSources = {};
  const dir = path.join(SRC_DIR, 'data/gameData/paths');
  if (!fs.existsSync(dir)) return mapSources;

  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.ts')) continue;
    const rel = `src/data/gameData/paths/${name}`;
    const content = fs.readFileSync(path.join(dir, name), 'utf8');
    const re = /^\s{2}(\w+):\s*\{/gm;
    let match;
    while ((match = re.exec(content)) !== null) {
      mapSources[match[1]] = rel;
    }
  }

  return mapSources;
}

const files = walk(SRC_DIR).sort((a, b) => a.path.localeCompare(b.path, 'en'));
const mapSources = buildMapSources();

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(MANIFEST_OUT, JSON.stringify(files));
fs.writeFileSync(MAP_SOURCES_OUT, JSON.stringify(mapSources, null, 0));

const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
const totalImports = files.reduce((sum, f) => sum + f.imports.length, 0);
console.log(
  `[src-manifest] ${files.length} files, ${totalLines} lines, ${totalImports} import edges, ${Object.keys(mapSources).length} map sources`,
);
