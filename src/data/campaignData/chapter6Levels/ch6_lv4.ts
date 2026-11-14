import type { CampaignLevel } from '@/types/campaign';

export const ch6_lv4: CampaignLevel = {
  id: 'ch6_lv4',
  chapter: 6,
  level: 4,
  title: '對峙',
  description:
    '鏡像指揮官親自送出第一條跨維度通訊。他不是來宣戰的，而是來邀請——要指揮官加入他們，一起奪回被軍部隱瞞的真相。在拒絕的同時，他派出第一批親兵：那是鏡像指揮官的私人精銳，這場仗是兩個指揮官之間的決鬥。',
  mapId: 'island',
  maxWaves: 7,
  isBossLevel: false,
  specialRules: [
    '親兵戰：敵人血量 +30%、獎勵 +20%',
    '島嶼戰場：使用「中央島嶼」分流地形',
    '個人決鬥：起始資金 1500、生命 14',
    '雙倍積分：擊殺敵人金錢獎勵翻倍',
  ],
  modifiers: {
    enemyHealthMult: 1.3,
    enemyRewardMult: 1.5,
    startingMoney: 1500,
    startingHealth: 14,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，緊急！裂縫對面——他要直接通話。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '接通。我也想親眼看看另一個我。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官',
      text: '⋯ 終於見面了，「我自己」。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '你不是我。你是另一條時間線的某個人。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官',
      text: '不——我們是同一個人。同樣的童年、同樣的家鄉、同樣的初泉河夕陽。差別只在於，三年前我死了，敵方用能量重組把我救了回來。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '然後你就換了陣營？',
      expression: 'angry',
    },
    {
      speaker: '鏡像指揮官',
      text: '不是換，是醒了。軍部一直把我當棋子，所謂保家衛國，不過是替當權者打仗。等你看見核心的真相，你也會做出跟我一樣的選擇。',
      expression: 'angry',
    },
    {
      speaker: '指揮官 (你)',
      text: '我不接受。和平是我們用命換來的，不是用背叛換來的。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官',
      text: '那就用武力說服你。親兵部隊，進入裂縫。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '對方親兵已進入戰場。指揮官，讓他看看——沒有死的指揮官是什麼樣子。',
      expression: 'angry',
    },
    {
      speaker: '指揮官 (你)',
      text: '收到。另一個我，既然你想決鬥，我就用過去學會的一切回敬你。',
      expression: 'angry',
    },
    {
      speaker: '鏡像指揮官',
      text: '⋯ 拼吧。誰贏，誰決定核心的命運。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '親兵部隊全數擊退，對方個人指揮鏈已斷。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '他不會就此罷手。下一次，他會親自出來。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我把通話中提到的「核心」做了交叉比對——指的是初泉河底下的某個物體。三百年前的瓜瓜文獻稱之為「世界誕生的種子」。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '聽起來像神話。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '神話常常是真實事件的回憶。如果核心是真的，兩個瓜瓜大地可能源於同一條根。建議在他們找到之前，我們先去找。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 2800,
    talentPoints: 16,
    unlockTower: ['laser'],
  },
};
