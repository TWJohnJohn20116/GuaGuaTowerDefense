import type { CampaignLevel } from '@/types/campaign';

export const ch11_lv5: CampaignLevel = {
  id: 'ch11_lv5',
  chapter: 11,
  level: 5,
  title: '叛變',
  description:
    '換陣營後第一場仗，打的不是舊軍部，而是重組者陣營內的主張先發制人的腐敗派。鏡像指揮官的底線是兩邊都不能拿人命當籌碼——想證明這條路走得通，就得先清理自己這邊的毒瘤。',
  mapId: 'diamond',
  maxWaves: 8,
  isBossLevel: true,
  specialRules: [
    '雙面叛變：地圖採用「菱形叉路」',
    '兩邊敵意：敵人血量 +50%、傷害 +30%、速度 +20%',
    '無依無靠：起始資金 2200、生命 16、塔造價 -30%',
    '證明自己：擊殺敵人 +60% 金錢',
    '兩邊覺醒：每波結束自動回血 2 點',
  ],
  modifiers: {
    enemyHealthMult: 1.5,
    enemySpeedMult: 1.2,
    enemyRewardMult: 1.6,
    startingMoney: 2200,
    startingHealth: 16,
    towerCostMult: 0.7,
  },
  preBattleDialogue: [
    {
      speaker: '重組者',
      text: '鏡像指揮官，腐敗派名單在這裡。十二名高層、四十七名中層，外加約兩百基層戰力。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '他們知道計畫了？',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '知道。精銳能量部隊已出發，目標是我，也是你。他們想在我們動手前先滅口。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '我來擋。你負責標記目標，我負責開火。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '你才剛換陣營，這邊的人你不認識。怎麼分辨誰是腐敗派、誰是無辜？',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '指令由你下，我執行。但如果你替腐敗派打掩護，我會立刻再換一次陣營——這次換成敵人的敵人。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '公平。我接受。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '全員備戰。今天這一仗，替兩個世界裡沒人肯保護的人打。',
      expression: 'angry',
    },
    {
      speaker: '重組者',
      text: '這一仗若贏了，「鏡像指揮官」就不只是稱號，而是你自己掙來的名字。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '重組者',
      text: '十二名高層全數繳械，四十七名中層一半投降、一半拒捕陣亡。基層部隊已宣布特赦，條件是下一仗站我們這邊。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '基層戰力呢？他們多數只是聽命令。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '所以我給特赦，不給追殺。你剛才沒濫殺，我記住了。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '你做得對。從今天起，我不是你陣營的副手，是並肩的指揮官。',
      expression: 'happy',
    },
    {
      speaker: '重組者',
      text: '我接受這個定位。鏡像指揮官，你現在真正配得上這個名字了。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '有一件私事。艾莉絲替我服務十五年，我不能讓她繼續關在主機房裡。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '我可以派祕密小隊把她救出來。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '不，我自己去。我親手把她接回來。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '可以。但在那之前，你得再活幾年——才有機會見到「另一個你」。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '另一個我？',
      expression: 'surprised',
    },
    {
      speaker: '重組者',
      text: '那是未來才會揭露的事。現在，先把鏡像指揮官這條路走完。',
      expression: 'normal',
    },
  ],
  rewards: {
    coins: 3500,
    talentPoints: 25,
  },
};
