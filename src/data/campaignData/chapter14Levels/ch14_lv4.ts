import type { CampaignLevel } from '@/types/campaign';

export const ch14_lv4: CampaignLevel = {
  id: 'ch14_lv4',
  chapter: 14,
  level: 4,
  title: '竊屍救人',
  description:
    '林石三十八歲，靈魂重組終於成熟。他在敵我戰報中看到一名剛陣亡的指揮官——被軍部當成棄子。林石決定救這個「跟自己父母一樣被用完就丟的人」，卻在實驗室門口撞上想將屍體武器化的腐敗派同行。',
  mapId: 'bridge',
  maxWaves: 6,
  specialRules: [
    '夜半潛入：地圖採用「橋樑」狹窄通道',
    '科學家對決：所有塔射速 +15%',
    '帶屍歸來：起始資金 1500、生命 13',
    '正義之戰：擊殺敵人 +40% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.25,
    enemySpeedMult: 1.15,
    enemyRewardMult: 1.4,
    startingMoney: 1500,
    startingHealth: 13,
  },
  preBattleDialogue: [
    {
      speaker: '重組者',
      text: '前線戰報：敵方指揮官陣亡，軍部內部會議稱「死得剛好」。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '跟我父母一樣——被徵召、被消耗、被遺忘。這次輪到我反過來撿人。',
      expression: 'serious',
    },
    {
      speaker: '腐敗科學家',
      text: '林博士！夜半挾屍，你知道這是重罪嗎？',
      expression: 'angry',
    },
    {
      speaker: '重組者',
      text: '你們也在等這具屍體吧？想拿去做武器化重組？',
      expression: 'serious',
    },
    {
      speaker: '腐敗科學家',
      text: '分一部分給我們，我們替您搞定軍部追殺。這很划算。',
      expression: 'normal',
    },
    {
      speaker: '重組者',
      text: '靈魂重組不是商品。我要救他，不是用他。',
      expression: 'serious',
    },
    {
      speaker: '腐敗科學家',
      text: '那只好硬搶了。反正這具屍體誰拿到都是寶。',
      expression: 'angry',
    },
    {
      speaker: '重組者',
      text: '我父母被軍部帶走三十二年。今天這具屍體，誰也別想再當棋子。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '實驗室防禦系統，啟動。科學家對科學家——開打吧。',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '重組者',
      text: '腐敗派繳械了。屍體安全，七天內完成靈魂重組。',
      expression: 'normal',
    },
    {
      speaker: '重組者',
      text: '醒來之後，我會把軍部的真相全告訴他。讓他自己決定要不要合作。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '若他願意一起掀翻兩邊的謊言，我們就有機會。若他拒絕……我會尊重，讓他安靜地再睡一次。',
      expression: 'normal',
    },
    {
      speaker: '重組者',
      text: '媽媽、爸爸，你們被軍部帶走的那年，我發誓要找到「不讓人白死」的方法。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '三十二年後，第一個實戰對象來了。這次，我不會再弄錯靈魂。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1700,
    talentPoints: 13,
  },
};
