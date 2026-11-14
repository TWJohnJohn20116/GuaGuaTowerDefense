/**
 * 檔案/圖示詳情 + 檔案列表 UI + de/es/ru/pt batch4 翻譯（batch7）
 */
import fs from 'fs';
import path from 'path';

const ENC_ZH = {
  fileDetailSelectHintLine1: '點選左側檔案卡',
  fileDetailSelectHintLine2: '查看路徑與用途',
  fileDetailOverLimitTitle: '超過行數上限',
  fileDetailOverLimitSuggest: '建議分割為多檔案（上限 {max} 行）。',
  fileDetailFolder: '資料夾',
  fileDetailCategory: '分類',
  fileDetailDescription: '說明',
  fileDetailFormat: '格式',
  fileDetailLineCount: '行數',
  fileDetailExtension: '副檔名',
  fileDetailImports: '引用',
  fileDetailImportedBy: '被引用',
  fileDetailImportsEmpty: '此檔案未引用其他 src 檔案',
  fileDetailImportedByEmpty: '目前沒有其他檔案引用此檔',
  fileDetailGoToTab: '前往圖鑑「{tab}」',
  iconDetailSelectHintLine1: '點選左側圖示',
  iconDetailSelectHintLine2: '預覽 SVG 詳情',
  iconDetailInlineSvg: '內嵌 SVG',
  iconDetailViewBoxHint: 'React 元件 · viewBox 0 0 24 24',
  iconDetailSwatches: '色票示範',
  iconDetailSizes: '尺寸示範',
  iconDetailSourceFile: '來源檔案',
  iconDetailSourceSection: '區塊：{section}',
  iconDetailScopeNote: '圖示庫收錄 Icons.tsx 全部 *Icon 元件（{count} 個），不含 emoji 對應器 ThemeIcon。',
  iconDetailOpenInFileLib: '在檔案庫開啟 {file}',
  iconSwatchWhite: '預設白',
  iconSwatchAmber: '琥珀',
  iconSwatchBlue: '藍色',
  iconSwatchEmerald: '翡翠',
  iconSwatchRose: '玫瑰',
  iconSwatchPurple: '紫色',
  fileListSearchResult: '搜尋結果：「{term}」',
  fileListColName: '名稱',
  fileListColType: '類型',
  fileListColLines: '行數',
  fileListColPath: '路徑',
  fileListAriaLabel: '檔案列表',
  fileListEmptyFolder: '此資料夾是空的',
  fileListItemCount: '{count} 個項目',
  fileListLineSum: ' · 共 {count} 行',
  fileListKeyboardHint: ' · ↑↓ 選取 · Enter 開啟 · Backspace 上層',
  fileListParentFolder: '上層',
  fileListFolderLabel: '資料夾',
  fileListOverLimitBadge: '超標',
  fileListSortBy: '依{label}排序',
};

const ENC_EN = {
  fileDetailSelectHintLine1: 'Select a file on the left',
  fileDetailSelectHintLine2: 'to view path and purpose',
  fileDetailOverLimitTitle: 'Over line limit',
  fileDetailOverLimitSuggest: 'Consider splitting into multiple files (max {max} lines).',
  fileDetailFolder: 'Folder',
  fileDetailCategory: 'Category',
  fileDetailDescription: 'Description',
  fileDetailFormat: 'Format',
  fileDetailLineCount: 'Lines',
  fileDetailExtension: 'Extension',
  fileDetailImports: 'Imports',
  fileDetailImportedBy: 'Imported by',
  fileDetailImportsEmpty: 'This file imports no other src files',
  fileDetailImportedByEmpty: 'No other files import this file',
  fileDetailGoToTab: 'Go to encyclopedia "{tab}"',
  iconDetailSelectHintLine1: 'Select an icon on the left',
  iconDetailSelectHintLine2: 'to preview SVG details',
  iconDetailInlineSvg: 'Inline SVG',
  iconDetailViewBoxHint: 'React component · viewBox 0 0 24 24',
  iconDetailSwatches: 'Color swatches',
  iconDetailSizes: 'Size preview',
  iconDetailSourceFile: 'Source file',
  iconDetailSourceSection: 'Section: {section}',
  iconDetailScopeNote: 'Icon library lists all *Icon components from Icons.tsx ({count} total), excluding ThemeIcon.',
  iconDetailOpenInFileLib: 'Open {file} in file library',
  iconSwatchWhite: 'Default white',
  iconSwatchAmber: 'Amber',
  iconSwatchBlue: 'Blue',
  iconSwatchEmerald: 'Emerald',
  iconSwatchRose: 'Rose',
  iconSwatchPurple: 'Purple',
  fileListSearchResult: 'Search results: "{term}"',
  fileListColName: 'Name',
  fileListColType: 'Type',
  fileListColLines: 'Lines',
  fileListColPath: 'Path',
  fileListAriaLabel: 'File list',
  fileListEmptyFolder: 'This folder is empty',
  fileListItemCount: '{count} items',
  fileListLineSum: ' · {count} lines total',
  fileListKeyboardHint: ' · ↑↓ select · Enter open · Backspace up',
  fileListParentFolder: 'Parent',
  fileListFolderLabel: 'Folder',
  fileListOverLimitBadge: 'Over',
  fileListSortBy: 'Sort by {label}',
};

const ENC_MAP = {
  'zh-TW': ENC_ZH, 'zh-CN': ENC_ZH, en: ENC_EN, ja: ENC_EN, ko: ENC_EN,
  fr: ENC_EN, de: ENC_EN, es: ENC_EN, ru: ENC_EN, pt: ENC_EN,
};

const GAME_DE = {
  pauseEncTabEnemies: 'Feind-Enzyklopädie',
  pauseEncTabTowers: 'Turm-Enzyklopädie',
  pauseEncTabSkills: 'Aktive Fähigkeiten',
  pauseEncTabEffects: 'Statuseffekte',
  pauseEncTabDefault: 'Enzyklopädie',
  pauseTraitArmorPerHit: 'Rüstung -{value}/Treffer',
  pauseTraitMutatorArmor: 'Mutator-Rüstung +{value}',
  pauseTraitShieldMax: 'Schild max. {value}',
  pauseTraitShieldCurrent: 'Aktiver Schild {value}',
  pauseFieldEffectSlow: 'Verlangsamung',
  pauseFieldEffectPoison: 'Gift',
  pauseFieldEffectBurn: 'Brand',
  pauseFieldEffectFreeze: 'Einfrieren',
  pauseFieldEffectStun: 'Betäubung',
  pauseFieldEffectBleed: 'Bluten',
  pauseFieldEffectWeakness: 'Schwäche',
  pauseFieldEffectRoot: 'Wurzel',
};

const GAME_ES = {
  pauseEncTabEnemies: 'Enciclopedia de enemigos',
  pauseEncTabTowers: 'Enciclopedia de torres',
  pauseEncTabSkills: 'Habilidades activas',
  pauseEncTabEffects: 'Efectos de estado',
  pauseEncTabDefault: 'Enciclopedia',
  pauseTraitArmorPerHit: 'Armadura -{value}/golpe',
  pauseTraitMutatorArmor: 'Armadura mutante +{value}',
  pauseTraitShieldMax: 'Escudo máx. {value}',
  pauseTraitShieldCurrent: 'Escudo activo {value}',
  pauseFieldEffectSlow: 'Ralentización',
  pauseFieldEffectPoison: 'Veneno',
  pauseFieldEffectBurn: 'Quemadura',
  pauseFieldEffectFreeze: 'Congelación',
  pauseFieldEffectStun: 'Aturdimiento',
  pauseFieldEffectBleed: 'Sangrado',
  pauseFieldEffectWeakness: 'Debilidad',
  pauseFieldEffectRoot: 'Enraizamiento',
};

const GAME_RU = {
  pauseEncTabEnemies: 'Энциклопедия врагов',
  pauseEncTabTowers: 'Энциклопедия башен',
  pauseEncTabSkills: 'Активные навыки',
  pauseEncTabEffects: 'Эффекты состояния',
  pauseEncTabDefault: 'Энциклопедия',
  pauseTraitArmorPerHit: 'Броня -{value}/удар',
  pauseTraitMutatorArmor: 'Мут. броня +{value}',
  pauseTraitShieldMax: 'Щит макс. {value}',
  pauseTraitShieldCurrent: 'Активный щит {value}',
  pauseFieldEffectSlow: 'Замедление',
  pauseFieldEffectPoison: 'Яд',
  pauseFieldEffectBurn: 'Горение',
  pauseFieldEffectFreeze: 'Заморозка',
  pauseFieldEffectStun: 'Оглушение',
  pauseFieldEffectBleed: 'Кровотечение',
  pauseFieldEffectWeakness: 'Слабость',
  pauseFieldEffectRoot: 'Обездвиживание',
};

const GAME_PT = {
  pauseEncTabEnemies: 'Enciclopédia de inimigos',
  pauseEncTabTowers: 'Enciclopédia de torres',
  pauseEncTabSkills: 'Habilidades ativas',
  pauseEncTabEffects: 'Efeitos de status',
  pauseEncTabDefault: 'Enciclopédia',
  pauseTraitArmorPerHit: 'Armadura -{value}/golpe',
  pauseTraitMutatorArmor: 'Armadura mutante +{value}',
  pauseTraitShieldMax: 'Escudo máx. {value}',
  pauseTraitShieldCurrent: 'Escudo ativo {value}',
  pauseFieldEffectSlow: 'Lentidão',
  pauseFieldEffectPoison: 'Veneno',
  pauseFieldEffectBurn: 'Queimadura',
  pauseFieldEffectFreeze: 'Congelamento',
  pauseFieldEffectStun: 'Atordoamento',
  pauseFieldEffectBleed: 'Sangramento',
  pauseFieldEffectWeakness: 'Fraqueza',
  pauseFieldEffectRoot: 'Enraizamento',
};

const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join('src/i18n/locales', `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes('fileDetailSelectHintLine1:')) {
    const enc = ENC_MAP[loc] ?? ENC_EN;
    const block = Object.entries(enc).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join('\n');
    s = s.replace(/(\s+iconLibClearFilter: '[^']*',)/, `$1\n${block}`);
    fs.writeFileSync(file, s, 'utf8');
    console.log('enc', loc);
  }
}

for (const [loc, game] of Object.entries({ de: GAME_DE, es: GAME_ES, ru: GAME_RU, pt: GAME_PT })) {
  const file = path.join('src/i18n/locales', `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  for (const [k, v] of Object.entries(game)) {
    const re = new RegExp(`(\\s+${k}: )'[^']*',`);
    if (re.test(s)) s = s.replace(re, `$1${JSON.stringify(v)},`);
  }
  fs.writeFileSync(file, s, 'utf8');
  console.log('game', loc);
}

console.log('Done batch7');
