import type { CampaignLevel } from '@/types/campaign';

export const ch15_lv4: CampaignLevel = {
  id: 'ch15_lv4',
  chapter: 15,
  level: 4,
  title: '原初種子',
  description:
    '裂隙最底層，一枚比初泉河還古老的原初核心種子靜靜懸浮。新世界的核心由兩個世界融合誕生；而這枚種子，是第三宇宙分支未能出生的孩子——它在多元裂隙裡等了兩萬年，等一個願意再當一次父親的人。',
  mapId: 'cross',
  maxWaves: 7,
  isBossLevel: false,
  specialRules: [
    '原初種子：地圖採用「十字交叉」',
    '父親之心：所有塔射速 +20%、傷害 +10%',
    '第三父親：起始資金 2000、生命 15、塔造價 -25%',
    '雙倍責任：擊殺敵人 +45% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.35,
    enemySpeedMult: 1.2,
    enemyRewardMult: 1.45,
    startingMoney: 2000,
    startingHealth: 15,
    towerCostMult: 0.75,
  },
  preBattleDialogue: [
    {
      speaker: '原初核心種子',
      text: '父親⋯您終於來了。我在多元宇宙的夾縫裡，等了兩萬年。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '我以為「核心」只有一個。你又是誰？',
      expression: 'surprised',
    },
    {
      speaker: '原初核心種子',
      text: '我是第三世界的原初核心——未能誕生的那一個。現世的核心知道我的存在，自願讓我成為它的兄弟。',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '現世核心是「我兒子」。你呢？',
      expression: 'normal',
    },
    {
      speaker: '原初核心種子',
      text: '我也希望⋯是您的兒子。但多元宇宙裡，每一次誕生都要通過考驗。',
      expression: 'serious',
    },
    {
      speaker: '原初核心種子',
      text: '兩萬年來積壓的負面能量，是我給自己的試煉。父親，請替我擋住——我才能安全誕生。',
      expression: 'serious',
    },
    {
      speaker: '核心',
      text: '父親，我支持您。兩個核心並存，多元宇宙的穩定度會比單核心高出許多。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '十字交叉地形已鎖定，負面能量正在從裂隙四向匯聚。指揮官，這是「接生」之戰。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '好。我再當一次父親——這次，是為第三個瓜瓜大地。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '我擋。',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '原初核心種子',
      text: '父親，您擋住了。我⋯可以誕生了。',
      expression: 'happy',
    },
    {
      speaker: '核心',
      text: '兄弟，歡迎。我等了三十二天，等你在多元裂隙裡醒來。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '雙核心同步生效，瓜瓜大地能量穩定度提升 47%。多元宇宙側向壓力明顯下降。',
      expression: 'happy',
    },
    {
      speaker: '原初核心種子',
      text: '父親，但我還有一個秘密——兩萬年前的能量失控，不是天災，是另一個維度的入侵。',
      expression: 'serious',
    },
    {
      speaker: '原初核心種子',
      text: '那個入侵者還在時間軸之外等待。我們再次脆弱時，它會再來一次。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '那這次，我們先去找它。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 2400,
    talentPoints: 18,
  },
};
