import type { CampaignLevel } from '@/types/campaign';

export const ch12_lv3: CampaignLevel = {
  id: 'ch12_lv3',
  chapter: 12,
  level: 3,
  title: '成年禮',
  description:
    '六年後，三人迎來各自的成年禮。鎮上傳統要求十八歲獨自守夜，但邊界真的來了盜賊。米雅十七歲那年，守夜變成三人的聯合作戰——也是她第一次說出「我要留下來」。',
  mapId: 'u_shape',
  maxWaves: 5,
  specialRules: [
    '聯合成年禮：地圖採用「U 形」分流',
    '青春活力：所有塔射速 +10%、傷害 +5%',
    '證明自己：起始資金 1100、生命 12',
    '三人合作：擊殺敵人 +30% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.0,
    enemyRewardMult: 1.3,
    startingMoney: 1100,
    startingHealth: 12,
  },
  preBattleDialogue: [
    {
      speaker: '青年米雅（17 歲）',
      text: '指揮官，今天你十八歲。守夜選哪一段？',
      expression: 'happy',
    },
    {
      speaker: '青年指揮官（18 歲）',
      text: '東邊小屋，視野最好。成年禮得獨自完成，不能靠別人。',
      expression: 'normal',
    },
    {
      speaker: '青年奧斯卡（20 歲）',
      text: '我守夜過了，但今晚不走。鎮警報說邊界有十二名盜賊朝這裡來。',
      expression: 'serious',
    },
    {
      speaker: '青年指揮官（18 歲）',
      text: '守夜規矩是獨自守……可這次不是演習。',
      expression: 'serious',
    },
    {
      speaker: '青年米雅（17 歲）',
      text: '十二個人，我們三個撐得住。跟初泉河那次一樣，分工就好。',
      expression: 'serious',
    },
    {
      speaker: '青年奧斯卡（20 歲）',
      text: '北、東、西三個方向，互相支援。這次守夜，算三人聯合版。',
      expression: 'normal',
    },
    {
      speaker: '青年指揮官（18 歲）',
      text: '好。為了鎮上每一個人，開戰。',
      expression: 'angry',
    },
    {
      speaker: '青年米雅（17 歲）',
      text: '我守北邊。指揮官東邊，奧斯卡西邊。別讓任何人踏進初泉鎮。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '青年指揮官（18 歲）',
      text: '十二名盜賊全部繳械，鎮上零傷亡。成年禮，過關了。',
      expression: 'happy',
    },
    {
      speaker: '青年米雅（17 歲）',
      text: '明年輪我守夜。指揮官，你說過要陪我整晚，可別忘。',
      expression: 'happy',
    },
    {
      speaker: '青年指揮官（18 歲）',
      text: '一言為定。米雅，你打算留還是走？',
      expression: 'normal',
    },
    {
      speaker: '青年米雅（17 歲）',
      text: '我留下來。初泉鎮需要哨站長，我要當那個人。',
      expression: 'happy',
    },
    {
      speaker: '青年指揮官（18 歲）',
      text: '我去軍校。奧斯卡已在軍校，往將軍走。路不同，但河岸邊還會再見。',
      expression: 'happy',
    },
    {
      speaker: '青年奧斯卡（20 歲）',
      text: '三個人走三條路，最後都會回到這條河。記住今晚。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 1300,
    talentPoints: 8,
  },
};
