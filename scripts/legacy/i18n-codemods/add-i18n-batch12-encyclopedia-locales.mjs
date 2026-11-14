/**
 * batch12-C：ja / ko / de encyclopedia detail & stats UI key 補譯
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');

const PATCH = {
  ja: {
    difficultyTab: '難易度',
    effectsTab: '効果',
    statsTab: '統計',
    sidebarGroupCombat: '戦闘',
    sidebarGroupTactics: '戦術',
    sidebarGroupMeta: '資料',
    skillsTab: 'スキル',
    effectsTabFull: '状態効果',
    iconsTab: 'アイコン',
    filesTab: 'ファイル',
    detail3dEnemyDrag: 'ドラッグで回転',
    fileLibSearchPlaceholder: 'ファイル検索…',
    fileLibTotalFiles: '{count} ファイル',
    fileLibTotalLines: '{count} 行',
    fileLibOverLimitFiles: '{count} 超過',
    iconLibSearchPlaceholder: 'アイコン検索…',
    iconLibFilterAll: 'すべて',
    iconLibTotalCount: '計 {count}',
    iconLibEmbeddedBadge: '内蔵',
    iconLibScopeHint: 'Icons.tsx の *Icon 一覧',
    iconLibNoResults: '該当なし',
    iconLibClearFilter: 'フィルター解除',
    searchPlaceholder: '検索…',
    sortBy: '並べ替え',
    sortName: '名前',
    sortDamage: 'ダメージ',
    sortCost: 'コスト',
    sortDps: 'DPS',
    sortRange: '射程',
    sortHealth: 'HP',
    sortSpeed: '速度',
    sortReward: '報酬',
    filterAll: 'すべて',
    filterBasic: '基本',
    filterSpecial: '特殊',
    filterMod: 'Mod',
    filterNormal: '通常',
    totalMapsCount: '{count} マップ',
    totalDifficultiesCount: '{count} 難易度',
    totalEffectsCount: '{count} 効果',
    noResults: '結果なし',
    clearFilter: 'フィルター解除',
    source: '出典',
    builtIn: '内蔵',
    fromMod: 'Mod',
    viewDetails: '詳細',
    builtInMap: '内蔵マップ',
    pathPointsLabel: '経路点',
    forkSegmentsLabel: '分岐',
    statsOverview: '概要',
    statsHistory: '履歴',
    statsRecords: '記録',
    statsOverviewDesc: '対局概要・勝率・自己ベスト',
    statsHistoryDesc: '対局履歴一覧',
    statsRecordsDesc: '詳細記録とエクスポート',
    selectTowerHint: 'タワーを選択',
    selectEnemyHint: '敵を選択',
    selectMapHint: 'マップを選択',
    selectDifficultyHint: '難易度を選択',
    selectEffectHint: '効果を選択',
    selectSkillHint: 'スキルを選択',
    addToCompare: '比較に追加',
    inCompare: '比較中',
    detail3dPreview: '3D',
    detail3dPreviewSync: 'Lv.{level} 同期',
    fileDetailSelectHintLine1: '左のファイルを選択',
    fileDetailSelectHintLine2: 'パスと用途を表示',
    fileDetailOverLimitTitle: '行数上限超過',
    fileDetailOverLimitSuggest: '複数ファイルに分割を推奨（上限 {max} 行）。',
    fileDetailFolder: 'フォルダ',
    fileDetailCategory: '分類',
    fileDetailDescription: '説明',
    fileDetailFormat: '形式',
    fileDetailLineCount: '行数',
    fileDetailExtension: '拡張子',
    fileDetailImports: 'インポート',
    fileDetailImportedBy: '参照元',
    yes: 'はい',
    no: 'いいえ',
    knockback: 'ノックバック',
    duration: '持続',
    targetUnit: '対象',
    cellUnit: 'マス',
  },
  ko: {
    difficultyTab: '난이도',
    effectsTab: '효과',
    statsTab: '통계',
    sidebarGroupCombat: '전투',
    sidebarGroupTactics: '전술',
    sidebarGroupMeta: '자료',
    skillsTab: '스킬',
    effectsTabFull: '상태 효과',
    iconsTab: '아이콘',
    filesTab: '파일',
    detail3dEnemyDrag: '드래그로 회전',
    fileLibSearchPlaceholder: '파일 검색…',
    searchPlaceholder: '검색…',
    sortBy: '정렬',
    sortName: '이름',
    statsOverview: '개요',
    statsHistory: '기록',
    statsRecords: '상세',
    statsOverviewDesc: '전적 개요·승률·개인 최고',
    statsHistoryDesc: '전체 전적 목록',
    statsRecordsDesc: '상세 기록 및 내보내기',
    selectTowerHint: '타워 선택',
    selectEnemyHint: '적 선택',
    selectMapHint: '맵 선택',
    yes: '예',
    no: '아니오',
    knockback: '넉백',
    duration: '지속',
  },
  de: {
    difficultyTab: 'Schwierigkeit',
    effectsTab: 'Effekte',
    statsTab: 'Statistik',
    statsOverviewDesc: 'Übersicht, Siegquote, Rekorde',
    statsHistoryDesc: 'Vollständiger Spielverlauf',
    statsRecordsDesc: 'Detailaufzeichnungen und Export',
    selectTowerHint: 'Turm wählen',
    yes: 'Ja',
    no: 'Nein',
  },
  fr: {
    difficultyTab: 'Difficulté',
    effectsTab: 'Effets',
    statsTab: 'Statistiques',
    sidebarGroupCombat: 'Combat',
    sidebarGroupTactics: 'Tactique',
    sidebarGroupMeta: 'Référence',
    skillsTab: 'Compétences',
    statsOverview: 'Aperçu',
    statsHistory: 'Historique',
    statsRecords: 'Archives',
    statsOverviewDesc: 'Aperçu, taux de victoire, records',
    statsHistoryDesc: 'Historique complet',
    statsRecordsDesc: 'Détails et export',
    selectTowerHint: 'Choisir une tour',
    selectEnemyHint: 'Choisir un ennemi',
    yes: 'Oui',
    no: 'Non',
  },
  es: {
    difficultyTab: 'Dificultad',
    effectsTab: 'Efectos',
    statsTab: 'Estadísticas',
    statsOverview: 'Resumen',
    statsHistory: 'Historial',
    statsRecords: 'Registros',
    statsOverviewDesc: 'Resumen, victorias y récords',
    statsHistoryDesc: 'Historial completo',
    statsRecordsDesc: 'Registros detallados y exportación',
    selectTowerHint: 'Elige una torre',
    yes: 'Sí',
    no: 'No',
  },
  ru: {
    difficultyTab: 'Сложность',
    effectsTab: 'Эффекты',
    statsTab: 'Статистика',
    statsOverview: 'Обзор',
    statsHistory: 'История',
    statsRecords: 'Записи',
    statsOverviewDesc: 'Обзор, победы, рекорды',
    statsHistoryDesc: 'Полная история',
    statsRecordsDesc: 'Детали и экспорт',
    selectTowerHint: 'Выберите башню',
    yes: 'Да',
    no: 'Нет',
  },
  pt: {
    difficultyTab: 'Dificuldade',
    effectsTab: 'Efeitos',
    statsTab: 'Estatísticas',
    statsOverview: 'Visão geral',
    statsHistory: 'Histórico',
    statsRecords: 'Registros',
    statsOverviewDesc: 'Visão geral, vitórias e recordes',
    statsHistoryDesc: 'Histórico completo',
    statsRecordsDesc: 'Registros detalhados e exportação',
    selectTowerHint: 'Escolha uma torre',
    yes: 'Sim',
    no: 'Não',
  },
};

const NESTED_ABILITIES = {
  ja: { flying: '飛行', healing: '回復オーラ', spawning: '分裂', shield: 'シールド再生', stealth: 'ステルス', berserk: 'バーサーク', armored: '重装備', teleport: 'テレポート', miniboss: 'ミニボス', swarm: 'スウォーム', phase: 'フェーズ', explode: '爆発', sabotage: '妨害' },
  ko: { flying: '비행', healing: '치유 오라', spawning: '분열', shield: '방패 재생', stealth: '은신', berserk: '광폭', armored: '중장갑', teleport: '순간이동', miniboss: '미니 보스', swarm: '떼', phase: '위상', explode: '폭발', sabotage: '사보타주' },
  de: { flying: 'Flug', healing: 'Heil-Aura', spawning: 'Spaltung', shield: 'Schild-Regen', stealth: 'Tarnung', berserk: 'Berserker', armored: 'Schwere Rüstung', teleport: 'Teleport', miniboss: 'Mini-Boss', swarm: 'Schwarm', phase: 'Phasenwechsel', explode: 'Explosion', sabotage: 'Sabotage' },
};

function patchNestedAbilities(loc, map) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  let n = 0;
  for (const [key, val] of Object.entries(map)) {
    const re = new RegExp(`(\\s+${key}: )"Flying"|"Flying"|"Healing Aura"|"[^"]*",`, '');
    // only replace inside abilities block - simpler: replace ability keys when still English
    const re2 = new RegExp(`(abilities: \\{[\\s\\S]*?\\s+${key}: )"[^"]*",`);
    const next = s.replace(re2, `$1${JSON.stringify(val)},`);
    if (next !== s) { n++; s = next; }
  }
  if (n > 0) {
    fs.writeFileSync(file, s, 'utf8');
    console.log('abilities patch', loc, n);
  }
}

function patchLocale(loc, map) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  let n = 0;
  for (const [key, val] of Object.entries(map)) {
    const re = new RegExp(`(\\s+${key}: )"[^"]*",`, 'g');
    const next = s.replace(re, `$1${JSON.stringify(val)},`);
    if (next !== s) {
      n++;
      s = next;
    }
  }
  if (n > 0) {
    fs.writeFileSync(file, s, 'utf8');
    console.log('encyclopedia patch', loc, n, 'keys');
  } else {
    console.log('skip', loc);
  }
}

for (const loc of ['ja', 'ko', 'de', 'fr', 'es', 'ru', 'pt']) {
  patchLocale(loc, PATCH[loc]);
}

for (const loc of ['ja', 'ko', 'de']) {
  patchNestedAbilities(loc, NESTED_ABILITIES[loc]);
}

console.log('Done batch12-C encyclopedia locales');
