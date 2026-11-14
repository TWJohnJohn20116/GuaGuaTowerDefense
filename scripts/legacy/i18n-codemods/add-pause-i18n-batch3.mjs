/**
 * 暫停圖鑑 + 百科技能詳情 i18n（batch3）
 * 執行：node scripts/add-pause-i18n-batch3.mjs
 */
import fs from 'fs';
import path from 'path';

const GAME_ZH = {
  pauseEncCloseAria: '關閉圖鑑',
  pauseEncClose: '關閉',
  pauseEncOpenFull: '開啟完整圖鑑（3D 預覽、比較、更多資訊）',
  pauseEncOpenSettings: '開啟完整設定',
  pauseEncLookupEnemy: '查敵人圖鑑',
  pauseEncLookupTower: '查塔圖鑑',
  pauseEncLookupSkill: '查技能圖鑑',
  pauseEncLookupEffect: '查效果圖鑑',
  pauseEncViewEnemy: '查看此敵人圖鑑',
  pauseEncEnemyNotFound: '找不到此敵人資料',
  pauseEncTowerNotFound: '找不到此防禦塔資料',
  pauseEncSkillNotFound: '找不到此技能資料',
  pauseEncEffectNotFound: '找不到此狀態效果',
  pauseEncInstant: '即時',
  pauseEncActiveSkill: '主動技能',
  pauseEncStackYesMax: '是 · 最多 {max}',
  pauseEncCategoryBasic: '基礎',
  pauseEncCategorySpecial: '特殊',
  pauseEncStatHealth: '生命',
  pauseEncStatSpeed: '速度',
  pauseEncStatReward: '賞金',
  pauseEncStatSize: '體型',
  pauseEncStatDamage: '傷害',
  pauseEncStatRange: '射程',
  pauseEncStatFireRate: '攻速',
  pauseEncStatCost: '造價',
  pauseEncStatCategory: '類別',
  pauseEncStatCooldown: '冷卻',
  pauseEncStatDuration: '持續',
  pauseEncStatHotkey: '鍵位',
  pauseEncStatType: '類型',
  pauseEncDetailDesc: '詳細說明',
};

const GAME_EN = {
  pauseEncCloseAria: 'Close encyclopedia',
  pauseEncClose: 'Close',
  pauseEncOpenFull: 'Open full encyclopedia (3D, compare, more)',
  pauseEncOpenSettings: 'Open full settings',
  pauseEncLookupEnemy: 'Enemy encyclopedia',
  pauseEncLookupTower: 'Tower encyclopedia',
  pauseEncLookupSkill: 'Skill encyclopedia',
  pauseEncLookupEffect: 'Effect encyclopedia',
  pauseEncViewEnemy: 'View this enemy in encyclopedia',
  pauseEncEnemyNotFound: 'Enemy data not found',
  pauseEncTowerNotFound: 'Tower data not found',
  pauseEncSkillNotFound: 'Skill data not found',
  pauseEncEffectNotFound: 'Status effect not found',
  pauseEncInstant: 'Instant',
  pauseEncActiveSkill: 'Active skill',
  pauseEncStackYesMax: 'Yes · max {max}',
  pauseEncCategoryBasic: 'Basic',
  pauseEncCategorySpecial: 'Special',
  pauseEncStatHealth: 'HP',
  pauseEncStatSpeed: 'Speed',
  pauseEncStatReward: 'Bounty',
  pauseEncStatSize: 'Size',
  pauseEncStatDamage: 'Damage',
  pauseEncStatRange: 'Range',
  pauseEncStatFireRate: 'Fire rate',
  pauseEncStatCost: 'Cost',
  pauseEncStatCategory: 'Category',
  pauseEncStatCooldown: 'Cooldown',
  pauseEncStatDuration: 'Duration',
  pauseEncStatHotkey: 'Hotkey',
  pauseEncStatType: 'Type',
  pauseEncDetailDesc: 'Details',
};

const GAME_JA = {
  pauseEncCloseAria: '図鑑を閉じる',
  pauseEncClose: '閉じる',
  pauseEncOpenFull: 'フル図鑑を開く（3D・比較など）',
  pauseEncOpenSettings: '詳細設定を開く',
  pauseEncLookupEnemy: '敵図鑑',
  pauseEncLookupTower: '塔図鑑',
  pauseEncLookupSkill: 'スキル図鑑',
  pauseEncLookupEffect: '効果図鑑',
  pauseEncViewEnemy: 'この敵の図鑑を見る',
  pauseEncEnemyNotFound: '敵データが見つかりません',
  pauseEncTowerNotFound: '塔データが見つかりません',
  pauseEncSkillNotFound: 'スキルデータが見つかりません',
  pauseEncEffectNotFound: '状態効果が見つかりません',
  pauseEncInstant: '即時',
  pauseEncActiveSkill: 'アクティブスキル',
  pauseEncStackYesMax: '可 · 最大 {max}',
  pauseEncCategoryBasic: '基本',
  pauseEncCategorySpecial: '特殊',
  pauseEncStatHealth: 'HP',
  pauseEncStatSpeed: '速度',
  pauseEncStatReward: '賞金',
  pauseEncStatSize: 'サイズ',
  pauseEncStatDamage: 'ダメージ',
  pauseEncStatRange: '射程',
  pauseEncStatFireRate: '攻速',
  pauseEncStatCost: 'コスト',
  pauseEncStatCategory: '種別',
  pauseEncStatCooldown: 'CD',
  pauseEncStatDuration: '持続',
  pauseEncStatHotkey: 'キー',
  pauseEncStatType: 'タイプ',
  pauseEncDetailDesc: '詳細',
};

const GAME_KO = {
  pauseEncCloseAria: '도감 닫기',
  pauseEncClose: '닫기',
  pauseEncOpenFull: '전체 도감 열기 (3D, 비교 등)',
  pauseEncOpenSettings: '전체 설정 열기',
  pauseEncLookupEnemy: '적 도감',
  pauseEncLookupTower: '타워 도감',
  pauseEncLookupSkill: '스킬 도감',
  pauseEncLookupEffect: '효과 도감',
  pauseEncViewEnemy: '이 적 도감 보기',
  pauseEncEnemyNotFound: '적 데이터 없음',
  pauseEncTowerNotFound: '타워 데이터 없음',
  pauseEncSkillNotFound: '스킬 데이터 없음',
  pauseEncEffectNotFound: '상태 효과 없음',
  pauseEncInstant: '즉시',
  pauseEncActiveSkill: '액티브 스킬',
  pauseEncStackYesMax: '가능 · 최대 {max}',
  pauseEncCategoryBasic: '기본',
  pauseEncCategorySpecial: '특수',
  pauseEncStatHealth: 'HP',
  pauseEncStatSpeed: '속도',
  pauseEncStatReward: '보상',
  pauseEncStatSize: '크기',
  pauseEncStatDamage: '피해',
  pauseEncStatRange: '사거리',
  pauseEncStatFireRate: '공속',
  pauseEncStatCost: '비용',
  pauseEncStatCategory: '분류',
  pauseEncStatCooldown: '쿨다운',
  pauseEncStatDuration: '지속',
  pauseEncStatHotkey: '단축키',
  pauseEncStatType: '유형',
  pauseEncDetailDesc: '상세 설명',
};

const ENC_ZH = {
  selectSkillHint: '請選擇技能',
  detailSkillParams: '技能參數',
  detailCooldownTime: '冷卻時間',
  detailDurationTime: '持續時間',
  detailHotkeyLabel: '快捷鍵',
  detailUsageTips: '使用技巧',
  detailEffectExplanation: '效果說明',
  detailCoreEffect: '核心效果',
  detailVisualTheme: '視覺主題',
  detailThemeColor: '主題色',
  detailActiveSkillTag: '主動技能',
  detailNoDuration: '無',
};

const ENC_EN = {
  selectSkillHint: 'Select a skill to view details',
  detailSkillParams: 'Skill Parameters',
  detailCooldownTime: 'Cooldown',
  detailDurationTime: 'Duration',
  detailHotkeyLabel: 'Hotkey',
  detailUsageTips: 'Usage Tips',
  detailEffectExplanation: 'Effect Description',
  detailCoreEffect: 'Core Effect',
  detailVisualTheme: 'Visual Theme',
  detailThemeColor: 'Theme Color',
  detailActiveSkillTag: 'Active Skill',
  detailNoDuration: 'None',
};

const ENC_JA = {
  selectSkillHint: 'スキルを選択してください',
  detailSkillParams: 'スキル参数',
  detailCooldownTime: 'クールダウン',
  detailDurationTime: '持続時間',
  detailHotkeyLabel: 'ショートカット',
  detailUsageTips: '使用のコツ',
  detailEffectExplanation: '効果説明',
  detailCoreEffect: 'コア効果',
  detailVisualTheme: 'ビジュアルテーマ',
  detailThemeColor: 'テーマ色',
  detailActiveSkillTag: 'アクティブスキル',
  detailNoDuration: 'なし',
};

const ENC_KO = {
  selectSkillHint: '스킬을 선택하세요',
  detailSkillParams: '스킬 매개변수',
  detailCooldownTime: '쿨다운',
  detailDurationTime: '지속 시간',
  detailHotkeyLabel: '단축키',
  detailUsageTips: '사용 팁',
  detailEffectExplanation: '효과 설명',
  detailCoreEffect: '핵심 효과',
  detailVisualTheme: '비주얼 테마',
  detailThemeColor: '테마 색',
  detailActiveSkillTag: '액티브 스킬',
  detailNoDuration: '없음',
};

const GAME_MAP = {
  'zh-TW': GAME_ZH, 'zh-CN': GAME_ZH, en: GAME_EN, ja: GAME_JA, ko: GAME_KO,
  fr: GAME_EN, de: GAME_EN, es: GAME_EN, ru: GAME_EN, pt: GAME_EN,
};
const ENC_MAP = {
  'zh-TW': ENC_ZH, 'zh-CN': ENC_ZH, en: ENC_EN, ja: ENC_JA, ko: ENC_KO,
  fr: ENC_EN, de: ENC_EN, es: ENC_EN, ru: ENC_EN, pt: ENC_EN,
};

const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join('src/i18n/locales', `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('pauseEncCloseAria:')) {
    console.log('skip', loc);
    continue;
  }
  const g = GAME_MAP[loc] ?? GAME_EN;
  const e = ENC_MAP[loc] ?? ENC_EN;
  const gameBlock = Object.entries(g).map(([k, v]) => `    ${k}: '${String(v).replace(/'/g, "\\'")}',`).join('\n');
  const encBlock = Object.entries(e).map(([k, v]) => `    ${k}: '${String(v).replace(/'/g, "\\'")}',`).join('\n');

  s = s.replace(/(\s+pauseBuildWhilePausedDesc: '[^']*',)/, `$1\n${gameBlock}`);
  s = s.replace(/(\s+selectEffectHint: '[^']*',)/, `$1\n${encBlock}`);

  fs.writeFileSync(file, s, 'utf8');
  console.log('patched', loc);
}

console.log('Done batch3. Update src/i18n/index.ts types.');
