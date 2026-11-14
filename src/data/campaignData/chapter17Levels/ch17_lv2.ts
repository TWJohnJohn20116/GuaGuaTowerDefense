import type { CampaignLevel } from '@/types/campaign';

export const ch17_lv2: CampaignLevel = {
  id: 'ch17_lv2',
  chapter: 17,
  level: 2,
  title: '米雅的最後一鍋湯',
  description:
    '五十九歲的米雅身體已不允許長期站哨，卻仍堅持親手煮最後一鍋番茄牛肉湯——這道餵飽過無數前線士兵的祕方，要在退休前分給整座初泉鎮。湯滾起的前夜，軍部新派系派人潛入，意圖在鍋裡下毒，順便剝奪林芳的繼承資格。',
  mapId: 'corridor',
  maxWaves: 5,
  specialRules: [
    '湯之保衛戰：地圖採用「長廊」',
    '師徒同心：所有塔射速 +15%、傷害 +10%',
    '米雅的最後招式：起始資金 1700、生命 14、塔造價 -20%',
    '為了湯：擊殺敵人 +40% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.1,
    enemyRewardMult: 1.4,
    startingMoney: 1700,
    startingHealth: 14,
    towerCostMult: 0.8,
  },
  preBattleDialogue: [
    {
      speaker: '前哨站長米雅（59 歲）',
      text: '林芳，鍋裡的湯再滾半個鐘頭就好。這鍋湯，我從七歲開始學，守了五十二年。',
      expression: 'normal',
    },
    {
      speaker: '哨站長林芳（39 歲）',
      text: '老師，您該休息了。外面的事交給我——',
      expression: 'serious',
    },
    {
      speaker: '前哨站長米雅（59 歲）',
      text: '不行。他們衝著祕方來，也衝著你來。新派系想證明「民間哨站」該由軍部接管——從這鍋湯下手，最見血。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '偵測到七名武裝人員正沿長廊接近廚房。攜帶不明化學試劑，意圖污染食物供應。',
      expression: 'serious',
    },
    {
      speaker: '哨站長林芳（39 歲）',
      text: '老師，您退到灶後。這是我第一次以哨站長身分獨立指揮——也是您教我的最後一課。',
      expression: 'serious',
    },
    {
      speaker: '前哨站長米雅（59 歲）',
      text: '傻孩子。最後一課，是讓你知道：有些仗不是為了贏，是為了讓後面的人還喝得到一口熱湯。',
      expression: 'happy',
    },
    {
      speaker: '前哨站長米雅（59 歲）',
      text: '陳浩、王森、林志……他們犧牲那年的冬天，我就是用這鍋湯把奧斯卡從迷霧邊緣拉回來的。',
      expression: 'serious',
    },
    {
      speaker: '哨站長林芳（39 歲）',
      text: '那我更不能讓任何人碰這口鍋。',
      expression: 'angry',
    },
    {
      speaker: '前哨站長米雅（59 歲）',
      text: '好。師徒並肩——守到湯滾好為止。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '前哨站長米雅（59 歲）',
      text: '湯好了。林芳，嚐一口——看鹹淡合不合你接手之後的口味。',
      expression: 'happy',
    },
    {
      speaker: '哨站長林芳（39 歲）',
      text: '……跟記憶裡一模一樣。老師，祕方我記全了，一個字都不會少。',
      expression: 'serious',
    },
    {
      speaker: '前哨站長米雅（59 歲）',
      text: '祕方從來不在紙上，在這雙手裡。從今天起，這雙手是你的了。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '入侵者已全部制服，化學試劑已銷毀。初泉鎮明日將如期舉行「最後一鍋湯」分發典禮。',
      expression: 'normal',
    },
  ],
  rewards: {
    coins: 2000,
    talentPoints: 14,
  },
};
