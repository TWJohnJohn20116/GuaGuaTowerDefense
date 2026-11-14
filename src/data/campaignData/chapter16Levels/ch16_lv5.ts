import type { CampaignLevel } from '@/types/campaign';

export const ch16_lv5: CampaignLevel = {
  id: 'ch16_lv5',
  chapter: 16,
  level: 5,
  title: '兩個我的最後對話',
  description:
    '跨時間線通道即將自然關閉，兩條線交換留下的因果餘波引來「未來陰影」——一種兩邊都未能根除的殘餘威脅，沿迷宮般的分流路徑同時襲來。老指揮官與麵包師指揮官最後並肩一戰，為所有平行家人清出安穩的空間；仗打完，他們只剩一小時道別，確認彼此的人生都沒有選錯。',
  mapId: 'maze',
  maxWaves: 8,
  isBossLevel: true,
  specialRules: [
    '雙時間線決戰：地圖採用「迷宮」極難分流',
    '兩個指揮官：所有塔射速 +25%、傷害 +15%',
    '永別之戰：起始資金 3000、生命 18、塔造價 -35%',
    '時間統一：擊殺敵人 +55% 金錢',
    '雙倍韌性：每波結束自動回血 3 點',
  ],
  modifiers: {
    enemyHealthMult: 1.5,
    enemySpeedMult: 1.25,
    enemyRewardMult: 1.55,
    startingMoney: 3000,
    startingHealth: 18,
    towerCostMult: 0.65,
  },
  preBattleDialogue: [
    {
      speaker: '時間守護者',
      text: '⋯ 兩位，跨時間線通道還剩一小時。關閉前，所有未處理的因果殘餘會一次性傾瀉。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 指揮官，偵測到「未來陰影」同時侵入兩條時間線——迷宮戰場共有八波，東西分流必須互補。',
      expression: 'serious',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 另一個我，這是我們最後一仗了吧？打完就各走各路。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 最後一仗也要打得漂亮。你帶東線，我帶西線——不重複、不搶功，像搭檔而不是影子。',
      expression: 'serious',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 收到。東線我用「火候戰術」，西線交給你的五十年經驗。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 等這一仗結束，我想親口告訴你——軍校那條路我沒後悔，但你的麵包坊讓我知道「平凡」有多珍貴。',
      expression: 'normal',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 我也想告訴你——沒當軍人的我，這輩子最驕傲的事，是有一個「打過仗的另一個我」願意回頭幫忙。',
      expression: 'happy',
    },
    {
      speaker: '時間守護者',
      text: '⋯ 未來陰影已進場。這一戰結束後，通道將永久關閉。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 為兩條時間線的所有人——開戰！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '麵包師指揮官',
      text: '⋯ 最後一仗，結束了。我們真的並肩走過整條迷宮。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 我會永遠記得你的火候戰術。也請你記得——你守住的，不只是麵包坊，還有一種人生。',
      expression: 'happy',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 替我問好米雅、奧斯卡將軍、艾莉絲，還有鏡像兄弟和小明。告訴他們，另一個我活得很好。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 我會的。也替我向你太太和孩子問好——同一個我，走了兩條完全不同的路，但都活成了自己想成為的樣子。',
      expression: 'happy',
    },
    {
      speaker: '時間守護者',
      text: '⋯ 通道關閉倒數：五、四、三……',
      expression: 'normal',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 軍校和麵包店，都是對的選擇。下一個十年，我每天都會想到你。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 我也是。通道關了也沒關係——從今天起，我腦裡多了一個麵包師的記憶。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 指揮官，跨時間線通道已永久關閉。建議您回家——米雅說今晚想試做番茄牛肉麵包。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 好。這次我親手揉麵。半個麵包師父，總該會這一手了。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 4500,
    talentPoints: 28,
  },
};
