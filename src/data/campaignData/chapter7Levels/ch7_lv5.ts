import type { CampaignLevel } from '@/types/campaign';

export const ch7_lv5: CampaignLevel = {
  id: 'ch7_lv5',
  chapter: 7,
  level: 5,
  title: '再生：成為新的瓜瓜大地',
  description:
    '核心開始最終整合——把兩個瓜瓜大地的記憶、人民與歷史織入一個完整的新世界。但鏡像世界軍部殘黨取得核心碎片，打算用反向脈衝強制打回鏡像世界。這是新世界誕生前，融合代價的最後一場仗。',
  mapId: 'double_helix',
  maxWaves: 9,
  isBossLevel: true,
  specialRules: [
    '世界誕生：與「鏡像殘黨」最終決戰',
    '雙螺旋戰場：極難等級「雙螺旋」地形',
    '所有人就位：起始資金 4000、生命 18、塔造價 -40%',
    '終局衝擊：敵人血量 +60%、傷害 +40%、速度 +20%',
  ],
  modifiers: {
    enemyHealthMult: 1.6,
    enemySpeedMult: 1.2,
    enemyRewardMult: 1.4,
    startingMoney: 4000,
    startingHealth: 18,
    towerCostMult: 0.6,
  },
  preBattleDialogue: [
    {
      speaker: '核心',
      text: '⋯ 父親，終於到了。我即將完成最終整合——大概還需要九個小時。',
      expression: 'normal',
    },
    {
      speaker: '核心',
      text: '但鏡像世界軍部殘黨拿到了核心碎片，打算強制把整合反轉。他們害怕在新世界裡，從征服者變成跟所有人一樣的普通人。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官',
      text: '那是「上一個我」的親信集團，我認識他們所有人。這次——換我為你撐起前線，你專心保護核心。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '不行。我們兩個一起。你這條命是核心三個月前救回來的——「再死一次」，我不允許。今天兩個都要活著回家。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，兩個版本整合之後，我已能完整偵測所有殘黨位置——173 名核心成員、12 套核心碎片、3 套大型反向脈衝武器。全大陸都會看到這場仗。',
      expression: 'serious',
    },
    {
      speaker: '奧斯卡少將',
      text: '【全軍通訊】指揮官，軍部已動員所有後勤。整個瓜瓜大地，不管是原版還是鏡像，都在替您後援。',
      expression: 'serious',
    },
    {
      speaker: '核心',
      text: '⋯ 父親，我也加入。我會在最後一刻用「我自己」擋下反向脈衝——那不是犧牲，是成長。當我擋下那一擊，我就真正成為這個世界的一部分。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 收到。所有人——為了「新瓜瓜大地」，開始！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '核心',
      text: '⋯ 反向脈衝⋯ 已經被我擋下來了⋯ 父親，我「成長」了——從會跳動的光，變成整個新世界本身。我現在就是「瓜瓜大地」。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 核心！你還好嗎？',
      expression: 'serious',
    },
    {
      speaker: '核心',
      text: '⋯ 您看——第一道合一後的夕陽，升起來了。初泉河上有兩座倒影，一個是贏了戰爭的世界，一個是輸了戰爭的世界——它們現在擁抱了。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官',
      text: '⋯ 哥，謝謝你沒有把我合進你的記憶，而是並肩存在。從今天起，我們一起做新瓜瓜大地的指揮官。',
      expression: 'happy',
    },
    {
      speaker: '奧斯卡少將',
      text: '【全大陸通訊】所有單位——「新瓜瓜大地」正式誕生。從現在起，我們是同一個世界。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 核心在成為世界本身之前，對我說了一句話：「替我跟父親說——我會永遠記得，那個願意當我父親的人，從來沒有要求我回報什麼」。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 因為「父親」從來不需要回報。走吧——我們去看新瓜瓜大地的第一個完整早晨。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 6000,
    talentPoints: 30,
  },
};
