import type { CampaignLevel } from '@/types/campaign';

export const ch12_lv5: CampaignLevel = {
  id: 'ch12_lv5',
  chapter: 12,
  level: 5,
  title: '番茄牛肉湯',
  description:
    '十二年後——也就是「現在」。奶奶離世三年，米雅仍堅持每年除夕熬湯。今年規模空前的殘黨突襲來襲，她必須獨撐四小時，等兩個青梅竹馬從遠方趕回。這鍋湯，不能涼。',
  mapId: 'fortress',
  maxWaves: 8,
  specialRules: [
    '家鄉之戰：地圖採用「堡壘」最終佈局',
    '一決勝負：所有塔傷害 +25%、射速 +15%',
    '記憶之力：擊殺 +50% 金錢',
    '最後堡壘：起始資金 2200、生命 22',
  ],
  modifiers: {
    enemyHealthMult: 1.3,
    enemySpeedMult: 1.15,
    enemyRewardMult: 1.5,
    startingMoney: 2200,
    startingHealth: 22,
  },
  preBattleDialogue: [
    {
      speaker: '哨站長米雅（29 歲）',
      text: '大規模殘黨突襲邊界，規模是過去十年加總。指揮官，奧斯卡，你們還在趕來的路上。',
      expression: 'serious',
    },
    {
      speaker: '指揮官（30 歲）',
      text: '米雅，撐住。我從邊境全速趕回，兩小時內到。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡（32 歲）',
      text: '我從北方出發，至少四小時。米雅，哨站交給妳，別硬拚到倒下。',
      expression: 'serious',
    },
    {
      speaker: '哨站長米雅（29 歲）',
      text: '四小時，我撐得住。除夕的湯已經在爐上了，用的是奶奶的祕方。',
      expression: 'normal',
    },
    {
      speaker: '指揮官（30 歲）',
      text: '奶奶走後，妳還是每年煮……',
      expression: 'happy',
    },
    {
      speaker: '哨站長米雅（29 歲）',
      text: '為奶奶，為我們三個，也為「家鄉」這兩個字。初泉鎮的土，今天沒人踩得過。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡（32 歲）',
      text: '妳給我活著。我們還要一起喝很多年的湯。',
      expression: 'serious',
    },
    {
      speaker: '哨站長米雅（29 歲）',
      text: '奶奶，您看好了。您的孫女，會守住您留下的這個家。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '指揮官（30 歲）',
      text: '米雅！我們到了——妳還好嗎？',
      expression: 'angry',
    },
    {
      speaker: '哨站長米雅（29 歲）',
      text: '撐住了。殘黨全退，哨站還在。傷是皮肉，比起初泉河那次不算什麼。',
      expression: 'happy',
    },
    {
      speaker: '少校奧斯卡（32 歲）',
      text: '妳獨守四小時，這仗寫進鎮史了。湯的香味飄到邊界來了。',
      expression: 'happy',
    },
    {
      speaker: '哨站長米雅（29 歲）',
      text: '進屋吧。家還在，湯也還熱。三個人，像從前那樣。',
      expression: 'happy',
    },
    {
      speaker: '指揮官（30 歲）',
      text: '米雅，奶奶會以妳為傲。妳把「家鄉」守成了真的。',
      expression: 'happy',
    },
    {
      speaker: '哨站長米雅（29 歲）',
      text: '我相信她就在湯裡，等我們三個一起喝。記憶不會因為人走了就消失。',
      expression: 'happy',
    },
    {
      speaker: '少校奧斯卡（32 歲）',
      text: '從七歲的水槍到今天的哨站，妳從沒離開過這裡。',
      expression: 'normal',
    },
    {
      speaker: '哨站長米雅（29 歲）',
      text: '初泉鎮永遠是我們的家。這鍋湯，明年還會再熬。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 3000,
    talentPoints: 20,
  },
};
