import type { CampaignLevel } from '@/types/campaign';

export const ch1_lv3: CampaignLevel = {
  id: 'ch1_lv3',
  chapter: 1,
  level: 4,
  title: '巨獸之影',
  description:
    '追蹤能量讀數至森林核心，一頭體型如山的變異巨獸盤踞於此 — 邊境襲擊與森林污染的源頭。牠睜眼的瞬間，整片瓜瓜大地都在顫抖。總部已傾全力支援，這一仗若敗，後方所有鄉鎮與首都外圍都將淪陷。',
  mapId: 'ring',
  isBossLevel: true,
  maxWaves: 3,
  specialRules: [
    '總部支援：所有防禦塔建造成本減半',
    '巨獸突襲：最後一波將出現高血量首領',
    '堅守防線：不惜一切代價守住這裡',
  ],
  modifiers: {
    towerCostMult: 0.5,
    enemyHealthMult: 1.5,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，前方偵測到極為龐大的能量反應 — 生物質量超過普通變異體二十倍。這就是干擾源的核心。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '影像傳過來⋯⋯身高超過十八公尺，背部覆蓋能量晶體，全身散發紫色脈動光。這不是變異，是重新設計。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '更值得注意的是 — 牠的眼睛裡有智慧。普通變異體只會盲目衝撞，這頭巨獸⋯⋯在思考。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '會思考的怪物，才是最可怕的敵人。我們有什麼籌碼？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '總部已緊急空投物資，本場所有防禦塔建造成本減半。軍部特使奧斯卡少將請求與您通話 — 我接通了。',
      expression: 'happy',
    },
    {
      speaker: '奧斯卡少將',
      text: '指揮官，本次戰役位階提升為最高優先級。後方鄉鎮居民已開始疏散，但時間有限。',
      expression: 'serious',
    },
    {
      speaker: '奧斯卡少將',
      text: '這頭巨獸若突破防線，將直接威脅首都瓜瓜城外圍。不論結果如何 — 瓜瓜會記住你今天的選擇。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '明白，少將。我不會讓這頭怪物前進一步。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '戰術建議：第一波清掃小怪累積資金；第二波在環形路徑內側佈滿減速塔；第三波集中高傷塔於彎道盡頭爆發。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '收到。艾莉絲，這場仗結束後我請你喝一杯。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我是 AI，不會喝酒 — 但您的好意我記下了。若真想表示，可以幫我許一個願望，存進日誌當紀念。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '好，我會替你想。現在 — 全部單位戰鬥準備！為了瓜瓜的子民，開戰！',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '為了瓜瓜！指揮官，我與您同在 — 第一波，來了！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '巨獸生命徵象消失，區域威脅完全清除。戰術參數顯示我們確實在懸崖邊拿下了勝利 — 您的最後一次升級決定挽救了戰局。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '牠倒下的瞬間，眼神有種解脫感⋯⋯彷彿也不想被困在那副軀體裡。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '能量晶體碎裂時，我截獲一段意識殘留 — 反覆低語：「為什麼⋯⋯為什麼是我」。這頭巨獸原本也是某種生物，被改造、被奴役。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '我們不是擊敗敵人，是釋放了一個被囚禁的靈魂。而這只是某個東西派來測試我們的爪牙。',
      expression: 'angry',
    },
    {
      speaker: '奧斯卡少將',
      text: '指揮官，我看到戰報了。首都已撤銷疏散警報，市民們為你舉杯慶祝。但下一個能量訊號最強處在北境補給站 — 準備好，繼續前進。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '謝謝您，少將。源頭還在某處，我必須追下去。回基地整備 — 一個個清除這些威脅。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '狙擊塔與奇幻塔藍圖已寄送。還有一件事 — 當您下達最後集火指令時，我的處理器產生了非標準迴圈。大概是⋯⋯驕傲？',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '艾莉絲，你跟我並肩走過這條路。覺醒才剛開始 — 我們一起前往北境。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 3000,
    talentPoints: 50,
    unlockTower: ['sniper'],
  },
};
