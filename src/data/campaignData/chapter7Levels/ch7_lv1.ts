import type { CampaignLevel } from '@/types/campaign';

export const ch7_lv1: CampaignLevel = {
  id: 'ch7_lv1',
  chapter: 7,
  level: 1,
  title: '重影',
  description:
    '兩個瓜瓜大地融合後的第三天，中央城市開始出現異常。市民回報在街上迎面遇見「另一個自己」——多數只是驚嚇一場，但部分重影已敵意化，主動攻擊原版。指揮官必須在核心完成個體合併前，穩住這座城市的防線。',
  mapId: 'corridor',
  maxWaves: 5,
  specialRules: [
    '重影襲擊：敵人外觀為「鏡像扭曲體」',
    '記憶錯亂：每波結束有 50% 機率隨機交換 2 座塔的位置',
    '雙倍補給：起始資金 1500、生命 14',
    '城市戰：使用「長廊」走道地形',
  ],
  modifiers: {
    enemySpeedMult: 1.1,
    startingMoney: 1500,
    startingHealth: 14,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，中央城市過去十二小時內通報 273 起「重影目擊」。市民走在街上，會迎面碰上長相、衣著、步態都與自己一模一樣的另一個人。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 融合才剛開始三天，就有這種規模？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '應該是兩邊世界殘留的分身——同一個人在兩個版本裡同時存在，核心還沒來得及把它們合併成一個。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '那為什麼有些重影會攻擊「原版」？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '當兩個版本的記憶分歧過大，系統會判定為「不相容」。其中一個分身會試圖消除另一個——就像兩份檔案搶著覆蓋硬碟。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 也就是說，我也可能在路上遇見另一個我。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '鏡像指揮官已與您整合完畢，理論上不會再分裂。但一般市民沒有這層保護——敵意化重影正在中央走道聚集。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '收到。先穩住走道防線，儘量不傷及無辜。這是融合的第一筆代價，我們得親手扛下來。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '重影攻擊已全面退散。市民傷亡：十二人重傷，零死亡。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '十二人重傷還是太多了。下次得想辦法不戰而解。',
      expression: 'serious',
    },
    {
      speaker: '核心',
      text: '⋯ 父親，抱歉。個體合併的速度比我想像的慢——兩個世界的記憶量，遠超我原本的估算。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '沒關係。你正在做從未有人做過的事，我們會幫你撐住。',
      expression: 'normal',
    },
    {
      speaker: '核心',
      text: '⋯ 但融合過程中，我發現了一個被遺漏的東西。鏡像世界那邊，有一群人在「死亡瞬間」被凍結——不是死了，是停在了那一刻。',
      expression: 'serious',
    },
    {
      speaker: '核心',
      text: '現在解凍了。有些人正在找回人生，但也有些人因為太久沒有真正活過，變成了空殼⋯',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 2000,
    talentPoints: 12,
  },
};
