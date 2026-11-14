import type { CampaignLevel } from '@/types/campaign';

export const ch10_lv2: CampaignLevel = {
  id: 'ch10_lv2',
  chapter: 10,
  level: 2,
  title: '南方迷霧任務',
  description:
    '一年後，奧斯卡親自帶領五人偵察小隊出發，目標是穿越南方迷霧、找出吞噬人員的源頭。出發前副官請求同行，奧斯卡拒絕了——他要副官留守哨站，萬一他們沒回來，南方還有人能接棒。',
  mapId: 'zigzag',
  maxWaves: 5,
  specialRules: [
    '迷霧進軍：地圖採用「之字形」蜿蜒迷霧路線',
    '能見度低：所有塔射程 -10%',
    '小隊出動：起始資金 1300、生命 13',
    '隊長奧斯卡：擊殺敵人 +30% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.1,
    enemySpeedMult: 1.1,
    enemyRewardMult: 1.3,
    startingMoney: 1300,
    startingHealth: 13,
  },
  preBattleDialogue: [
    {
      speaker: '哨站副官',
      text: '少校，偵察小隊五人已就緒。請讓我跟你們一起進迷霧。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '不行。你留下守哨站。',
      expression: 'serious',
    },
    {
      speaker: '哨站副官',
      text: '我跟您訓練了整整一年——',
      expression: 'angry',
    },
    {
      speaker: '少校奧斯卡',
      text: '正因為訓練了一年，我才更需要你在背後。我們若沒回來，你就是下一任少校。',
      expression: 'serious',
    },
    {
      speaker: '哨站副官',
      text: '……',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '守好哨站。等我回來。',
      expression: 'happy',
    },
    {
      speaker: '少校奧斯卡',
      text: '各位，進迷霧三條規則：跟緊指揮鏈、不准分散、隊長比任務重要——隊長活著，任務還能再做一次。',
      expression: 'serious',
    },
    {
      speaker: '小隊員陳浩',
      text: '收到，少校。',
      expression: 'normal',
    },
    {
      speaker: '小隊員王森',
      text: '林珊跟小明在等著我。我一定跟緊您。',
      expression: 'normal',
    },
    {
      speaker: '小隊員林志',
      text: '下個月要回鄉見阿嬤……我也跟緊。',
      expression: 'normal',
    },
    {
      speaker: '少校奧斯卡',
      text: '出發。目標——找出迷霧源頭。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '少校奧斯卡',
      text: '第一段迷霧穿過了。現在我們在迷霧深處。',
      expression: 'serious',
    },
    {
      speaker: '小隊員陳浩',
      text: '少校，指北針停了——完全不轉。',
      expression: 'surprised',
    },
    {
      speaker: '小隊員王森',
      text: '定位系統顯示我們同時出現在七個座標……',
      expression: 'surprised',
    },
    {
      speaker: '少校奧斯卡',
      text: '這不是天然霧，是會干擾儀器的能量場。儀器靠不住，用人腦——看太陽、看地形、看風向。',
      expression: 'serious',
    },
    {
      speaker: '小隊員林志',
      text: '那方向怎麼判斷？',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '跟我走。繼續深入。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1400,
    talentPoints: 9,
  },
};
