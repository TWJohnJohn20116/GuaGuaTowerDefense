import type { CampaignLevel } from '@/types/campaign';

export const ch1_lv2: CampaignLevel = {
  id: 'ch1_lv2',
  chapter: 1,
  level: 3,
  title: '迷霧森林',
  description:
    '能量讀數指向邊境西側的瓜瓜森林 — 指揮官的故鄉初泉鎮就在這片迷霧深處。原本溫順的森林生物因污染而狂暴，移動速度遠超尋常。霧氣中藏著無法解析的威脅，而我們必須在污染擴散之前，直搗源頭。',
  mapId: 'zigzag',
  maxWaves: 3,
  specialRules: [
    '狂暴化：敵人移動速度增加 50%',
    '脆弱裝甲：敵人生命值減少 20%',
    '速戰速決：只需防守 3 波',
    '極限控場：冰凍塔與暫停控制',
  ],
  modifiers: {
    enemySpeedMult: 1.5,
    enemyHealthMult: 0.8,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，部隊已進入瓜瓜森林外圍。初泉河就在西側三公里處 — 這片三百平方公里的綠地是大地最古老的生態區之一，也是邊境襲擊能量波形的源頭方向。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯⋯空氣裡有股燒焦的味道。我小時候和家人在這裡野餐，從未聞過這種氣息。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '您的家族紀錄確實有初泉鎮的居住資料。很抱歉 — 您要以指揮官的身分，在戰場上回到家鄉。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '警告：偵測到大範圍能量干擾。森林內所有生物均處於狂暴狀態，移動速度提升五成，裝甲因失控而變脆 — 生命值降低兩成。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '這裡平常是觀光勝地。艾莉絲，污染範圍有多大？',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '掃描結果令人不安 — 森林中已無任何未受影響的生物。松鼠、野兔、山貓⋯⋯全部變了。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '也就是說，我們即將面對的敵人，原本是我童年的記憶。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我理解這對您有多難。但若不阻止牠們，污染將擴散至整片大地。建議全力部署冰凍塔延緩速度，必要時使用「時間減速」技能爭取八秒反應時間。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '有沒有不殺生的方式？就算被污染了，牠們仍是我從小看著長大的動物。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '污染達此程度，逆轉幾乎不可能。牠們會繼續攻擊未受影響的生物 — 從長遠來看，擊敗牠們才是真正的救贖。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯⋯好。我會用最快、最不痛苦的方式結束牠們的折磨。霧愈來愈濃了 — 出發，為了讓牠們安息。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '收到。我會在戰術上盡力協助，減少不必要的痛苦。指揮官，我與您同在。',
      expression: 'normal',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '三波威脅已清除。我保留了部分樣本供研究中心逆向工程 — 若未來找到淨化方法，或許能挽救其他區域。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '我們獵殺的，是自己曾經保護的對象⋯⋯這場戰爭真是諷刺。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '霧氣散後，森林深處現出初泉鎮舊瞭望塔的輪廓。塔內存有舊時代能量網路，修復後可為後續戰役提供補給支援。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '我以前每個週末都會爬上去看夕陽⋯⋯至少讓這座小鎮的記憶，繼續為瓜瓜出力。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '森林核心偵測到強烈能量讀數 — 規模是今日所有敵人的二十倍以上。已為您預定機槍塔授權，對抗巨獸時的小怪潮會非常實用。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '二十倍⋯⋯那不是敵人，是巨獸。回基地補給，然後直搗源頭 — 這次我不會再失去任何瓜瓜的子民。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1500,
    talentPoints: 20,
    unlockTower: ['machine'],
  },
};
