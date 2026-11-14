import type { CampaignLevel } from '@/types/campaign';

export const ch8_lv1: CampaignLevel = {
  id: 'ch8_lv1',
  chapter: 8,
  level: 1,
  title: '北方冰原',
  description:
    '新瓜瓜大地誕生第三十天，軍部宣布進入「探索期」。指揮官、鏡像指揮官與艾莉絲組成首支北極勘察隊，前往融合時臨時生成的北方冰原。這裡沒有舊地圖、沒有舊敵情，只有一片等待被命名的白。但冰面上那道六趾足跡，提醒所有人：和平不等於空白。',
  mapId: 'straight',
  maxWaves: 5,
  specialRules: [
    '探索戰：地圖採用「直線」基本路線',
    '冰原寒風：所有塔射速 -10%（遊戲示意）',
    '輕裝上陣：起始資金 1200、生命 13',
    '足跡發現：擊殺敵人額外 +20% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.0,
    enemyRewardMult: 1.2,
    startingMoney: 1200,
    startingHealth: 13,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，北極勘察隊已抵達冰原邊界。氣溫 -38°C，風速每秒 14 公尺。建議全員啟動保溫護盾。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 融合後的第一個月，全大陸都在慶祝。我們卻選擇往北走。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官',
      text: '⋯ 因為「和平」不是停下來，是確認腳下踩的是什麼。哥，這道理是你教我的。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '這片冰原在融合前不存在。核心是為了平衡能量，臨時開闢的新地帶。我們是第一批進入的瓜瓜人。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '沒有敵情通報、沒有污染讀數。這種安靜，反而讓我不習慣。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 等等。前方兩百公尺偵測到地表異常——有一道足跡，而且正在朝我們延伸。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '足跡？這裡才剛形成，怎麼會有人先來過？',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '六趾、足長四十五公分、深度顯示體重約三百八十公斤。不符合任何已知瓜瓜生物。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官',
      text: '⋯ 也就是說，新世界不只合併了兩個我們，還夾帶了「第三種居民」。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '生命訊號接近中。對方沒有發出敵意波段，但正在加速。',
      expression: 'angry',
    },
    {
      speaker: '指揮官 (你)',
      text: '先示警，再接觸。若對方攻擊，我們只阻擋、不追殺。這是探索，不是開戰。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '指揮官 (你)',
      text: '⋯ 牠們退回去了。不像來打仗，比較像在趕走入侵者。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '腦波讀數顯示「驚嚇」與「領域保護」。我推測牠們是融合時被抽出的新生種，把這片冰原當成唯一的家。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官',
      text: '⋯ 好消息是，我們沒有把第一場探索打成征服。壞消息是，地圖上還有很多問號。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '足跡往東北延伸，至少還有三組不同步幅。指揮官，和平的第一天，我們已經知道這世界比想像中更擁擠。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 記下來。從這裡開始，一塊塊把未知畫進新地圖。',
      expression: 'normal',
    },
  ],
  rewards: {
    coins: 1500,
    talentPoints: 10,
  },
};
