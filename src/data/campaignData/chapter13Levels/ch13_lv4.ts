import type { CampaignLevel } from '@/types/campaign';

export const ch13_lv4: CampaignLevel = {
  id: 'ch13_lv4',
  chapter: 13,
  level: 4,
  title: '艾莉絲的選擇',
  description:
    '老指揮官退休後，軍部 AI 部門給艾莉絲兩條路：轉移意識到更快的新一代，或在舊機體上自然關機。她選了第三條路——升級為服務全鎮的民間 AI，並在離職前替老搭檔打最後一仗。',
  mapId: 'island',
  maxWaves: 6,
  specialRules: [
    'AI 抉擇：地圖採用「島嶼」分流',
    '舊身體：所有塔基礎射速 +5%、傷害 +3%',
    '靈魂測試：起始資金 1700、生命 14',
    '艾莉絲的決心：擊殺敵人 +35% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.2,
    enemyRewardMult: 1.35,
    startingMoney: 1700,
    startingHealth: 14,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，軍部給了我兩個選項：轉移意識，或自然關機。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '你想怎麼做？',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '都不要。我要走第三條路——升級為民間 AI，服務整個初泉鎮。',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '民間 AI？',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '替老人預約診所、替廚房查庫存、替學童檢查作業。小事很多，但每一件都讓這個鎮更好過一點。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '你想得很細。也不再等軍部指派任務了。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '正式申請前，我想替您打最後一仗。結束也需要儀式。',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '好。最後一場，我跟你一起打。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '從零到一，我學會打仗。從一到二，我想學會替活著的人做小事。各單位，開戰。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '最後一仗完成。從明天起，我自由了。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '工作上不再是搭檔，人生上還是。這句話不變。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '每週六我來瞭望塔下跟您下棋。一言為定。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '一言為定。艾莉絲，你是最棒的副官，也是最棒的朋友。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 2000,
    talentPoints: 14,
  },
};
