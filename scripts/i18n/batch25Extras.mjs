/** batch25：mod-manager detail / import / store / wave / balance key */
export const BATCH25_MM_DETAIL_KEYS = [
  'sectionAddTowers', 'sectionAddEnemies', 'sectionAddMaps', 'sectionAddWaves',
  'towerStatLine', 'enemyStatLine', 'mapDifficulty', 'mapWaypointCount',
  'waveCountBadge', 'waveEnemyBadge', 'metaGameVersion', 'metaCreatedAt', 'metaUpdatedAt',
];

export const BATCH25_MOD_KEYS = [
  'modImportReplace', 'modImportMerge', 'modImportIdConflict', 'modImportMerged',
  'storeModAlreadyInstalled', 'storeModInvalidFormat',
  'balDpsLabel', 'wvTimelineEstSec', 'wvLegendBoss',
];

export const BATCH25_KEYS = [...BATCH25_MM_DETAIL_KEYS, ...BATCH25_MOD_KEYS];

const ZH_MM = {
  sectionAddTowers: '新增防禦塔',
  sectionAddEnemies: '新增敵人',
  sectionAddMaps: '新增地圖',
  sectionAddWaves: '自訂波次組',
  towerStatLine: '傷害: {damage} • 射程: {range}',
  enemyStatLine: 'HP: {hp} • 速度: {speed}x',
  mapDifficulty: '難度: {difficulty}',
  mapWaypointCount: '{count} 路徑點',
  waveCountBadge: '{count} 波',
  waveEnemyBadge: '{count} 敵',
  metaGameVersion: '遊戲版本',
  metaCreatedAt: '創建時間',
  metaUpdatedAt: '更新時間',
};

const ZH_MOD = {
  modImportReplace: '覆蓋匯入',
  modImportMerge: '合併匯入',
  modImportIdConflict: 'Mod ID 與已安裝項目衝突。建議使用「合併匯入」或修改 metadata.id。',
  modImportMerged: '已合併匯入內容',
  storeModAlreadyInstalled: '此 Mod 已經安裝',
  storeModInvalidFormat: '無效的 Mod 格式',
  balDpsLabel: 'DPS',
  wvTimelineEstSec: '~{seconds}s',
  wvLegendBoss: 'Boss',
};

const EN_MM = {
  sectionAddTowers: 'Custom towers',
  sectionAddEnemies: 'Custom enemies',
  sectionAddMaps: 'Custom maps',
  sectionAddWaves: 'Custom wave sets',
  towerStatLine: 'DMG: {damage} • Range: {range}',
  enemyStatLine: 'HP: {hp} • Speed: {speed}x',
  mapDifficulty: 'Difficulty: {difficulty}',
  mapWaypointCount: '{count} waypoints',
  waveCountBadge: '{count} waves',
  waveEnemyBadge: '{count} enemies',
  metaGameVersion: 'Game version',
  metaCreatedAt: 'Created',
  metaUpdatedAt: 'Updated',
};

const EN_MOD = {
  modImportReplace: 'Replace import',
  modImportMerge: 'Merge import',
  modImportIdConflict: 'Mod ID conflicts with installed mod. Use merge import or change metadata.id.',
  modImportMerged: 'Content merged from import',
  storeModAlreadyInstalled: 'This mod is already installed',
  storeModInvalidFormat: 'Invalid mod format',
  balDpsLabel: 'DPS',
  wvTimelineEstSec: '~{seconds}s',
  wvLegendBoss: 'Boss',
};

const JA_MM = { ...EN_MM, sectionAddTowers: 'カスタム塔', metaCreatedAt: '作成日', metaUpdatedAt: '更新日' };
const KO_MM = { ...EN_MM, sectionAddTowers: '커스텀 타워', metaCreatedAt: '생성일', metaUpdatedAt: '수정일' };
const DE_MM = { ...EN_MM, sectionAddTowers: 'Eigene Türme', metaGameVersion: 'Spielversion' };
const FR_MM = { ...EN_MM, sectionAddTowers: 'Tours perso', metaGameVersion: 'Version jeu' };

const MAP_MM = {
  'zh-TW': ZH_MM, 'zh-CN': ZH_MM, en: EN_MM, ja: JA_MM, ko: KO_MM, de: DE_MM, fr: FR_MM, es: EN_MM, ru: EN_MM, pt: EN_MM,
};

const MAP_MOD = {
  'zh-TW': ZH_MOD, 'zh-CN': ZH_MOD, en: EN_MOD, ja: { ...EN_MOD, modImportReplace: '上書きインポート', modImportMerge: 'マージインポート' },
  ko: { ...EN_MOD, storeModAlreadyInstalled: '이미 설치된 Mod' },
  de: EN_MOD, fr: EN_MOD, es: EN_MOD, ru: EN_MOD, pt: EN_MOD,
};

export function getBatch25MmDetail(loc) {
  return { ...EN_MM, ...MAP_MM[loc] };
}

export function getBatch25ModEditor(loc) {
  return { ...EN_MOD, ...MAP_MOD[loc] };
}

export function formatBatch25MmDetailLines(loc) {
  const d = getBatch25MmDetail(loc);
  return BATCH25_MM_DETAIL_KEYS.map((k) => `      ${k}: ${JSON.stringify(d[k] ?? EN_MM[k])},`).join('\n');
}

export function formatBatch25ModLines(loc) {
  const d = getBatch25ModEditor(loc);
  return BATCH25_MOD_KEYS.map((k) => `    ${k}: ${JSON.stringify(d[k] ?? EN_MOD[k])},`).join('\n');
}
