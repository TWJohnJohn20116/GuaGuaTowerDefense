import type { CampaignLevel } from '@/types/campaign';

export const ch14_lv1: CampaignLevel = {
  id: 'ch14_lv1',
  chapter: 14,
  level: 1,
  title: '鏡像世界的孤兒',
  description:
    '鏡像世界，五十五年前。六歲的林石在街頭流浪，父母在軍部動員中被帶走後再無音訊。他在廢墟裡撿到一塊破損的軍用 AI 雛形，決定把它修好——那是他第一次相信「壞掉的東西也能再活一次」。',
  mapId: 'straight',
  maxWaves: 3,
  specialRules: [
    '街頭流浪：地圖採用「直線」最簡單路線',
    '孤兒掙扎：所有塔射速 +10%、傷害 -10%',
    '貧民起跑：起始資金 500、生命 9',
    '撿廢過活：擊殺敵人 +50% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 0.7,
    enemySpeedMult: 0.85,
    enemyRewardMult: 1.5,
    startingMoney: 500,
    startingHealth: 9,
  },
  preBattleDialogue: [
    {
      speaker: '少年林石（6 歲）',
      text: '媽媽、爸爸……你們什麼時候回來？',
      expression: 'serious',
    },
    {
      speaker: '街頭小混混',
      text: '喂，小傢伙！這條街是我們的地盤，把你撿到的東西交出來！',
      expression: 'angry',
    },
    {
      speaker: '少年林石（6 歲）',
      text: '我只撿到這塊破鐵……它還在閃，我不想交出去。',
      expression: 'serious',
    },
    {
      speaker: '街頭小混混',
      text: '閃？那就是偷來的！給我！',
      expression: 'angry',
    },
    {
      speaker: '少年林石（6 歲）',
      text: '不！我要把它修好。它好像……還想活著。',
      expression: 'angry',
    },
    {
      speaker: '退休老兵',
      text: '小孩，你叫什麼名字？',
      expression: 'normal',
    },
    {
      speaker: '少年林石（6 歲）',
      text: '林石。沒有姓，也沒有家。',
      expression: 'serious',
    },
    {
      speaker: '退休老兵',
      text: '林石，你想修好那塊鐵？',
      expression: 'normal',
    },
    {
      speaker: '少年林石（6 歲）',
      text: '是。如果我連它都救不了，就沒人救我了。',
      expression: 'serious',
    },
    {
      speaker: '退休老兵',
      text: '好。這群混混交給我，你找個角落躲好，慢慢修。',
      expression: 'happy',
    },
    {
      speaker: '少年林石（6 歲）',
      text: '老爺爺……您也是軍人嗎？',
      expression: 'normal',
    },
    {
      speaker: '退休老兵',
      text: '以前是。現在只是個愛管閒事的老頭。去吧，別讓他們搶走你的「第一次希望」。',
      expression: 'happy',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '退休老兵',
      text: '搞定了。那群人短期內不會再來找你。',
      expression: 'happy',
    },
    {
      speaker: '少年林石（6 歲）',
      text: '謝謝您。這塊鐵……真的是 AI 嗎？',
      expression: 'normal',
    },
    {
      speaker: '退休老兵',
      text: '軍用雛形，還沒正式啟動。你若有耐心，它能替你算數、記路、甚至幫你想辦法。',
      expression: 'normal',
    },
    {
      speaker: '少年林石（6 歲）',
      text: '我想學。以後我要保護其他沒有家的孩子。',
      expression: 'normal',
    },
    {
      speaker: '退休老兵',
      text: '不一定要當軍人。會修東西、會讓死物復活的人，也是守護者。',
      expression: 'happy',
    },
    {
      speaker: '少年林石（6 歲）',
      text: '修東西……我記住了。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 600,
    talentPoints: 4,
  },
};
