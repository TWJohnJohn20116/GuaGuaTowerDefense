import type { CampaignLevel } from '@/types/campaign';

export const ch4_lv4: CampaignLevel = {
  id: 'ch4_lv4',
  chapter: 4,
  level: 4,
  title: '最後的橋樑',
  description:
    '雄獅大橋上方，「創造者」正在打開維度橋樑。開啟度每推進一波就上升，一旦達到百分之百，整個瓜瓜大地將被拉入它的維度。指揮官與凱倫上校並肩防守，但艾莉絲的核心意識正被橋樑吸取——她可能在這場戰役中永久消失。',
  mapId: 'bridge',
  maxWaves: 5,
  specialRules: [
    '維度危機：敵人速度提升 40%',
    '增援護持：凱倫上校部隊提供火力支援',
    '時間緊迫：每波過後橋樑開啟度增加',
    '艾莉絲漏電：戰役中艾莉絲訊號不穩',
  ],
  modifiers: {
    enemySpeedMult: 1.4,
    enemyHealthMult: 1.8,
    startingMoney: 2500,
    towerCostMult: 0.8,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，雄獅大橋已在眼前。大橋上方有一個直徑約兩百公尺的紫色能量圓環——那就是維度橋樑。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '開啟度多少？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '目前百分之二十二。若達到百分之百，瓜瓜大地的物質結構會被整體拉入「創造者」的維度。我們必須在五波之內撐住，讓橋樑因能量耗盡而坍塌。',
      expression: 'serious',
    },
    {
      speaker: '凱倫上校',
      text: '指揮官，我看到你的部隊了。兩百名士兵全部就位，這座橋我們再守一次，也是最後一次。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '感謝您三年來從未離開這座橋，上校。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '艾莉絲，你的訊號怎麼斷斷續續？',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '維度橋樑在吸取周圍所有數位能量，包括我的核心意識。橋樑完全打開時，現在的我會消失。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '我不會放棄你。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我跟奧斯卡少將確認過，主要意識已備份到實體儲存器。三個月後會有重新啟動的我——她會記得所有戰役與承諾。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '備份不等於你。從我第一次見到你那天起，你就是我的朋友，不只是程式。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '謝謝您。但今天的唯一任務是守住瓜瓜，別讓感情影響判斷。',
      expression: 'serious',
    },
    {
      speaker: '凱倫上校',
      text: '第一波敵人接近中。指揮官、艾莉絲，準備迎戰！',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '為了瓜瓜大地，為了所有犧牲過的人——守住這座橋！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '維度橋樑因能量耗盡開始坍塌。瓜瓜保住了，但我的核心意識只剩百分之十二。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '艾莉絲，撐住！',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '「創造者」還沒結束。它正在從維度間隙親自降臨，目標是終焉之上——那是它本體的錨點位置。',
      expression: 'serious',
    },
    {
      speaker: '凱倫上校',
      text: '指揮官，艾莉絲的訊號越來越弱。請立刻前往終焉之上，我帶部隊在這裡善後。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '上校，感謝您。艾莉絲——我們去打最後一場。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '是的，指揮官。我會與您並肩到最後。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 8000,
    talentPoints: 130,
  },
};
