import type { CampaignLevel } from '@/types/campaign';

export const ch12_lv4: CampaignLevel = {
  id: 'ch12_lv4',
  chapter: 12,
  level: 4,
  title: '最後一次圍爐',
  description:
    '九年後的除夕，米雅二十六歲、已是初泉哨站長。指揮官從邊境、奧斯卡從軍部臨時調假，三人奇蹟般聚在奶奶家。圍爐的湯剛冒熱氣，窗外警報就響了。',
  mapId: 'diagonal',
  maxWaves: 6,
  specialRules: [
    '除夕之戰：地圖採用「對角線」分流',
    '不放年假：所有塔射速 +15%、傷害 +10%',
    '為家人而戰：起始資金 1500、生命 14',
    '三人聯防：擊殺敵人 +35% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.15,
    enemySpeedMult: 1.1,
    enemyRewardMult: 1.35,
    startingMoney: 1500,
    startingHealth: 14,
  },
  preBattleDialogue: [
    {
      speaker: '哨站長米雅（26 歲）',
      text: '警報！邊界有殘黨趁除夕偷襲，人數不少。',
      expression: 'angry',
    },
    {
      speaker: '指揮官（27 歲）',
      text: '米雅，我跟你一起。難得三人聚齊，不能讓這頓飯泡湯。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡（29 歲）',
      text: '算我一份。北、東、西，跟成年禮那次一樣分工。',
      expression: 'serious',
    },
    {
      speaker: '米雅奶奶',
      text: '三個小傢伙，湯在爐上溫著。打完仗回來喝，別讓它涼了。',
      expression: 'happy',
    },
    {
      speaker: '哨站長米雅（26 歲）',
      text: '奶奶，我們很快回來。這次也是為了守家。',
      expression: 'happy',
    },
    {
      speaker: '指揮官（27 歲）',
      text: '米雅守北邊，我守東邊，奧斯卡西邊。速戰速決。',
      expression: 'serious',
    },
    {
      speaker: '哨站長米雅（26 歲）',
      text: '為了奶奶的湯，也為了初泉鎮——開戰！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '哨站長米雅（26 歲）',
      text: '殘黨退散了。奶奶，我們回來了。',
      expression: 'happy',
    },
    {
      speaker: '米雅奶奶',
      text: '湯還熱。你們長大了，各自忙碌，但除夕一定要回來。',
      expression: 'happy',
    },
    {
      speaker: '指揮官（27 歲）',
      text: '奶奶，您的番茄牛肉湯還是天下第一。',
      expression: 'happy',
    },
    {
      speaker: '少校奧斯卡（29 歲）',
      text: '每年除夕，三人一桌。這是我們給自己的規矩。',
      expression: 'happy',
    },
    {
      speaker: '米雅奶奶',
      text: '米雅，我老了。番茄牛肉湯的祕方，等我走後，妳要替我繼續煮。',
      expression: 'normal',
    },
    {
      speaker: '哨站長米雅（26 歲）',
      text: '奶奶，別說這種話……',
      expression: 'serious',
    },
    {
      speaker: '米雅奶奶',
      text: '湯不只是食物，是記憶。初泉鎮的人靠它記得「家」是什麼味道。答應我。',
      expression: 'serious',
    },
    {
      speaker: '哨站長米雅（26 歲）',
      text: '我答應您。這鍋湯，我會守一輩子。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1700,
    talentPoints: 11,
  },
};
