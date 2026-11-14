import type { CampaignLevel } from '@/types/campaign';

export const ch16_lv4: CampaignLevel = {
  id: 'ch16_lv4',
  chapter: 16,
  level: 4,
  title: '麵包師的真實考驗',
  description:
    '和平並未降臨平行時間線。一支「拒絕文官治鎮」的軍方派系殺到初泉鎮，認定沒上過戰場的麵包師不配享受安穩生活，要把他強征入伍。麵包師指揮官拒絕退讓，要求獨自指揮十字街防線——老指揮官這次只旁觀，看他能否用「火候與耐心」證明：沒當軍人，也能守住家鄉。',
  mapId: 'cross',
  maxWaves: 7,
  isBossLevel: true,
  specialRules: [
    '麵包師獨自戰：地圖採用「十字交叉」',
    '老兵旁觀：所有塔射速 +20%、傷害 +10%',
    '證明自己：起始資金 2200、生命 16、塔造價 -25%',
    '雙倍獎勵：擊殺敵人 +60% 金錢',
    '麵包師奇蹟：每波結束自動回血 2 點',
  ],
  modifiers: {
    enemyHealthMult: 1.4,
    enemySpeedMult: 1.2,
    enemyRewardMult: 1.5,
    startingMoney: 2200,
    startingHealth: 16,
    towerCostMult: 0.75,
  },
  preBattleDialogue: [
    {
      speaker: '麵包師指揮官',
      text: '⋯ 另一個我，這次換我來。政變部隊要把我拖上戰場——我想用自己的方式拒絕。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 他們有正規編制、交叉火力、還熟悉城鎮巷戰。你確定不讓我插手？',
      expression: 'serious',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 確定。若永遠靠你代打，鎮上的人只會說「麵包師運氣好」，不會說「麵包師守住了」。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 指揮官，依戰術模型推算，麵包師指揮官勝率約 41%。但「旁觀不介入」是他目前最需要的尊嚴。',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 好，我退到指揮台後方。麵包師，把你教我的「等麵包出爐」的耐心用上去。',
      expression: 'normal',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 我會把塔升級當成調火候——太早太貴，太晚來不及。十字街四向，我一個人顧。',
      expression: 'serious',
    },
    {
      speaker: '政變部隊指揮官',
      text: '⋯ 初泉鎮的麵包師，戰爭不是烤箱。要麼入伍，要麼讓開。',
      expression: 'angry',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 我選第三種——留下來，把你們擋在鎮外。沒當過軍人，不代表不會打仗。',
      expression: 'angry',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 我在這裡看著。麵包師，讓他們知道——另一條路上的我，也有資格守護這片土地。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '麵包師指揮官',
      text: '⋯ 撐下來了。手被燙過、被嚇過，但十字街還在我們手上。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 你的打法跟我完全不同——不搶先、不冒進，像等麵包二次發酵一樣穩。',
      expression: 'happy',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 烤箱教會我一件事：火候對了，慢一點也來得及。塔升級時機，我也是這樣判斷的。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 我打了五十年快仗，從沒想過「慢」也是戰術。麵包師，我真心為你驕傲。',
      expression: 'happy',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 你比我多打了無數場仗，我比你多等過無數次出爐。兩個我，都有自己的智慧。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 指揮官，政變部隊已撤退。平行時間線的鎮民開始稱呼他為「麵包師指揮官」——不是諷刺，是敬意。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 2800,
    talentPoints: 18,
  },
};
