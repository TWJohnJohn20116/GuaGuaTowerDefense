/** batch21：覆寫 ja/ko encyclopedia.enemyGuides */
import fs from 'fs';
import path from 'path';
import { ENEMY_IDS, formatEnemyGuidesBlock } from './i18n/batch19EncEnemyGuides.mjs';
import { JA, KO } from './i18n/batch21EncJaKo.mjs';

function line(id, d) {
  const tips = d.tips.map((t) => JSON.stringify(t)).join(', ');
  const cr = Object.entries(d.counterReasons).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ');
  return `      ${id}: { abilityDesc: ${JSON.stringify(d.abilityDesc)}, tips: [${tips}], weakness: ${JSON.stringify(d.weakness)}, spawnWave: ${JSON.stringify(d.spawnWave)}, counterReasons: { ${cr} } },`;
}

function formatJaKoBlock(loc) {
  const data = loc === 'ja' ? JA : KO;
  return ENEMY_IDS.map((id) => line(id, data[id])).join('\n');
}

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['ja', 'ko']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  const block = formatJaKoBlock(loc);
  const re = /(\s+enemyGuides: \{)[\s\S]*?(\r?\n\s+\},\r?\n\s+modContent:)/;
  if (!re.test(s)) {
    console.warn('no anchor', loc);
    continue;
  }
  s = s.replace(re, (_m, head, tail) => `${head}\n${block}\n${tail}`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('enemyGuides', loc);
}

console.log('Done enc ja/ko');
