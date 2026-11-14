import type { CampaignLevel } from '@/types/campaign';

export const ch8_lv2: CampaignLevel = {
  id: 'ch8_lv2',
  chapter: 8,
  level: 2,
  title: '沉沒城市',
  description:
    '融合後第四十二天，東海岸海水突然退去三公尺，露出一座兩個世界都不記得的海底古城。街道完整、雕像細緻，卻無人居住。探索小隊登陸時，一群以為自己死去千年的瓜瓜人從水下現身——他們帶來重逢的希望，也帶來當年大潮一同沉眠的東西。',
  mapId: 'corridor',
  maxWaves: 6,
  specialRules: [
    '海底城市：地圖採用「長廊」城市街道',
    '潮汐戰場：每波結束敵人速度 +5%',
    '考古組：起始資金 1700、生命 14',
    '古文明饋贈：擊殺敵人 25% 機率掉落 +30 額外金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.1,
    enemySpeedMult: 1.05,
    enemyRewardMult: 1.3,
    startingMoney: 1700,
    startingHealth: 14,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，海面下浮起了一座完整城市。建築風格約一千五百年前，但兩邊歷史檔案都查無此城。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 兩個世界都遺失的記憶，被核心一起拉回來了？',
      expression: 'surprised',
    },
    {
      speaker: '鏡像指揮官',
      text: '比那更早。這可能是「分裂之前」的源頭世界殘影。我們不是在考古，是在撿回被丟掉的自己。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '潮汐穩定，適合登陸。軍部已把這裡列為「文化保存區」，禁止任何破壞性開採。',
      expression: 'normal',
    },
    {
      speaker: '沉沒市民代表',
      text: '⋯ 你 ⋯ 們 ⋯ 是 ⋯ 來 ⋯ 接 ⋯ 我們 ⋯ 回 ⋯ 家 ⋯ 的 ⋯ 嗎 ⋯',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '有人說話！艾莉絲，鎖定訊號！',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '水下街道約兩百個生命訊號，全是瓜瓜人。身體部分透明化，心跳頻率極低——他們處於長期半凍結狀態。',
      expression: 'surprised',
    },
    {
      speaker: '沉沒市民代表',
      text: '⋯ 一千年前 ⋯ 大潮把我們帶走 ⋯ 我們以為 ⋯ 世界忘了我們 ⋯',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 世界沒有忘。是新瓜瓜大地剛剛出生，才終於有力氣喊你們回來。',
      expression: 'normal',
    },
    {
      speaker: '沉沒市民代表',
      text: '⋯ 天上的光 ⋯ 喚醒了我們 ⋯ 但跟著醒來的 ⋯ 還有那年大潮帶走的東西 ⋯',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '海床深處出現高能反應。那些「東西」正在往城市主街移動，速度比預期快。',
      expression: 'angry',
    },
    {
      speaker: '沉沒市民代表',
      text: '⋯ 請先 ⋯ 撐住 ⋯ 我們的孩子 ⋯ 還在水下 ⋯',
      expression: 'angry',
    },
    {
      speaker: '指揮官 (你)',
      text: '收到。鏡像、艾莉絲，保護市民，清理海床。這一仗是為了讓失蹤的人真正上岸。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '沉沒市民代表',
      text: '⋯ 你們 ⋯ 真的把它們 ⋯ 擋下來了 ⋯',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '已啟動「逐步解凍」程序。三天內，他們可以安全上岸。這是探索期以來，第一次「找回人口」而不是「消滅威脅」。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官',
      text: '⋯ 哥，看見沒？核心不只合併兩個現代世界，還把失落的人一起織回來了。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 是啊。希望很亮。但海床深處還有兩處反應沒有消失，只是暫時安靜。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我會持續監測。指揮官，新世界的和平，看起來熱鬧，其實邊角還在滲水。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 沒關係。只要還有人被找回來，就值得繼續探索。',
      expression: 'normal',
    },
  ],
  rewards: {
    coins: 1900,
    talentPoints: 12,
  },
};
