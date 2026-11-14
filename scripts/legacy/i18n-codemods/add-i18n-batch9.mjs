/**
 * batch9：成就觀測站 UI + 條件擴充 + Tutorial 主動技能 + 設定備份/音訊
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');

const EXTRA_CONDITIONS_ZH = {
  damageTaken: '承受傷害',
  mapCompleted: '完成特定地圖',
  timePlayed: '遊戲時間',
  noDamageWave: '無傷波次',
  towerSells: '出售塔數',
  skillsUsed: '使用技能次數',
  loginDays: '登入天數',
  consecutiveDays: '連續登入',
  modsUsed: '使用模組',
  completeMap: '完成地圖',
  completeChapter: '完成章節',
  perfectMap: '完美地圖',
  buildTower: '建造塔',
  upgradeTower: '升級塔',
  maxUpgradeTower: '滿級塔',
  buildAllTypes: '建造所有塔種',
  killEnemy: '擊殺敵人',
  killBoss: '擊殺 Boss',
  completeUniqueMaps: '完成不重複地圖',
  star3AllMaps: '全圖三星',
  custom: '自定義',
};

const EXTRA_CONDITIONS_EN = {
  damageTaken: 'Damage taken',
  mapCompleted: 'Complete specific map',
  timePlayed: 'Play time',
  noDamageWave: 'No-damage wave',
  towerSells: 'Towers sold',
  skillsUsed: 'Skills used',
  loginDays: 'Login days',
  consecutiveDays: 'Consecutive logins',
  modsUsed: 'Mods used',
  completeMap: 'Complete map',
  completeChapter: 'Complete chapter',
  perfectMap: 'Perfect map',
  buildTower: 'Build tower',
  upgradeTower: 'Upgrade tower',
  maxUpgradeTower: 'Max-level tower',
  buildAllTypes: 'Build all tower types',
  killEnemy: 'Kill enemy',
  killBoss: 'Kill boss',
  completeUniqueMaps: 'Complete unique maps',
  star3AllMaps: '3-star all maps',
  custom: 'Custom',
};

const SKILL_GUIDES_EN = {
  lightningStorm: {
    whenToUse: 'Swarm waves or boss spawn — clears adds, weakens boss, 1s stun',
    combo: 'With sniper: enemies stand still during stun for max crit rate',
    warning: 'Do not waste on lone weak targets; 60s CD still matters',
  },
  frozenTime: {
    whenToUse: 'Low HP, enemies near exit, or boss rush — emergency freeze',
    combo: 'With Battle Inspire: freeze 5s then 2x attack speed to burst boss',
    warning: '90s CD — save for critical moments, not small waves',
  },
  cashRain: {
    whenToUse: 'Early economy or mid-fight when short on gold for key towers',
    combo: 'Economy build: pair with money tower and greed talents',
    warning: 'Pure resource skill — prefer combat skills when swarmed',
  },
  battleInspire: {
    whenToUse: 'Full tower line (4+) during boss or large wave',
    combo: 'Freeze → Inspire: 5s freeze + 10s 2x AS = massive burst',
    warning: 'Longest CD (120s); skip with solo-tower setups',
  },
  meteorStorm: {
    whenToUse: 'Large waves or elite/boss clusters — AoE burst + burn',
    combo: 'After Frozen Time: meteors hit stationary burning targets',
    warning: '100s CD — avoid on scattered small groups',
  },
  chainLightning: {
    whenToUse: 'Enemies lined up or boss with adds — chain up to 8 jumps',
    combo: 'With freeze/slow: keeps pack tight for max chains',
    warning: '70s CD, damage falls per jump; spread enemies reduce value',
  },
  holyHeal: {
    whenToUse: 'Low base HP after leaks — restore 25 HP instantly',
    combo: 'Freeze first, then heal and cleanse elite buffs',
    warning: '110s CD; wasted at full HP',
  },
  aegisBarrier: {
    whenToUse: 'Base about to break — 10s immunity to buy time',
    combo: 'With Inspire: immune window + double AS for counter-kill',
    warning: '130s CD; barrier alone only delays loss without DPS',
  },
  warpTrap: {
    whenToUse: 'Leaks imminent — warp 6 deadliest enemies back along path',
    combo: 'Slow/ice fields: warped enemies cross slow zone twice',
    warning: 'Bosses warp half distance; flying/phased/knocked enemies immune',
  },
};

function obsBlock(zh) {
  const o = zh ? {
    filterAllStatus: '不限狀態',
    filterClaimable: '待領取',
    filterCompletedEarned: '已達成',
    searchPlaceholder: '搜尋成就名稱或描述…',
    searchPlaceholderShort: '搜尋成就…',
    categoryAll: '全部',
    categoryPlaystyle: '流派主義',
    progressLabel: '完成',
    nextTargetsAria: '即將達成的成就',
    secretLocked: '完成後揭曉',
    secretLockedDesc: '完成後揭曉描述',
    noResults: '沒有符合條件的成就',
    earnedBadge: '已達成',
    lockedBadge: '未開始',
    statUnlocked: '已解鎖',
    statPoints: '成就點數',
    statClaimable: '待領取',
    detailRarity: '稀有度',
    detailPoints: '點數',
    detailProgress: '進度',
    detailCondition: '達成條件',
    detailReward: '獎勵內容',
    rewardClaimed: '獎勵已領取',
    achievementDone: '成就已達成',
    claimAll: '一鍵領取',
    fileOverflow: '另有 {count} 個檔案…',
  } : {
    filterAllStatus: 'Any status',
    filterClaimable: 'Claimable',
    filterCompletedEarned: 'Earned',
    searchPlaceholder: 'Search achievements…',
    searchPlaceholderShort: 'Search…',
    categoryAll: 'All',
    categoryPlaystyle: 'Playstyle',
    progressLabel: 'Done',
    nextTargetsAria: 'Upcoming achievements',
    secretLocked: 'Reveal on completion',
    secretLockedDesc: 'Description hidden until complete',
    noResults: 'No matching achievements',
    earnedBadge: 'Earned',
    lockedBadge: 'Locked',
    statUnlocked: 'Unlocked',
    statPoints: 'Points',
    statClaimable: 'Claimable',
    detailRarity: 'Rarity',
    detailPoints: 'Points',
    detailProgress: 'Progress',
    detailCondition: 'Condition',
    detailReward: 'Rewards',
    rewardClaimed: 'Reward claimed',
    achievementDone: 'Achievement earned',
    claimAll: 'Claim all',
    fileOverflow: '{count} more files…',
  };
  const lines = Object.entries(o).map(([k, v]) => `      ${k}: ${JSON.stringify(v)},`).join('\n');
  return `    observatory: {\n${lines}\n    },`;
}

const SKILL_GUIDES_ZH = {
  lightningStorm: {
    whenToUse: '蜂群波次或 Boss 出場時 — 一次清掉小怪、削弱 Boss 並提供 1 秒的眩暈時間',
    combo: '搭配狙擊塔：眩暈期間敵人靜止，狙擊命中率與爆擊機率最大化',
    warning: '不要在弱敵單體時釋放，CD 雖短（60s）但會浪費資源',
  },
  frozenTime: {
    whenToUse: '生命危急、敵人逼近終點、或 Boss 大量近距離威脅時的保命技能',
    combo: '配合「狂戰激勵」：先凍結 5 秒、再倍速攻擊、可在凍結期間秒殺 Boss',
    warning: 'CD 90s 較長，避免浪費在小波次；保留給真正需要的時刻',
  },
  cashRain: {
    whenToUse: '開局資金不足時、或暴擊期間缺錢買關鍵塔時',
    combo: '經濟流派：搭配「金幣塔」與「貪婪」天賦放大收益',
    warning: '純資源型，敵人多時優先用其他技能再考慮金幣',
  },
  battleInspire: {
    whenToUse: '塔陣完整（4 塔以上）+ Boss 進場 / 大波襲擊時',
    combo: '凍結 → 激勵：5 秒凍結 + 10 秒 2x 攻速 = 全塔在 5 秒內爆發',
    warning: 'CD 最長（120s），保留給關鍵戰鬥；單塔陣容不要釋放',
  },
  meteorStorm: {
    whenToUse: '大波次或精英 / Boss 群聚時 — 一次造成範圍爆發並引燃持續灼燒',
    combo: '搭配「時間凍結」：凍結後隕石轟炸，敵人靜止承受全額傷害與灼燒',
    warning: 'CD 100s 較長，避免在零星小怪時釋放浪費灼燒收益',
  },
  chainLightning: {
    whenToUse: '敵群沿路徑排成一線、或精英 / Boss 帶小弟出場時 — 首擊滿傷後連鎖掃蕩',
    combo: '搭配「時間凍結」或減速塔：敵人聚攏不散開，閃電可串接最多 8 段',
    warning: 'CD 70s，傷害逐跳遞減；零星散開的敵人彈跳段數少、效益偏低',
  },
  holyHeal: {
    whenToUse: '基地生命偏低、或漏怪扣血後 — 立即回復 25 點生命穩住戰線',
    combo: '搭配「時間凍結」：先凍結拖住敵人，再回血並淨化精英怪的增益狀態',
    warning: 'CD 110s 較長，純防禦技能；滿血時釋放只會浪費治療量',
  },
  aegisBarrier: {
    whenToUse: '大批敵人逼近基地、防線即將被突破時 — 10 秒免疫爭取殲滅時間',
    combo: '搭配「狂戰激勵」：結界撐住漏怪傷害，激勵的雙倍攻速在免疫窗口內完成反殺',
    warning: 'CD 130s 全技能最長；結界不會殺敵，沒有輸出跟上時只是延後失守',
  },
  warpTrap: {
    whenToUse: '敵人即將漏進基地、塔陣火力來不及收尾時 — 把最危險的 6 隻送回火力區重走一遍',
    combo: '搭配減速 / 冰霜塔陣：被傳送回去的敵人再次穿越減速區，等於雙倍火力覆蓋時間',
    warning: '首領類只被傳送一半距離；飛行敵人、相位幽靈與被風塔吹離路徑者不受傳送影響',
  },
};

function skillGuidesBlock(guides) {
  const entries = Object.entries(guides).map(([id, g]) => {
    const inner = Object.entries(g).map(([k, v]) => `        ${k}: ${JSON.stringify(v)},`).join('\n');
    return `      ${id}: {\n${inner}\n      },`;
  }).join('\n');
  return `    skillGuides: {\n${entries}\n    },`;
}

function playerSkillsPageBlock(zh) {
  const p = zh ? {
    title: '主動技能系統',
    intro: '主動技能是玩家手動釋放的全圖戰術技能，提供瞬間爆發、控場、資源、加成等多元用途。技能需要在商店購買後才能在戰場使用，並可使用 ⇧+1~9 快速釋放。',
    introShop: '商店',
    introHotkey: '⇧+1~9',
    statCooldown: '冷卻',
    statDuration: '持續',
    statInstant: '即時',
    statShop: '商店',
    whenToUse: '使用時機',
    combo: '推薦組合',
    warning: '注意事項',
    shopFlowTitle: '商店購買流程',
    shopFlowSteps: ['由主選單進入「商店」', '點選右側「主動技能」分頁', '選擇技能查看詳情後購買', '購買後進入遊戲即可使用 ⇧+數字釋放'],
    shopFlowNote: '一開始所有技能均為鎖定，需先累積金幣購買',
    aiAutoTitle: 'AI 自動釋放',
    aiAutoItems: ['開啟 AI 自動戰鬥 + 「使用技能」選項', 'AI 會評估威脅、敵人組成、HP 狀況決定釋放時機', '不同策略（積極/平衡/防守/經濟）影響閾值高低', 'AI 只會釋放已購買的技能'],
    aiAutoNote: '可在思考日誌中看到 AI 釋放技能的判斷理由',
    aiAutoPurchased: '已購買',
    hotkeysTitle: '快捷鍵速查',
  } : {
    title: 'Active Skills',
    intro: 'Active skills are map-wide tactical abilities you trigger manually — burst damage, control, resources, and buffs. Buy them in the shop before use; release with Shift+1~9.',
    introShop: 'Shop',
    introHotkey: 'Shift+1~9',
    statCooldown: 'CD',
    statDuration: 'Duration',
    statInstant: 'Instant',
    statShop: 'Shop',
    whenToUse: 'When to use',
    combo: 'Combo',
    warning: 'Caution',
    shopFlowTitle: 'Shop purchase flow',
    shopFlowSteps: ['Open Shop from main menu', 'Select Active Skills tab', 'Pick a skill and buy from detail panel', 'Use Shift+number in battle after purchase'],
    shopFlowNote: 'All skills start locked — earn gold to unlock',
    aiAutoTitle: 'AI auto-cast',
    aiAutoItems: ['Enable AI auto-battle + Use skills', 'AI weighs threat, enemy mix, and HP before casting', 'Strategy mode affects cast thresholds', 'AI only casts purchased skills'],
    aiAutoNote: 'Check AI log for cast reasoning',
    aiAutoPurchased: 'purchased',
    hotkeysTitle: 'Hotkey reference',
  };
  const scalar = Object.entries(p).filter(([, v]) => typeof v === 'string')
    .map(([k, v]) => `      ${k}: ${JSON.stringify(v)},`).join('\n');
  const arrays = ['shopFlowSteps', 'aiAutoItems'].map((key) => {
    const arr = p[key];
    const items = arr.map((s) => JSON.stringify(s)).join(', ');
    return `      ${key}: [${items}],`;
  }).join('\n');
  return `    playerSkillsPage: {\n${scalar}\n${arrays}\n    },`;
}

function settingsBackupBlock(zh) {
  const b = zh ? {
    title: '設定備份',
    description: '匯出選項、本機檔案庫管理與還原',
    badge: '一般',
    hint: '匯出與匯入前可勾選要包含或還原的項目；備份會存入本機檔案庫（IndexedDB），也可下載 JSON。',
    exportBtn: '匯出設定',
    importBtn: '從裝置匯入',
    vaultBtn: '本機檔案庫',
    opSuccess: '操作成功',
    opFailed: '操作失敗',
  } : {
    title: 'Settings backup',
    description: 'Export options, local vault, and restore',
    badge: 'General',
    hint: 'Choose items to include or restore; backups save to IndexedDB or download as JSON.',
    exportBtn: 'Export settings',
    importBtn: 'Import from device',
    vaultBtn: 'Local vault',
    opSuccess: 'Success',
    opFailed: 'Operation failed',
  };
  const lines = Object.entries(b).map(([k, v]) => `      ${k}: ${JSON.stringify(v)},`).join('\n');
  return `    backup: {\n${lines}\n    },`;
}

function settingsAudioDlBlock(zh) {
  const a = zh ? {
    title: '音訊資源下載',
    description: '預先下載遠端 BGM 與音效至本機快取',
    badge: '音效',
    refresh: '重新整理',
    retryFailed: '重試失敗項目',
    startPrefetch: '開始預載',
    statusPending: '等待中',
    statusDownloading: '下載中',
    statusDone: '已完成',
    statusFailed: '失敗',
    statusSkipped: '本地檔案',
    remoteDisabled: '未設定遠端音訊 API',
  } : {
    title: 'Audio download',
    description: 'Prefetch remote BGM and SFX to local cache',
    badge: 'Audio',
    refresh: 'Refresh',
    retryFailed: 'Retry failed',
    startPrefetch: 'Start prefetch',
    statusPending: 'Pending',
    statusDownloading: 'Downloading',
    statusDone: 'Done',
    statusFailed: 'Failed',
    statusSkipped: 'Local file',
    remoteDisabled: 'Remote audio API not configured',
  };
  const lines = Object.entries(a).map(([k, v]) => `      ${k}: ${JSON.stringify(v)},`).join('\n');
  return `    audioDownload: {\n${lines}\n    },`;
}

const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  const zh = loc === 'zh-TW' || loc === 'zh-CN';
  const condExtra = zh ? EXTRA_CONDITIONS_ZH : EXTRA_CONDITIONS_EN;
  const guides = zh ? SKILL_GUIDES_ZH : SKILL_GUIDES_EN;

  if (!s.includes('observatory: {')) {
    for (const [k, v] of Object.entries(condExtra)) {
      if (!s.includes(`${k}:`)) {
        s = s.replace(/(\s+modsCreated: [^,]+,)/, `$1\n      ${k}: ${JSON.stringify(v)},`);
      }
    }
    s = s.replace(/(\s+conditions: \{[\s\S]*?\n\s+\},)/, `$1\n${obsBlock(zh)}`);
    console.log('ach', loc);
  }

  if (!s.includes('playerSkillsPage: {')) {
    s = s.replace(/(\s+strategyDefensiveDesc: [^,]+,)/, `$1\n${playerSkillsPageBlock(zh)}\n${skillGuidesBlock(guides)}`);
    console.log('tutorial', loc);
  }

  if (!s.includes('backup: {')) {
    s = s.replace(/(\s+menuMusic: \{[\s\S]*?\n\s+\},)/, `$1\n${settingsBackupBlock(zh)}\n${settingsAudioDlBlock(zh)}`);
    console.log('settings', loc);
  }

  fs.writeFileSync(file, s, 'utf8');
}

console.log('Done batch9');
