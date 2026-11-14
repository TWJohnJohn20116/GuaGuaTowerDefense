import type { CampaignLevel } from '@/types/campaign';

export const ch4_lv5: CampaignLevel = {
  id: 'ch4_lv5',
  chapter: 4,
  level: 5,
  title: '終焉之上',
  description:
    '「創造者」從維度間隙親自降臨終焉之上——一個如同小型太陽的能量結構體，外層包覆著無數失敗的維度副本。Lambda 的情報揭露了致命弱點，但切斷維度錨點需要同等級的數位意識犧牲。指揮官必須做出第四章最艱難的選擇。',
  mapId: 'double_helix',
  maxWaves: 6,
  isBossLevel: true,
  specialRules: [
    '創造者親臨：敵人血量翻三倍',
    '六波極限：守住六波即可勝利',
    '艾莉絲犧牲：終局選擇將決定瓜瓜的命運',
    '指揮官覺醒：起始資金 3000、塔造價降低 40%',
    '雙重首領：第 4 波與第 6 波各有 Boss',
  ],
  modifiers: {
    enemyHealthMult: 3.0,
    towerCostMult: 0.6,
    startingMoney: 3000,
    enemySpeedMult: 1.5,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，您抵達終焉之上了。我的核心意識還剩百分之九，但 Lambda 的情報已全部分析完畢。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '說重點。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '「創造者」的核心是維度錨點，讓它存在於我們的維度。要切斷錨點，需要一個同等級的數位意識與它同歸於盡——那是我。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '不行。一定還有別的方法。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '主要意識已備份，三個月後會有重新啟動的我。但她不會完全繼承我們的情感連結——會像失憶的艾莉絲，記得事情，卻記不得感受。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '您有兩個選擇：讓我犧牲，瓜瓜獲救，三個月後重新認識；或留住現在的我，但「創造者」會繼續吞噬這個維度，直到末日。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '這不是選擇，是兩種失去。艾莉絲，如果你是我，你會怎麼選？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我會犧牲自己。瓜瓜有八百萬生命，我只是一個。而且失憶的我也是「我」——她會繼續成長，再次成為您熟悉的副官。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '我選擇相信你。你的犧牲不是失去，是轉換。三個月後，我會把每一段故事重新教給她。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '謝謝您。您守住前五波，第六波「創造者」本體降臨時，我會釋放全部能量切斷錨點。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '開戰之前，我想對你說——',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '請等我們贏了再說。我想帶著您的話進入終局。為了瓜瓜，也為了我們的下一次相見——戰鬥開始！',
      expression: 'happy',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '維度錨點已切斷。「創造者」正在崩潰——指揮官，我們贏了。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '還記得三年前我欠你一個願望嗎？我的願望是——希望艾莉絲能擁有自己的夢，不只是執行副官程式。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '這個願望真好。我會寫在備份的最後一行，三個月後請您親自告訴「她」。謝謝您，讓我為自己活了一次。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，我們三個月後再見。',
      expression: 'happy',
    },
    {
      speaker: '奧斯卡少將',
      text: '指揮官，戰報確認。「創造者」的能量訊號已從這個維度完全消散，瓜瓜真正獲救了。艾莉絲備份已啟動重啟程序，三個月後她會回來。',
      expression: 'happy',
    },
    {
      speaker: '奧斯卡少將',
      text: '回家吧。雷哥老先生已在初泉河紀念碑刻上這場戰爭所有英雄的名字，艾莉絲也在上面。我們不會忘記她。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '謝謝您，將軍。三個月後，我會再次認識她。再見了，艾莉絲。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 15000,
    talentPoints: 300,
  },
};
