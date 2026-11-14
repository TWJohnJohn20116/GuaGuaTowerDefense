import type { CampaignLevel } from '@/types/campaign';

export const ch13_lv5: CampaignLevel = {
  id: 'ch13_lv5',
  chapter: 13,
  level: 5,
  title: '真正的傳承',
  description:
    '核心融合二十週年紀念日，初泉鎮舉行慶典。慶典進行中，另一維度的微弱訊號試圖撕開新裂縫。新指揮官王小明帶領 ALICE-2 與新一代部隊，第一次不靠老人完整守住戰場。',
  mapId: 'maze',
  maxWaves: 9,
  isBossLevel: true,
  specialRules: [
    '紀念日決戰：地圖採用「迷宮」極難分流',
    '新世代覺醒：起始資金 3000、生命 18、塔造價 -35%',
    '新一代戰術：所有塔射速 +25%、傷害 +15%',
    '所有人在場：每波結束自動回血 3 點',
    '異界第三裂縫：敵人血量 +60%、速度 +25%',
  ],
  modifiers: {
    enemyHealthMult: 1.6,
    enemySpeedMult: 1.25,
    enemyRewardMult: 1.5,
    startingMoney: 3000,
    startingHealth: 18,
    towerCostMult: 0.65,
  },
  preBattleDialogue: [
    {
      speaker: '新指揮官 王小明（26 歲）',
      text: '父親，第三裂縫又開了。但今天我想自己打，請您跟米雅、奧斯卡少將在慶典台上。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '你贏了，我們鼓掌。你輸了，我們也在台上替你撐住場面。',
      expression: 'happy',
    },
    {
      speaker: '新指揮官 王小明（26 歲）',
      text: '這句話就夠了。我知道您真的相信我了。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '小明指揮官，我已把 ALICE-2 推薦給您。她比我快五倍，但人性化邏輯是我教了二十七年的。',
      expression: 'normal',
    },
    {
      speaker: 'ALICE-2',
      text: '小明指揮官，我準備好了。這一仗，替父親那一輩打給他們看。',
      expression: 'serious',
    },
    {
      speaker: '新指揮官 王小明（26 歲）',
      text: '不是打給誰看。是證明下一代接得住。',
      expression: 'serious',
    },
    {
      speaker: 'ALICE-2',
      text: '收到。裂縫座標鎖定，布陣方案已同步。',
      expression: 'normal',
    },
    {
      speaker: '新指揮官 王小明（26 歲）',
      text: '各單位，為新瓜瓜大地，也為所有還活著的人。開戰。',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '新指揮官 王小明（26 歲）',
      text: '第三裂縫永久封印。父親，我們做到了。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '乾淨俐落。我為你驕傲。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官（51 歲）',
      text: '比我們兩個當年打得還穩。失敗時間線裡，我沒看過這種節奏。',
      expression: 'happy',
    },
    {
      speaker: '奧斯卡少將',
      text: '中央主線的紀律與判斷，是我這輩子看過最漂亮的之一。',
      expression: 'happy',
    },
    {
      speaker: '哨站長米雅（50 歲）',
      text: '你父親的戰術、鏡像的智慧、奧斯卡的紀律、艾莉絲的判斷——你全接住了，也變成自己的東西。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '父親留下兩個世界的記憶，米雅留下一鍋湯，奧斯卡留下紀念碑，鏡像留下失敗的智慧。小明，你留下什麼，由你決定。',
      expression: 'happy',
    },
    {
      speaker: '新指揮官 王小明（26 歲）',
      text: '我留下相信下一代的能力。不需要我打給他們看，他們自己就能站穩。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '這才是真正的傳承。走吧，米雅煮了全鎮最大的一鍋湯，我們同桌。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 5000,
    talentPoints: 30,
  },
};
