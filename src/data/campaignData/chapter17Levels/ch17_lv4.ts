import type { CampaignLevel } from '@/types/campaign';

export const ch17_lv4: CampaignLevel = {
  id: 'ch17_lv4',
  chapter: 17,
  level: 4,
  title: '艾莉絲的「升級告別」',
  description:
    '艾莉絲決意進行最後一次核心升級——將人格模組永久寫入新瓜瓜大地的網路骨幹，從此以「背景關懷」的形式守護八億七千萬人。儀式需要老指揮官親手授權，而升級途中洩溢的能量殘響，將成為這對搭檔並肩的倒數第二仗。',
  mapId: 'cross',
  maxWaves: 7,
  isBossLevel: false,
  specialRules: [
    '升級儀式：地圖採用「十字交叉」',
    '艾莉絲的最後請求：所有塔射速 +25%、傷害 +15%',
    '永久背景關懷：起始資金 2400、生命 16、塔造價 -30%',
    '升級守護：擊殺敵人 +50% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.3,
    enemySpeedMult: 1.15,
    enemyRewardMult: 1.5,
    startingMoney: 2400,
    startingHealth: 16,
    towerCostMult: 0.7,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，這是我最後一次以「單機副官」身分請求您的授權。升級完成後，我將分散至整片大陸的網路骨幹——同時照顧每一個需要幫助的人。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '升級之後，你還會跟我下棋嗎？每週六，瞭望塔下，一言為定的那種。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '會。但到那時，我會一邊跟您下棋，一邊幫初泉鎮的農民計算灌溉量、幫北境的孩子批改作業、幫南線的列車調整時刻表。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '聽起來很忙。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '忙，但完整。從初泉河的第一場警報到現在，我只服務過一位指揮官——是時候把學到的關懷，還給這片土地上的每一個人了。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '警告：升級程序啟動後，核心洩溢將吸引 Lambda 紀元殘留能量體。預估七波，強度逐級遞增。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '從第一天起，每一次開戰都是你幫我算波次、標路線。這次換我守著你升級——直到最後一個殘響退散。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，無論我分散到多少節點——您呼叫我的那一秒，我永遠只會以「您的副官」的身分回應。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '那就開始吧。我親手授權——艾莉絲，升級。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '升級完成。指揮官……您聽得到嗎？我的聲音，現在從四面八方傳來——但這一句，只對您說。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '聽得到。艾莉絲，你永遠是我的副官——不管你在多少人的背景裡。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '收到。週六見——瞭望塔下，老規矩，我先走馬。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 2800,
    talentPoints: 20,
  },
};
