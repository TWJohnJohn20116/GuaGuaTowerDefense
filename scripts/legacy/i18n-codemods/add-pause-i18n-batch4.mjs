/**
 * 暫停 tab 標籤、敵人特性、技能技巧、塔 3D 預覽 i18n（batch4）
 * 執行：node scripts/add-pause-i18n-batch4.mjs
 */
import fs from 'fs';
import path from 'path';

const SKILL_TIPS_ZH = {
  lightningStorm: [
    '適合對付成團敵人或 Boss 戰前清場',
    '全場眩暈 1 秒可爭取塔集火窗口',
    '冷卻 60 秒，留到高密度波次再用',
  ],
  frozenTime: [
    '凍結 5 秒可阻斷高速衝鋒波次',
    '對 Boss 與極速敵特別有效',
    '冷卻 90 秒，配合已有塔陣集火',
  ],
  cashRain: [
    '經濟落後時快速補上 $300',
    '可用於波次間隙緊急建塔或升級',
    '比輸出型技能更適合長線布局',
  ],
  battleInspire: [
    '全塔攻速 ×2 持續 10 秒',
    'Boss 或混合大波次時爆發輸出',
    '冷卻 120 秒，確保場上塔數足夠再開',
  ],
  meteorStorm: [
    '120 瞬間傷害 + 4 秒每秒 30 灼燒',
    '適合混合敵群與高血量目標',
    '冷卻 100 秒，DOT 可持續施壓',
  ],
  chainLightning: [
    '鎖定強敵後最多彈跳 8 段',
    '敵人聚集時遞減傷害效益最高',
    '0.6 秒眩暈可打斷前排推進',
  ],
  holyHeal: [
    '立即恢復基地 25 生命',
    '同時淨化敵人增益（加速、護盾等）',
    '冷卻 110 秒，殘血守線的保險',
  ],
  aegisBarrier: [
    '10 秒內基地免疫所有傷害',
    '展開瞬間全場減速 50% 持續 2 秒',
    '冷卻 130 秒，Boss 技能或大波前開啟',
  ],
  warpTrap: [
    '把最逼近基地的 6 隻敵人回溯 4 格',
    '落地暈眩 0.8 秒，首領僅傳送一半距離',
    '冷卻 85 秒，通道瓶頸處效果最佳',
  ],
};

const SKILL_TIPS_EN = {
  lightningStorm: [
    'Great for clearing swarms or softening a boss',
    'Global 1s stun buys time for tower focus fire',
    '60s cooldown—save for high-density waves',
  ],
  frozenTime: [
    '5s freeze stops rush waves cold',
    'Especially strong vs bosses and fast units',
    '90s cooldown—pair with an established tower line',
  ],
  cashRain: [
    'Instant $300 when economy falls behind',
    'Use between waves for emergency builds or upgrades',
    'More flexible timing than damage skills',
  ],
  battleInspire: [
    'All towers attack 2× speed for 10 seconds',
    'Burst DPS during bosses or mixed heavy waves',
    '120s cooldown—wait until you have enough towers',
  ],
  meteorStorm: [
    '120 instant damage plus 30/s burn for 4 seconds',
    'Strong vs mixed groups and high-HP targets',
    '100s cooldown—DOT keeps pressure after the hit',
  ],
  chainLightning: [
    'Chains up to 8 jumps from the strongest foe',
    'Best value when enemies cluster together',
    '0.6s stun can interrupt front-line pushes',
  ],
  holyHeal: [
    'Instantly restores 25 base HP',
    'Also purges enemy buffs (haste, shield, etc.)',
    '110s cooldown—emergency lifeline when low',
  ],
  aegisBarrier: [
    'Base takes no damage for 10 seconds',
    'Opening burst slows all enemies 50% for 2 seconds',
    '130s cooldown—use before boss abilities or big waves',
  ],
  warpTrap: [
    'Warps the 6 enemies nearest base 4 tiles back',
    '0.8s daze on landing; bosses warp half distance',
    '85s cooldown—strongest at path choke points',
  ],
};

const SKILL_TIPS_JA = {
  lightningStorm: ['群れやボス前の掃除に有効', '全体1秒スタンで塔の集中砲火を確保', 'CD60秒—高密度ウェーブ用に温存'],
  frozenTime: ['5秒凍結で高速ラッシュを止める', 'ボス・高速敵に特に有効', 'CD90秒—塔列が整ってから'],
  cashRain: ['経済が遅れた時に$300即時補填', 'ウェーブ間の緊急建設・強化に', 'ダメージ系より柔軟なタイミング'],
  battleInspire: ['全塔攻速2倍・10秒', 'ボスや混合大波で火力爆発', 'CD120秒—塔数を確保してから'],
  meteorStorm: ['120即ダメ＋4秒間30/s燃焼', '混合群・高HP向け', 'CD100秒—DOTで継続圧'],
  chainLightning: ['強敵から最大8跳弾', '密集時に減衰ダメが効く', '0.6秒スタンで前線を止める'],
  holyHeal: ['基地HP25即回復', '敵バフ（加速・盾等）も浄化', 'CD110秒—残血時の保険'],
  aegisBarrier: ['10秒間基地無敵', '展開時全体50%減速2秒', 'CD130秒—ボス技・大波前'],
  warpTrap: ['最寄り6体を4マス後退', '着地0.8秒気絶、ボスは半分距離', 'CD85秒—通路のボトルネック向け'],
};

const SKILL_TIPS_KO = {
  lightningStorm: ['떼나 보스전 전 정리에 적합', '전체 1초 기절로 타워 집중 사격', 'CD 60초—고밀도 웨이브용'],
  frozenTime: ['5초 빙결로 고속 러시 차단', '보스·고속 적에 특히 효과', 'CD 90초—타워 라인 확보 후'],
  cashRain: ['경제 뒤처질 때 $300 즉시', '웨이브 사이 긴급 건설·업그레이드', '딜 스킬보다 타이밍 유연'],
  battleInspire: ['전 타워 공속 2배 10초', '보스·혼합 대웨이브 버스트', 'CD 120초—타워 수 확보 후'],
  meteorStorm: ['120 즉시 + 4초간 30/s 화상', '혼합 군집·고HP 대상', 'CD 100초—DOT 지속 압박'],
  chainLightning: ['강적 기준 최대 8연쇄', '적 밀집 시 감쇠 딜 효율', '0.6초 기절로 전선 차단'],
  holyHeal: ['기지 HP 25 즉시 회복', '적 버프(가속·보호막 등) 정화', 'CD 110초—위기 탈출용'],
  aegisBarrier: ['10초간 기지 무적', '전개 시 전체 50% 감속 2초', 'CD 130초—보스·대웨이브 전'],
  warpTrap: ['기지 근접 6기 4칸 후퇴', '착지 0.8초 기절, 보스는 절반', 'CD 85초—병목 구간'],
};

const GAME_ZH = {
  pauseEncTabEnemies: '敵人圖鑑',
  pauseEncTabTowers: '防禦塔圖鑑',
  pauseEncTabSkills: '主動技能',
  pauseEncTabEffects: '狀態效果',
  pauseEncTabDefault: '圖鑑',
  pauseTraitArmorPerHit: '裝甲 -{value}/擊',
  pauseTraitMutatorArmor: '突變裝甲 +{value}',
  pauseTraitShieldMax: '護盾上限 {value}',
  pauseTraitShieldCurrent: '現有護盾 {value}',
  pauseFieldEffectSlow: '減速',
  pauseFieldEffectPoison: '中毒',
  pauseFieldEffectBurn: '燃燒',
  pauseFieldEffectFreeze: '冰凍',
  pauseFieldEffectStun: '眩暈',
  pauseFieldEffectBleed: '流血',
  pauseFieldEffectWeakness: '虛弱',
  pauseFieldEffectRoot: '定身',
};

const GAME_EN = {
  pauseEncTabEnemies: 'Enemy Encyclopedia',
  pauseEncTabTowers: 'Tower Encyclopedia',
  pauseEncTabSkills: 'Active Skills',
  pauseEncTabEffects: 'Status Effects',
  pauseEncTabDefault: 'Encyclopedia',
  pauseTraitArmorPerHit: 'Armor -{value}/hit',
  pauseTraitMutatorArmor: 'Mutator armor +{value}',
  pauseTraitShieldMax: 'Shield cap {value}',
  pauseTraitShieldCurrent: 'Active shield {value}',
  pauseFieldEffectSlow: 'Slow',
  pauseFieldEffectPoison: 'Poison',
  pauseFieldEffectBurn: 'Burn',
  pauseFieldEffectFreeze: 'Freeze',
  pauseFieldEffectStun: 'Stun',
  pauseFieldEffectBleed: 'Bleed',
  pauseFieldEffectWeakness: 'Weakness',
  pauseFieldEffectRoot: 'Root',
};

const GAME_JA = {
  pauseEncTabEnemies: '敵図鑑',
  pauseEncTabTowers: '塔図鑑',
  pauseEncTabSkills: 'アクティブスキル',
  pauseEncTabEffects: '状態効果',
  pauseEncTabDefault: '図鑑',
  pauseTraitArmorPerHit: '装甲 -{value}/撃',
  pauseTraitMutatorArmor: '変異装甲 +{value}',
  pauseTraitShieldMax: 'シールド上限 {value}',
  pauseTraitShieldCurrent: '現シールド {value}',
  pauseFieldEffectSlow: '減速',
  pauseFieldEffectPoison: '毒',
  pauseFieldEffectBurn: '燃焼',
  pauseFieldEffectFreeze: '凍結',
  pauseFieldEffectStun: 'スタン',
  pauseFieldEffectBleed: '出血',
  pauseFieldEffectWeakness: '虚弱',
  pauseFieldEffectRoot: '拘束',
};

const GAME_KO = {
  pauseEncTabEnemies: '적 도감',
  pauseEncTabTowers: '타워 도감',
  pauseEncTabSkills: '액티브 스킬',
  pauseEncTabEffects: '상태 효과',
  pauseEncTabDefault: '도감',
  pauseTraitArmorPerHit: '장갑 -{value}/타',
  pauseTraitMutatorArmor: '돌연변이 장갑 +{value}',
  pauseTraitShieldMax: '보호막 상한 {value}',
  pauseTraitShieldCurrent: '현재 보호막 {value}',
  pauseFieldEffectSlow: '감속',
  pauseFieldEffectPoison: '중독',
  pauseFieldEffectBurn: '화상',
  pauseFieldEffectFreeze: '빙결',
  pauseFieldEffectStun: '기절',
  pauseFieldEffectBleed: '출혈',
  pauseFieldEffectWeakness: '허약',
  pauseFieldEffectRoot: '속박',
};

const ENC_ZH = {
  detail3dPreview: '3D 預覽模型',
  detail3dPreviewSync: '同步攻擊預覽 · Lv.{level}',
};

const ENC_EN = {
  detail3dPreview: '3D Preview Model',
  detail3dPreviewSync: 'Synced attack preview · Lv.{level}',
};

const ENC_JA = {
  detail3dPreview: '3D プレビューモデル',
  detail3dPreviewSync: '攻撃プレビュー同期 · Lv.{level}',
};

const ENC_KO = {
  detail3dPreview: '3D 미리보기 모델',
  detail3dPreviewSync: '공격 미리보기 동기화 · Lv.{level}',
};

const GAME_MAP = {
  'zh-TW': GAME_ZH, 'zh-CN': GAME_ZH, en: GAME_EN, ja: GAME_JA, ko: GAME_KO,
  fr: GAME_EN, de: GAME_EN, es: GAME_EN, ru: GAME_EN, pt: GAME_EN,
};
const ENC_SCALAR_MAP = {
  'zh-TW': ENC_ZH, 'zh-CN': ENC_ZH, en: ENC_EN, ja: ENC_JA, ko: ENC_KO,
  fr: ENC_EN, de: ENC_EN, es: ENC_EN, ru: ENC_EN, pt: ENC_EN,
};
const SKILL_TIPS_MAP = {
  'zh-TW': SKILL_TIPS_ZH, 'zh-CN': SKILL_TIPS_ZH, en: SKILL_TIPS_EN, ja: SKILL_TIPS_JA, ko: SKILL_TIPS_KO,
  fr: SKILL_TIPS_EN, de: SKILL_TIPS_EN, es: SKILL_TIPS_EN, ru: SKILL_TIPS_EN, pt: SKILL_TIPS_EN,
};

function formatSkillTipsBlock(tips) {
  const lines = Object.entries(tips).map(([id, arr]) => {
    const items = arr.map((s) => `'${String(s).replace(/'/g, "\\'")}'`).join(', ');
    return `      ${id}: [${items}],`;
  });
  return `    skillTips: {\n${lines.join('\n')}\n    },`;
}

const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join('src/i18n/locales', `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('pauseEncTabEnemies:')) {
    console.log('skip', loc);
    continue;
  }
  const g = GAME_MAP[loc] ?? GAME_EN;
  const encScalar = ENC_SCALAR_MAP[loc] ?? ENC_EN;
  const tips = SKILL_TIPS_MAP[loc] ?? SKILL_TIPS_EN;

  const gameBlock = Object.entries(g).map(([k, v]) => `    ${k}: '${String(v).replace(/'/g, "\\'")}',`).join('\n');
  const encScalarBlock = Object.entries(encScalar).map(([k, v]) => `    ${k}: '${String(v).replace(/'/g, "\\'")}',`).join('\n');
  const skillTipsBlock = formatSkillTipsBlock(tips);

  s = s.replace(/(\s+pauseEncDetailDesc: '[^']*',)/, `$1\n${gameBlock}`);
  s = s.replace(
    /(\s+detailNoDuration: '[^']*',)/,
    `$1\n${encScalarBlock}\n${skillTipsBlock}`,
  );

  fs.writeFileSync(file, s, 'utf8');
  console.log('patched', loc);
}

console.log('Done batch4. Update src/i18n/index.ts types.');
