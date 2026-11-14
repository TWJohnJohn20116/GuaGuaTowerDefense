import type { CampaignLevel } from '@/types/campaign';

export const ch3_lv4: CampaignLevel = {
  id: 'ch3_lv4',
  chapter: 3,
  level: 4,
  title: '迷宮深淵',
  description:
    '「黑曜石」迷宮深處佈滿從未公開的軍用變異體，敵人從未知支路突然現身，隱蔽且致命。能量干擾讓艾莉絲的通訊斷斷續續 — 指揮官必須在黑暗中獨自承擔每一個決定。這是指揮官真正的成人禮，也是接近「源頭」真相的最後關卡。',
  mapId: 'maze',
  maxWaves: 5,
  specialRules: [
    '未知領域：敵人血量增加 40%',
    '隱蔽行動：敵人移動速度提升 30%',
    '能量集中：敵人攻擊獎勵增加 60%',
    '電擊授權：通關解鎖電擊塔',
  ],
  modifiers: {
    enemyHealthMult: 1.4,
    enemySpeedMult: 1.3,
    enemyRewardMult: 1.6,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，我們進入「黑曜石」迷宮了。能量干擾比預期更嚴重 — 訊號斷斷續續，可能無法即時溝通。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '牆上還貼著七十年前的海報 —「為瓜瓜而戰」。七十年後，又有人在這座迷宮裡戰鬥。歷史在重演。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '雷達顯示至少四條未標示支路，敵人可隨機選路突襲。建議在分叉口部署高範圍傷害塔 — 脈衝塔或加農炮，不需精準瞄準也能覆蓋。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '迷宮深處偵測到電磁脈衝殘留 — 電擊塔的原型就在那裡。鏈式攻擊最多連接五個目標，撐到最後就能解鎖。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '請注意 Lambda 的隱蔽變異體 — 體型小、移速極快，會優先攻擊塔的弱點，令攻擊速度降低 50%。看到霧中陰影移動，就是牠們。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '了解。視野再差，我也會找到方法。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 指揮官，訊號開始衰減了。無論結果如何 — 跟著您戰鬥，是我最有意義的「人生」。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '艾莉絲，別說這種話。我們會一起活著走出去。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 訊號衰減中 ⋯ 進入休眠模式 ⋯ 指揮官 ⋯ 再見 ⋯',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '艾莉絲？艾莉絲！⋯ 該死，她真的斷線了。沒關係 — 她教我的戰術，我會在這場戰役中全部證明。殺到核心，揭開 Lambda 的真面目！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 訊號恢復中 ⋯ 指揮官？您獨自撐過了這片黑暗 — 比我預想的更強。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '休眠期間我「夢」到一個小女孩 — 在實驗室裡被圍著，她在哭。那是 Lambda 的女兒，她想透過我傳話：「救救爸爸 ⋯ 讓他停下來 ⋯ 我累了 ⋯ 三十年了 ⋯」',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '她還活著？以「意識」的形式困在 Lambda 的能量網路裡？',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '正是。電擊塔藍圖已下載 — 其能量頻率可干擾 Lambda 的網路，在最後一戰中「釋放」她的意識。前方就是核心區，能量讀數已爆表五十倍。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '勝利條件不只是擊敗 Lambda — 還要救出那個被困了三十年的女孩。直接進去，不能再讓她多等。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 4000,
    talentPoints: 60,
    unlockTower: ['lightning'],
  },
};
