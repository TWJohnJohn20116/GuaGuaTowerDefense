/**
 * 圖示庫/檔案庫 UI + 敵人 3D + fr 側欄/batch4 法文（batch6）
 */
import fs from 'fs';
import path from 'path';

const ENC_ZH = {
  detail3dEnemyDrag: '拖曳旋轉預覽',
  fileLibSearchPlaceholder: '搜尋 src 內的檔案…',
  fileLibTotalFiles: '共 {count} 個檔案',
  fileLibTotalLines: '{count} 行',
  fileLibOverLimitFiles: '{count} 個超標檔案',
  iconLibSearchPlaceholder: '搜尋圖示名稱或分類…',
  iconLibFilterAll: '全部 ({count})',
  iconLibTotalCount: '共 {count} 個 SVG 圖示',
  iconLibEmbeddedBadge: '100% 內嵌 SVG',
  iconLibScopeHint: 'Icons.tsx 全收錄 {count} 個（排除 ThemeIcon）',
  iconLibNoResults: '查無圖示',
  iconLibClearFilter: '清除篩選',
};

const ENC_EN = {
  detail3dEnemyDrag: 'Drag to rotate preview',
  fileLibSearchPlaceholder: 'Search files in src…',
  fileLibTotalFiles: '{count} files total',
  fileLibTotalLines: '{count} lines',
  fileLibOverLimitFiles: '{count} over-limit files',
  iconLibSearchPlaceholder: 'Search icon name or category…',
  iconLibFilterAll: 'All ({count})',
  iconLibTotalCount: '{count} SVG icons',
  iconLibEmbeddedBadge: '100% inline SVG',
  iconLibScopeHint: 'Icons.tsx registry: {count} icons (excl. ThemeIcon)',
  iconLibNoResults: 'No icons found',
  iconLibClearFilter: 'Clear filters',
};

const ENC_JA = {
  detail3dEnemyDrag: 'ドラッグで回転プレビュー',
  fileLibSearchPlaceholder: 'src 内のファイルを検索…',
  fileLibTotalFiles: '計 {count} ファイル',
  fileLibTotalLines: '{count} 行',
  fileLibOverLimitFiles: '超過 {count} ファイル',
  iconLibSearchPlaceholder: 'アイコン名・分類を検索…',
  iconLibFilterAll: 'すべて ({count})',
  iconLibTotalCount: '計 {count} 個の SVG',
  iconLibEmbeddedBadge: '100% インライン SVG',
  iconLibScopeHint: 'Icons.tsx 収録 {count} 個（ThemeIcon 除く）',
  iconLibNoResults: 'アイコンが見つかりません',
  iconLibClearFilter: 'フィルタ解除',
};

const ENC_KO = {
  detail3dEnemyDrag: '드래그하여 회전 미리보기',
  fileLibSearchPlaceholder: 'src 파일 검색…',
  fileLibTotalFiles: '총 {count}개 파일',
  fileLibTotalLines: '{count}행',
  fileLibOverLimitFiles: '초과 {count}개 파일',
  iconLibSearchPlaceholder: '아이콘 이름·분류 검색…',
  iconLibFilterAll: '전체 ({count})',
  iconLibTotalCount: '총 {count}개 SVG',
  iconLibEmbeddedBadge: '100% 인라인 SVG',
  iconLibScopeHint: 'Icons.tsx {count}개 (ThemeIcon 제외)',
  iconLibNoResults: '아이콘 없음',
  iconLibClearFilter: '필터 지우기',
};

const ENC_FR = {
  detail3dEnemyDrag: 'Faites glisser pour faire pivoter',
  fileLibSearchPlaceholder: 'Rechercher dans src…',
  fileLibTotalFiles: '{count} fichiers au total',
  fileLibTotalLines: '{count} lignes',
  fileLibOverLimitFiles: '{count} fichiers hors limite',
  iconLibSearchPlaceholder: 'Rechercher icône ou catégorie…',
  iconLibFilterAll: 'Tous ({count})',
  iconLibTotalCount: '{count} icônes SVG',
  iconLibEmbeddedBadge: '100 % SVG intégrés',
  iconLibScopeHint: 'Icons.tsx : {count} icônes (hors ThemeIcon)',
  iconLibNoResults: 'Aucune icône',
  iconLibClearFilter: 'Effacer les filtres',
  sidebarGroupCombat: 'Données de combat',
  sidebarGroupTactics: 'Cartes et tactiques',
  sidebarGroupMeta: 'Systèmes méta',
  skillsTab: 'Compétences actives',
  effectsTabFull: 'Effets de statut',
  iconsTab: 'Bibliothèque d\'icônes',
  filesTab: 'Bibliothèque de fichiers',
};

const ENC_DE = { ...ENC_EN, detail3dEnemyDrag: 'Ziehen zum Drehen der Vorschau' };
const ENC_ES = { ...ENC_EN, detail3dEnemyDrag: 'Arrastra para rotar la vista previa' };
const ENC_RU = { ...ENC_EN, detail3dEnemyDrag: 'Перетащите для поворота' };
const ENC_PT = { ...ENC_EN, detail3dEnemyDrag: 'Arraste para girar a visualização' };

const ENC_MAP = {
  'zh-TW': ENC_ZH, 'zh-CN': ENC_ZH, en: ENC_EN, ja: ENC_JA, ko: ENC_KO,
  fr: ENC_FR, de: ENC_DE, es: ENC_ES, ru: ENC_RU, pt: ENC_PT,
};

const FR_GAME = {
  pauseEncTabEnemies: 'Encyclopédie des ennemis',
  pauseEncTabTowers: 'Encyclopédie des tours',
  pauseEncTabSkills: 'Compétences actives',
  pauseEncTabEffects: 'Effets de statut',
  pauseEncTabDefault: 'Encyclopédie',
  pauseTraitArmorPerHit: 'Armure -{value}/coup',
  pauseTraitMutatorArmor: 'Armure mutante +{value}',
  pauseTraitShieldMax: 'Bouclier max {value}',
  pauseTraitShieldCurrent: 'Bouclier actif {value}',
  pauseFieldEffectSlow: 'Ralentissement',
  pauseFieldEffectPoison: 'Poison',
  pauseFieldEffectBurn: 'Brûlure',
  pauseFieldEffectFreeze: 'Gel',
  pauseFieldEffectStun: 'Étourdissement',
  pauseFieldEffectBleed: 'Saignement',
  pauseFieldEffectWeakness: 'Faiblesse',
  pauseFieldEffectRoot: 'Enracinement',
  pauseEncCloseAria: 'Fermer l\'encyclopédie',
  pauseEncClose: 'Fermer',
  pauseEncOpenFull: 'Ouvrir l\'encyclopédie complète (3D, comparaison…)',
  pauseEncOpenSettings: 'Ouvrir les paramètres complets',
  pauseEncLookupEnemy: 'Encyclopédie ennemis',
  pauseEncLookupTower: 'Encyclopédie tours',
  pauseEncLookupSkill: 'Encyclopédie compétences',
  pauseEncLookupEffect: 'Encyclopédie effets',
  pauseEncViewEnemy: 'Voir cet ennemi dans l\'encyclopédie',
  pauseEncEnemyNotFound: 'Données ennemi introuvables',
  pauseEncTowerNotFound: 'Données tour introuvables',
  pauseEncSkillNotFound: 'Données compétence introuvables',
  pauseEncEffectNotFound: 'Effet introuvable',
};

const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join('src/i18n/locales', `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes('detail3dEnemyDrag:')) {
    const enc = ENC_MAP[loc] ?? ENC_EN;
    const block = Object.entries(enc)
      .filter(([k]) => !k.startsWith('sidebar'))
      .map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`)
      .join('\n');
    s = s.replace(/(\s+filesTab: '[^']*',)/, `$1\n${block}`);
    if (!s.includes('sidebarGroupCombat:') && enc.sidebarGroupCombat) {
      const sb = Object.entries(enc)
        .filter(([k]) => k.startsWith('sidebar'))
        .map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`)
        .join('\n');
      if (sb) s = s.replace(/(\s+filesTab: '[^']*',)/, `$1\n${sb}`);
    }
    fs.writeFileSync(file, s, 'utf8');
    console.log('enc patched', loc);
  } else {
    console.log('enc skip', loc);
  }
}

// fr game batch4 法文
const frFile = path.join('src/i18n/locales/fr.ts');
let fr = fs.readFileSync(frFile, 'utf8');
for (const [k, v] of Object.entries(FR_GAME)) {
  const re = new RegExp(`(\\s+${k}: )'[^']*',`);
  if (re.test(fr)) {
    fr = fr.replace(re, `$1${JSON.stringify(v)},`);
  }
}
if (!fr.includes('sidebarGroupCombat:')) {
  const sb = Object.entries(ENC_FR)
    .filter(([k]) => k.startsWith('sidebar'))
    .map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`)
    .join('\n');
  fr = fr.replace(/(\s+statsTab: '[^']*',)/, `$1\n${sb}`);
}
fs.writeFileSync(frFile, fr, 'utf8');
console.log('fr game + sidebar patched');

console.log('Done batch6. Update index.ts types.');
