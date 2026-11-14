/** batch18：Mod 編輯器 3D 編輯器 + 圖鑑連結 i18n */
export const M3D_UI_KEYS = [
  'ecLinkView', 'ecLinkAbility',
  'm3dTitle', 'm3dSubtitle', 'm3dUnnamedTower', 'm3dTemplatePh', 'm3dUndo', 'm3dUndoTitle',
  'm3dClear', 'm3dCancel', 'm3dSave', 'm3dAddHint', 'm3dControls1', 'm3dControls2',
  'm3dOutOfTile', 'm3dInTile', 'm3dEmptyParts', 'm3dCopyPart', 'm3dDeletePart',
  'm3dAutoSpinLabel', 'm3dAutoSpinDesc', 'm3dPartsPanel', 'm3dPropsPanel',
  'm3dMaterialLabel', 'm3dPositionLabel', 'm3dRotationLabel', 'm3dScaleLabel',
  'm3dMatMetal', 'm3dMatTrim', 'm3dMatAccent', 'm3dMatGlow', 'm3dMatGold',
  'm3dCatBase', 'm3dCatBody', 'm3dCatWeapon', 'm3dCatEnergy', 'm3dCatDecor',
  'm3dTplClassic', 'm3dTplCrystal', 'm3dTplTesla', 'm3dTplHalo', 'm3dTplBlank',
];

const ZH = {
  ecLinkView: '查看圖鑑說明',
  ecLinkAbility: '圖鑑能力說明',
  m3dTitle: '3D 模型編輯器',
  m3dSubtitle: '{name} · {count} 個部件',
  m3dUnnamedTower: '未命名塔',
  m3dTemplatePh: '套用起手模板...',
  m3dUndo: '撤銷',
  m3dUndoTitle: '撤銷（Ctrl+Z）',
  m3dClear: '清空',
  m3dCancel: '取消',
  m3dSave: '保存模型',
  m3dAddHint: '點擊部件加入場景中央',
  m3dControls1: '左鍵點選部件 · 拖曳沿地面移動 · Shift+拖曳 = 上下移動',
  m3dControls2: '拖空白旋轉視角 · 滾輪縮放 · Ctrl+Z 撤銷 · Delete 刪除選中',
  m3dOutOfTile: '部件可能超出地塊 · 遊戲內自動縮回',
  m3dInTile: '地塊邊界內',
  m3dEmptyParts: '從左側部件庫加入部件',
  m3dCopyPart: '複製部件',
  m3dDeletePart: '刪除部件（Delete）',
  m3dAutoSpinLabel: '持續自轉',
  m3dAutoSpinDesc: '遊戲內繞 Y 軸自轉（葉片 / 水晶 / 懸浮環）',
  m3dPartsPanel: '部件列表',
  m3dPropsPanel: '部件屬性',
  m3dMaterialLabel: '材質',
  m3dPositionLabel: '位置',
  m3dRotationLabel: '旋轉（度）',
  m3dScaleLabel: '縮放',
  m3dMatMetal: '機身',
  m3dMatTrim: '暗件',
  m3dMatAccent: '主色',
  m3dMatGlow: '發光',
  m3dMatGold: '金色',
  m3dCatBase: '底座',
  m3dCatBody: '塔身',
  m3dCatWeapon: '武器',
  m3dCatEnergy: '能量',
  m3dCatDecor: '裝飾',
  m3dTplClassic: '經典砲塔',
  m3dTplCrystal: '水晶尖塔',
  m3dTplTesla: '特斯拉線圈',
  m3dTplHalo: '懸浮光環',
  m3dTplBlank: '空白畫布',
};

const EN = {
  ecLinkView: 'View codex',
  ecLinkAbility: 'Ability codex',
  m3dTitle: '3D model editor',
  m3dSubtitle: '{name} · {count} parts',
  m3dUnnamedTower: 'Unnamed tower',
  m3dTemplatePh: 'Apply starter template...',
  m3dUndo: 'Undo',
  m3dUndoTitle: 'Undo (Ctrl+Z)',
  m3dClear: 'Clear',
  m3dCancel: 'Cancel',
  m3dSave: 'Save model',
  m3dAddHint: 'Click a part to add at center',
  m3dControls1: 'L-click part · drag on ground · Shift+drag = move Y',
  m3dControls2: 'Drag empty to orbit · scroll zoom · Ctrl+Z undo · Delete remove',
  m3dOutOfTile: 'Part may exceed tile · auto-scaled in game',
  m3dInTile: 'Within tile bounds',
  m3dEmptyParts: 'Add parts from the library on the left',
  m3dCopyPart: 'Duplicate part',
  m3dDeletePart: 'Delete part (Delete)',
  m3dAutoSpinLabel: 'Continuous spin',
  m3dAutoSpinDesc: 'Spins on Y axis in-game (blades / crystals / rings)',
  m3dPartsPanel: 'Part list',
  m3dPropsPanel: 'Part properties',
  m3dMaterialLabel: 'Material',
  m3dPositionLabel: 'Position',
  m3dRotationLabel: 'Rotation (deg)',
  m3dScaleLabel: 'Scale',
  m3dMatMetal: 'Hull',
  m3dMatTrim: 'Trim',
  m3dMatAccent: 'Accent',
  m3dMatGlow: 'Glow',
  m3dMatGold: 'Gold',
  m3dCatBase: 'Base',
  m3dCatBody: 'Body',
  m3dCatWeapon: 'Weapon',
  m3dCatEnergy: 'Energy',
  m3dCatDecor: 'Decor',
  m3dTplClassic: 'Classic turret',
  m3dTplCrystal: 'Crystal spire',
  m3dTplTesla: 'Tesla coil',
  m3dTplHalo: 'Floating halo',
  m3dTplBlank: 'Blank canvas',
};

const JA = {
  ...EN,
  ecLinkView: '図鑑を見る',
  ecLinkAbility: '能力図鑑',
  m3dTitle: '3D モデルエディタ',
  m3dUnnamedTower: '無名タワー',
  m3dSave: 'モデル保存',
  m3dCatBase: 'ベース',
  m3dCatBody: '塔身',
  m3dTplClassic: 'クラシック砲塔',
};

const KO = {
  ...EN,
  ecLinkView: '도감 보기',
  ecLinkAbility: '능력 도감',
  m3dTitle: '3D 모델 편집기',
  m3dUnnamedTower: '이름 없는 타워',
  m3dSave: '모델 저장',
};

const MAP = {
  'zh-TW': ZH, 'zh-CN': ZH, en: EN, ja: JA, ko: KO,
  de: EN, fr: EN, es: EN, ru: EN, pt: EN,
};

export function getM3dUi(loc) {
  return { ...EN, ...MAP[loc] };
}

export function formatM3dUiLines(loc) {
  const d = getM3dUi(loc);
  return M3D_UI_KEYS.map((k) => `    ${k}: ${JSON.stringify(d[k] ?? EN[k])},`).join('\n');
}

export const M3D_CAT_KEYS = ['m3dCatBase', 'm3dCatBody', 'm3dCatWeapon', 'm3dCatEnergy', 'm3dCatDecor'];
export const M3D_TPL_KEYS = ['m3dTplClassic', 'm3dTplCrystal', 'm3dTplTesla', 'm3dTplHalo', 'm3dTplBlank'];
export const M3D_MAT_KEYS = ['m3dMatMetal', 'm3dMatTrim', 'm3dMatAccent', 'm3dMatGlow', 'm3dMatGold'];
