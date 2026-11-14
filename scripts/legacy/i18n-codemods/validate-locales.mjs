import esbuild from 'esbuild';
import fs from 'fs';

for (const loc of ['zh-TW', 'en', 'pt', 'fr']) {
  try {
    const source = fs.readFileSync(`src/i18n/locales/${loc}.ts`, 'utf8');
    esbuild.transformSync({ loader: 'ts', source, sourcefile: `${loc}.ts` });
    console.log(loc, 'OK');
  } catch (e) {
    console.log(loc, 'FAIL', e.message.split('\n').slice(0, 3).join(' | '));
  }
}
