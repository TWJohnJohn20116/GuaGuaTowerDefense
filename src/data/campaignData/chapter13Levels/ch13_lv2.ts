import type { CampaignLevel } from '@/types/campaign';

export const ch13_lv2: CampaignLevel = {
  id: 'ch13_lv2',
  chapter: 13,
  level: 2,
  title: '米雅哨站的接班',
  description:
    '哨站長米雅五十歲，守了二十五年的番茄牛肉湯與初泉河岸。退休前她要把哨站交給徒弟林芳，卻在邊界遭遇軍部殘黨挑釁。這是她以哨站長身分打的最後一仗。',
  mapId: 'corridor',
  maxWaves: 6,
  specialRules: [
    '退休前最後一仗：地圖採用「長廊」哨站走道',
    '老兵不敗：所有塔射速 +20%、傷害 +10%',
    '經驗值：起始資金 1700、生命 15、塔造價 -20%',
    '師徒同心：擊殺敵人 +30% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.2,
    enemyRewardMult: 1.3,
    startingMoney: 1700,
    startingHealth: 15,
    towerCostMult: 0.8,
  },
  preBattleDialogue: [
    {
      speaker: '哨站長米雅（50 歲）',
      text: '林芳，妳跟了我八年。明天起，這裡由妳接手。',
      expression: 'happy',
    },
    {
      speaker: '林芳（27 歲）',
      text: '老師，我會把哨站守好。',
      expression: 'serious',
    },
    {
      speaker: '哨站長米雅（50 歲）',
      text: '不要替我守。替妳自己守，替林芳這個名字守。',
      expression: 'happy',
    },
    {
      speaker: '林芳（27 歲）',
      text: '警報！邊界有不明部隊接近，編制不像本地駐軍。',
      expression: 'angry',
    },
    {
      speaker: '哨站長米雅（50 歲）',
      text: '軍部殘黨。當年我拒絕遷都，他們記到現在。',
      expression: 'serious',
    },
    {
      speaker: '林芳（27 歲）',
      text: '老師，這仗讓我來。',
      expression: 'serious',
    },
    {
      speaker: '哨站長米雅（50 歲）',
      text: '不。這是我做哨站長的第二十五年，也是最後一仗。妳跟在我身邊看，記住每一個決定。',
      expression: 'serious',
    },
    {
      speaker: '林芳（27 歲）',
      text: '收到。',
      expression: 'serious',
    },
    {
      speaker: '哨站長米雅（50 歲）',
      text: '為了奶奶的湯，也為了林芳的明天。開戰。',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '林芳（27 歲）',
      text: '老師，剛才那招先放敵靠近、再用迴轉射程反打，我從沒見過。',
      expression: 'surprised',
    },
    {
      speaker: '哨站長米雅（50 歲）',
      text: '迷霧戰場的老招。二十五年前，少校奧斯卡教過我，全軍只教過我和指揮官兩個人。',
      expression: 'happy',
    },
    {
      speaker: '林芳（27 歲）',
      text: '那從我開始，變成第三個人會了。哨站名字我不改，還叫米雅哨站，直到我也退休。',
      expression: 'serious',
    },
    {
      speaker: '哨站長米雅（50 歲）',
      text: '好。那米雅這個名字，會一直在這條河岸上。',
      expression: 'happy',
    },
    {
      speaker: '哨站長米雅（50 歲）',
      text: '退休後我打算煮一鍋更大的番茄牛肉湯，請全鎮來吃。人老了，鍋子可以變大。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 1900,
    talentPoints: 13,
  },
};
