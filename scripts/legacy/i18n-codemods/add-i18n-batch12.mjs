/**
 * batch12：dev.ui + modEditorExt 預設 key 注入各 locale
 */
import fs from 'fs';
import path from 'path';
import { getDevUi, formatDevUiBlock } from './i18n/batch12DevUiBundle.mjs';
import { getModDefaults, formatModDefaultsBlock } from './i18n/batch12ModDefaultsBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (!s.includes('\n    ui: {\n      current:')) {
    const devUi = formatDevUiBlock(getDevUi(loc));
    const replaced = s.replace(
      /(secTowerDistribution: [^,\n]+,)(\r?\n\s+\},)/,
      `$1\n    ui: {\n${devUi}\n    },$2`,
    );
    if (replaced !== s) {
      s = replaced;
      changed = true;
      console.log('dev.ui', loc);
    } else {
      console.log('skip dev.ui (pattern miss)', loc);
    }
  }

  if (!s.includes('defaultModName:')) {
    const modBlock = formatModDefaultsBlock(getModDefaults(loc));
    let replaced = s.replace(
      /(\s+dpsCompare: [^,\n]+,)(\r?\n\s+\},)/,
      `$1\n${modBlock}$2`,
    );
    if (replaced === s) {
      replaced = s.replace(
        /(modEditorExt: \{[\s\S]*?)(  \},\r?\n\r?\n  modifiers:)/,
        `$1${modBlock}\n$2`,
      );
    }
    if (replaced !== s) {
      s = replaced;
      changed = true;
      console.log('modEditorExt defaults', loc);
    }
  }

  if (changed) fs.writeFileSync(file, s, 'utf8');
}

console.log('Done batch12 locale injection');
