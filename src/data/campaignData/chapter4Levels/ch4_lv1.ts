import type { CampaignLevel } from '@/types/campaign';

export const ch4_lv1: CampaignLevel = {
  id: 'ch4_lv1',
  chapter: 4,
  level: 1,
  title: '迴歸',
  description:
    '終焉之戰三年後，指揮官已退役回初泉鎮。瓜瓜城中央廣場再度升起紫色霧氣，懸浮其上的巨大能量球體宣告「創造者」甦醒 — Lambda 不過是它跨維度實驗的棄子。三位新晉指揮官在第一波全數陣亡，軍部只能請指揮官重披戰甲，迎戰被重新組裝的舊日變異體。',
  mapId: 'zigzag',
  maxWaves: 4,
  specialRules: [
    '記憶喚醒：被擊敗過的變異體重新登場',
    '時光膠囊：起始資金加倍',
    '高速戰役：敵人移動速度提升 20%',
    '宿命之戰：守住四波才能勝利',
  ],
  modifiers: {
    enemySpeedMult: 1.2,
    startingMoney: 1500,
    enemyHealthMult: 1.3,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官 — 緊急喚醒。瓜瓜城中央廣場再次出現紫色霧氣，能量讀數與三十三年前 Lambda 早期型態一致，但訊號來源在「空中」。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 三年了，艾莉絲。你應該在永久休眠，我也應該在初泉鎮過退休生活。',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '廣場上方懸浮著直徑逾五百公尺的能量球體，內部有無數微結構運轉。「源頭」臨終預言成真了 —「創造者」醒了。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【創造者廣播】「瓜瓜的居民們，我觀察這個維度三十三年了。Lambda 是我安排的實驗品，他失敗了 — 現在輪到我親自接收這個世界。指揮官，我很期待再會。」',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: 'Lambda 只是實驗品？所以這場戰爭從來不是「我們對 Lambda」，而是對一個跨維度的存在？',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '正是。軍部已派三名新指揮官迎戰，全在第一波陣亡。我跟奧斯卡少將談過 — 只有您能回來。敵方正在派遣「記憶變異體」：雙頭巨獸、迷霧巨獸、迴音 — 被擊敗過的敵人，弱點全被修補。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '又要面對打過的敵人，而且這次更快、更硬。軍部還留著我的研究經費？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '起始資金 1500，全數撥入戰術終端。看來從您退役那天起，他們就預料這一天會來。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【奧斯卡少將通訊】指揮官，我跟你說過你必須回來 — 對不起。家園、初泉河、雄獅大橋，一切都還在你指尖。回家吧。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '沒事，少將。瓜瓜需要我，我就回來。艾莉絲 — 再戰一次。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '三年的休眠，從未睡得這麼踏實過。指揮官，守住四波 — 讓「創造者」知道瓜瓜還有人守。',
      expression: 'happy',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '四波全數守住。記憶變異體已肅清，但攻擊軌跡明顯針對您過去的戰術做了優化 —「創造者」在邊打邊研究您。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【創造者分析】「指揮官仍偏防守，但三年退休讓他出現新的猶豫。我很期待下一場 — 看他能撐到第幾關。」',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '它在跟我玩遊戲。下一場我要打破自己的習慣，讓它算錯。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '下一目標是東區「碎裂之地」— 創造者在那裡撕開時空裂縫，過去的時間正從縫隙漏出來。出發前，跟初泉鎮的家人道個別。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 我會的。這次，我不確定能不能回來 — 但一定會讓它後悔醒來。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 5000,
    talentPoints: 80,
  },
};
