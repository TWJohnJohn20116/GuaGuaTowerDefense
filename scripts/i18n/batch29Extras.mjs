/** batch29：statistics.fieldLabels / skins.detail / mutatorChallenge 完整 / lpUndeployHint */

export const BATCH29_STATS_FIELD_KEYS = ['towersSold', 'gameMode', 'totalTowersSold'];

export const BATCH29_SKIN_DETAIL_KEYS = [
  'selectHintLine1', 'selectHintLine2', 'rarity', 'category', 'towerLabel', 'skinProperties',
  'visualEffects', 'effectGlow', 'effectAura', 'effectTrail', 'effectParticle', 'effectIdleAnim',
  'favoriteBadge', 'universalSkin',
];

export const BATCH29_MUT_TOOLBAR_KEYS = [
  'hint', 'filterAll', 'tierEasy', 'tierMedium', 'tierHard', 'tierExtreme',
];

export const BATCH29_MUT_TOP_KEYS = ['completionRate', 'emptyTier'];

const ZH_STATS_FIELDS = {
  towersSold: '出售塔數',
  gameMode: '對局模式',
  totalTowersSold: '累計售塔',
};
const EN_STATS_FIELDS = {
  towersSold: 'Towers sold',
  gameMode: 'Game mode',
  totalTowersSold: 'Total towers sold',
};

const ZH_SKIN_DETAIL = {
  selectHintLine1: '點選左側皮膚',
  selectHintLine2: '查看詳情與裝備',
  rarity: '稀有度',
  category: '類別',
  towerLabel: '適用塔',
  skinProperties: '皮膚屬性',
  visualEffects: '視覺特效',
  effectGlow: '發光',
  effectAura: '光環',
  effectTrail: '軌跡',
  effectParticle: '粒子',
  effectIdleAnim: '閒置動畫',
  favoriteBadge: '收藏',
  universalSkin: '通用皮膚',
};
const EN_SKIN_DETAIL = {
  selectHintLine1: 'Select a skin on the left',
  selectHintLine2: 'to view details and equip',
  rarity: 'Rarity',
  category: 'Category',
  towerLabel: 'Tower',
  skinProperties: 'Skin properties',
  visualEffects: 'Visual effects',
  effectGlow: 'Glow',
  effectAura: 'Aura',
  effectTrail: 'Trail',
  effectParticle: 'Particles',
  effectIdleAnim: 'Idle animation',
  favoriteBadge: 'Favorite',
  universalSkin: 'Universal skin',
};

const ZH_MUT_TOOLBAR = {
  hint: '固定規則試煉 · 選擇挑戰後於右側查看詳情',
  filterAll: '全部',
  tierEasy: '簡單',
  tierMedium: '中等',
  tierHard: '困難',
  tierExtreme: '極限',
};
const EN_MUT_TOOLBAR = {
  hint: 'Fixed-rule trials · select a challenge to view details on the right',
  filterAll: 'All',
  tierEasy: 'Easy',
  tierMedium: 'Medium',
  tierHard: 'Hard',
  tierExtreme: 'Extreme',
};

const ZH_MUT_TOP = { completionRate: '完成率', emptyTier: '此難度暫無挑戰' };
const EN_MUT_TOP = { completionRate: 'Completion rate', emptyTier: 'No challenges in this tier' };

const ZH_MUT_DETAIL = {
  selectHintLine1: '點選左側挑戰',
  selectHintLine2: '查看規則與獎勵',
  mapLabel: '地圖',
  difficultyLabel: '難度',
  rulesLabel: '突變規則',
  rewardLabel: '獎勵',
  endlessSuffix: ' · 無盡',
  wavesSuffix: ' · {count} 波',
  diffEasy: '簡單',
  diffNormal: '普通',
  diffHard: '困難',
  diffNightmare: '夢魘',
  diffImpossible: '地獄',
  diffCustom: '自訂',
};
const EN_MUT_DETAIL = {
  selectHintLine1: 'Select a challenge on the left',
  selectHintLine2: 'to view rules and rewards',
  mapLabel: 'Map',
  difficultyLabel: 'Difficulty',
  rulesLabel: 'Mutator rules',
  rewardLabel: 'Rewards',
  endlessSuffix: ' · Endless',
  wavesSuffix: ' · {count} waves',
  diffEasy: 'Easy',
  diffNormal: 'Normal',
  diffHard: 'Hard',
  diffNightmare: 'Nightmare',
  diffImpossible: 'Hell',
  diffCustom: 'Custom',
};

const JA_MUT_TOOLBAR = { ...EN_MUT_TOOLBAR, hint: '固定ルール試練 · 左で選択して右で詳細', tierEasy: '簡単', tierMedium: '普通', tierHard: '困難', tierExtreme: '極限' };
const KO_MUT_TOOLBAR = { ...EN_MUT_TOOLBAR, hint: '고정 규칙 시련 · 왼쪽에서 선택 후 오른쪽에서 확인', tierEasy: '쉬움', tierMedium: '보통', tierHard: '어려움', tierExtreme: '극한' };
const DE_MUT_TOOLBAR = { ...EN_MUT_TOOLBAR, hint: 'Feste Regeln · links wählen, Details rechts', tierEasy: 'Leicht', tierMedium: 'Mittel', tierHard: 'Schwer', tierExtreme: 'Extrem' };
const FR_MUT_TOOLBAR = { ...EN_MUT_TOOLBAR, hint: 'Épreuves à règles fixes · sélectionnez à gauche', tierEasy: 'Facile', tierMedium: 'Moyen', tierHard: 'Difficile', tierExtreme: 'Extrême' };
const ES_MUT_TOOLBAR = { ...EN_MUT_TOOLBAR, hint: 'Pruebas de reglas fijas · elige a la izquierda', tierEasy: 'Fácil', tierMedium: 'Medio', tierHard: 'Difícil', tierExtreme: 'Extremo' };
const RU_MUT_TOOLBAR = { ...EN_MUT_TOOLBAR, hint: 'Испытания с правилами · выберите слева', tierEasy: 'Легко', tierMedium: 'Средне', tierHard: 'Сложно', tierExtreme: 'Экстрим' };
const PT_MUT_TOOLBAR = { ...EN_MUT_TOOLBAR, hint: 'Provas de regras fixas · selecione à esquerda', tierEasy: 'Fácil', tierMedium: 'Médio', tierHard: 'Difícil', tierExtreme: 'Extremo' };

const LP_UNDEPLOY = {
  'zh-TW': 'Shift+點擊或右鍵已部署塔可退款',
  'zh-CN': 'Shift+点击或右键已部署塔可退款',
  en: 'Shift+click or right-click deployed tower to refund',
  ja: 'Shift+クリックまたは右クリックで配置塔を返金',
  ko: 'Shift+클릭 또는 우클릭으로 배치된 타워 환불',
  de: 'Shift+Klick oder Rechtsklick auf platzierten Turm für Rückerstattung',
  fr: 'Shift+clic ou clic droit sur une tour déployée pour rembourser',
  es: 'Shift+clic o clic derecho en torre desplegada para reembolso',
  ru: 'Shift+клик или ПКМ по размещённой башне для возврата',
  pt: 'Shift+clique ou botão direito na torre implantada para reembolso',
};

const MAP = (zh, en) => ({
  'zh-TW': zh, 'zh-CN': zh, en, ja: en, ko: en, de: en, fr: en, es: en, ru: en, pt: en,
});

const MUT_TOOLBAR_MAP = {
  'zh-TW': ZH_MUT_TOOLBAR, 'zh-CN': ZH_MUT_TOOLBAR, en: EN_MUT_TOOLBAR,
  ja: JA_MUT_TOOLBAR, ko: KO_MUT_TOOLBAR, de: DE_MUT_TOOLBAR, fr: FR_MUT_TOOLBAR,
  es: ES_MUT_TOOLBAR, ru: RU_MUT_TOOLBAR, pt: PT_MUT_TOOLBAR,
};

export function getBatch29StatsFields(loc) {
  return { ...EN_STATS_FIELDS, ...MAP(ZH_STATS_FIELDS, EN_STATS_FIELDS)[loc] };
}
export function getBatch29SkinDetail(loc) {
  return { ...EN_SKIN_DETAIL, ...MAP(ZH_SKIN_DETAIL, EN_SKIN_DETAIL)[loc] };
}
export function getBatch29MutToolbar(loc) {
  return { ...EN_MUT_TOOLBAR, ...MUT_TOOLBAR_MAP[loc] };
}
export function getBatch29MutTop(loc) {
  return { ...EN_MUT_TOP, ...MAP(ZH_MUT_TOP, EN_MUT_TOP)[loc] };
}
export function getBatch29MutDetail(loc) {
  return { ...EN_MUT_DETAIL, ...MAP(ZH_MUT_DETAIL, EN_MUT_DETAIL)[loc] };
}
export function getLpUndeployHint(loc) {
  return LP_UNDEPLOY[loc] ?? LP_UNDEPLOY.en;
}

function lines(keys, data, indent) {
  const pad = ' '.repeat(indent);
  return keys.map((k) => `${pad}${k}: ${JSON.stringify(data[k])},`).join('\n');
}

export function formatStatsFieldLines(loc) {
  return lines(BATCH29_STATS_FIELD_KEYS, getBatch29StatsFields(loc), 6);
}
export function formatSkinDetailBlock(loc) {
  return `    detail: {\n${lines(BATCH29_SKIN_DETAIL_KEYS, getBatch29SkinDetail(loc), 6)}\n    },`;
}
export function formatMutToolbarBlock(loc) {
  return `    toolbar: {\n${lines(BATCH29_MUT_TOOLBAR_KEYS, getBatch29MutToolbar(loc), 6)}\n    },`;
}
export function formatMutTopLines(loc) {
  return lines(BATCH29_MUT_TOP_KEYS, getBatch29MutTop(loc), 4);
}
export function formatMutDetailBlock(loc) {
  return `    detail: {\n${lines([
    'selectHintLine1', 'selectHintLine2', 'mapLabel', 'difficultyLabel', 'rulesLabel', 'rewardLabel',
    'endlessSuffix', 'wavesSuffix', 'diffEasy', 'diffNormal', 'diffHard', 'diffNightmare', 'diffImpossible', 'diffCustom',
  ], getBatch29MutDetail(loc), 6)}\n    },`;
}
