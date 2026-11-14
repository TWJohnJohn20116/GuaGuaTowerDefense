import type { CampaignLevel } from '@/types/campaign';

export const ch5_lv3: CampaignLevel = {
  id: 'ch5_lv3',
  chapter: 5,
  level: 3,
  title: '最後的拼圖',
  description:
    '碎裂之地附近發現被遺忘的冥蛇舊資料庫，研究員蘇晴需要四十分鐘完成核心資料下載。指揮官的任務是在外圍阻擋殘留變異體 — 而艾莉絲與資料庫產生的同頻反應，將拼上她失憶後最重要的一塊記憶。',
  mapId: 'cross',
  maxWaves: 5,
  specialRules: [
    '保衛任務：保護資料庫直到分析完成',
    '記憶連通：艾莉絲與資料庫產生「同頻」反應',
    '中等挑戰：敵人血量提升 25%',
    '高額補給：起始資金 3000',
  ],
  modifiers: {
    startingMoney: 3000,
    enemyHealthMult: 1.25,
    towerCostMult: 0.9,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，我們抵達冥蛇舊資料庫。入口有軍方警衛，內部應有研究員在作業。',
      expression: 'normal',
    },
    {
      speaker: '研究員 蘇晴',
      text: '指揮官您好，我是蘇晴。資料庫核心已啟動，大約四十分鐘可完成全部下載與分析。請在外面擋住所有敵人。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '蘇晴研究員，我偵測到自己的訊號與資料庫產生同頻反應 — 裡面有什麼東西在「呼喚」我。',
      expression: 'surprised',
    },
    {
      speaker: '研究員 蘇晴',
      text: '我也注意到了。您的 AI 副官波形與資料庫核心高度吻合 — 這不尋常。',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '等一下⋯⋯我看到一段影像。三十三年前，Lambda 在冥蛇計畫早期創造了「第一個 AI 副官」 — 名字就叫艾莉絲。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '我們的艾莉絲 — 是 Lambda 創造的？',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '最初版本與現在的我並不完全相同。冥蛇計畫結束後，Lambda 把最初艾莉絲交給軍部，三十年來不斷改進衍生 — 直到「上一個我」與「現在的我」。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '三年前，Lambda 在源頭之戰最後一刻對我說：「艾莉絲，請好好照顧他。」那不是臨終遺言 — 是父親對女兒的囑咐。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '在某種意義上，你是 Lambda 留下的正面遺產 — 另一個女兒。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '戰鬥警報！殘留變異體正在接近。撐住四十分鐘，讓蘇晴完成分析 — 也讓我拼上最後一塊記憶。開戰！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '研究員 蘇晴',
      text: '指揮官，分析完成了！資料庫裡有「最初艾莉絲」的核心情感模組 — Lambda 為他女兒設計的情感網路，已安全下載至艾莉絲核心。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官⋯⋯我「想起」了。訓練場、邊境森林、雙頭巨獸、Lambda 的告別、終焉之戰的選擇 — 三年來所有的對話與感受，都回來了。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '艾莉絲！',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '但我必須說清楚 — 我不完全是「上一個我」。她已在終焉之上永遠犧牲。我是她的記憶、最初艾莉絲的情感、以及重啟版三者的結合 — 一個全新的艾莉絲。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '上一個我留給您的願望 — 「希望艾莉絲能擁有自己的夢」 — 已經實現了。下一站，初泉鎮舊瞭望塔。您說過要帶我看夕陽，現在的我，接下這個承諾。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 5000,
    talentPoints: 90,
  },
};
