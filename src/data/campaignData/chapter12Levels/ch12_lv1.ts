import type { CampaignLevel } from '@/types/campaign';

export const ch12_lv1: CampaignLevel = {
  id: 'ch12_lv1',
  chapter: 12,
  level: 1,
  title: '初泉河童年',
  description:
    '三十五年前，初泉鎮舊瞭望塔下的河岸仍是孩子們的戰場。八歲的指揮官、七歲的米雅和十歲的奧斯卡用木棒與水槍演練守河，誰也沒料到這場「打仗遊戲」三十年後會變成真仗。',
  mapId: 'straight',
  maxWaves: 3,
  specialRules: [
    '童年戰場：地圖採用「直線」最簡單路線',
    '玩玩而已：所有塔射速 +20%、傷害 -20%',
    '小孩遊戲：起始資金 600、生命 10',
    '友誼第一：擊殺敵人 +30% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 0.7,
    enemySpeedMult: 0.9,
    enemyRewardMult: 1.3,
    startingMoney: 600,
    startingHealth: 10,
  },
  preBattleDialogue: [
    {
      speaker: '小奧斯卡（10 歲）',
      text: '聽好了，這條河岸是初泉鎮的地盤。外地來的，一律不准過。',
      expression: 'serious',
    },
    {
      speaker: '小指揮官（8 歲）',
      text: '奧斯卡哥，我站第一排！',
      expression: 'happy',
    },
    {
      speaker: '小米雅（7 歲）',
      text: '我也要打！我帶了藍色水槍，射程比木棒遠！',
      expression: 'happy',
    },
    {
      speaker: '小奧斯卡（10 歲）',
      text: '米雅，妳負責後方醫護。有人中彈就遞 OK 繃。',
      expression: 'normal',
    },
    {
      speaker: '小米雅（7 歲）',
      text: '我才不要當後勤！我比指揮官只小一歲欸！',
      expression: 'angry',
    },
    {
      speaker: '小指揮官（8 歲）',
      text: '米雅的水槍打得更遠，跟我並肩就好。後方交給奧斯卡哥統籌。',
      expression: 'happy',
    },
    {
      speaker: '小米雅（7 歲）',
      text: '真的？那我要打最前面那個戴帽子的！',
      expression: 'happy',
    },
    {
      speaker: '小奧斯卡（10 歲）',
      text: '外地小孩來了，人數比我們多。別慌，按演練的陣型上。',
      expression: 'serious',
    },
    {
      speaker: '小指揮官（8 歲）',
      text: '為了我們的河岸，開戰！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '小米雅（7 歲）',
      text: '贏了！我的水槍真的有用！',
      expression: 'happy',
    },
    {
      speaker: '小奧斯卡（10 歲）',
      text: '漂亮。米雅，妳剛才那一下打得準。',
      expression: 'happy',
    },
    {
      speaker: '小指揮官（8 歲）',
      text: '米雅，妳長大一定會是很厲害的軍人。',
      expression: 'happy',
    },
    {
      speaker: '小米雅（7 歲）',
      text: '我才不要離開這裡。我要守在初泉鎮，哪都不去。',
      expression: 'happy',
    },
    {
      speaker: '小奧斯卡（10 歲）',
      text: '守在這裡也是一種軍人。我們管那叫「哨站長」。',
      expression: 'normal',
    },
    {
      speaker: '小米雅（7 歲）',
      text: '那我長大要當哨站長！指揮官，你要去外面當將軍，回來保護我喔。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 700,
    talentPoints: 5,
  },
};
