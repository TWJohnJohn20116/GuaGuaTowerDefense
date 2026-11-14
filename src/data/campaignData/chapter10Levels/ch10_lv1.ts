import type { CampaignLevel } from '@/types/campaign';

export const ch10_lv1: CampaignLevel = {
  id: 'ch10_lv1',
  chapter: 10,
  level: 1,
  title: '年輕的奧斯卡',
  description:
    '時間倒回三十年前。剛升上少校的奧斯卡接手南方哨站，這裡十年來已有四支小隊進入迷霧後再無音訊。軍部催促主動偵察，他卻決定先穩固防線、不貿然派人——因為活著的軍人，比一份倉促的報告更珍貴。',
  mapId: 'straight',
  maxWaves: 4,
  specialRules: [
    '新官上任：地圖採用「直線」基礎防線',
    '哨站新生：所有塔射速 +5%',
    '前線部署：起始資金 1000、生命 12',
    '打好基礎：擊殺敵人 +20% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 0.95,
    enemyRewardMult: 1.2,
    startingMoney: 1000,
    startingHealth: 12,
  },
  preBattleDialogue: [
    {
      speaker: '少校奧斯卡',
      text: '副官，報告哨站現役兵力。',
      expression: 'serious',
    },
    {
      speaker: '哨站副官',
      text: '四十七名老兵、十二名新兵，重型武器零。補給只夠撐兩週。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '過去十年，四支小隊進了南方迷霧，沒有一個人回來。軍部要我主動偵察——我現在不派。',
      expression: 'serious',
    },
    {
      speaker: '哨站副官',
      text: '少校，這等於違抗命令。軍部會追責的。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '追責我來扛。我會寫信說明：在搞清楚迷霧是什麼之前，不拿人命去填。',
      expression: 'serious',
    },
    {
      speaker: '哨站副官',
      text: '……為什麼？其他哨站長都是先派人試探。',
      expression: 'normal',
    },
    {
      speaker: '少校奧斯卡',
      text: '因為哨站還站著。人死了，就什麼情報都帶不回來。',
      expression: 'serious',
    },
    {
      speaker: '哨站副官',
      text: '警報！迷霧邊緣有不明目標接近——它們走出來了！',
      expression: 'angry',
    },
    {
      speaker: '少校奧斯卡',
      text: '全員就定位，在哨站接戰。一個人都不要離開防線。',
      expression: 'serious',
    },
    {
      speaker: '哨站副官',
      text: '收到。這才是我們該打的仗。',
      expression: 'normal',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '少校奧斯卡',
      text: '第一仗守住了。三人輕傷，無陣亡。',
      expression: 'normal',
    },
    {
      speaker: '哨站副官',
      text: '您那個「不派人」的決定，今晚救了我們整個哨站。',
      expression: 'happy',
    },
    {
      speaker: '少校奧斯卡',
      text: '但不派人不能永遠。迷霧的源頭還在，遲早得有人進去。',
      expression: 'serious',
    },
    {
      speaker: '哨站副官',
      text: '軍部能等多久？',
      expression: 'normal',
    },
    {
      speaker: '少校奧斯卡',
      text: '我會親自上呈報告，請一年時間組建專門小隊。準備好了再進，比快更重要。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1100,
    talentPoints: 7,
  },
};
