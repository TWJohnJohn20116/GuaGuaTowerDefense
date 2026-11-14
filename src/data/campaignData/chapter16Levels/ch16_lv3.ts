import type { CampaignLevel } from '@/types/campaign';

export const ch16_lv3: CampaignLevel = {
  id: 'ch16_lv3',
  chapter: 16,
  level: 3,
  title: '兩條時間線的合作',
  description:
    '家園保衛戰後，兩條時間線開始互通——老指揮官學會了麵包師的節奏感，麵包師也記住了半輩子戰場的判斷力。但頻繁的跨線交流驚動了「時間守護者」，它認定這種干擾會撕裂因果，於是在島嶼分流戰場現身，要求強制關閉通道。兩個指揮官決定並肩抵抗，為「平行家人」爭取繼續對話的權利。',
  mapId: 'island',
  maxWaves: 6,
  specialRules: [
    '時間守衛戰：地圖採用「島嶼」分流',
    '雙線合作：所有塔射速 +15%、傷害 +5%',
    '兩個我：起始資金 1700、生命 14、塔造價 -20%',
    '時間自由：擊殺敵人 +40% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.25,
    enemySpeedMult: 1.15,
    enemyRewardMult: 1.4,
    startingMoney: 1700,
    startingHealth: 14,
    towerCostMult: 0.8,
  },
  preBattleDialogue: [
    {
      speaker: '時間守護者',
      text: '⋯ 兩位「同一個人」，你們的跨時間線交流已超出容許閾值。通道必須關閉。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 誰訂的規則？我打了五十年仗，第一次聽說「兩個我不能互相問好」。',
      expression: 'serious',
    },
    {
      speaker: '時間守護者',
      text: '⋯ 不是人訂的，是自然因果。你們交換得越多，兩條線就越容易互相坍塌。',
      expression: 'normal',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 那自然為什麼允許我們長得一樣、記得同一首兒歌、用同一碗番茄牛肉湯過除夕？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 指揮官，時間守護者本體正在分裂成多路進攻，島嶼戰場的因果鎖鏈已鎖定。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 麵包師，你守北島。我守南島。這次不是誰教誰，是兩個我真正並肩。',
      expression: 'serious',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 好。我這輩子第一次覺得——「另一個我」不是影子，是搭檔。',
      expression: 'happy',
    },
    {
      speaker: '時間守護者',
      text: '⋯ 執行強制終止。你們的對話，到此為止。',
      expression: 'angry',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 那我們就抵抗到底。為兩條時間線的家人，也為「沒選的那條路」還有存在的意義。',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '時間守護者',
      text: '⋯ 我輸了。但規則不會消失——過度干擾仍會被抹除。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 那我們自願遵守新約：不密集交換，不篡改彼此命運，只在必要時互相伸手。',
      expression: 'normal',
    },
    {
      speaker: '時間守護者',
      text: '⋯ 可接受。每年除夕，你們可以共享一頓飯的時間——不多，一小時。',
      expression: 'happy',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 太好了！我太太每年除夕都煮番茄牛肉湯，跟奶奶祕方一模一樣。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 看來不管哪條路，我們都沒忘記家的味道。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 2000,
    talentPoints: 14,
  },
};
