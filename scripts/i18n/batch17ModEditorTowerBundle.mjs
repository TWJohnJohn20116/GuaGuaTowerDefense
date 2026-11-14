/** batch17：Mod 編輯器塔模型 + 進階面板 i18n */
export const TOWER_KEYS = [
  'tmBasic', 'tmSniper', 'tmCannon', 'tmMachine', 'tmShotgun', 'tmFrost', 'tmPoison',
  'tmLaser', 'tmLightning', 'tmFlame', 'tmWind', 'tmMoney', 'tmPulse', 'tmBallista',
  'twPreview3dTitle', 'twPreview3dHint', 'twCustom3dTitle', 'twCustom3dActive', 'twCustom3dOpen',
  'twCustom3dContinue', 'twCustom3dClear', 'twCustom3dDesc', 'twBaseModelTitle', 'twBaseModelHint',
  'twBaseModelHintOff', 'twVisualTitle', 'twVisualHint', 'twVisualHintOff', 'twModelScale',
  'twModelScaleNote', 'twBarrelLength', 'twBarrelNote', 'twGlowTitle', 'twGlowHint', 'twGlowColor',
  'twGlowIntensity', 'twProjectileTitle', 'twProjectileHint', 'twProjectileSpeed', 'twProjectileSize',
];

const ZH = {
  tmBasic: '基礎塔', tmSniper: '狙擊塔', tmCannon: '加農炮', tmMachine: '機槍塔', tmShotgun: '霰彈塔',
  tmFrost: '冰凍塔', tmPoison: '毒塔', tmLaser: '雷射塔', tmLightning: '電擊塔', tmFlame: '火焰塔',
  tmWind: '風暴塔', tmMoney: '錢塔', tmPulse: '脈衝塔', tmBallista: '弩炮塔',
  twPreview3dTitle: '3D 模型預覽', twPreview3dHint: '拖曳旋轉 · 所有調整即時生效',
  twCustom3dTitle: '自訂 3D 模型', twCustom3dActive: '生效中 · {count} 個部件',
  twCustom3dOpen: '打開 3D 模型編輯器', twCustom3dContinue: '繼續編輯自訂模型', twCustom3dClear: '清除',
  twCustom3dDesc: '部件級自由組裝（47 種幾何件），存在時優先於基礎模型與視覺微調，遊戲內同步生效',
  twBaseModelTitle: '基礎模型選擇', twBaseModelHint: '13 種基礎外形', twBaseModelHintOff: '自訂模型生效中 · 此區已停用',
  twVisualTitle: '視覺微調', twVisualHint: '作用於基礎模型', twVisualHintOff: '自訂模型生效中 · 此區已停用',
  twModelScale: '模型大小', twModelScaleNote: '放大時寬度自動限制在地塊內（只長高）',
  twBarrelLength: '砲管長度', twBarrelNote: '上限為標準長度，確保砲口不出地塊',
  twGlowTitle: '發光件光暈', twGlowHint: '基礎與自訂模型皆生效', twGlowColor: '顏色', twGlowIntensity: '強度',
  twProjectileTitle: '投射物參數', twProjectileHint: '攻擊彈道視覺', twProjectileSpeed: '速度', twProjectileSize: '大小',
};

const EN = {
  tmBasic: 'Basic tower', tmSniper: 'Sniper', tmCannon: 'Cannon', tmMachine: 'Machine gun', tmShotgun: 'Shotgun',
  tmFrost: 'Frost', tmPoison: 'Poison', tmLaser: 'Laser', tmLightning: 'Lightning', tmFlame: 'Flame',
  tmWind: 'Wind', tmMoney: 'Money', tmPulse: 'Pulse', tmBallista: 'Ballista',
  twPreview3dTitle: '3D model preview', twPreview3dHint: 'Drag to rotate · live updates',
  twCustom3dTitle: 'Custom 3D model', twCustom3dActive: 'Active · {count} parts',
  twCustom3dOpen: 'Open 3D model editor', twCustom3dContinue: 'Continue editing custom model', twCustom3dClear: 'Clear',
  twCustom3dDesc: 'Part-level assembly (47 shapes); overrides base model and visual tweaks in-game',
  twBaseModelTitle: 'Base model', twBaseModelHint: '13 base shapes', twBaseModelHintOff: 'Custom model active · disabled',
  twVisualTitle: 'Visual tweaks', twVisualHint: 'Applies to base model', twVisualHintOff: 'Custom model active · disabled',
  twModelScale: 'Model scale', twModelScaleNote: 'Width capped to tile when scaling up',
  twBarrelLength: 'Barrel length', twBarrelNote: 'Capped so muzzle stays on tile',
  twGlowTitle: 'Glow emissive', twGlowHint: 'Works on base and custom models', twGlowColor: 'Color', twGlowIntensity: 'Intensity',
  twProjectileTitle: 'Projectile', twProjectileHint: 'Attack trajectory visuals', twProjectileSpeed: 'Speed', twProjectileSize: 'Size',
};

const JA = {
  ...EN,
  tmBasic: '基本タワー', tmSniper: 'スナイパー', tmCannon: 'キャノン', tmMachine: 'マシンガン', tmShotgun: 'ショットガン',
  tmFrost: '氷結', tmPoison: '毒', tmLaser: 'レーザー', tmLightning: '電撃', tmFlame: '炎',
  tmWind: '嵐', tmMoney: 'マネー', tmPulse: 'パルス', tmBallista: 'バリスタ',
  twPreview3dTitle: '3D モデルプレビュー', twPreview3dHint: 'ドラッグで回転 · リアルタイム反映',
  twCustom3dTitle: 'カスタム 3D モデル', twCustom3dActive: '有効 · {count} パーツ',
  twCustom3dOpen: '3D モデルエディタを開く', twCustom3dContinue: 'カスタムモデルを編集続行', twCustom3dClear: 'クリア',
  twCustom3dDesc: 'パーツ単位で組み立て（47形状）。存在時はベースモデルとビジュアル調整より優先',
  twBaseModelTitle: 'ベースモデル', twBaseModelHint: '13種の基本形状', twBaseModelHintOff: 'カスタムモデル有効 · 無効',
  twVisualTitle: 'ビジュアル調整', twVisualHint: 'ベースモデルに適用', twVisualHintOff: 'カスタムモデル有効 · 無効',
  twModelScale: 'モデルサイズ', twModelScaleNote: '拡大時幅はタイル内に制限',
  twBarrelLength: '砲身長', twBarrelNote: '砲口がタイル外に出ない上限',
  twGlowTitle: '発光グロー', twGlowHint: 'ベース/カスタム両方に有効', twGlowColor: '色', twGlowIntensity: '強度',
  twProjectileTitle: '投射物', twProjectileHint: '攻撃弾道の見た目', twProjectileSpeed: '速度', twProjectileSize: 'サイズ',
};

const KO = {
  ...EN,
  tmBasic: '기본 타워', tmSniper: '스나이퍼', tmCannon: '캐논', tmMachine: '기관총', tmShotgun: '샷건',
  tmFrost: '냉동', tmPoison: '독', tmLaser: '레이저', tmLightning: '번개', tmFlame: '화염',
  tmWind: '폭풍', tmMoney: '머니', tmPulse: '펄스', tmBallista: '발리스타',
  twPreview3dTitle: '3D 모델 미리보기', twPreview3dHint: '드래그로 회전 · 실시간 반영',
  twCustom3dTitle: '커스텀 3D 모델', twCustom3dActive: '활성 · {count} 파트',
  twCustom3dOpen: '3D 모델 편집기 열기', twCustom3dContinue: '커스텀 모델 편집 계속', twCustom3dClear: '지우기',
  twCustom3dDesc: '파트 단위 조립(47형상). 있으면 기본 모델·비주얼보다 우선',
  twBaseModelTitle: '기본 모델', twBaseModelHint: '13가지 기본 형상', twBaseModelHintOff: '커스텀 모델 활성 · 비활성',
  twVisualTitle: '비주얼 미세조정', twVisualHint: '기본 모델에 적용', twVisualHintOff: '커스텀 모델 활성 · 비활성',
  twModelScale: '모델 크기', twModelScaleNote: '확대 시 너비는 타일 내로 제한',
  twBarrelLength: '포신 길이', twBarrelNote: '포구가 타일 밖으로 나가지 않도록 상한',
  twGlowTitle: '발광 후광', twGlowHint: '기본·커스텀 모두 적용', twGlowColor: '색', twGlowIntensity: '강도',
  twProjectileTitle: '투사체', twProjectileHint: '공격 궤적 비주얼', twProjectileSpeed: '속도', twProjectileSize: '크기',
};

const MAP = {
  'zh-TW': ZH, 'zh-CN': ZH, en: EN,
  ja: JA,
  ko: KO,
  de: EN, fr: EN, es: EN, ru: EN, pt: EN,
};

export function getTowerUi(loc) {
  return { ...EN, ...MAP[loc] };
}

export function formatTowerUiLines(loc) {
  const d = getTowerUi(loc);
  return TOWER_KEYS.map((k) => `    ${k}: ${JSON.stringify(d[k] ?? EN[k])},`).join('\n');
}
