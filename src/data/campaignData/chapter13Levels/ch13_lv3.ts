import type { CampaignLevel } from '@/types/campaign';

export const ch13_lv3: CampaignLevel = {
  id: 'ch13_lv3',
  chapter: 13,
  level: 3,
  title: '老指揮官的最後一仗',
  description:
    '王小明二十六歲，在前線遭遇異界第三裂縫的進化生物，戰術被對方學走而潰敗。退休的老指揮官與鏡像兄弟再度穿上軍裝，三代同堂守住這場可能是老一輩的最後一仗。',
  mapId: 'cross',
  maxWaves: 7,
  isBossLevel: true,
  specialRules: [
    '三代同堂：地圖採用「十字交叉」',
    '老兵不死：起始資金 2200、生命 16、塔造價 -25%',
    '異界三度入侵：敵人血量 +40%、速度 +20%、傷害 +25%',
    '父子情：擊殺敵人 +50% 金錢',
    '三代加成：每波結束自動回血 2 點',
  ],
  modifiers: {
    enemyHealthMult: 1.4,
    enemySpeedMult: 1.2,
    enemyRewardMult: 1.5,
    startingMoney: 2200,
    startingHealth: 16,
    towerCostMult: 0.75,
  },
  preBattleDialogue: [
    {
      speaker: '新指揮官 王小明（26 歲）',
      text: '父親⋯ 第三裂縫的敵人學會了我們的戰術，我撐不住了。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '五年沒穿軍裝。我來。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（51 歲）',
      text: '哥，我也來。兩邊是同一個世界，這種時候不分家。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '敵群比上次裂縫之戰進化了三代，會預判我們的布陣節奏。單一指揮官很難應對。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '那就教它們一個學不會的：三個指揮官同時動。北邊我守，南邊鏡像守，中央主線小明帶。',
      expression: 'serious',
    },
    {
      speaker: '新指揮官 王小明（26 歲）',
      text: '中央主線最重要⋯ 父親，這是考驗還是信任？',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '是信任。老指揮官最後一個任務，就是相信下一代。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官（51 歲）',
      text: '它們無法同時預判三條方向。我們一起出招。',
      expression: 'serious',
    },
    {
      speaker: '新指揮官 王小明（26 歲）',
      text: '各單位，三代同堂，開戰。',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '新指揮官 王小明（26 歲）',
      text: '裂縫退散了。父親，北邊那個假撤退誘餌，我從沒見您用過。',
      expression: 'surprised',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '那是鏡像兄弟在失敗時間線裡想出來的招。今天讓他正面用一次，也算平反。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官（51 歲）',
      text: '打輸的智慧也是智慧。哥，這仗算我們一起贏的。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '我正式退了。下次裂縫再開，是你跟你的下一代打，不是我跟你。',
      expression: 'normal',
    },
    {
      speaker: '新指揮官 王小明（26 歲）',
      text: '我還沒結婚呢。',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '人生不只打仗。我希望你比我更早開始過自己的日子。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 2800,
    talentPoints: 18,
  },
};
