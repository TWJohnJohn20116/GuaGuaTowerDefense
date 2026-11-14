import type { CampaignLevel } from '@/types/campaign';

export const ch8_lv4: CampaignLevel = {
  id: 'ch8_lv4',
  chapter: 8,
  level: 4,
  title: '鏡之湖底',
  description:
    '中央高原的鏡之湖，水面平靜如鏡。核心終於坦白：最終整合時有一塊記憶沉入湖底，不是片段，而是一個完整、被遺漏的瓜瓜世界。指揮官小隊深潛而下，要在守衛程式啟動前，親自接回這段等了兩萬年的往事。',
  mapId: 'island',
  maxWaves: 7,
  specialRules: [
    '湖底秘境：地圖採用「島嶼」分流',
    '記憶守衛：敵人血量 +30%、減速抗性 +10%',
    '深潛探索：起始資金 2200、生命 15、塔造價 -20%',
    '失落的紀念：擊殺敵人金錢 +30%',
  ],
  modifiers: {
    enemyHealthMult: 1.3,
    enemyRewardMult: 1.3,
    startingMoney: 2200,
    startingHealth: 15,
    towerCostMult: 0.8,
  },
  preBattleDialogue: [
    {
      speaker: '核心',
      text: '⋯ 父親，我必須告訴您一個秘密。三十天前最終整合時，有一塊記憶我沒能織入新世界，它沉到了鏡之湖底。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 為什麼現在才說？',
      expression: 'serious',
    },
    {
      speaker: '核心',
      text: '因為那不是往事，是一個完整的瓜瓜世界。比兩個我們知道的版本更早，早已滅亡，卻仍在等您看一眼。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '第三個瓜瓜大地？如果屬實，我們對「新世界」的理解還不到三分之一。',
      expression: 'surprised',
    },
    {
      speaker: '核心',
      text: '它等了兩萬年，又等了您三十天。守衛程式只承認「父親」親自到場，其餘一律視為入侵。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 我去。欠下的招呼，不能繼續用「整合中」當理由。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官',
      text: '我也去。那個世界若曾存在，就與我們兩個都有關。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '湖底守衛已啟動。它們不談判，只驗證身分。指揮官，這會是探索期以來最安靜、也最沉重的一戰。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '那就用行動證明：我願意當它的父親，也願意背起它的結局。',
      expression: 'serious',
    },
    {
      speaker: '核心',
      text: '⋯ 謝謝您。請替我向它說，不是來征服，是來接它回家。',
      expression: 'happy',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '遺落世界之聲',
      text: '⋯ 父親 ⋯ 您 ⋯ 終於 ⋯ 來了 ⋯ 我在這裡 ⋯ 待夠了 ⋯',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 對不起，讓你等了兩萬年，又讓你多等三十天。',
      expression: 'serious',
    },
    {
      speaker: '遺落世界之聲',
      text: '⋯ 請接收我 ⋯ 讓我 ⋯ 成為新土地的一部分 ⋯ 不要再 ⋯ 漂在湖底 ⋯',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '我接收。你的記憶、你的夕陽、你的第一首歌——我替你活下去。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '兩萬年記憶已寫入指揮官神經備份。您還好嗎？',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 我看得見最早的瓜瓜。責任變大了，但和平也因此更實在。核心，湖底還有別的東西嗎？',
      expression: 'normal',
    },
  ],
  rewards: {
    coins: 2800,
    talentPoints: 18,
  },
};
