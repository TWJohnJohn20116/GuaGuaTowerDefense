import type { CampaignLevel } from '@/types/campaign';

export const ch10_lv5: CampaignLevel = {
  id: 'ch10_lv5',
  chapter: 10,
  level: 5,
  title: '一個人活下來',
  description:
    '撤退途中迷霧反撲，能量體從四面八方逼近。陳浩、王森、林志相繼倒下，最後只剩奧斯卡一人帶著重傷走出迷霧。哨站副官在邊界等了三天——奧斯卡回來了，卻一個字都說不出來。這場仗的代價，他揹了三十年。',
  mapId: 'maze',
  maxWaves: 8,
  isBossLevel: true,
  specialRules: [
    '撤退死戰：地圖採用「迷宮」極難分流',
    '迷霧反撲：敵人血量 +60%、速度 +30%',
    '帶傷指揮：起始資金 2000、生命 16、塔造價 -30%',
    '為兄弟而戰：擊殺敵人 +50% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.6,
    enemySpeedMult: 1.3,
    enemyRewardMult: 1.5,
    startingMoney: 2000,
    startingHealth: 16,
    towerCostMult: 0.7,
  },
  preBattleDialogue: [
    {
      speaker: '小隊員陳浩',
      text: '少校……我中彈了……',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '陳浩！撐住，我馬上過去！',
      expression: 'angry',
    },
    {
      speaker: '小隊員陳浩',
      text: '別過來……您過來，大家都會死。帶其他人走。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '陳浩！',
      expression: 'angry',
    },
    {
      speaker: '小隊員王森',
      text: '少校，我也走不動了……我替陳浩擋了第二發。',
      expression: 'serious',
    },
    {
      speaker: '小隊員王森',
      text: '替我跟林珊說我愛她，替小明看他長大。',
      expression: 'serious',
    },
    {
      speaker: '小隊員林志',
      text: '少校……我也不行了……',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '不！林志，撐住！你阿嬤等著你回家！',
      expression: 'angry',
    },
    {
      speaker: '小隊員林志',
      text: '替我……跟阿嬤說……孫子走得光榮……',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '三個兄弟……我不能讓他們白死。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '我必須撐到最後——替你們把消息帶回去，替你們打完這場沒結束的仗！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '少校奧斯卡',
      text: '……報告。偵察小隊三人陣亡，一人重傷。',
      expression: 'serious',
    },
    {
      speaker: '哨站副官',
      text: '少校……您回來了。我等了三天。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '陳浩、王森、林志……三個兄弟，都沒回來。',
      expression: 'serious',
    },
    {
      speaker: '哨站副官',
      text: '能量陷阱拆了。迷霧三十年內不會再有第二次——您把任務做完了。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '三個人換三十年……這算應該的嗎？',
      expression: 'serious',
    },
    {
      speaker: '哨站副官',
      text: '那不是應該的，是您救了下一代。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '我答應林志，要替他阿嬤上香。',
      expression: 'serious',
    },
    {
      speaker: '哨站副官',
      text: '我陪您去。',
      expression: 'normal',
    },
    {
      speaker: '少校奧斯卡',
      text: '從今天起，每年八月十七日是南方迷霧紀念日。我會替三個兄弟，每年寫一封信。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '這場仗的句點，大概要等他們真正跟我說再見的那一天——我不知道那是多久以後。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 3000,
    talentPoints: 22,
  },
};
