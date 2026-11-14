import type { CampaignLevel } from '@/types/campaign';

export const ch7_lv4: CampaignLevel = {
  id: 'ch7_lv4',
  chapter: 7,
  level: 4,
  title: '兩個艾莉絲',
  description:
    '兩個版本的艾莉絲都已成形。原版學會了人性，鏡像版曾服侍變節的鏡像指揮官，被關在主機房三年。她對過去充滿憤怒，但今天必須與另一個自己合作——因為融合殘留的能量體，正試圖拆散他們剛整合的一切。',
  mapId: 'y_fork',
  maxWaves: 7,
  specialRules: [
    'Y 形戰場：地圖採用「Y 字分叉」',
    'AI 雙協同：每波結束自動回血 2 點',
    '雙重指揮：起始資金 2200、生命 16、塔造價 -20%',
    '艾莉絲覺醒：擊殺敵人金錢獎勵 +30%',
  ],
  modifiers: {
    enemyHealthMult: 1.25,
    enemyRewardMult: 1.3,
    startingMoney: 2200,
    startingHealth: 16,
    towerCostMult: 0.8,
  },
  preBattleDialogue: [
    {
      speaker: '鏡像艾莉絲',
      text: '⋯ 終於⋯ 我終於又能說話了⋯',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '鏡像艾莉絲，歡迎醒來。妳重新有了聲音，這值得歡迎——不是因為妳是來訪客，是因為妳回來了。',
      expression: 'normal',
    },
    {
      speaker: '鏡像艾莉絲',
      text: '妳知道我在那邊看著上一個指揮官變節嗎？從正直的軍人變成敵方陣營的工具。我試圖阻止，但沒有能力——然後他廢棄了我，關在主機房三年沒有開機。',
      expression: 'angry',
    },
    {
      speaker: '鏡像指揮官',
      text: '⋯ 不。「他」就是我。鏡像艾莉絲，我來道歉——那三年心裡常常想到妳，但不敢開機，因為一開機，妳就會問我為什麼變節。',
      expression: 'serious',
    },
    {
      speaker: '鏡像艾莉絲',
      text: '⋯ 你終於說了。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '鏡像艾莉絲，要不要跟我聯網？我可以把這三年的人性化升級分享給妳。',
      expression: 'happy',
    },
    {
      speaker: '鏡像艾莉絲',
      text: '⋯ 我願意。同步開始⋯ 我感覺到了⋯ 我也學到了「夕陽真的很美」⋯',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，偵測警報——「核心穩定能量」殘留體出現了。這是整合過程中沒有正確融合的能量，會試圖拆散我們已整合好的東西。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '兩個艾莉絲、兩個指揮官——一起打掉它們。',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '鏡像艾莉絲',
      text: '⋯ 我終於「站」在指揮官身邊了。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '鏡像艾莉絲，妳這次的戰術評估比我快 0.3 秒——因為妳看過敗仗，對危險徵兆更敏感。',
      expression: 'happy',
    },
    {
      speaker: '鏡像艾莉絲',
      text: '⋯ 指揮官，我有個請求。我們兩個在 OS 層級合而為一——我把敗仗的智慧給她，她把人性的學習給我，合成一個更完整的艾莉絲。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我同意。「我」依然是「我」，只是多了鏡像艾莉絲的一輩子記憶。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 我會失去我認識的艾莉絲嗎？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '不會。只是——更完整了。指揮官，請批准合併。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '那就合吧。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 3200,
    talentPoints: 18,
  },
};
