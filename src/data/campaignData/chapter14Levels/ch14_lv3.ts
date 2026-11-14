import type { CampaignLevel } from '@/types/campaign';

export const ch14_lv3: CampaignLevel = {
  id: 'ch14_lv3',
  chapter: 14,
  level: 3,
  title: '靈魂沒有回來',
  description:
    '林石二十八歲。他第一次嘗試重組整隻生物——對象是陪伴十二年的老貓咪咪，已經死了三天。身體成功甦醒，卻不認得他、攻擊一切。林石第一次明白：能量可以重組，靈魂卻不會自動跟上。',
  mapId: 'island',
  maxWaves: 5,
  specialRules: [
    '失控實驗：地圖採用「島嶼」分流',
    '心痛之戰：所有塔射速 -10%（林石無心戰鬥）',
    '失敗的代價：起始資金 1100、生命 11',
    '為咪咪而戰：擊殺敵人 +40% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.15,
    enemySpeedMult: 1.1,
    enemyRewardMult: 1.4,
    startingMoney: 1100,
    startingHealth: 11,
  },
  preBattleDialogue: [
    {
      speaker: '青年林石（28 歲）',
      text: '咪咪……是我，林石。你還認得我嗎？',
      expression: 'serious',
    },
    {
      speaker: '重組後的咪咪',
      text: '嘶——！',
      expression: 'angry',
    },
    {
      speaker: '青年林石（28 歲）',
      text: '七年研究全灌進去了……身體明明回來了，為什麼眼神是空的？',
      expression: 'serious',
    },
    {
      speaker: '重組後的咪咪',
      text: '嘶嘶嘶！',
      expression: 'angry',
    },
    {
      speaker: '青年林石（28 歲）',
      text: '別砸！那是實驗紀錄！',
      expression: 'angry',
    },
    {
      speaker: '青年林石（28 歲）',
      text: '糟了……失控的重組殘骸也被驚醒了，全部衝向出口！',
      expression: 'angry',
    },
    {
      speaker: '青年林石（28 歲）',
      text: '如果讓它們跑出去，街區會遭殃。我得擋住——包括你，咪咪。',
      expression: 'serious',
    },
    {
      speaker: '青年林石（28 歲）',
      text: '對不起。等這場結束，我會讓你再睡一次。這次……不會再弄錯。',
      expression: 'serious',
    },
    {
      speaker: '青年林石（28 歲）',
      text: '實驗室防禦系統，啟動。這是我第一次為「失敗」而戰。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '青年林石（28 歲）',
      text: '咪咪……對不起。我又一次沒能完整地把你帶回來。',
      expression: 'serious',
    },
    {
      speaker: '青年林石（28 歲）',
      text: '身體回來了，靈魂沒有。這不是治療，是製造另一種死亡。',
      expression: 'serious',
    },
    {
      speaker: '青年林石（28 歲）',
      text: '我學到了：重組不只是修復細胞，還得修復「記憶與自我」。',
      expression: 'serious',
    },
    {
      speaker: '青年林石（28 歲）',
      text: '靈魂重組……再花十年。下一次叫你回來，我要連「你記得我」一起帶回來。',
      expression: 'serious',
    },
    {
      speaker: '青年林石（28 歲）',
      text: '從今天起，我的研究方向改了。不再只是能量重組——是靈魂重組。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1300,
    talentPoints: 10,
  },
};
