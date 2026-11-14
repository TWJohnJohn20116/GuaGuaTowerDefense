import type { CampaignLevel } from '@/types/campaign';

export const ch8_lv3: CampaignLevel = {
  id: 'ch8_lv3',
  chapter: 8,
  level: 3,
  title: '歌唱森林',
  description:
    '南方山脈背後，一片融合後新生的發光森林正在「唱歌」——歌聲裡有兩個世界各自的童年與家鄉。指揮官小隊原打算在此紮營休整，卻發現部分樹木無法接受合一，尖叫聲把動物逼成狂怒之獸。治癒破碎記憶，是探索期最溫柔、也最危險的一課。',
  mapId: 'snake',
  maxWaves: 6,
  specialRules: [
    '森林戰場：地圖採用「蛇形」蜿蜒路線',
    '聲波擾動：敵人具「狂怒」狀態，攻擊性 +20%',
    '歌之諧律：擊殺敵人 +25% 金錢',
    '林中駐紮：起始資金 1900、生命 14',
  ],
  modifiers: {
    enemyHealthMult: 1.15,
    enemySpeedMult: 1.1,
    enemyRewardMult: 1.25,
    startingMoney: 1900,
    startingHealth: 14,
  },
  preBattleDialogue: [
    {
      speaker: '指揮官 (你)',
      text: '⋯ 艾莉絲，你聽見了嗎？整片森林在唱歌。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '不是動物，也不是人。是樹幹在震動發聲。頻譜顯示，內容是兩個世界融合前的民謠與搖籃曲。',
      expression: 'surprised',
    },
    {
      speaker: '鏡像指揮官',
      text: '⋯ 我聽見媽媽哼過這首。你這邊的版本，歌詞不一樣，旋律卻完全對得上。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '這裡像一座露天紀念館。不是讓人打仗，是讓人記得自己從哪裡來。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '可惜不是所有記憶都願意被保存。東側有三棵樹的頻率紊亂，聲音已從歌變成尖叫。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 那些是「不肯融合」的碎片？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '是。尖叫正在污染周邊動物的神經節律，牠們失去理性，朝我們衝過來了。',
      expression: 'angry',
    },
    {
      speaker: '鏡像指揮官',
      text: '動物是無辜的。問題在樹，不在牠們。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '任務改為「調諧」：找出尖叫的源頭，切斷不諧音。能不殺的，一隻都別殺。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '收到。我會用「歌之諧律」反向匹配。指揮官，這可能是探索期裡，最接近心理戰的一仗。',
      expression: 'normal',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '三棵尖叫之樹已調回和聲。森林動物正在恢復理性，預計兩天內回到正常行為。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官',
      text: '⋯ 哥，你聽。兩首媽媽的歌，現在合成同一首了。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 很美。這才是我想要的和平——不是沒有聲音，是終於能一起唱。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '不過，林底還有一段極低頻率我沒解開。它不攻擊，只是在「等」。指揮官，有些隱憂不會尖叫，只會沉默。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 標記位置。探索期才剛開始，我們有的是時間把它聽清楚。',
      expression: 'normal',
    },
  ],
  rewards: {
    coins: 2200,
    talentPoints: 14,
  },
};
