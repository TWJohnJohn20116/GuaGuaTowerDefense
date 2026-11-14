/** batch19：全螢幕地圖編輯器 + LivePreview i18n */
export const MAP_LP_KEYS = [
  'mapFsToolSelect', 'mapFsToolBrush', 'mapFsToolBlock', 'mapFsToolErase',
  'mapFsToolUndo', 'mapFsToolRedo', 'mapFsToolReverse', 'mapFsToolDup', 'mapFsToolMirror', 'mapFsToolClear',
  'mapFsToggleFlow', 'mapFsToggleGrid', 'mapFsNamePh', 'mapFsHistInitial', 'mapFsHistEdit',
  'lpFxSplash', 'lpFxSlow', 'lpFxPoison', 'lpFxChain', 'lpAbilityTag',
  'lpColTower', 'lpColEnemy', 'lpKillTag', 'lpEmptyHint', 'lpSimulating', 'lpPlayBtn', 'lpClickSelect', 'lpSpecialAbility',
  'lpReset', 'lpResetTitle', 'lpWaveModeHint', 'lpPathModeHint', 'lpDefaultHint', 'lpWaitWaveSpawn',
  'lpWaveProgress', 'lpAutoCycle', 'lpWaveLockHint',
];

const ZH = {
  mapFsToolSelect: '選取/移動 (1)', mapFsToolBrush: '繪製路徑 (2)', mapFsToolBlock: '障礙格子 (4)', mapFsToolErase: '刪除路徑 (3)',
  mapFsToolUndo: '撤銷 (Ctrl+Z)', mapFsToolRedo: '重做 (Ctrl+Y)', mapFsToolReverse: '反轉路徑', mapFsToolDup: '複製路徑（下移）',
  mapFsToolMirror: '水平對稱', mapFsToolClear: '清空地圖', mapFsToggleFlow: '切換流動預覽', mapFsToggleGrid: '切換網格',
  mapFsNamePh: '輸入名稱...', mapFsHistInitial: '初始狀態', mapFsHistEdit: '路徑編輯 ({count} 點)',
  lpFxSplash: '濺', lpFxSlow: '緩', lpFxPoison: '毒', lpFxChain: '電', lpAbilityTag: '特',
  lpColTower: '塔', lpColEnemy: '敵人', lpKillTag: '擊殺', lpEmptyHint: '添加塔或敵人來預覽',
  lpSimulating: '模擬中', lpPlayBtn: '播放', lpClickSelect: '點擊選擇', lpSpecialAbility: '特殊能力',
  lpReset: '重置', lpResetTitle: '重置血條與路徑', lpWaveModeHint: '波次生成 · 塔鎖定射程內最近敵人',
  lpPathModeHint: '路徑模式 · 塔鎖定最近敵人 · 擊殺後自動重生', lpDefaultHint: '塔鎖定射程內最近敵人 · 擊殺後自動重生',
  lpWaitWaveSpawn: '等待波次生成敵人…',
  lpWaveProgress: '波次 {current}/{total}', lpAutoCycle: '自動循環', lpWaveLockHint: '塔鎖定射程內最近敵人',
};

const EN = {
  mapFsToolSelect: 'Select/move (1)', mapFsToolBrush: 'Draw path (2)', mapFsToolBlock: 'Block tile (4)', mapFsToolErase: 'Erase path (3)',
  mapFsToolUndo: 'Undo (Ctrl+Z)', mapFsToolRedo: 'Redo (Ctrl+Y)', mapFsToolReverse: 'Reverse path', mapFsToolDup: 'Duplicate path (down)',
  mapFsToolMirror: 'Mirror horizontal', mapFsToolClear: 'Clear map', mapFsToggleFlow: 'Toggle flow preview', mapFsToggleGrid: 'Toggle grid',
  mapFsNamePh: 'Enter name...', mapFsHistInitial: 'Initial state', mapFsHistEdit: 'Path edit ({count} pts)',
  lpFxSplash: 'S', lpFxSlow: 'S', lpFxPoison: 'P', lpFxChain: 'C', lpAbilityTag: 'A',
  lpColTower: 'Towers', lpColEnemy: 'Enemies', lpKillTag: 'Kill', lpEmptyHint: 'Add towers or enemies to preview',
  lpSimulating: 'Simulating', lpPlayBtn: 'Play', lpClickSelect: 'Click to select', lpSpecialAbility: 'Special ability',
  lpReset: 'Reset', lpResetTitle: 'Reset HP and path', lpWaveModeHint: 'Wave spawn · towers lock nearest in range',
  lpPathModeHint: 'Path mode · lock nearest · respawn on kill', lpDefaultHint: 'Lock nearest in range · respawn on kill',
  lpWaitWaveSpawn: 'Waiting for wave spawn…',
  lpWaveProgress: 'Wave {current}/{total}', lpAutoCycle: 'Auto cycle', lpWaveLockHint: 'Towers lock nearest in range',
};

const JA = {
  ...EN,
  mapFsToolSelect: '選択/移動 (1)', mapFsToolBrush: '経路描画 (2)', mapFsToolClear: 'マップクリア',
  lpColTower: 'タワー', lpColEnemy: '敵', lpEmptyHint: 'タワーか敵を追加してプレビュー', lpSimulating: 'シミュレーション中', lpPlayBtn: '再生',
};

const KO = {
  ...EN,
  mapFsToolSelect: '선택/이동 (1)', mapFsToolBrush: '경로 그리기 (2)', mapFsToolClear: '맵 지우기',
  lpColTower: '타워', lpColEnemy: '적', lpEmptyHint: '타워나 적을 추가해 미리보기', lpSimulating: '시뮬레이션 중', lpPlayBtn: '재생',
};

const DE = {
  ...EN,
  mapFsToolSelect: 'Auswaehlen (1)', mapFsToolBrush: 'Pfad zeichnen (2)', mapFsToolErase: 'Pfad loeschen (3)',
  mapFsToolUndo: 'Rueckgaengig', mapFsToolClear: 'Karte leeren', lpColTower: 'Tuerme', lpColEnemy: 'Feinde',
  lpEmptyHint: 'Tuerme oder Feinde hinzufuegen', lpSimulating: 'Simulation', lpPlayBtn: 'Abspielen',
};

const FR = {
  ...EN,
  mapFsToolSelect: 'Selection (1)', mapFsToolBrush: 'Tracer chemin (2)', mapFsToolClear: 'Vider carte',
  lpColTower: 'Tours', lpColEnemy: 'Ennemis', lpEmptyHint: 'Ajoutez tours ou ennemis', lpSimulating: 'Simulation', lpPlayBtn: 'Lecture',
};

const MAP = {
  'zh-TW': ZH, 'zh-CN': ZH, en: EN, ja: JA, ko: KO, de: DE, fr: FR, es: EN, ru: EN, pt: EN,
};

export function getMapLpUi(loc) {
  return { ...EN, ...MAP[loc] };
}

export function formatMapLpLines(loc) {
  const d = getMapLpUi(loc);
  return MAP_LP_KEYS.map((k) => `    ${k}: ${JSON.stringify(d[k] ?? EN[k])},`).join('\n');
}
