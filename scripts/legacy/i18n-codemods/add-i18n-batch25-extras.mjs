/** batch25：注入 mod-manager detail + modEditorExt key */
import fs from 'fs';
import path from 'path';
import {
  BATCH25_MM_DETAIL_KEYS,
  BATCH25_MOD_KEYS,
  formatBatch25MmDetailLines,
  formatBatch25ModLines,
} from './i18n/batch25Extras.mjs';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');

  if (!/\bsectionAddTowers:/.test(s)) {
    const mmLines = formatBatch25MmDetailLines(loc);
    const mmAnchor = /(\s+confirmRemovePrompt: [^,\n]+,)(\r?\n\s+\},)/;
    if (mmAnchor.test(s)) {
      s = s.replace(mmAnchor, (_m, head, tail) => `${head}\n${mmLines}\n${tail}`);
      console.log('batch25 mm-detail', loc);
    } else {
      console.warn('no mm anchor', loc);
    }
  } else {
    console.log('skip mm-detail', loc);
  }

  if (!/\bmodImportReplace:/.test(s)) {
    const modLines = formatBatch25ModLines(loc);
    const modAnchor = /\biconEmojiLibrary:/.test(s)
      ? /(\s+iconEmojiLibrary: [^,\n]+,)(\r?\n\s+\},)/
      : /(\s+jsonPasteHint: [^,\n]+,)(\r?\n\s+\},)/;
    if (modAnchor.test(s)) {
      s = s.replace(modAnchor, (_m, head, tail) => `${head}\n${modLines}\n${tail}`);
      console.log('batch25 modEditor', loc);
    } else {
      console.warn('no mod anchor', loc);
    }
  } else {
    console.log('skip modEditor', loc);
  }

  fs.writeFileSync(file, s, 'utf8');
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');

if (!/\bsectionAddTowers:/.test(ix)) {
  const mmTypes = BATCH25_MM_DETAIL_KEYS.map((k) => `      ${k}: string;`).join('\n');
  ix = ix.replace(/(\s+confirmRemovePrompt: string;)/, `$1\n${mmTypes}`);
  console.log('index mm-detail types');
}

if (!/\bmodImportReplace:/.test(ix)) {
  const modTypes = BATCH25_MOD_KEYS.map((k) => `    ${k}: string;`).join('\n');
  const modAnchor = /\biconEmojiLibrary: string;/.test(ix)
    ? /(\s+iconEmojiLibrary: string;)/
    : /(\s+jsonPasteHint: string;)/;
  ix = ix.replace(modAnchor, `$1\n${modTypes}`);
  console.log('index modEditor types');
}

fs.writeFileSync(idx, ix, 'utf8');
console.log('Done batch25 extras');
