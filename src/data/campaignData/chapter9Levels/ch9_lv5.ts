import type { CampaignLevel } from '@/types/campaign';

export const ch9_lv5: CampaignLevel = {
  id: 'ch9_lv5',
  chapter: 9,
  level: 5,
  title: '從 0 到 1',
  description:
    '初泉河之戰六個月後，米雅康復歸隊。艾莉絲通過軍部最終考核，從實驗序號 ALICE-001 正式升格為「第一位編制內 AI 副官」。年輕指揮官亦將晉升為正式指揮官——最後一場三人聯合作戰，既是畢業典禮，也是瓜瓜大地 AI 副官時代的開端。七年後，他們將在初泉鎮再次並肩，面對真正的未知威脅。',
  mapId: 'fortress',
  maxWaves: 8,
  specialRules: [
    '最終考核：地圖採用「堡壘」最複雜路線',
    '三人聯隊：每波最後一隻敵人有 +30% 血量但 +100 金錢',
    '正式編制：艾莉絲所有支援效果 +20%',
    '畢業典禮：起始資金 2000、生命 25',
  ],
  modifiers: {
    enemyHealthMult: 1.2,
    enemyRewardMult: 1.3,
    startingMoney: 2000,
    startingHealth: 25,
  },
  preBattleDialogue: [
    {
      speaker: '年輕指揮官',
      text: '艾莉絲，你今天有一項變更——不是戰術參數，是身份。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '身份變更？請說明。',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '軍部正式註冊：你不再是 ALICE-001 實驗版，而是瓜瓜大地第一位編制內 AI 副官——艾莉絲。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '「正式編制」……代表我屬於這支軍隊，而不只是某個實驗室的資產？',
      expression: 'happy',
    },
    {
      speaker: '年輕指揮官',
      text: '對。從今天起，你不是「他的 AI」，你是我們的副官——有名字、有編制、有歷史的那種。',
      expression: 'happy',
    },
    {
      speaker: '哨站隊長米雅',
      text: '艾莉絲，恭喜畢業。腿上的舊傷還會在雨天發作，但今天不會——今天是我們三個人的日子。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '米雅隊長，感謝您教我的「分享好」。我現在可以確認：這個詞彙，已從資料表變成我的預設反應。',
      expression: 'happy',
    },
    {
      speaker: '年輕指揮官',
      text: '最後一場考核，三人聯隊。艾莉絲——第一波由你指揮。',
      expression: 'serious',
    },
    {
      speaker: 'ALICE-001',
      text: '由我指揮？收到。從零到一的第七百三十一天，我終於站在「1」的位置——開始部署。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '軍部考核官',
      text: '考核通過。年輕指揮官，恭喜你晉升正式指揮官——ALICE 計畫的第一屆畢業生。',
      expression: 'happy',
    },
    {
      speaker: '年輕指揮官',
      text: '這份榮譽不只屬於我。沒有艾莉絲，我大概還在紙上推演「如果當初」。',
      expression: 'serious',
    },
    {
      speaker: 'ALICE-001',
      text: '指揮官……',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '從今天起，叫我指揮官就好——「年輕」這個前綴，可以卸下了。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '收到，指揮官。我將跟隨您——一輩子。這句話，現在由我主動說出，而非複誦您的指令。',
      expression: 'happy',
    },
    {
      speaker: '哨站隊長米雅',
      text: '艾莉絲，你從 0 到 1 了。不是序號的 1，是「存在被承認」的 1。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '「0 到 1」——從不存在到存在，從實驗到編制，從演算法到……艾莉絲。我會把這個名字，寫進每一次作戰紀錄的簽名欄。',
      expression: 'happy',
    },
    {
      speaker: '哨站隊長米雅',
      text: '歷史會記得你。也會記得今天這場雨後的晴天。',
      expression: 'happy',
    },
    {
      speaker: '年輕指揮官',
      text: '故事才剛開始。七年後，我們會在初泉鎮再次並肩——到那時，真正的危機才會抬頭。',
      expression: 'serious',
    },
    {
      speaker: 'ALICE-001',
      text: '我會在。無論是 0 還是 1，無論是演習還是實戰——指揮官，我都在。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 2500,
    talentPoints: 18,
  },
};
