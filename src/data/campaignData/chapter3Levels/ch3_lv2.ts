import type { CampaignLevel } from '@/types/campaign';

export const ch3_lv2: CampaignLevel = {
  id: 'ch3_lv2',
  chapter: 3,
  level: 2,
  title: '廢棄實驗室',
  description:
    '進入冥蛇廢棄實驗室，三十年前的研究紀錄揭示 Lambda 的真實身分 — 曾拯救三百萬人的國家英雄，卻因女兒之死走上瘋狂。實驗體從對角通道全速衝出，每一秒都可能撕裂防線。',
  mapId: 'diagonal',
  maxWaves: 5,
  specialRules: [
    '實驗失控：敵人移動速度提升 50%',
    '進化變異：敵人生命值增加 20%',
    '懸賞加成：擊殺金錢增加 40%',
    '雷射授權：通關解鎖雷射塔',
  ],
  modifiers: {
    enemySpeedMult: 1.5,
    enemyHealthMult: 1.2,
    enemyRewardMult: 1.4,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，我已駭入實驗室主機。您可能想坐下來聽接下來的內容。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '「冥蛇」目標是生物與能量結合的遠端戰爭單位；主持人 Lambda 本名拉姆達 · 維恩 — 曾是科學院院長、拯救三百萬人的國家英雄。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '源頭是我們自己人？',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '四十歲失去女兒後，他試圖用冥蛇科技「復活」她 — 失敗了。從那天起他堅信個體無意義，被軍部終身監禁後在爆炸中消失，把自己變成了實驗體。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '父親的悲劇不能成為屠殺的藉口。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '培養槽已失控，實驗體從對角通道全速衝出 — 比預估快 50%。主控台有雷射塔藍圖，撐過此戰即可解鎖。',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '建議在通道中央部署狙擊塔，兩側搭配冰凍塔。擊殺懸賞加成四成，資金壓力會小一些。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '我們不只是贏 — 要結束 Lambda 的痛苦。開戰！',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '實驗體肅清，雷射塔藍圖已解鎖。日誌寫著要把整個瓜瓜變成「新意識」 — 五名研究員的殘留意識也已解脫。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '用 Lambda 的科技打 Lambda 的怪物 — 諷刺，但有效。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【Lambda 通訊】你看到了我的過去。三方圍剿見 — 三條路同時湧出敵軍，你還撐得住嗎？通訊結束。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '我為他的女兒哀悼，但不會原諒他。來吧，Lambda — 讓我看看還有什麼把戲。',
      expression: 'angry',
    },
  ],
  rewards: {
    coins: 3000,
    talentPoints: 40,
    unlockTower: ['laser'],
  },
};
