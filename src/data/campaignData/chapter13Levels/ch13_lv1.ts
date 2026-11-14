import type { CampaignLevel } from '@/types/campaign';

export const ch13_lv1: CampaignLevel = {
  id: 'ch13_lv1',
  chapter: 13,
  level: 1,
  title: '新指揮官的第一天',
  description:
    '核心融合二十年後，初泉鎮舊瞭望塔下的木屋裡，退休五年的老指揮官目送養子王小明領取新一代指揮官徽章。這是王森之子第一次獨立指揮實戰，規模不大，但父親會在現場看完全程。',
  mapId: 'zigzag',
  maxWaves: 5,
  specialRules: [
    '新世代戰術：地圖採用「之字形」',
    '父親在場：所有塔射速 +10%、傷害 +5%',
    '初次出戰：起始資金 1500、生命 14',
    '新人光環：擊殺敵人 +25% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.1,
    enemyRewardMult: 1.25,
    startingMoney: 1500,
    startingHealth: 14,
  },
  preBattleDialogue: [
    {
      speaker: '老指揮官（50 歲）',
      text: '小明，今天是你第一場仗。緊張嗎？',
      expression: 'happy',
    },
    {
      speaker: '新指揮官 王小明（25 歲）',
      text: '父親在這裡，我不緊張。但我會自己下每一個決定。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（50 歲）',
      text: '很好。我今天只看，不指揮。你卡住的時候，我也不會提示。',
      expression: 'serious',
    },
    {
      speaker: '新指揮官 王小明（25 歲）',
      text: '⋯ 連一個提示都沒有？',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（50 歲）',
      text: '提示救不了下一場仗。實戰才會。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '小明指揮官，我也會跟著您。協助比例已調降至上一代的七成，其餘靠您自己判斷。',
      expression: 'normal',
    },
    {
      speaker: '新指揮官 王小明（25 歲）',
      text: '艾莉絲奶奶，沒問題。我會自己想的。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '奶奶？從第一次開機算起，我才二十七歲。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（50 歲）',
      text: 'AI 沒有年齡，但跟人相處的時間夠長，叫奶奶不算錯。',
      expression: 'happy',
    },
    {
      speaker: '新指揮官 王小明（25 歲）',
      text: '第一波來了。基礎陣型，各單位就位。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '老指揮官（50 歲）',
      text: '第三波升級慢了一拍。不是錯，是資金還沒轉開。下次試試換塔位置，比硬升級便宜。',
      expression: 'normal',
    },
    {
      speaker: '新指揮官 王小明（25 歲）',
      text: '父親，您三十年都是這樣練出來的？',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（50 歲）',
      text: '每一場仗都教我一點實戰才學得會的東西。明天你自己打，我不會再來現場。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '戰報已送達軍部。第一仗，合格。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（50 歲）',
      text: '但你需要的時候，我會出現。這句話不算提示，是承諾。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 1500,
    talentPoints: 10,
  },
};
