import type { CampaignLevel } from '@/types/campaign';

export const ch7_lv2: CampaignLevel = {
  id: 'ch7_lv2',
  chapter: 7,
  level: 2,
  title: '殘響',
  description:
    '被凍結的「未死之人」開始在新世界遊蕩。他們帶著死亡瞬間的痛苦記憶與不完整的身體，找上當年該救他們而沒救成的人。奧斯卡少將最後一次任務中陣亡的整支偵察小隊，此刻走在他家門口——不是來相聚，是來算帳。',
  mapId: 'snake',
  maxWaves: 6,
  specialRules: [
    '亡靈反撲：敵人具「殘響」效果，被擊殺後會重生 1 次（血量 30%）',
    '蛇形戰場：地圖採用「蛇形」蜿蜒路線',
    '良心之戰：擊殺額外掉落 +50% 金錢',
    '緊急部署：起始資金 1700、生命 14',
  ],
  modifiers: {
    enemyHealthMult: 1.1,
    enemyRewardMult: 1.5,
    startingMoney: 1700,
    startingHealth: 14,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，奧斯卡少將親自打來。他說這件事不能只用通訊處理。',
      expression: 'serious',
    },
    {
      speaker: '奧斯卡少將',
      text: '指揮官，我知道您剛打完一仗。但我必須當面跟您說——我「最後一次任務」帶出去的那支偵察小隊，全部回來了。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 全部回來？少將，那批人不是十年前在「南方迷霧」陣亡的嗎？',
      expression: 'surprised',
    },
    {
      speaker: '奧斯卡少將',
      text: '核心融合時，把他們從死亡瞬間解凍了。現在——走在我家門口。但他們不是來找我相聚，是來找我算帳。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '少將，當年的決策沒有錯。是突發天候加上敵方埋伏的雙重意外，不是您的責任。',
      expression: 'serious',
    },
    {
      speaker: '奧斯卡少將',
      text: '⋯ 但他們的痛苦是真的。那一刻，他們心裡確實在喊「將軍為什麼不來救我們」。那段呼喊，現在變成了實體——不是人，是痛苦本身。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '少將，我會去處理。您先把家人撤到安全地方。',
      expression: 'serious',
    },
    {
      speaker: '奧斯卡少將',
      text: '不。我跟您一起去。我必須親口跟那些曾經是我兄弟的痛苦——道歉。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '戰術提醒：這些「殘響」被擊殺後會再次重生一次。我們得徹底擊潰它們的痛苦頻率，才能讓它們真正消散。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '收到。少將，走吧。這場仗用「擊敗」開始，用「告別」結束。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '奧斯卡少將',
      text: '⋯ 兄弟們，對不起。我來晚了十年。',
      expression: 'serious',
    },
    {
      speaker: '殘響',
      text: '⋯ 將軍⋯ 我們在那一天⋯ 沒有怪您⋯ 是「世界」沒給您來救我們的時間⋯',
      expression: 'normal',
    },
    {
      speaker: '奧斯卡少將',
      text: '⋯ 你們——真的這樣想嗎？',
      expression: 'surprised',
    },
    {
      speaker: '殘響',
      text: '⋯ 是的。能再說一次再見，已經比很多人幸運多了。請繼續活著，替我們看更多的瓜瓜大地春天⋯',
      expression: 'happy',
    },
    {
      speaker: '奧斯卡少將',
      text: '⋯ 我會的。我答應你們。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '殘響全數消散。這次不是被殺掉，是自願放下。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 融合的第二筆代價，是用眼淚付的。少將，您終於可以真正放下那一天了。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 2400,
    talentPoints: 14,
  },
};
