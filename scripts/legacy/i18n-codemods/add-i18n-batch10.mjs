/**
 * batch10：主選單/商店/皮膚/結算/Mod/每日挑戰/Tutorial 側欄分組
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');

const MAP = {
  'zh-TW': {
    common: { treeCollapse: '收合', treeExpand: '展開', none: '無' },
    game: {
      retryCampaignLevel: '重試本關',
      effectBuff: '增益',
      effectDebuff: '減益',
      statCooldown: '冷卻',
      statHotkey: '快捷鍵',
    },
    shopToolbar: {
      switchProduct: '切換商品',
      skillCooldown: '冷卻',
      skillDuration: '持續',
      skillInstant: '即時生效',
    },
    tutorialGroups: { basics: '基礎入門', combat: '戰鬥核心', systems: '進階系統' },
    modGrid: {
      emptyNone: '尚未安裝任何 Mod',
      emptyFilter: '沒有符合條件的 Mod',
      importFirst: '匯入第一個 Mod',
      clearFilters: '清除篩選',
    },
    daily: {
      tabToday: '今日挑戰',
      todayHint: '完成左側條件後，於右欄領取獎勵',
      historyHint: '近 30 天完成紀錄一覽',
    },
    skins: {
      previewIdle: '閒置',
      previewAttack: '攻擊',
      compareOn: '關閉對比',
      compareOff: '三欄對比',
      backToSets: '返回套裝列表',
      emptyNoFavorites: '尚無收藏皮膚，點卡片星號加入收藏',
      emptyNoSkinsInSet: '此套裝尚無皮膚',
      emptyNoSets: '尚無可用套裝',
      equippedShort: '已裝',
      addFavorite: '加入收藏',
      favorited: '已收藏',
      defaultAppearance: '預設外觀',
      currentEquipped: '目前裝備',
      unlockToEquip: '完成解鎖條件後可裝備',
      currentlyEquipped: '目前已裝備',
      universalPickTower: '通用皮膚 · 選擇要裝備的塔',
    },
  },
  'zh-CN': {
    common: { treeCollapse: '收合', treeExpand: '展开', none: '无' },
    game: {
      retryCampaignLevel: '重试本关',
      effectBuff: '增益',
      effectDebuff: '减益',
      statCooldown: '冷却',
      statHotkey: '快捷键',
    },
    shopToolbar: {
      switchProduct: '切换商品',
      skillCooldown: '冷却',
      skillDuration: '持续',
      skillInstant: '即时生效',
    },
    tutorialGroups: { basics: '基础入门', combat: '战斗核心', systems: '进阶系统' },
    modGrid: {
      emptyNone: '尚未安装任何 Mod',
      emptyFilter: '没有符合条件的 Mod',
      importFirst: '导入第一个 Mod',
      clearFilters: '清除筛选',
    },
    daily: {
      tabToday: '今日挑战',
      todayHint: '完成左侧条件后，于右栏领取奖励',
      historyHint: '近 30 天完成纪录一览',
    },
    skins: {
      previewIdle: '闲置',
      previewAttack: '攻击',
      compareOn: '关闭对比',
      compareOff: '三栏对比',
      backToSets: '返回套装列表',
      emptyNoFavorites: '尚无收藏皮肤，点卡片星号加入收藏',
      emptyNoSkinsInSet: '此套装尚无皮肤',
      emptyNoSets: '尚无可用套装',
      equippedShort: '已装',
      addFavorite: '加入收藏',
      favorited: '已收藏',
      defaultAppearance: '默认外观',
      currentEquipped: '目前装备',
      unlockToEquip: '完成解锁条件后可装备',
      currentlyEquipped: '目前已装备',
      universalPickTower: '通用皮肤 · 选择要装备的塔',
    },
  },
};

const EN = {
  common: { treeCollapse: 'Collapse', treeExpand: 'Expand', none: 'None' },
  game: {
    retryCampaignLevel: 'Retry level',
    effectBuff: 'Buff',
    effectDebuff: 'Debuff',
    statCooldown: 'Cooldown',
    statHotkey: 'Hotkey',
  },
  shopToolbar: {
    switchProduct: 'Switch item',
    skillCooldown: 'CD',
    skillDuration: 'Duration',
    skillInstant: 'Instant',
  },
  tutorialGroups: { basics: 'Basics', combat: 'Combat', systems: 'Systems' },
  modGrid: {
    emptyNone: 'No mods installed',
    emptyFilter: 'No mods match filters',
    importFirst: 'Import first mod',
    clearFilters: 'Clear filters',
  },
  daily: {
    tabToday: 'Today',
    todayHint: 'Complete conditions on the left, claim reward on the right',
    historyHint: 'Last 30 days completion log',
  },
  skins: {
    previewIdle: 'Idle',
    previewAttack: 'Attack',
    compareOn: 'Close compare',
    compareOff: '3-column compare',
    backToSets: 'Back to sets',
    emptyNoFavorites: 'No favorites yet — star a card to add',
    emptyNoSkinsInSet: 'No skins in this set',
    emptyNoSets: 'No sets available',
    equippedShort: 'On',
    addFavorite: 'Add to favorites',
    favorited: 'Favorited',
    defaultAppearance: 'Default',
    currentEquipped: 'Equipped',
    unlockToEquip: 'Unlock to equip',
    currentlyEquipped: 'Currently equipped',
    universalPickTower: 'Universal skin · pick a tower',
  },
};

function pick(loc) {
  return MAP[loc] ?? EN;
}

function insertAfter(s, anchor, block) {
  if (s.includes(block.trim().split('\n')[0])) return s;
  if (!s.includes(anchor)) return s;
  return s.replace(anchor, `${anchor}\n${block}`);
}

const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  const d = pick(loc);
  let changed = false;

  if (!s.includes('treeCollapse:')) {
    const block = Object.entries(d.common)
      .map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`)
      .join('\n');
    s = insertAfter(s, '    export: ', block);
    changed = true;
  }

  if (!s.includes('retryCampaignLevel:')) {
    const block = Object.entries(d.game)
      .map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`)
      .join('\n');
    s = s.replace(/(\s+quickRetry: [^,]+,)/, `$1\n${block}`);
    changed = true;
  }

  if (!s.includes('switchProduct:')) {
    const block = Object.entries(d.shopToolbar)
      .map(([k, v]) => `      ${k}: ${JSON.stringify(v)},`)
      .join('\n');
    s = s.replace(/(\s+skillsHint: [^,]+,)/, `$1\n${block}`);
    changed = true;
  }

  if (!s.includes('gameTabGroups:')) {
    const g = d.tutorialGroups;
    const block = `    gameTabGroups: {
      basics: ${JSON.stringify(g.basics)},
      combat: ${JSON.stringify(g.combat)},
      systems: ${JSON.stringify(g.systems)},
    },`;
    s = s.replace(/(\s+modTutorial: [^,]+,)/, `$1\n${block}`);
    changed = true;
  }

  if (!s.includes('grid: {') || !s.includes('emptyNone:')) {
    const block = Object.entries(d.modGrid)
      .map(([k, v]) => `      ${k}: ${JSON.stringify(v)},`)
      .join('\n');
    s = s.replace(
      /(\s+modManager: \{[\s\S]*?\s+toolbar: \{[\s\S]*?\n\s+\},)/,
      `$1\n    grid: {\n${block}\n    },`,
    );
    changed = true;
  }

  if (!s.includes('tabToday:')) {
    const block = Object.entries(d.daily)
      .map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`)
      .join('\n');
    s = s.replace(/(\s+rewardClaimed: [^,]+,)/, `$1\n${block}`);
    changed = true;
  }

  if (!s.includes('previewIdle:') && s.includes('noSkins:')) {
    const block = Object.entries(d.skins)
      .map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`)
      .join('\n');
    s = s.replace(/(\s+noSkins: [^,]+,)/, `$1\n${block}`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, s, 'utf8');
    console.log('batch10', loc);
  }
}

console.log('Done batch10');
