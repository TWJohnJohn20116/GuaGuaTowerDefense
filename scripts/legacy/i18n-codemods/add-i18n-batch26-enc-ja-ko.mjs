/** batch26：覆寫 encyclopedia.enemyGuides ja/ko */
import fs from 'fs';
import path from 'path';
import { ENEMY_IDS, formatEnemyGuidesBlock } from './i18n/batch19EncEnemyGuides.mjs';
import { JA_POLISH, KO_POLISH } from './i18n/batch26EncJaKoPolish.mjs';

function line(id, d) {
  const tips = d.tips.map((t) => JSON.stringify(t)).join(', ');
  const cr = Object.entries(d.counterReasons).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ');
  return `      ${id}: { abilityDesc: ${JSON.stringify(d.abilityDesc)}, tips: [${tips}], weakness: ${JSON.stringify(d.weakness)}, spawnWave: ${JSON.stringify(d.spawnWave)}, counterReasons: { ${cr} } },`;
}

function formatBlock(data) {
  return ENEMY_IDS.map((id) => line(id, data[id])).join('\n');
}

const MAP = { ja: JA_POLISH, ko: KO_POLISH };
const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['ja', 'ko']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  const block = formatBlock(MAP[loc]);
  const re = /(\s+enemyGuides: \{)[\s\S]*?(\r?\n\s+\},\r?\n\s+modContent:)/;
  if (!re.test(s)) {
    console.warn('no anchor', loc);
    continue;
  }
  s = s.replace(re, (_m, head, tail) => `${head}\n${block}\n${tail}`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('enemyGuides polish', loc);
}

console.log('Done batch26 ja/ko guides');
