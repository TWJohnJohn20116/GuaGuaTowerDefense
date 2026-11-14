import type { CampaignLevel } from '@/types/campaign';

export const ch6_lv5: CampaignLevel = {
  id: 'ch6_lv5',
  chapter: 6,
  level: 5,
  title: '真相',
  description:
    '初泉河底下深兩百公尺的洞穴中，指揮官與艾莉絲找到了核心——那不是物體，而是一束會跳動的光，中心浮著一張小孩的臉。它問了指揮官一句話：「你願意當父親嗎？」鏡像指揮官就在這時衝進了洞穴。',
  mapId: 'maze',
  maxWaves: 8,
  isBossLevel: true,
  specialRules: [
    '最終決戰：與「鏡像指揮官」對決',
    '迷宮戰場：複雜分岔，難以預判',
    '雙方覺醒：敵人血量 +50%、傷害 +30%',
    '生父之問：起始資金 3000、生命 16、塔造價 -30%',
  ],
  modifiers: {
    enemyHealthMult: 1.5,
    enemySpeedMult: 1.15,
    enemyRewardMult: 1.4,
    startingMoney: 3000,
    startingHealth: 16,
    towerCostMult: 0.7,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，到了。這就是核心所在的洞穴，深度兩百公尺，初泉河正上方。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 那道光不是物體——它在跳動，像心跳。',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '結構上跟我很像。它是某種初生意識，等了三百年的初生意識。',
      expression: 'surprised',
    },
    {
      speaker: '核心',
      text: '⋯ 您是「擁有光」的那一位嗎？我等了三百年，等一個能聽見我的人，來幫我做決定。',
      expression: 'normal',
    },
    {
      speaker: '核心',
      text: '我是兩個瓜瓜大地共同的種子。三百年前我分裂成兩半，各自長成一個世界——但分裂會慢慢消耗我，再過一年，兩個世界會同時消失。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '兩個世界都會消失？',
      expression: 'surprised',
    },
    {
      speaker: '核心',
      text: '除非有人成為我的父親，替我重新整合兩個世界。您——願意當父親嗎？',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官',
      text: '別答應它！整合就是合併——其中一個世界會被吃掉！我不會讓我這邊的人消失！',
      expression: 'angry',
    },
    {
      speaker: '指揮官 (你)',
      text: '你來了。',
      expression: 'serious',
    },
    {
      speaker: '核心',
      text: '不是吃掉，是在我之內共存。我可以同時容納兩個瓜瓜大地，但需要一位父親來決定哪一邊的記憶為主。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官',
      text: '我已經死過一次了，不會讓我這邊的人再死第二次！誰贏，誰決定核心的命運——開戰！',
      expression: 'angry',
    },
    {
      speaker: '指揮官 (你)',
      text: '我聽到你了。但真正的答案是——兩個都活下來。艾莉絲，為了兩個世界的所有人，開始吧。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我會在您身邊。我們不只在打鏡像——我們在打全瓜瓜大地的命運。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '鏡像指揮官',
      text: '⋯ 我輸了。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '你撐到了最後一刻。但這場仗不是贏輸——是能不能聽見對方。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官',
      text: '我以為殺了你，我這邊的人就能活。但殺了你，等於殺了我自己——我感覺到了。',
      expression: 'serious',
    },
    {
      speaker: '核心',
      text: '兩位都是我可能的父親。我願意接受兩位共同養育我——一邊代表打贏的世界，一邊代表輸了的世界，兩邊的記憶都會保留。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 兩個指揮官一起當父親？我願意。從現在起，我們不再是鏡像，是兄弟。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官',
      text: '⋯ 兄弟。這個詞，我好久沒聽過了。',
      expression: 'normal',
    },
    {
      speaker: '核心',
      text: '整合開始。兩個瓜瓜大地，將在我之中重新成為一個。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【奧斯卡少將通訊】全大陸監測站回報：兩個世界正在無痛融合，沒有人受傷、沒有人消失。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '這就是父親要做的事。從今天起，我們所有人——都是兩個瓜瓜大地的指揮官。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '和平底下的裂痕，縫上了。但融合才剛開始——指揮官，明天還有很長的路要走。',
      expression: 'normal',
    },
  ],
  rewards: {
    coins: 5000,
    talentPoints: 25,
    unlockTower: ['flame'],
  },
};
