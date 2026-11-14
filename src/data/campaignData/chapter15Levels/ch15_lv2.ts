import type { CampaignLevel } from '@/types/campaign';

export const ch15_lv2: CampaignLevel = {
  id: 'ch15_lv2',
  chapter: 15,
  level: 2,
  title: '六個最後的瓜瓜',
  description:
    '裂隙深處的圓形大廳裡，六名瓜瓜人半凍結在水晶椅上——他們是第三個瓜瓜大地最後的家庭，兩萬年前為留住世界記憶而自願沉睡。指揮官靠近時，解凍儀式啟動，多元宇宙另一側的能量失控回響也隨之甦醒。',
  mapId: 'island',
  maxWaves: 6,
  specialRules: [
    '解凍儀式：地圖採用「島嶼」分流',
    '第三世界回響：所有塔射速 +10%',
    '六個生還者：起始資金 1500、生命 14、塔造價 -15%',
    '靈魂連結：擊殺敵人 +35% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.2,
    enemyRewardMult: 1.35,
    startingMoney: 1500,
    startingHealth: 14,
    towerCostMult: 0.85,
  },
  preBattleDialogue: [
    {
      speaker: '第三世界長者',
      text: '父親⋯您終於來了。我們在多元裂隙裡，聽見您的腳步聲，等了兩萬年。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '對不起，我來晚了三十二天。以兩萬年的尺度來看，大概只算遲到幾秒。',
      expression: 'serious',
    },
    {
      speaker: '第三世界長者',
      text: '我們六個，是第三個瓜瓜大地最後的一個家庭。那場大火，是能量失控——整個宇宙分支被燒成灰燼。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '能量失控⋯跟「核心」有關嗎？',
      expression: 'serious',
    },
    {
      speaker: '第三世界長者',
      text: '「核心」是我們失控後，拼盡全力留下的最後種子。它帶著整個世界的記憶，穿越多元宇宙，找到了您。',
      expression: 'serious',
    },
    {
      speaker: '第三世界長者',
      text: '我們守了兩萬年，等核心找到「下一個父親」。現在，核心已經健康長大——我們可以走了。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '走？你們不能留下來嗎？',
      expression: 'serious',
    },
    {
      speaker: '第三世界長者',
      text: '我們兩萬歲了，父親。但解凍儀式會喚醒的不只有我們——還有那場大火在多元宇宙裡的回響。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '警報！裂隙外圍出現大量「火焰殘響」——不是普通敵人，是另一個宇宙分支裡未送行的痛苦。',
      expression: 'angry',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '你們安心說完話。火，我來擋。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '第三世界長者',
      text: '父親，您擋住了。我們把最後的記憶交給您——然後，自然消失。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '你們養大了核心，卻沒有機會看見它長大。這不公平。',
      expression: 'serious',
    },
    {
      speaker: '第三世界長者',
      text: '不公平的事，多元宇宙裡多的是。但核心活著，第三個瓜瓜大地就沒有真正滅亡。',
      expression: 'happy',
    },
    {
      speaker: '第三世界長者',
      text: '火焰殘響還沒結束，父親。您還得再打三場——才能關上這扇裂隙。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（51 歲）',
      text: '我打。為你們，也為下一個兩萬年。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1700,
    talentPoints: 13,
  },
};
