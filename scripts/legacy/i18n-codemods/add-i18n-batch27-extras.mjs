/** batch27：注入 shop / memorial / pathSelectionExt / modManager.batch */
import fs from 'fs';
import path from 'path';
import {
  BATCH27_SHOP_KEYS,
  BATCH27_MEM_DETAIL_KEYS,
  BATCH27_PATH_KEYS,
  BATCH27_MM_BATCH_KEYS,
  formatBatch27ShopLines,
  formatBatch27MemDetailLines,
  formatBatch27PathLines,
  formatBatch27MmBatchLines,
  formatModManagerBlockLocalized,
  LOCALIZED_MM,
} from './i18n/batch27Extras.mjs';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');

  if (!/\bdetailSelectHint1:/.test(s)) {
    const lines = formatBatch27ShopLines(loc);
    const anchor = /(\s+successUnlocked: [^,\n]+,)(\r?\n\s+toolbar: \{)/;
    if (anchor.test(s) && /\bshop: \{/.test(s)) {
      s = s.replace(anchor, `$1\n${lines}$2`);
      console.log('shop', loc);
    } else {
      console.warn('no shop anchor', loc);
    }
  }

  if (!/memorial:[\s\S]*detail:[\s\S]*selectHintLine1:/.test(s)) {
    const lines = formatBatch27MemDetailLines(loc);
    const anchor = /(memorial: \{[\s\S]*?\s+detail: \{)(\r?\n\s+backToList:)/;
    if (anchor.test(s)) {
      s = s.replace(anchor, `$1\n${lines}$2`);
      console.log('memorial detail', loc);
    } else {
      console.warn('no memorial anchor', loc);
    }
  }

  if (!/\bcampaignProgressTitle:/.test(s)) {
    const lines = formatBatch27PathLines(loc);
    const anchor = /(\s+pathSelectionExt: \{)/;
    if (anchor.test(s)) {
      s = s.replace(anchor, `$1\n${lines}`);
      console.log('path', loc);
    } else {
      console.warn('no path anchor', loc);
    }
  }

  if (LOCALIZED_MM[loc]) {
    const block = formatModManagerBlockLocalized(loc, LOCALIZED_MM[loc]);
    const re = /\n  modManager: \{[\s\S]*?\n  \},/;
    if (re.test(s)) {
      s = s.replace(re, `\n${block}`);
      console.log('modManager localize', loc);
    }
  } else if (!/\bbatch: \{/.test(s) || !/modManager:[\s\S]*batch:/.test(s)) {
    const lines = formatBatch27MmBatchLines(loc);
    const anchor = /(\s+grid: \{[\s\S]*?\n\s+\},)(\r?\n\s+detail: \{)/;
    if (anchor.test(s)) {
      s = s.replace(anchor, `$1\n    batch: {\n${lines}\n    },$2`);
      console.log('modManager batch', loc);
    } else {
      console.warn('no mm batch anchor', loc);
    }
  }

  fs.writeFileSync(file, s, 'utf8');
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');

if (!/\bdetailSelectHint1:/.test(ix)) {
  const shopTypes = BATCH27_SHOP_KEYS.map((k) => `    ${k}: string;`).join('\n');
  ix = ix.replace(/(\s+shop: \{)/, `$1\n${shopTypes}`);
  console.log('index shop');
}

if (!/\bselectHintLine1: string;[\s\S]*memorial/.test(ix)) {
  const memTypes = BATCH27_MEM_DETAIL_KEYS.map((k) => `      ${k}: string;`).join('\n');
  ix = ix.replace(/(memorial:[\s\S]*?detail: \{[\s\S]*?)(\s+backToList: string;)/, `$1\n${memTypes}\n$2`);
  console.log('index memorial');
}

if (!/\bcampaignProgressTitle:/.test(ix)) {
  const pathTypes = BATCH27_PATH_KEYS.map((k) => `    ${k}: string;`).join('\n');
  ix = ix.replace(/(\s+pathSelectionExt: \{)/, `$1\n${pathTypes}`);
  console.log('index path');
}

fs.writeFileSync(idx, ix, 'utf8');
console.log('Done batch27 extras');
