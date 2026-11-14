/** 補 dev.ui 缺少的 key 到各 locale */
import fs from 'fs';
import path from 'path';
import { getDevUi } from './i18n/batch12DevUiBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');
const EXTRA_KEYS = ['sceneCloseTest', 'overlayHint', 'spawnEnemyBatch', 'killAllEnemies', 'speedMultiplierHint', 'fpsTargetHint', 'statusLabel', 'aiBattleEnabled', 'aiBattleDisabled', 'strategyLabel', 'upgradeAllOne', 'upgradeAllMax', 'clearAllTowers', 'unlockAllFeedback', 'storageCleared', 'infoLiveHint'];

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('aiBattleEnabled:')) {
    console.log('skip', loc);
    continue;
  }
  const ui = getDevUi(loc);
  const lines = EXTRA_KEYS.map((k) => `    ${k}: ${JSON.stringify(ui[k])},`).join('\n');
  s = s.replace(/(\s+timerIdle: [^,\n]+,)(\r?\n\s+\},)/, `$1\n${lines}$2`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('dev.ui extra', loc);
}

console.log('Done dev.ui extra keys');
