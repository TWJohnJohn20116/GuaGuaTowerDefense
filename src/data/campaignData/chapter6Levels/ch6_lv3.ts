import type { CampaignLevel } from '@/types/campaign';

export const ch6_lv3: CampaignLevel = {
  id: 'ch6_lv3',
  chapter: 6,
  level: 3,
  title: '鏡像世界',
  description:
    '艾莉絲解碼三十六小時內截獲的全部訊號。畫面顯示另一邊的瓜瓜大地確實存在——地形、城市、河流與我們一模一樣，卻破碎、焦黑、被佔領。最讓人不寒而慄的是，一張軍部紀念碑照片上，指揮官的名字赫然列在陣亡名單裡。',
  mapId: 'cross',
  maxWaves: 6,
  specialRules: [
    '鏡像戰場：地圖採用十字交叉路線',
    '能量干擾：所有塔射速降低 10%',
    '視差：敵人有 15% 機率「閃現」位移',
    '增援部署：起始資金 1300、生命 12',
  ],
  modifiers: {
    enemySpeedMult: 1.1,
    enemyHealthMult: 1.15,
    startingMoney: 1300,
    startingHealth: 12,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，過去三十六小時截獲的訊號全部解碼完畢。請做好心理準備。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '投影吧。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '第一張：那邊的初泉鎮。格局跟我們完全一樣，但房子全燒了。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 我們贏了的那場戰爭，在那邊——他們輸了。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '第二張：中央廣場，插滿不認識的軍旗。第三張——軍部紀念碑，陣亡名單第三行第二個名字，是您的名字。「指揮官，戰死於初泉河防線」。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 在那邊的世界，我已經死了三年。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '還有第四張。一個身穿軍裝、跟您一模一樣的人，站在敵方軍旗下接受指揮官徽章。',
      expression: 'angry',
    },
    {
      speaker: '指揮官 (你)',
      text: '另一個我，加入了敵人的陣營。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '鏡像指揮官，應該就是這次跨維度入侵的總指揮。他擁有跟您相同的戰術經驗、記憶和習慣。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '這場仗變成我跟自己打。那我得打破自己的習慣，否則他會看穿我每一步。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '敵軍已在十字戰場集結。指揮官，請用連您自己都想不到的打法。',
      expression: 'normal',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '您剛才的戰術完全跳脫過去五年的模式——對方確實猜錯了。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '我故意用的，是奧斯卡少將當年教我、但我從來不用的那一套。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '敵方指揮鏈截獲到回應：「這個指揮官不是『我』，是走了不一樣路的另一個我。」同時，他們的下一步計畫不是要征服，而是要奪回某個叫「核心」的東西。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 核心是什麼？',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '還在解碼。但有一件事可以確定——鏡像指揮官也已經發現您不是他了。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 2200,
    talentPoints: 14,
  },
};
