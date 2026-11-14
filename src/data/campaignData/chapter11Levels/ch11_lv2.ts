import type { CampaignLevel } from '@/types/campaign';

export const ch11_lv2: CampaignLevel = {
  id: 'ch11_lv2',
  chapter: 11,
  level: 2,
  title: '死亡之日',
  description:
    '「乘勝追擊」變成死亡行軍。軍部情報有誤，敵方主陣地竟是空城誘敵，鏡像指揮官率領的一千人走進真正的伏擊圈。沒有後援、沒有退路、沒有空中支援，在敵營中央，他第一次真正地死去。',
  mapId: 'corridor',
  maxWaves: 7,
  specialRules: [
    '送死之戰：地圖採用「長廊」狹窄走道',
    '彈盡糧絕：所有塔射速 -15%、射程 -10%',
    '無路可退：起始資金 800、生命 8',
    '最後的吼聲：擊殺敵人 +60% 金錢（補給只能靠擊殺）',
  ],
  modifiers: {
    enemyHealthMult: 1.5,
    enemySpeedMult: 1.2,
    enemyRewardMult: 1.6,
    startingMoney: 800,
    startingHealth: 8,
  },
  preBattleDialogue: [
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '奧斯卡，情報錯了。這裡不是主陣地，是伏擊圈——我們被引進來了。',
      expression: 'angry',
    },
    {
      speaker: '鏡像奧斯卡（年輕版）',
      text: '通訊全斷，後援聯絡不上。指揮官，現在撤還來得及嗎？',
      expression: 'angry',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '來不及了。你帶兩百人從西側突圍，我帶剩下的人正面拖住敵軍。',
      expression: 'serious',
    },
    {
      speaker: '鏡像奧斯卡（年輕版）',
      text: '那您呢？',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '我是這一千人的指揮官，指揮官留下。這不是請求，是命令。',
      expression: 'serious',
    },
    {
      speaker: '鏡像奧斯卡（年輕版）',
      text: '我會替您把家鄉的事做完。也會替您跟艾莉絲說——',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '別說了，走！',
      expression: 'angry',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '兄弟們，聽著。沒有後援，沒有退路，但我們還能站。為西邊那兩百人，為所有人的家鄉，把敵軍釘死在這裡！',
      expression: 'angry',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '這一仗大概贏不了。但我們可以讓它變成敵人永遠忘不掉的代價。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '我中彈了……別過來，蹲下，還有敵人。',
      expression: 'serious',
    },
    {
      speaker: '小隊員',
      text: '指揮官！撐住！醫官馬上——',
      expression: 'angry',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '替我告訴艾莉絲，對不起，沒能帶她去看下一個夕陽。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '告訴奧斯卡，責任交給他了。告訴家鄉的人，我盡力了。',
      expression: 'serious',
    },
    {
      speaker: '小隊員',
      text: '指揮官，不要睡，我們還在——',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '兄弟，夕陽快落了。跟我一起走。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1500,
    talentPoints: 13,
  },
};
