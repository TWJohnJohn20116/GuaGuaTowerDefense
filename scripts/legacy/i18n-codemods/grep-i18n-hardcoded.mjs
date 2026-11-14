/** 掃描 src 中含中文的 .tsx/.ts 檔案（排除 locales、註解行） */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src');
const SKIP = /[/\\]i18n[/\\]locales[/\\]/;
const ZH = /[\u4e00-\u9fff]/;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (SKIP.test(p)) continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(p);
  }
  return out;
}

const hits = [];
for (const file of walk(ROOT)) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let codeLines = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!ZH.test(line)) continue;
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;
    if (/description:\s*['"]/.test(line) && file.includes('encyclopedia')) continue;
    codeLines++;
  }
  if (codeLines > 0) hits.push({ file: path.relative(ROOT, file), codeLines });
}

hits.sort((a, b) => b.codeLines - a.codeLines);
console.log('=== i18n grep sweep (non-comment Chinese lines) ===');
console.log('Total files:', hits.length);
for (const h of hits.slice(0, 25)) {
  console.log(`${h.codeLines.toString().padStart(4)}  ${h.file}`);
}
