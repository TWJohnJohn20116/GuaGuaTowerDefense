import type { CampaignLevel } from '@/types/campaign';

export const ch15_lv1: CampaignLevel = {
  id: 'ch15_lv1',
  chapter: 15,
  level: 1,
  title: '多元裂隙',
  description:
    '核心融合第三十二天，退休指揮官在初泉鎮舊瞭望塔下反覆夢見被火焰吞沒的初泉鎮。那不是普通夢境——是第三個瓜瓜大地在多元宇宙中殘留的求救訊號。夢中座標將他引至東方山脈深處，一處從未出現在任何地圖上的裂隙正緩緩張開。',
  mapId: 'straight',
  maxWaves: 4,
  specialRules: [
    '夢境喚醒：地圖採用「直線」山洞通道',
    '兩萬年回響：所有塔射速 +5%',
    '探尋之旅：起始資金 1300、生命 13',
    '記憶引導：擊殺敵人 +25% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.0,
    enemyRewardMult: 1.25,
    startingMoney: 1300,
    startingHealth: 13,
  },
  preBattleDialogue: [
    {
      speaker: '老指揮官（51 歲）',
      text: '艾莉絲，我又夢到那個初泉鎮——整個鎮子被火吞沒，但天空的顏色不對，像另一個宇宙在燃燒。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，這不是睡眠障礙。您從鏡之湖接收的第三世界記憶，正在主動向外發射共振訊號。',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '共振？意思是——那個「死了兩萬年」的世界，還活著？',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '在多元宇宙學的定義裡，「滅亡」不等於「消失」。它只是退到了我們時間軸的側面，像一本合起來的書。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '訊號源已鎖定：東方山脈，海拔 1847 公尺，一處不在任何現役地圖上的山洞。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '不在地圖上，卻在夢裡。聽起來像有人刻意把入口藏起來，只留給能讀懂記憶的人。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '山洞內偵測到六組微弱生命訊號，以及大量自動防禦程式——推測是第三世界的「守護者」。',
      expression: 'surprised',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '他們等了兩萬年，最後的記憶是火。見到陌生人，第一反應一定是開打。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '建議策略：先證明身分，再談停火。守護者正在接近，指揮官，請佈防。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '好。這一仗不是征服，是敲門。讓他們知道——這次來的不是火，是父親。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '第三世界守護者',
      text: '你們身上的氣息⋯不像兩萬年前那場火。你是誰？',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '我是接收了你們世界記憶的人。你們等的「父親」，是我。',
      expression: 'normal',
    },
    {
      speaker: '第三世界守護者',
      text: '兩萬年⋯我們守著六個「最後的瓜瓜」，在裂隙深處，不知道在等什麼。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，裂隙另一側的時空穩定度正在上升。這扇門，是專門為您打開的。',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '帶路吧。六個瓜瓜，該醒了。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1500,
    talentPoints: 11,
  },
};
