import type { CampaignLevel } from '@/types/campaign';

export const ch12_lv2: CampaignLevel = {
  id: 'ch12_lv2',
  chapter: 12,
  level: 2,
  title: '奶奶的湯',
  description:
    '兩年後，米雅奶奶的番茄牛肉湯把三個孩子拴在同一張飯桌旁。奶奶住院那晚，市場上最後一塊牛肉被外地人買走——為了一鍋湯，他們追了整條街。',
  mapId: 'corridor',
  maxWaves: 4,
  specialRules: [
    '街頭追逐：地圖採用「長廊」街道地形',
    '為奶奶而戰：所有塔射速 +15%',
    '鎮上跑：起始資金 800、生命 11',
    '童年正義：擊殺敵人 +25% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 0.85,
    enemySpeedMult: 1.0,
    enemyRewardMult: 1.25,
    startingMoney: 800,
    startingHealth: 11,
  },
  preBattleDialogue: [
    {
      speaker: '小米雅（9 歲）',
      text: '奶奶住院了……她說想喝番茄牛肉湯。我們得替她煮一次。',
      expression: 'serious',
    },
    {
      speaker: '小指揮官（10 歲）',
      text: '市場最後一塊牛肉剛被那個外地大叔買走，往東街跑了！',
      expression: 'angry',
    },
    {
      speaker: '小奧斯卡（12 歲）',
      text: '冷靜。人家合法付錢，不能搶。我們去跟他談，看能不能分一半。',
      expression: 'serious',
    },
    {
      speaker: '小米雅（9 歲）',
      text: '我把撲滿裡的錢全帶上。這次不是打仗用的，是給奶奶的。',
      expression: 'serious',
    },
    {
      speaker: '小奧斯卡（12 歲）',
      text: '米雅，那筆錢是妳存了兩年的。指揮官，你也別全掏。',
      expression: 'normal',
    },
    {
      speaker: '小米雅（9 歲）',
      text: '奶奶每天傍晚都等我們三個。這次換我們等她。',
      expression: 'serious',
    },
    {
      speaker: '小指揮官（10 歲）',
      text: '好，三人一起。但路上還有別人也盯上那塊肉，得先擋住。',
      expression: 'serious',
    },
    {
      speaker: '小奧斯卡（12 歲）',
      text: '我走在最前面。談判歸談判，別讓任何人把牛肉搶走。',
      expression: 'serious',
    },
    {
      speaker: '小米雅（9 歲）',
      text: '為了奶奶的湯，我們追！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '外地大叔',
      text: '三個小鬼為了一鍋湯，追了我三條街？',
      expression: 'surprised',
    },
    {
      speaker: '小米雅（9 歲）',
      text: '大叔，我奶奶住院了。她以前常煮湯給鎮上的孩子喝，我們想替她煮一次。',
      expression: 'serious',
    },
    {
      speaker: '外地大叔',
      text: '米雅奶奶啊……我兒子小時候沒飯吃，是她端湯給他的。',
      expression: 'normal',
    },
    {
      speaker: '外地大叔',
      text: '牛肉給你們，錢不收。替我跟奶奶說聲謝謝——如果她還記得我兒子的話。',
      expression: 'happy',
    },
    {
      speaker: '小米雅（9 歲）',
      text: '奶奶一定記得。湯煮好了，也分一碗給您兒子，好嗎？',
      expression: 'happy',
    },
    {
      speaker: '外地大叔',
      text: '他在街尾麵店打工，沒有家。你們願意分他一碗，比什麼都重要。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 900,
    talentPoints: 6,
  },
};
