import type { CampaignLevel } from '@/types/campaign';

export const ch7_lv3: CampaignLevel = {
  id: 'ch7_lv3',
  chapter: 7,
  level: 3,
  title: '物理失衡',
  description:
    '融合過程中，物理常數開始錯亂。部分區域重力驟降、時間流速減半；南方迷霧山谷更出現「墜落方向反轉」——雨水從地面往天上飄。一支適應了異常物理的實驗兵團變異為攻擊性異界生物，正朝中央城市推進。',
  mapId: 'diagonal',
  maxWaves: 7,
  specialRules: [
    '重力錯亂：敵人速度有 ±15% 隨機浮動',
    '時間扭曲：所有塔射速 ±10% 浮動',
    '對角戰場：地圖採用「對角線」分流',
    '緊急動員：起始資金 1900、生命 14',
  ],
  modifiers: {
    enemySpeedMult: 1.15,
    enemyHealthMult: 1.2,
    startingMoney: 1900,
    startingHealth: 14,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，全大陸監測站回報：物理常數正在跳動。南方迷霧山谷已完全上下顛倒——雨水從地面往天上掉，樹根朝天、樹葉入土。',
      expression: 'angry',
    },
    {
      speaker: '指揮官 (你)',
      text: '那邊的居民呢？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '都漂在天上，還活著，但無法降落。更糟的是，山谷裡有一支過去的實驗兵團變異成了異界生物——適應了顛倒重力，卻失去了人性。',
      expression: 'serious',
    },
    {
      speaker: '核心',
      text: '⋯ 父親，這是我處理速度跟不上的後果。我太抱歉了⋯',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '不是你的錯。你正在做兩個世界都從未做過的事——我們得在邊界攔下它們，不能讓它們進入正常重力區。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '若異界生物進入正常重力區，身體會爆裂，但會引發更大規模的物理紊亂。建議鏡像指揮官一同出戰——他在鏡像世界面對過類似的失衡。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官',
      text: '已抵達戰區。對付適應了異常物理的生物，要用異常的戰術——這是我從敗仗裡學到的。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '兄弟，那就兩個我一起打。你負責「為什麼輸」，我負責「怎麼贏」。',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '異界生物全數退散。物理失衡已由核心修正，山谷居民慢慢落地，無人受傷。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官',
      text: '⋯ 兄弟，你的戰術跟我這邊「戰敗版的我」完全不同。你學到的是怎麼贏，不是為什麼輸。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '但「為什麼輸」也是智慧。你從那邊帶來的，今天確實幫上忙了。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 指揮官，剛才戰場上我同時收到兩個「我」的訊號。鏡像艾莉絲還在找回自己——她希望下一場仗，我們三個一起打。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 兩個艾莉絲。融合的代價，連 AI 副官都得分身。',
      expression: 'surprised',
    },
  ],
  rewards: {
    coins: 2800,
    talentPoints: 16,
  },
};
