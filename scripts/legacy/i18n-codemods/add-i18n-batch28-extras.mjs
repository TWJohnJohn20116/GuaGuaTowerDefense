/** batch28：注入 shop / mutator / achievement / statistics / daily / memorial detail */
import fs from 'fs';
import path from 'path';
import {
  BATCH28_SHOP_ROLE_KEYS, BATCH28_SHOP_TRAIT_KEYS, BATCH28_SHOP_STAT_KEYS,
  BATCH28_MUT_DETAIL_KEYS, BATCH28_OBS_KEYS, BATCH28_STATS_DETAIL_KEYS, BATCH28_DAILY_KEYS,
  formatShopRoleLines, formatShopTraitLines, formatShopStatLines,
  formatMutDetailLines, formatObsLines, formatStatsDetailLines, formatDailyLines, formatMemDetailBlock,
} from './i18n/batch28Extras.mjs';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');

  if (!/\broleBasic:/.test(s)) {
    const block = `${formatShopRoleLines(loc)}\n${formatShopTraitLines(loc)}\n${formatShopStatLines(loc)}`;
    const anchor = /(\s+suggestionNeedCoins: [^,\n]+,)/;
    if (anchor.test(s)) {
      s = s.replace(anchor, `$1\n${block}`);
      console.log('shop data', loc);
    }
  }

  if (!/mutatorChallenge:[\s\S]*detail:/.test(s)) {
    const block = formatMutDetailLines(loc);
    const anchor = /(\s+mutatorChallenge: \{[\s\S]*?\s+toolbar: \{[\s\S]*?\n\s+\},)(\r?\n\s+\},)/;
    if (anchor.test(s)) {
      s = s.replace(anchor, `$1\n    detail: {\n${block}\n    },$2`);
      console.log('mutator detail', loc);
    } else {
      console.warn('no mutator anchor', loc);
    }
  }

  if (!/\bclaimableShort:/.test(s)) {
    const block = formatObsLines(loc);
    const anchor = /(\s+observatory: \{[\s\S]*?\s+emptyHint: [^,\n]+,)/;
    if (anchor.test(s)) {
      s = s.replace(anchor, `$1\n${block}`);
      console.log('observatory', loc);
    }
  }

  if (!/statistics:[\s\S]*detail:/.test(s)) {
    const block = formatStatsDetailLines(loc);
    const anchor = /(\s+statistics: \{)/;
    if (anchor.test(s)) {
      s = s.replace(anchor, `$1\n    detail: {\n${block}\n    },`);
      console.log('statistics detail', loc);
    }
  }

  if (!/\bemptySelectHint1:/.test(s)) {
    const block = formatDailyLines(loc);
    const anchor = /(\s+dailyChallenge: \{)/;
    if (anchor.test(s)) {
      s = s.replace(anchor, `$1\n${block}`);
      console.log('daily empty', loc);
    }
  }

  if (loc !== 'zh-TW' && !/memorial:[\s\S]*detail:/.test(s)) {
    const block = formatMemDetailBlock(loc);
    const anchor = /(\s+filterDefeat: [^,\n]+,)(\r?\n\s+\},)/;
    if (/memorial: \{/.test(s) && anchor.test(s)) {
      s = s.replace(anchor, `$1\n${block}$2`);
      console.log('memorial detail', loc);
    }
  }

  fs.writeFileSync(file, s, 'utf8');
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');

function injectTypes(block, anchorRe) {
  if (!block.split('\n').some((l) => l.trim() && ix.includes(l.trim().replace(';', '')))) {
    ix = ix.replace(anchorRe, (m, a1) => `${a1}\n${block}`);
    return true;
  }
  return false;
}

const shopTypes = [...BATCH28_SHOP_ROLE_KEYS, ...BATCH28_SHOP_TRAIT_KEYS, ...BATCH28_SHOP_STAT_KEYS]
  .map((k) => `    ${k}: string;`).join('\n');
if (injectTypes(shopTypes, /(\s+suggestionNeedCoins: string;)/)) console.log('index shop');

const mutTypes = BATCH28_MUT_DETAIL_KEYS.map((k) => `      ${k}: string;`).join('\n');
if (!/mutatorChallenge:[\s\S]*detail:/.test(ix)) {
  ix = ix.replace(/(\s+toolbar: \{[\s\S]*?\n\s+\};\n\s+\};[\s\S]*?\/\/ 紀念碑)/m, (m) =>
    m.replace(/(\s+toolbar: \{[\s\S]*?\n\s+\};)/, `$1\n    detail: {\n${mutTypes}\n    };`));
  console.log('index mutator');
}

const obsTypes = BATCH28_OBS_KEYS.map((k) => `      ${k}: string;`).join('\n');
if (injectTypes(obsTypes, /(\s+emptyHint: string;)/)) console.log('index obs');

const statsTypes = BATCH28_STATS_DETAIL_KEYS.map((k) => `      ${k}: string;`).join('\n');
if (!/statistics:[\s\S]*detail:/.test(ix)) {
  ix = ix.replace(/(\s+statistics: \{)/, `$1\n    detail: {\n${statsTypes}\n    };`);
  console.log('index stats');
}

const dailyTypes = BATCH28_DAILY_KEYS.map((k) => `    ${k}: string;`).join('\n');
if (injectTypes(dailyTypes, /(\s+dailyChallenge: \{)/)) console.log('index daily');

fs.writeFileSync(idx, ix, 'utf8');
console.log('Done batch28 extras');
