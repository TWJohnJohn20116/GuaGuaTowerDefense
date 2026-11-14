import type { CampaignLevel } from '@/types/campaign';

export const ch15_lv3: CampaignLevel = {
  id: 'ch15_lv3',
  chapter: 15,
  level: 3,
  title: '跨宇宙的火',
  description:
    '六名長者消散後，裂隙外的火焰殘響愈發密集。每一團火都是多元宇宙碰撞中，第三世界某個瓜瓜人最後的未竟之語。指揮官無法「消滅」它們——只能以戰為祭，替兩萬年前的兄弟完成最後的送行。',
  mapId: 'snake',
  maxWaves: 7,
  specialRules: [
    '送行火焰：地圖採用「蛇形」蜿蜒迷霧',
    '哀悼之戰：所有塔射速 +15%、傷害 -5%',
    '為他們而戰：起始資金 1700、生命 14',
    '送行儀式：擊殺敵人 +40% 金錢',
    '長者護佑：每波結束自動回血 1 點',
  ],
  modifiers: {
    enemyHealthMult: 1.3,
    enemySpeedMult: 1.15,
    enemyRewardMult: 1.4,
    startingMoney: 1700,
    startingHealth: 14,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，那些不是敵人。它們是第三宇宙分支裡，兩萬年前未能被聽見的痛苦記憶。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '所以我不能「殺」，只能「送行」。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '對。塔火力的意義不是毀滅，而是讓每一團殘響被承認、被記住，然後自然消散。',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '從多元宇宙的角度看，每一個被擊倒的火焰，都是一條終於能安息的生命線。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '您今天的戰術會跟平常不一樣——我已在戰術面板上標記「慈悲模式」，傷害略降，但共鳴效率提升。',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '這場仗，心情會不一樣。不是守城，是守墓。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '兩萬年前的瓜瓜兄弟們，我替你們，把最後一場送行儀式做完。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '蛇形通道已開啟。火焰殘響正在匯聚，指揮官，請下令。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '老指揮官（51 歲）',
      text: '結束了。跨宇宙的那場火，全部被聽見，全部消散了。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，您剛才的打法比平常溫柔——但有效得多。痛苦不需要被消滅，只需要被承認。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '偵測到裂隙最深層還有東西在等。它在等您「準備好」——準備面對第三世界的原初核心。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '我準備好了。往下走。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1900,
    talentPoints: 15,
  },
};
