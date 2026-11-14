import type { CampaignLevel } from '@/types/campaign';

export const ch16_lv2: CampaignLevel = {
  id: 'ch16_lv2',
  chapter: 16,
  level: 2,
  title: '麵包師的家庭',
  description:
    '縱火危機暫解，敵方殘部卻沿著 U 形街道逼近麵包師的家。平行時間線裡，軍部從未建立完整防線，家鄉的威脅一路滲透到平民生活。麵包師指揮官護著妻子與兩個孩子，第一次握起從未碰過的防禦器材——老指揮官在通道另一端，教他如何把「保護家人」變成唯一信條。',
  mapId: 'u_shape',
  maxWaves: 5,
  specialRules: [
    '保衛家園：地圖採用「U 形」街道',
    '平民起兵：所有塔射速 -10%、傷害 -5%',
    '為家人而戰：起始資金 1300、生命 13',
    '麵包師覺醒：擊殺敵人 +35% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.1,
    enemyRewardMult: 1.35,
    startingMoney: 1300,
    startingHealth: 13,
  },
  preBattleDialogue: [
    {
      speaker: '麵包師指揮官',
      text: '⋯ 另一個我，我從來沒打過仗。連軍靴都沒穿過，現在卻要擋在家門口。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 沒關係。戰場和麵包坊一樣，先顧好最重要的事——你太太和兩個孩子還在 U 形街尾。',
      expression: 'normal',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 他們剛把除夕要用的番茄牛肉湯料備好。我不能讓敵人踏進那間廚房。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 指揮官，平行時間線敵軍兵力約為本線的六成，但平民防禦經驗為零，容錯率極低。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 麵包師，記住三句話：先守轉角、別讓敵人包抄、孩子撤離前你不准退。',
      expression: 'serious',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 收到。聽起來像你在軍校第一堂課講的……我現在才懂那有多難。',
      expression: 'normal',
    },
    {
      speaker: '麵包師太太',
      text: '⋯ 親愛的，我把孩子送到鄰居地下室了。你專心打，麵包坊交給我。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 好太太。今天兩個我們一起上——你守東翼，我從通道替你穩住西線。',
      expression: 'serious',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 為了家人，也為了讓「沒當軍人的我」知道自己不是廢人。開戰吧。',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '麵包師指揮官',
      text: '⋯ 我們贏了。手還在抖，但家門還在。',
      expression: 'happy',
    },
    {
      speaker: '麵包師太太',
      text: '⋯ 親愛的，你身上多了一股氣——像戰場回來的人，又像剛出爐的麵包那麼燙。',
      expression: 'surprised',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 那是我分給你的一點軍人經驗。不多，夠用就好。',
      expression: 'normal',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 另一個我，謝謝你。我開始明白——沒當軍人，不代表不能保護家。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 1500,
    talentPoints: 11,
  },
};
