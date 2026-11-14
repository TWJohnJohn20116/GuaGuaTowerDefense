/** 掃描 src 內 JSX/字串中的中文硬編碼（排除註解與 locale） */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src');
const SKIP = /locales|\.test\.|\.spec\./;
const CN = /[\u4e00-\u9fff]/;

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts|jsx|js)$/.test(ent.name) && !SKIP.test(p)) out.push(p);
  }
  return out;
}

const hits = [];
for (const file of walk(ROOT)) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let inBlockComment = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (inBlockComment) {
      if (line.includes('*/')) inBlockComment = false;
      continue;
    }
    if (line.trim().startsWith('//')) continue;
    if (line.includes('/*')) {
      if (!line.includes('*/')) inBlockComment = true;
      continue;
    }
    const stripped = line.replace(/\/\/.*$/, '');
    if (!CN.test(stripped)) continue;
    if (/import\s|from\s|\/\*|console\.|@deprecated/.test(stripped)) continue;
    hits.push({ file: path.relative(ROOT, file), line: i + 1, text: stripped.trim().slice(0, 120) });
  }
}

console.log(`Found ${hits.length} lines with Chinese (excl. comments)`);
for (const h of hits.slice(0, 80)) {
  console.log(`${h.file}:${h.line}  ${h.text}`);
}
if (hits.length > 80) console.log(`... and ${hits.length - 80} more`);
