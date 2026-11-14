import type { CampaignLevel } from '@/types/campaign';

export const ch6_lv2: CampaignLevel = {
  id: 'ch6_lv2',
  chapter: 6,
  level: 2,
  title: '來自彼岸的訪客',
  description:
    '裂縫不再閃爍，而是穩定成一道直徑十二公尺的持續開口。走出來的不再是模糊能量體，而是形體完整、攜帶武器的文明生物——步伐整齊，隊形嚴謹。它們不是來探路的，是先鋒部隊。',
  mapId: 'u_shape',
  maxWaves: 6,
  specialRules: [
    '裂縫穩定：每波敵人速度 +20%',
    '陌生科技：敵人有 25% 機率閃避近戰塔',
    '初次戰報：軍部支援 +500 起始金幣',
    '戰術紀律：敵人擊殺獎勵正常',
  ],
  modifiers: {
    enemySpeedMult: 1.2,
    startingMoney: 1000,
    startingHealth: 12,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，觀測站二次回報：裂縫已穩定，維持為直徑十二公尺的持續開口，沒有收縮跡象。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '它們沒打算走。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '更糟。這次出來的跟昨天那些不穩定能量體完全不同——形體完整、肢體對稱、攜帶武器，是文明生物。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '步伐有節奏，隊形有紀律。我敢打賭，這是軍隊。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '一支軍隊，從另一個維度直接走進我們的家。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '能量簽章跟瓜瓜大地的物理常數偏差百分之十七。它們閃避近戰武器的能力，疑似相位偏移——建議優先動用雷射與雷電塔。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '所以我們要打一場跨維度戰爭？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '是的。而且這是您擊敗創造者之後，第一次面對完全不認識的敵人。請保持冷靜——您比六個月前更強了。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '能量武器全線開火。讓它們知道，來瓜瓜大地是要付代價的。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '奧斯卡少將的增援資金已到帳。指揮官，這不是污染擴散的重演——這是從和平底下裂開的新傷口。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '指揮官 (你)',
      text: '它們的戰術太精準了，不像是第一次來。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '隊形變化、武器切換、撤退時機——全都有備而來。我從通訊頻率截獲一段話：「指揮官還活著，重複，這個世界的指揮官還活著。」',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 「這個世界的指揮官」？難道在它們那邊，我已經死了？',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我傾向相信裂縫另一邊是某種鏡像版本的瓜瓜大地。那邊的歷史跟我們有差異——而它們打過來，可能是因為那邊的指揮官已經輸了。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '那我們得搞清楚，那邊的我究竟發生了什麼事。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1800,
    talentPoints: 12,
    unlockTower: ['lightning'],
  },
};
