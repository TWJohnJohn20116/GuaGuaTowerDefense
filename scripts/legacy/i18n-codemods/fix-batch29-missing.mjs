/** 補注入 batch29 skins.detail + mutatorChallenge 完整（避免跨區塊誤判） */
import fs from 'fs';
import path from 'path';
import {
  formatSkinDetailBlock,
  formatMutToolbarBlock,
  formatMutTopLines,
  formatMutDetailBlock,
} from './i18n/batch29Extras.mjs';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt', 'zh-CN'];

function extractBlock(src, key) {
  const start = src.indexOf(`  ${key}: {`);
  if (start < 0) return null;
  let depth = 0;
  let i = start + key.length + 3;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    if (src[i] === '}') {
      depth--;
      if (depth === 0) {
        return { start, end: i + 1, text: src.slice(start, i + 1) };
      }
    }
  }
  return null;
}

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');

  const skins = extractBlock(s, 'skins');
  if (skins && !/\bdetail: \{/.test(skins.text)) {
    const detail = formatSkinDetailBlock(loc);
    const insertAt = skins.end - 1;
    s = s.slice(0, insertAt) + `\n${detail}\n` + s.slice(insertAt);
    console.log('skins detail', loc);
  }

  const mut = extractBlock(s, 'mutatorChallenge');
  if (mut) {
    let block = mut.text;
    let changed = false;
    if (!/\btoolbar: \{/.test(block)) {
      const top = formatMutTopLines(loc);
      const toolbar = formatMutToolbarBlock(loc);
      const detail = formatMutDetailBlock(loc);
      block = block.replace(/(\bbestScore: [^,\n]+,)/, `$1\n${top}\n${toolbar}\n${detail}`);
      changed = true;
    } else if (!/\bdetail: \{/.test(block)) {
      const detail = formatMutDetailBlock(loc);
      block = block.replace(/(\btoolbar: \{[\s\S]*?\n\s+\},)/, `$1\n${detail}`);
      changed = true;
    }
    if (changed) {
      s = s.slice(0, mut.start) + block + s.slice(mut.end);
      console.log('mutator full', loc);
    }
  }

  fs.writeFileSync(file, s, 'utf8');
}

console.log('Done batch29 patch');
