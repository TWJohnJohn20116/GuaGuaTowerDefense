/** 補注入 batch28 mutator.detail + statistics.detail */
import fs from 'fs';
import path from 'path';
import { formatMutDetailLines, formatStatsDetailLines } from './i18n/batch28Extras.mjs';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');

  if (!/mutatorChallenge:[\s\S]*?\bdetail: \{/.test(s)) {
    const block = formatMutDetailLines(loc);
    const anchor = /(\s+mutatorChallenge: \{[\s\S]*?\s+toolbar: \{[\s\S]*?\n\s+\},)(\r?\n\s+\},)/;
    if (anchor.test(s)) {
      s = s.replace(anchor, `$1\n    detail: {\n${block}\n    },$2`);
      console.log('mutator detail', loc);
    }
  }

  if (!/statistics:[\s\S]*?\bdetail: \{/.test(s)) {
    const block = formatStatsDetailLines(loc);
    s = s.replace(/(\s+statistics: \{)/, `$1\n    detail: {\n${block}\n    },`);
    console.log('statistics detail', loc);
  }

  fs.writeFileSync(file, s, 'utf8');
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');

if (!/mutatorChallenge:[\s\S]*detail:/.test(ix)) {
  const mutTypes = [
    'selectHintLine1', 'selectHintLine2', 'mapLabel', 'difficultyLabel', 'rulesLabel', 'rewardLabel',
    'endlessSuffix', 'wavesSuffix', 'diffEasy', 'diffNormal', 'diffHard', 'diffNightmare', 'diffImpossible', 'diffCustom',
  ].map((k) => `      ${k}: string;`).join('\n');
  ix = ix.replace(
    /(\s+toolbar: \{[\s\S]*?tierExtreme: string;\n\s+\};)/,
    `$1\n    detail: {\n${mutTypes}\n    };`,
  );
  console.log('index mutator detail');
}

if (!/statistics:[\s\S]*detail:/.test(ix)) {
  ix = ix.replace(
    /(\s+statistics: \{)/,
    `$1\n    detail: {\n      selectHintLine1: string;\n      selectHintLine2: string;\n    };`,
  );
  console.log('index statistics detail');
}

const shopRoleTypes = [
  'roleBasic', 'roleSniper', 'roleCannon', 'roleBallista', 'roleMachine', 'roleShotgun',
  'roleFrost', 'rolePoison', 'roleLaser', 'roleLightning', 'roleFlame', 'roleMoney', 'roleWind', 'rolePulse',
  'traitInstantHit', 'traitSplash', 'traitSlow', 'traitPoison', 'traitLaser', 'traitLightning',
  'traitFlame', 'traitMoney', 'traitWind', 'traitPulse', 'traitCrit',
  'statDamage', 'statRange', 'statFireRate', 'statCooldown', 'statDuration', 'statHotkey', 'statInstant',
].map((k) => `    ${k}: string;`).join('\n');

if (!/\broleBasic: string;/.test(ix)) {
  ix = ix.replace(/(\s+suggestionNeedCoins: string;)/, `$1\n${shopRoleTypes}`);
  console.log('index shop roles');
}

if (!/\bclaimableShort: string;/.test(ix)) {
  ix = ix.replace(/(\s+emptyHint: string;)/, `$1\n      claimableShort: string;\n      rewardPointsUnit: string;\n      keyboardHint: string;`);
  console.log('index obs');
}

if (!/\bemptySelectHint1: string;/.test(ix)) {
  ix = ix.replace(/(\s+dailyChallenge: \{)/, `$1\n    emptySelectHint1: string;\n    emptySelectHint2: string;`);
  console.log('index daily');
}

fs.writeFileSync(idx, ix, 'utf8');
console.log('Done batch28 patch');
