import type { CampaignLevel } from '@/types/campaign';

export const ch15_lv5: CampaignLevel = {
  id: 'ch15_lv5',
  chapter: 15,
  level: 5,
  title: '時間之外的入侵者',
  description:
    '原初核心鎖定了兩萬年前那個維度入侵者的座標——它不在任何已知宇宙，而在瓜瓜大地時間軸之外的反作用力場域。指揮官、新世代指揮官、鏡像指揮官、艾莉絲、ALICE-2 與雙核心七人聯手，進入多元宇宙邊界，將這道兩萬年的陰影永遠斬斷。',
  mapId: 'double_helix',
  maxWaves: 9,
  isBossLevel: true,
  specialRules: [
    '時間之外：地圖採用「雙螺旋」極難迷霧',
    '世代決戰：起始資金 4500、生命 20、塔造價 -45%',
    '兩萬年陰影：敵人血量 +75%、速度 +30%、傷害 +40%',
    '七人聯手：每波結束自動回血 4 點',
    '永久斬斷：擊殺敵人 +60% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.75,
    enemySpeedMult: 1.3,
    enemyRewardMult: 1.6,
    startingMoney: 4500,
    startingHealth: 20,
    towerCostMult: 0.55,
  },
  preBattleDialogue: [
    {
      speaker: '原初核心',
      text: '父親，我鎖定了入侵者的維度座標。它不在任何宇宙裡——它在時間軸之外。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '時間軸之外？意思是，它從一開始就不屬於任何一個瓜瓜大地？',
      expression: 'serious',
    },
    {
      speaker: '原初核心',
      text: '對。它是多元宇宙的「反作用力」——每一次世界融合，它就變強一分。',
      expression: 'serious',
    },
    {
      speaker: '王小明（26 歲）',
      text: '父親，這代不能讓兩萬年的陰影再纏住下一代。我來。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官',
      text: '哥，我也來。另一個宇宙分支的我，也欠第三世界一個交代。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我跟 ALICE-2 一起。退休後第一次上真正的戰場——這次是為自己，不是為軍部。',
      expression: 'normal',
    },
    {
      speaker: 'ALICE-2',
      text: '艾莉絲奶奶，您今天的戰術演算速度，比現役時期還快 12%。',
      expression: 'normal',
    },
    {
      speaker: '核心',
      text: '父親，雙核心加入。這場仗結束後，多元宇宙裂隙將永久關閉——第三世界正式成為我們的一部分。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '七個人，三個宇宙分支，兩個核心。這不是家庭聚會，這是多元宇宙的收編之戰。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '為兩萬年前的瓜瓜，為下一個兩萬年——開戰！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '原初核心',
      text: '父親，入侵者已永遠斬斷。多元宇宙裂隙正在關閉——第三個瓜瓜大地，正式歸位。',
      expression: 'happy',
    },
    {
      speaker: '核心',
      text: '兄弟，你真正誕生了。從今天起，兩個核心並肩守護——不分裂，不合二為一。',
      expression: 'happy',
    },
    {
      speaker: '王小明（26 歲）',
      text: '父親，剛才那場七人聯手——是我這輩子看過最壯觀的「真正的開始」。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '家人不只是血緣，是願意一起打的人。走吧，米雅煮的湯不會涼。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '兩萬年前的火燒掉了一個宇宙分支——兩萬年後，我們替那場火，點起了慈悲之光。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '下一個兩萬年，我們不在了。但我們的兒子會活著——直到永遠。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 8000,
    talentPoints: 50,
  },
};
