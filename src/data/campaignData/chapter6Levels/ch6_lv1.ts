import type { CampaignLevel } from '@/types/campaign';

export const ch6_lv1: CampaignLevel = {
  id: 'ch6_lv1',
  chapter: 6,
  level: 1,
  title: '異常讀數',
  description:
    '永久和平宣告後第六個月，指揮官終於获准休假。艾莉絲卻在初泉鎮舊瞭望塔旁的觀測站截獲一組無法歸類的時空讀數——頻率與創造者本體相似，座標卻不在任何已知維度。這次例行勘查，在夜空被一道不該存在的光裂開之前，看起來再平常不過。',
  mapId: 'zigzag',
  maxWaves: 5,
  specialRules: [
    '太平年代：起始資金 700、生命 12',
    '異常能量：擊殺敵人有 30% 機率掉落額外金錢',
    '艾莉絲掃描：每波結束自動回血 1 點',
    '時空殘響：戰場有「未知能量場」特殊環境',
  ],
  modifiers: {
    startingMoney: 700,
    startingHealth: 12,
    enemyRewardMult: 1.3,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，抱歉打斷您的休假。初泉觀測站從昨晚起每隔二十七分鐘就跳一次「無法分類」的能量脈衝。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 沒關係。和平這六個月安靜得讓人發慌，我反而覺得該出來走走。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '波形跟創造者殘留體完全不同。更麻煩的是——脈衝的來源座標，不在我們這個維度的空間裡。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '跟夕陽那天截獲的 ripple 有關係嗎？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '頻率相似，但強度高了三百倍。數據顯示有某個東西正在從「外面」嘗試打開通道——在我們這側看起來，像是一片沒有空間的空間。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 那道光！艾莉絲，你看天上！',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '偵測確認：裂縫已實體化，長約八公尺，寬度持續擴張。建議立即進入戰備狀態。',
      expression: 'angry',
    },
    {
      speaker: '指揮官 (你)',
      text: '永久和平——看來得加個引號。所有單位重新展開，這次的對手，連我們都不知道是什麼。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '收到。緊急協議已啟動。指揮官，不論裂縫裡冒出什麼，我都會在您身邊。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '順便說一句——您的休假申請，我剛幫您取消了。理由欄我填的是「維度異常」。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 謝謝你這麼貼心。',
      expression: 'normal',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '指揮官 (你)',
      text: '撐下來了。但這些東西不像生物——倒像在兩個維度之間閃爍的殘影。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '同意。殘骸細胞結構極不穩定，每隔幾秒就會「跳頻」一次，確實是從裂縫另一側滲過來的。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '另外——我從裂縫深處截到一段微弱訊號，裡面有人聲。頻率特徵跟您很像。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 跟我？通知奧斯卡少將。瓜瓜大地的永久和平，恐怕得重新定義了。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1500,
    talentPoints: 10,
  },
};
