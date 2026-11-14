/** batch12-B：ModEditor 預設值與額外 key */

const ZH = {
  defaultModName: '我的 Mod',
  defaultModDesc: '自訂 Mod',
  defaultAuthor: '作者',
  customTag: '自訂',
  newTower: '新塔',
  newEnemy: '新敵人',
  newMap: '新地圖',
  newWaveSet: '新波次組',
  customTower: '自訂塔',
  customEnemy: '自訂敵人',
  customMap: '自訂地圖',
  customWave: '自訂波次',
  fromTemplateTower: '基於模板建立的塔',
  fromTemplateEnemy: '基於模板建立的敵人',
  customSuffix: ' (自訂)',
  duplicateSuffix: ' (副本)',
  formatError: '格式錯誤',
  downloadStarted: '開始下載檔案！',
  downloadFile: '下載檔案',
  importOverlayHint: '從 JSON 檔案或貼上內容匯入，將覆蓋目前的內容',
  importClickChange: '點擊更換檔案',
  importSelectJson: '點擊選擇 JSON 檔案',
  importDragDrop: '或將檔案拖放至此',
  importOrPaste: '或貼上 JSON 代碼',
  importConfirmBtn: '確認導入',
  importJsonPh: '{"metadata": {"name": "我的Mod", ...}, "content": {...}}',
  exportTowers: '防禦塔 ({count})',
  exportEnemies: '敵人 ({count})',
  exportMaps: '地圖 ({count})',
};

const ZH_CN = {
  ...ZH,
  defaultModName: '我的 Mod',
  defaultModDesc: '自定义 Mod',
  defaultAuthor: '作者',
  customTag: '自定义',
  newTower: '新塔',
  newEnemy: '新敌人',
  newMap: '新地图',
  newWaveSet: '新波次组',
  customTower: '自定义塔',
  customEnemy: '自定义敌人',
  customMap: '自定义地图',
  customWave: '自定义波次',
  fromTemplateTower: '基于模板建立的塔',
  fromTemplateEnemy: '基于模板建立的敌人',
  customSuffix: ' (自定义)',
  duplicateSuffix: ' (副本)',
  formatError: '格式错误',
  downloadStarted: '开始下载档案！',
  downloadFile: '下载档案',
  importOverlayHint: '从 JSON 档案或贴上内容导入，将覆盖目前的内容',
  importClickChange: '点击更换档案',
  importSelectJson: '点击选择 JSON 档案',
  importDragDrop: '或将档案拖放至此',
  importOrPaste: '或贴上 JSON 代码',
  importConfirmBtn: '确认导入',
};

const EN = {
  defaultModName: 'My Mod',
  defaultModDesc: 'Custom mod',
  defaultAuthor: 'Author',
  customTag: 'custom',
  newTower: 'New tower',
  newEnemy: 'New enemy',
  newMap: 'New map',
  newWaveSet: 'New wave set',
  customTower: 'Custom tower',
  customEnemy: 'Custom enemy',
  customMap: 'Custom map',
  customWave: 'Custom waves',
  fromTemplateTower: 'Tower from template',
  fromTemplateEnemy: 'Enemy from template',
  customSuffix: ' (custom)',
  duplicateSuffix: ' (copy)',
  formatError: 'Invalid format',
  downloadStarted: 'Download started!',
  downloadFile: 'Download file',
  importOverlayHint: 'Import from JSON file or paste; overwrites current content',
  importClickChange: 'Click to change file',
  importSelectJson: 'Click to select JSON file',
  importDragDrop: 'Or drag file here',
  importOrPaste: 'Or paste JSON',
  importConfirmBtn: 'Confirm import',
  importJsonPh: '{"metadata": {"name": "MyMod", ...}, "content": {...}}',
  exportTowers: 'Towers ({count})',
  exportEnemies: 'Enemies ({count})',
  exportMaps: 'Maps ({count})',
};

export function getModDefaults(loc) {
  if (loc === 'zh-TW') return ZH;
  if (loc === 'zh-CN') return ZH_CN;
  if (loc === 'ja') return { ...EN, defaultModName: 'マイ Mod', defaultModDesc: 'カスタム Mod', defaultAuthor: '作者', customTag: 'カスタム', newTower: '新タワー', newEnemy: '新敵', newMap: '新マップ', newWaveSet: '新ウェーブ', customTower: 'カスタムタワー', customEnemy: 'カスタム敵', customMap: 'カスタムマップ', customWave: 'カスタムウェーブ', customSuffix: ' (カスタム)', duplicateSuffix: ' (コピー)', formatError: '形式エラー', downloadFile: 'ダウンロード', importConfirmBtn: 'インポート' };
  if (loc === 'ko') return { ...EN, defaultModName: '내 Mod', defaultModDesc: '커스텀 Mod', defaultAuthor: '작성자', customTag: '커스텀', newTower: '새 타워', newEnemy: '새 적', newMap: '새 맵', newWaveSet: '새 웨이브', customSuffix: ' (커스텀)', duplicateSuffix: ' (복사)', formatError: '형식 오류', downloadFile: '다운로드', importConfirmBtn: '가져오기' };
  if (loc === 'de') return { ...EN, defaultModName: 'Mein Mod', defaultModDesc: 'Eigenes Mod', defaultAuthor: 'Autor', customTag: 'custom', newTower: 'Neuer Turm', newEnemy: 'Neuer Gegner', newMap: 'Neue Karte', newWaveSet: 'Neue Wellen', customSuffix: ' (custom)', duplicateSuffix: ' (Kopie)', formatError: 'Ungültiges Format', downloadFile: 'Herunterladen', importConfirmBtn: 'Importieren' };
  return EN;
}

export function formatModDefaultsBlock(obj, indent = 4) {
  const sp = ' '.repeat(indent);
  return Object.entries(obj)
    .map(([k, v]) => `${sp}${k}: ${JSON.stringify(v)},`)
    .join('\n');
}
