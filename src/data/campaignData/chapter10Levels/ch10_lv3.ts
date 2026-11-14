import type { CampaignLevel } from '@/types/campaign';

export const ch10_lv3: CampaignLevel = {
  id: 'ch10_lv3',
  chapter: 10,
  level: 3,
  title: '迷霧吞噬',
  description:
    '迷霧的真面目終於顯現——不是霧，而是會吞噬意識的能量場。王森看見已故的母親，林志忘記了自己的名字。奧斯卡用呼喊把隊員從幻覺中拉回，卻也聽見了屬於自己的預言：一個遙遠的死亡日期。',
  mapId: 'snake',
  maxWaves: 6,
  specialRules: [
    '幻覺戰場：地圖採用「蛇形」蜿蜒迷霧',
    '意識消蝕：敵人有 20% 機率「閃避」減速效果',
    '緊急應對：起始資金 1500、生命 13',
    '人聲呼叫：擊殺敵人 +30% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.2,
    enemySpeedMult: 1.15,
    enemyRewardMult: 1.3,
    startingMoney: 1500,
    startingHealth: 13,
  },
  preBattleDialogue: [
    {
      speaker: '小隊員王森',
      text: '媽……媽，您怎麼來這裡？',
      expression: 'surprised',
    },
    {
      speaker: '少校奧斯卡',
      text: '王森！清醒過來！你媽十年前就走了，這是迷霧的幻覺！',
      expression: 'angry',
    },
    {
      speaker: '小隊員王森',
      text: '可是她看起來好真……她說要帶我回家……',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '聽我聲音！你叫王森，二十八歲，三年前跟林珊結婚，去年生了兒子小明！',
      expression: 'angry',
    },
    {
      speaker: '小隊員王森',
      text: '林珊……小明……我醒了，少校。',
      expression: 'normal',
    },
    {
      speaker: '小隊員林志',
      text: '我……我叫什麼？',
      expression: 'surprised',
    },
    {
      speaker: '少校奧斯卡',
      text: '林志！米雅介紹進來的學弟，二十二歲，下個月要回鄉見阿嬤！',
      expression: 'angry',
    },
    {
      speaker: '小隊員林志',
      text: '阿嬤……對，我叫林志。',
      expression: 'normal',
    },
    {
      speaker: '迷霧殘響',
      text: '奧斯卡……你會死在二〇四六年八月十七日……',
      expression: 'normal',
    },
    {
      speaker: '少校奧斯卡',
      text: '那是幻覺。死亡日期由不得霧來決定。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '全員集中！找出能量節點，一發解決！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '少校奧斯卡',
      text: '小型能量節點摧毀了。但這片迷霧——不只有一個源頭。',
      expression: 'serious',
    },
    {
      speaker: '小隊員陳浩',
      text: '少校，我們繼續深入嗎？',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '再進一步，還是撤退——我得想清楚。今晚先讓大家休息。',
      expression: 'serious',
    },
    {
      speaker: '小隊員王森',
      text: '隊長，您決定就好。',
      expression: 'normal',
    },
    {
      speaker: '少校奧斯卡',
      text: '這一夜，我大概睡不著了。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1600,
    talentPoints: 11,
  },
};
