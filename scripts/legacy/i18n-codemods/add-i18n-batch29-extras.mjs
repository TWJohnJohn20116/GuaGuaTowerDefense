/** batch29：注入 statistics.fieldLabels / skins.detail / mutatorChallenge 完整 / lpUndeployHint */
import fs from 'fs';
import path from 'path';
import {
  BATCH29_STATS_FIELD_KEYS,
  BATCH29_SKIN_DETAIL_KEYS,
  formatStatsFieldLines,
  formatSkinDetailBlock,
  formatMutToolbarBlock,
  formatMutTopLines,
  formatMutDetailBlock,
  getLpUndeployHint,
} from './i18n/batch29Extras.mjs';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');

  if (!/statistics:[\s\S]*fieldLabels:/.test(s) && /statistics: \{/.test(s)) {
    const block = formatStatsFieldLines(loc);
    s = s.replace(/(\s+statistics: \{)/, `$1\n    fieldLabels: {\n${block}\n    },`);
    console.log('statistics fieldLabels', loc);
  }

  if (!/skins:[\s\S]*\bdetail: \{/.test(s) && /\bskins: \{/.test(s)) {
    const block = formatSkinDetailBlock(loc);
    const anchor = /(\s+toolbar: \{[\s\S]*?\n\s+\},\n)(\s+\},)/;
    if (/\bskins: \{/.test(s) && anchor.test(s)) {
      s = s.replace(anchor, `$1${block}\n$2`);
      console.log('skins detail', loc);
    } else {
      s = s.replace(/(\s+noSkins: [^,\n]+,)/, `$1\n${block}`);
      console.log('skins detail fallback', loc);
    }
  }

  if (/mutatorChallenge: \{/.test(s) && !/mutatorChallenge:[\s\S]*\btoolbar: \{/.test(s)) {
    const top = formatMutTopLines(loc);
    const toolbar = formatMutToolbarBlock(loc);
    const detail = formatMutDetailBlock(loc);
    s = s.replace(
      /(\s+mutatorChallenge: \{[\s\S]*?\bbestScore: [^,\n]+,)/,
      `$1\n${top}\n${toolbar}\n${detail}`,
    );
    console.log('mutator full', loc);
  } else if (/mutatorChallenge: \{/.test(s) && !/mutatorChallenge:[\s\S]*\bdetail: \{/.test(s)) {
    const top = formatMutTopLines(loc);
    const detail = formatMutDetailBlock(loc);
    s = s.replace(/(\s+mutatorChallenge: \{[\s\S]*?\bbestScore: [^,\n]+,)/, `$1\n${top}`);
    if (/mutatorChallenge:[\s\S]*\btoolbar: \{/.test(s)) {
      s = s.replace(/(\s+toolbar: \{[\s\S]*?\n\s+\},)(?=\s+\},)/, `$1\n${detail}`);
    }
    console.log('mutator detail patch', loc);
  }

  if (!/\blpUndeployHint:/.test(s) && /\bmodEditorExt: \{/.test(s)) {
    const hint = getLpUndeployHint(loc);
    s = s.replace(/(\s+lpDeployHint: [^,\n]+,)/, `$1\n    lpUndeployHint: ${JSON.stringify(hint)},`);
    console.log('lpUndeployHint', loc);
  }

  fs.writeFileSync(file, s, 'utf8');
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');

const fieldTypes = BATCH29_STATS_FIELD_KEYS.map((k) => `      ${k}: string;`).join('\n');
if (!/fieldLabels:/.test(ix)) {
  ix = ix.replace(/(\s+statistics: \{)/, `$1\n    fieldLabels: {\n${fieldTypes}\n    };`);
  console.log('index statistics fieldLabels');
}

const skinTypes = BATCH29_SKIN_DETAIL_KEYS.map((k) => `      ${k}: string;`).join('\n');
if (!/skins:[\s\S]*detail:/.test(ix)) {
  ix = ix.replace(/(\s+skins: \{)/, `$1\n    detail: {\n${skinTypes}\n    };`);
  console.log('index skins detail');
}

if (!/\bcompletionRate: string;/.test(ix)) {
  ix = ix.replace(/(\s+bestScore: string;\n)(\s+\};)/, `$1    completionRate: string;\n    emptyTier: string;\n$2`);
  console.log('index mutator top');
}

fs.writeFileSync(idx, ix, 'utf8');
console.log('Done batch29 extras');
