import type { CampaignLevel } from '@/types/campaign';

export const ch11_lv1: CampaignLevel = {
  id: 'ch11_lv1',
  chapter: 11,
  level: 1,
  title: '初泉河防線',
  description:
    '鏡像世界，五年前。鏡像指揮官仍是軍部眼裡最正直的新星，初泉河防線是他「死前」最後一場漂亮仗。指揮鏈完整、士氣高昂、戰術精準，三天三夜守住了家鄉門戶。他不知道自己的死期，還有七十二小時。',
  mapId: 'zigzag',
  maxWaves: 6,
  specialRules: [
    '巔峰狀態：所有塔射速 +10%、傷害 +5%',
    '高昂士氣：起始資金 1500、生命 14、塔造價 -15%',
    '初泉河之戰：擊殺敵人 +30% 金錢',
    '光榮的最後一仗：每波結束自動回血 1 點',
  ],
  modifiers: {
    enemyHealthMult: 1.1,
    enemyRewardMult: 1.3,
    startingMoney: 1500,
    startingHealth: 14,
    towerCostMult: 0.85,
  },
  preBattleDialogue: [
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '兄弟們，初泉河這條防線我們守了三天三夜，今天也不會讓步。這條河養大我們，輪到我們養它。',
      expression: 'serious',
    },
    {
      speaker: '鏡像艾莉絲（早期版）',
      text: '戰術評估完成：敵方兵力約為我方三倍，但地形、補給與士氣均偏向守方。勝算不低，前提是別有人亂改部署。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '艾莉絲，你這句「別有人亂改」是在點名我嗎？',
      expression: 'happy',
    },
    {
      speaker: '鏡像艾莉絲（早期版）',
      text: '我在點名所有會在開戰前五分鐘臨時換陣型的人。資料顯示，那通常是指揮官本人。',
      expression: 'normal',
    },
    {
      speaker: '鏡像奧斯卡（年輕版）',
      text: '指揮官，後勤就位。三天份的彈藥、糧食與藥品全數補齊，連我偷偷多帶的熱咖啡都有。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '奧斯卡，我跟你一起在這條河邊長大。今天不為軍部，只為家鄉。',
      expression: 'serious',
    },
    {
      speaker: '鏡像奧斯卡（年輕版）',
      text: '我比你早來這個世界幾年，但你比我更懂什麼叫「保護家鄉」。這句話我記了十五年。',
      expression: 'happy',
    },
    {
      speaker: '鏡像艾莉絲（早期版）',
      text: '偵測更新：敵方先鋒部隊已進入有效射程，預計兩分鐘內接觸。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '全員備戰。這一仗打完，我請大家去河堤看夕陽——我請客，奧斯卡出錢。',
      expression: 'happy',
    },
    {
      speaker: '鏡像奧斯卡（年輕版）',
      text: '為什麼又是我出錢？',
      expression: 'surprised',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '因為你官階比我高。開火！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '鏡像奧斯卡（年輕版）',
      text: '指揮官，三天了，防線還在，熱咖啡也還有剩。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '我們守住了。這是我帶隊以來打得最漂亮的一仗。',
      expression: 'happy',
    },
    {
      speaker: '鏡像艾莉絲（早期版）',
      text: '軍部最新命令：乘勝追擊，直撲敵方主陣地。附註寫著「不得延誤」。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '我們剛守完三天三夜，現在就要追？這命令聽起來不太像「乘勝」，比較像「趕我們去送」。',
      expression: 'serious',
    },
    {
      speaker: '鏡像奧斯卡（年輕版）',
      text: '我也覺得冒險。但軍部執意要打，我們沒有第二條路。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '軍人服從命令。艾莉絲，你留在哨站。這次我帶隊出去，回來再帶你看下一個夕陽。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1700,
    talentPoints: 11,
  },
};
