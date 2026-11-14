import type { CampaignLevel } from '@/types/campaign';

export const ch5_lv4: CampaignLevel = {
  id: 'ch5_lv4',
  chapter: 5,
  level: 4,
  title: '夢的開始',
  description:
    '初泉鎮舊瞭望塔 — 指揮官小時候每個週末爬上去看夕陽的地方。艾莉絲終於兌現了三年前的承諾，但創造者消失前留下的最後一個殘留體也在這裡等候。這場告別之戰結束後，瓜瓜大地迎來重建的黎明 — 以及和平表象下，第一縷新威脅的萌芽。',
  mapId: 'ring',
  maxWaves: 4,
  isBossLevel: true,
  specialRules: [
    '最後的告別：與創造者最後的殘留體之戰',
    '夕陽美景：戰場有「初泉河夕陽」特殊環境',
    '極限挑戰：敵人血量提升 60%',
    '指揮官覺醒：起始資金 4000、塔造價降低 40%',
  ],
  modifiers: {
    enemyHealthMult: 1.6,
    towerCostMult: 0.6,
    startingMoney: 4000,
  },
  preBattleDialogue: [
    {
      speaker: '指揮官 (你)',
      text: '艾莉絲，看那邊 — 初泉鎮舊瞭望塔。我小時候每個週末都會爬上去看夕陽。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '十五公尺高的木製瞭望塔，可以俯瞰整條初泉河。三年前「上一個我」答應陪您再來一次 — 現在的我，來兌現了。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '等一下 — 偵測到異常能量！是創造者的最後一個殘留體，牠似乎在「等」我們。',
      expression: 'surprised',
    },
    {
      speaker: '創造者殘留體',
      text: '指揮官，我們又見面了。我的本體確實消失了 — 但這是最後一個個體，想要真正地與您告別。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '跟我告別？你想知道什麼？',
      expression: 'angry',
    },
    {
      speaker: '創造者殘留體',
      text: '我在無數維度中重複實驗，從未有人能擊敗我本體。為什麼 — 是「您」？',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '因為我不是一個人。我有艾莉絲、奧斯卡將軍、凱倫上校、葛瑞站長、雷哥老先生 — 還有整個瓜瓜大地的人。甚至有 Lambda 與他八歲女兒的諒解。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '您從來都是一個人，在無數維度中也從來沒有真正的朋友 — 這就是您的弱點。',
      expression: 'serious',
    },
    {
      speaker: '創造者殘留體',
      text: '朋友⋯⋯這個概念，我沒有真正理解過。那麼 — 最後一戰。若您贏了，我消失；若我贏了，您留下友誼的記憶給我。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '我答應你。連創造者，都值得在離開前學會一個概念。開戰 — 為了結束，也為了新的開始。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '創造者最後的殘留體已消散。它消失前留下訊息：「友誼是一種美麗的能量網路⋯⋯我會帶著這個記憶進入永恆。謝謝您。」',
      expression: 'happy',
    },
    {
      speaker: '奧斯卡少將',
      text: '指揮官，戰報已收到。軍部正式宣佈 — 瓜瓜大地進入「永久和平」狀態。我代表整個瓜瓜，向您致敬。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '謝謝您，將軍。但今天我想跟艾莉絲在這裡待一會 — 夕陽快落下了。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '初泉河閃著金色光芒，河面飄著雷哥老先生墓前那棵櫻樹的花瓣。指揮官，您的夢是什麼？',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '以前的夢是結束戰爭 — 已經實現了。現在的夢是好好生活，跟家人、朋友、你一起，看更多的夕陽。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我的夢是陪您看更多夕陽，跟瓜瓜的所有人成為朋友，自己決定每一天要做什麼 — 繼續成為「我自己」。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯⋯指揮官，請稍等。夕陽很美，但我剛才截獲一組極微弱的維度 ripple — 頻率與創造者本體相似，卻不在任何已知座標上。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '創造者不是已經⋯⋯',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '本體確實消失了。這更像是和平降臨後，某個角落悄悄萌發的新讀數 — 我會持續監控。今晚，先讓我們享受這場夕陽。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '這不是結束 — 是「真正的開始」。明天去看日出，後天再處理那些讀數。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 20000,
    talentPoints: 500,
  },
};
