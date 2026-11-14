import type { CampaignLevel } from '@/types/campaign';

export const ch17_lv3: CampaignLevel = {
  id: 'ch17_lv3',
  chapter: 17,
  level: 3,
  title: '奧斯卡將軍的回憶錄',
  description:
    '六十二歲的奧斯卡將軍卸下軍職，開始撰寫橫跨六十二年的回憶錄。南方迷霧一役中陳浩、王森、林志三人的名字，將各自佔據完整一章——連同當年軍部隱瞞的腐敗真相。歷史修正派在出版前夜發動圍剿，企圖讓這本書與三名陣亡者一同沉入黑暗。',
  mapId: 'island',
  maxWaves: 6,
  specialRules: [
    '回憶錄保衛戰：地圖採用「島嶼」分流',
    '老將軍最後一戰：所有塔射速 +20%、傷害 +10%',
    '為兄弟而寫：起始資金 1900、生命 15、塔造價 -25%',
    '替亡靈記錄：擊殺敵人 +45% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.2,
    enemyRewardMult: 1.45,
    startingMoney: 1900,
    startingHealth: 15,
    towerCostMult: 0.75,
  },
  preBattleDialogue: [
    {
      speaker: '老奧斯卡將軍（62 歲）',
      text: '陳浩、王森、林志——這本書的前三章，我寫了整整兩年。每一個字，都是從迷霧裡帶出來的。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '將軍，歷史修正派的人已經封鎖了出版通路。他們說您「動搖軍心」。',
      expression: 'serious',
    },
    {
      speaker: '老奧斯卡將軍（62 歲）',
      text: '動搖軍心的不是真相，是謊言。當年若不是有人貪圖軍功、延誤救援，他們三個本可以活著走出迷霧。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '修正派武裝小隊正從三座島嶼橋頭推進，目標是銷毀手稿與備份伺服器。預估十五分鐘後接觸。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '我陪您打。這一仗跟軍階無關——是替三個再也無法為自己辯護的兄弟，守住他們的名字。',
      expression: 'serious',
    },
    {
      speaker: '老奧斯卡將軍（62 歲）',
      text: '指揮官，我六十二歲了，跑不動當年的衝鋒節奏。但守稿這種仗，我還打得動。',
      expression: 'normal',
    },
    {
      speaker: '老奧斯卡將軍（62 歲）',
      text: '三十年前，我獨自走出迷霧，一個字都說不出來。今天，我要替他們把該說的話全部寫完——誰也別想撕掉。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '手稿已同步至七處離線備份。但現場原始檔若被毀，將軍親手批注的邊欄手記將永久遺失。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '那就守到最後一頁。將軍，您只管寫——前面交給我們。',
      expression: 'serious',
    },
    {
      speaker: '老奧斯卡將軍（62 歲）',
      text: '好。為了陳浩、王森、林志——開戰。',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '老奧斯卡將軍（62 歲）',
      text: '修正派全部繳械。手稿一頁未損——連邊欄上陳浩畫的小人，都還在。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '出版日期照舊。軍部那邊，我會親自去談。',
      expression: 'serious',
    },
    {
      speaker: '老奧斯卡將軍（62 歲）',
      text: '陳浩、王森、林志——你們的故事，不會再被埋進檔案室的灰裡了。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '回憶錄預購量已突破三百萬冊。初泉河畔的紀念碑前，有人開始朗讀第三章的草稿。',
      expression: 'normal',
    },
  ],
  rewards: {
    coins: 2300,
    talentPoints: 16,
  },
};
