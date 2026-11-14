/**
 * i18n 對齊檢查（TypeScript AST 版）
 *
 * 型別層面：Translations 由 locales/zh-TW.ts 推導，所以「程式讀了不存在的鍵」由 tsc 直接把關。
 * 這支腳本補上執行時層面：**每個語言檔不得出現 zh-TW 沒有的鍵**（打錯字 / 被砍掉的殘留），
 * 並輸出各語言相對 zh-TW 的覆蓋率（缺的鍵執行時會回退成繁中）。
 *
 * 用法：
 *   node scripts/i18n-parity.mjs           # 人類可讀報告
 *   node scripts/i18n-parity.mjs --json    # 給 CI / 工具吃
 *   node scripts/i18n-parity.mjs --strict  # 有任何孤兒鍵就 exit 1
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LOCALES_DIR = path.join(ROOT, 'src/i18n/locales');

const BASE_LOCALE = 'zh-TW';
const LOCALE_EXPORTS = {
  'zh-TW': { file: 'zh-TW.ts', exportName: 'zhTW' },
  'zh-CN': { file: 'zh-CN.ts', exportName: 'zhCN' },
  en: { file: 'en.ts', exportName: 'en' },
  ja: { file: 'ja.ts', exportName: 'ja' },
  ko: { file: 'ko.ts', exportName: 'ko' },
  fr: { file: 'fr.ts', exportName: 'fr' },
  de: { file: 'de.ts', exportName: 'de' },
  es: { file: 'es.ts', exportName: 'es' },
  ru: { file: 'ru.ts', exportName: 'ru' },
  pt: { file: 'pt.ts', exportName: 'pt' },
};

const parse = (file) =>
  ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

const propName = (name) => {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
};

const unwrap = (node) => {
  let n = node;
  while (
    n &&
    (ts.isAsExpression(n) ||
      (ts.isSatisfiesExpression && ts.isSatisfiesExpression(n)) ||
      ts.isParenthesizedExpression(n) ||
      (ts.isTypeAssertionExpression && ts.isTypeAssertionExpression(n)))
  ) {
    n = n.expression;
  }
  return n;
};

/** 從 locale 物件的 ObjectLiteral 收集點分鍵路徑 */
const collectKeys = (sourceFile, exportName) => {
  const paths = new Set();
  let initializer = null;
  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const decl of node.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.name.text === exportName && decl.initializer) {
        initializer = unwrap(decl.initializer);
      }
    }
  });
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
    throw new Error(`object literal export ${exportName} not found`);
  }

  const walk = (obj, prefix) => {
    for (const prop of obj.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const name = propName(prop.name);
      if (!name) continue;
      const childPath = prefix ? `${prefix}.${name}` : name;
      const value = unwrap(prop.initializer);
      if (value && ts.isObjectLiteralExpression(value)) walk(value, childPath);
      else paths.add(childPath);
    }
  };

  walk(initializer, '');
  return paths;
};

const loadLocale = (name) => {
  const { file, exportName } = LOCALE_EXPORTS[name];
  return collectKeys(parse(path.join(LOCALES_DIR, file)), exportName);
};

const main = () => {
  const base = loadLocale(BASE_LOCALE);

  const locales = {};
  for (const name of Object.keys(LOCALE_EXPORTS)) {
    if (name === BASE_LOCALE) continue;
    const keys = loadLocale(name);
    const orphans = [...keys].filter((k) => !base.has(k)).sort();
    locales[name] = {
      keys: keys.size,
      coverage: base.size ? Number((((keys.size - orphans.length) / base.size) * 100).toFixed(1)) : 0,
      orphans,
    };
  }

  const report = { base: base.size, locales };

  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    console.log(`[i18n] ${BASE_LOCALE} 基準 ${base.size} 鍵（型別由此推導，缺鍵由 tsc 把關）\n`);
    console.log('各語言鍵數 / 覆蓋率（缺的鍵執行時回退繁中）:');
    for (const [name, info] of Object.entries(locales)) {
      console.log(
        `    ${name.padEnd(6)} ${String(info.keys).padStart(5)} 鍵  ${String(info.coverage).padStart(5)}%` +
          (info.orphans.length ? `  orphan=${info.orphans.length}` : ''),
      );
    }
    const orphaned = Object.entries(locales).filter(([, i]) => i.orphans.length);
    if (orphaned.length) {
      console.log(`\n✗ 語言檔含 ${BASE_LOCALE} 不存在的鍵（打錯字或被砍掉的殘留）:`);
      for (const [name, info] of orphaned) {
        console.log(`  ${name}:`);
        for (const k of info.orphans) console.log(`    ${k}`);
      }
    } else {
      console.log('\n✓ 沒有孤兒鍵');
    }
  }

  if (process.argv.includes('--strict') && Object.values(locales).some((i) => i.orphans.length)) {
    process.exit(1);
  }
};

main();
