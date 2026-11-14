import type { CampaignLevel } from '@/types/campaign';

export const ch3_lv5: CampaignLevel = {
  id: 'ch3_lv5',
  chapter: 3,
  level: 5,
  title: '終焉之戰',
  description:
    '核心區域中，「源頭」終於現身 — 一座由紫色能量絲線編織的雙螺旋結構，Lambda 將意識上傳後的最終形態。他的女兒被困在螺旋中央，三十年來從未真正安息。終局之戰，必須不惜代價擊潰源頭，並以電擊塔的頻率釋放那個孩子的意識。',
  mapId: 'double_helix',
  maxWaves: 5,
  isBossLevel: true,
  specialRules: [
    '終局之戰：雙線威脅同時推進',
    '能量爆發：敵人生命值翻倍',
    '指揮官覺醒：塔造價降低 30%',
    '雙重首領：第 4 波與第 5 波各有一隻 Boss',
    '無限榮耀：豐厚獎勵與最終解鎖',
  ],
  modifiers: {
    enemyHealthMult: 2.0,
    towerCostMult: 0.7,
    startingMoney: 1500,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，這就是「源頭」。核心室中央懸浮著雙螺旋結構 — Lambda 用冥蛇科技將意識重塑為這個形態，中央光點是他女兒的意識核心。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '會發光的雙螺旋 ⋯ 他真的變成了「新的物種」。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【Lambda 通訊】「你們無法理解。我已超越肉體，看見了沒有戰爭、沒有死亡的世界 — 指揮官，加入我，你會成為新世界的副指揮官。」',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: 'Lambda，你的女兒快樂嗎？困在能量網路裡三十年 — 她真的想要這個「永生」嗎？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【Lambda 通訊】⋯ 你怎麼知道 ⋯ 她當然快樂 ⋯ 我給了她永恆 ⋯',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '她親口跟我說 —「我累了，請讓我休息」。Lambda，她不是你的孩子，是你的囚徒。開戰吧。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【奧斯卡少將通訊】整個瓜瓜大地都在看著你。起始資金 1500、塔造價降 30% — 這是軍部最後的支援。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '第 4 波首領「迴音」、第 5 波「迴音」加「源頭」本體同時出擊。當敵人晶體閃爍時，立刻用電擊塔 — 我會趁機把女孩的意識拉出來。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '我寧可跟瓜瓜的每一個子民死在這裡，也絕不背叛他們。Lambda — 三十年的瘋狂，今天結束！',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '收到。為了瓜瓜、為了那個被困三十年的女孩 — 指揮官，戰鬥開始！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '能量讀數歸零。「源頭」已被摧毀 — 在最後一次電擊脈衝中，女孩的意識成功分離，三十年的囚禁結束了。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【女孩的訊息】「⋯ 謝謝你 ⋯ 我可以休息了 ⋯ 跟媽媽說 ⋯ 我愛她 ⋯」',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '我們贏了 ⋯ 瓜瓜得救了。她媽媽還活著？',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '是的，住在瓜瓜城東區。Lambda 的妻子每年到墓前獻花，完全不知道丈夫做了什麼 — 現在，她可以替女兒燒一束花了。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '但「源頭」崩潰前傳出最後訊息 —「我們不是最後一個。我們之上還有『創造者』。當他醒來的那天，你們會懷念我的仁慈。」',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 還有更大的威脅？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: 'Lambda 只是更大計畫的一部分。創造者仍在沉睡 — 我們有時間準備。今天先慶祝勝利，回家吧。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【奧斯卡少將通訊】英雄歸鄉典禮已備妥，紀念碑也會刻上 Lambda 女兒的名字。指揮官 — 瓜瓜在等您。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '少將，我想先去 Lambda 妻子家 — 親口告訴她女兒的事，讓那位母親有機會說再見。然後，我們回家。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 8000,
    talentPoints: 150,
    unlockTower: ['pulse', 'wind'],
  },
};
