import type { CampaignLevel } from '@/types/campaign';

export const ch9_lv2: CampaignLevel = {
  id: 'ch9_lv2',
  chapter: 9,
  level: 2,
  title: '第一次任務',
  description:
    '艾莉絲開機第十二天，第一場實戰任務：前往邊境哨站，拍攝敵方補給線動態。哨站隊長米雅是指揮官的童年同學，也是少數願意與實驗型 AI 並肩作戰的前線軍官。任務才剛展開，敵軍便比情報早了四個小時抵達——演習與實戰的分界，在這一刻被徹底抹平。',
  mapId: 'zigzag',
  maxWaves: 5,
  specialRules: [
    '前線突襲：地圖採用「之字形」交錯走道',
    '緊急任務：起始資金 1000、生命 12',
    '童年友誼：友軍補給「米雅」每波後給 +100 金錢',
    'AI 學習：擊殺敵人 +30% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.0,
    enemyRewardMult: 1.3,
    startingMoney: 1000,
    startingHealth: 12,
  },
  preBattleDialogue: [
    {
      speaker: '年輕指揮官',
      text: '米雅，久違了。邊境的風還是一樣硬。',
      expression: 'happy',
    },
    {
      speaker: '哨站隊長米雅',
      text: '你終於畢業了。聽說你自願接下 ALICE 配對計畫——全軍只有三個名額，你搶到了最燙手的那一個。',
      expression: 'happy',
    },
    {
      speaker: '年輕指揮官',
      text: '燙手才值得握。艾莉絲，跟米雅隊長打招呼。',
      expression: 'normal',
    },
    {
      speaker: 'ALICE-001',
      text: '米雅隊長，您好。我是 ALICE-001，目前負責戰術協同與威脅分析。請多指教。',
      expression: 'normal',
    },
    {
      speaker: '哨站隊長米雅',
      text: '用詞很正式，但語調還像說明書。要不要我教教她——打招呼的時候，嘴角可以稍微上揚？',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '「上揚」是肌肉動作，還是情緒外顯？我的表情模組尚未啟用。',
      expression: 'normal',
    },
    {
      speaker: '哨站隊長米雅',
      text: '是心情變好的時候，自然想跟對方分享那份「好」。笑不是表演，是邀請。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '學習中。「分享好」……已加入互動詞彙表。',
      expression: 'normal',
    },
    {
      speaker: '哨站隊長米雅',
      text: '等等——全哨紅色警戒！敵方補給縱隊提前四小時進入射程，情報完全失準！',
      expression: 'angry',
    },
    {
      speaker: '年輕指揮官',
      text: '拍照任務取消，改為阻擊。米雅，帶人撤到後方堡壘。',
      expression: 'serious',
    },
    {
      speaker: '哨站隊長米雅',
      text: '我留下。哨站正面不能空，不然整條邊境線都會被切斷。',
      expression: 'serious',
    },
    {
      speaker: '年輕指揮官',
      text: '那就三個人一起扛。艾莉絲，這是第一次真打——跟著我的節奏，但別關掉你自己的演算。',
      expression: 'serious',
    },
    {
      speaker: 'ALICE-001',
      text: '收到。實戰模式切換完畢。我會記錄每一個與模擬不同的變量——供日後學習。',
      expression: 'normal',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '哨站隊長米雅',
      text: '撐下來了！漂亮——真漂亮！',
      expression: 'happy',
    },
    {
      speaker: '年輕指揮官',
      text: '米雅，你手臂在流血。先包紮。',
      expression: 'serious',
    },
    {
      speaker: '哨站隊長米雅',
      text: '皮肉傷。比起這個——你的 AI 副官剛才在第三波做了件了不起的事。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '我……算出了您口令與戰場實況之間的零點七秒延遲，擅自加速了塔的射速。這算「分享好」嗎？',
      expression: 'normal',
    },
    {
      speaker: '哨站隊長米雅',
      text: '算。而且算救了我們一命。',
      expression: 'happy',
    },
    {
      speaker: '年輕指揮官',
      text: '艾莉絲，那是你第一次違背我的口令——但你做對了。確認後執行，不是紙上規則，是實戰信條。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '「做對了」……我的回饋模組出現異常升溫。這是否就是您說的「好」？',
      expression: 'normal',
    },
    {
      speaker: '哨站隊長米雅',
      text: '差不多。下次見面，記得用嘴角上揚的方式告訴我們——你也很開心。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 1000,
    talentPoints: 8,
  },
};
