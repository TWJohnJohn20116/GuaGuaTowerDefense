import type { CampaignLevel } from '@/types/campaign';

export const ch4_lv3: CampaignLevel = {
  id: 'ch4_lv3',
  chapter: 4,
  level: 3,
  title: 'Lambda 的呼喚',
  description:
    '破曉之巔的舊研究所被紫色能量重新「長」了出來。「創造者」收集 Lambda 的殘留意識，試圖再造一個聽話的源頭。但重組過程讓 Lambda 看清了三十三年實驗的真相——它選擇站在指揮官這一邊。死敵變盟友，這是第四章最震驚的轉折。',
  mapId: 'island',
  maxWaves: 5,
  specialRules: [
    'Lambda 增援：每波結束 Lambda 會提供戰術情報',
    '創造者怒火：敵人血量大幅提升 70%',
    '混合戰場：海陸雙線推進',
    '能量爆發：擊殺懸賞加成 60%',
  ],
  modifiers: {
    enemyHealthMult: 1.7,
    enemyRewardMult: 1.6,
    startingMoney: 2000,
    towerCostMult: 0.85,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，我們抵達破曉之巔。三年前我們夷平這座島嶼，現在它卻像有生命一樣重新長出結構。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '當年這裡只剩廢墟。現在的感覺不像修復，比較像……被什麼東西催著再生。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '「創造者」正在用維度能量重組研究所，並收集 Lambda 殘留意識，準備給它新的形體。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '掃描完成。我偵測到 Lambda 的能量特徵，但波形與三年前完全不同——它在主動呼叫我們，而且沒有敵意。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '沒有敵意的 Lambda？聽起來像陷阱。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我接通訊號。指揮官，請您親耳確認。',
      expression: 'normal',
    },
    {
      speaker: 'Lambda 維恩',
      text: '指揮官，你還活著。我以為三年前你就親手終結了我。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: 'Lambda？你怎麼會——',
      expression: 'surprised',
    },
    {
      speaker: 'Lambda 維恩',
      text: '「創造者」收集了我的能量殘留，把我重新組裝。重組過程讓我看見真相：我這一生只是它的實驗品，艾莉芙的死也是它安排的觸發事件。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '艾莉芙的死……也是它設計的？',
      expression: 'surprised',
    },
    {
      speaker: 'Lambda 維恩',
      text: '我做了它想看到的選擇，變成源頭，傷害了無數瓜瓜居民。它想再用我折磨更多人——我會站在你這一邊，把每波的敵人弱點全部告訴你。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '為什麼幫我？三年前我們是死敵。',
      expression: 'serious',
    },
    {
      speaker: 'Lambda 維恩',
      text: '因為艾莉芙在終焉之戰對你說過謝謝。我看到了。如果這能讓我的贖罪開始，這是我作為 Lambda 維恩最後想做的事。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '第一個情報：本場會派出進化版三頭巨獸。Lambda 同時會在能量網路中擾亂「創造者」的指令。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '三頭巨獸？好，Lambda——開戰。為了艾莉芙，也為了所有被操縱的維度。',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'Lambda 維恩',
      text: '三頭巨獸已擊敗。「創造者」發現我叛變，正在切斷我的能量供給。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: 'Lambda，撐住！',
      expression: 'angry',
    },
    {
      speaker: 'Lambda 維恩',
      text: '別擔心我。我把最後的情報包傳給艾莉絲了——「創造者」的核心是維度橋樑，位置在雄獅大橋上方。',
      expression: 'serious',
    },
    {
      speaker: 'Lambda 維恩',
      text: '指揮官，打敗它之後，請去初泉河紀念碑看看艾莉芙的名字。告訴她，爸爸終於可以見她了。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: 'Lambda 訊號中斷。情報包已解析完畢——我們必須在橋樑完全打開前，趕往雄獅大橋。',
      expression: 'serious',
    },
    {
      speaker: '凱倫上校',
      text: '指揮官，是我。三年沒見了。我與部隊會在大橋上等您，一起結束這場戰爭。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 7000,
    talentPoints: 120,
  },
};
