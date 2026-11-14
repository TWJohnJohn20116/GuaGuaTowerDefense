import type { CampaignLevel } from '@/types/campaign';

export const ch1_lv1: CampaignLevel = {
  id: 'ch1_lv1',
  chapter: 1,
  level: 2,
  title: '防線崩潰',
  description:
    '邊境哨站凌晨三點觸發紅色警戒，大量未知生物朝防線推進。第一波衝擊摧毀了彈藥倉庫，起始資金僅剩四分之一 — 這是指揮官第一次面對真正的敵人，也是「未知威脅」覺醒的第一聲警鐘。',
  mapId: 'straight',
  maxWaves: 3,
  specialRules: [
    '經濟拮据：初始資金只有 $200',
    '懸賞加倍：擊殺敵人獲得的獎勵增加 50%',
    '速戰速決：只需防守 3 波',
    '進階教學：學習防禦塔升級與技能',
  ],
  modifiers: {
    startingMoney: 200,
    enemyRewardMult: 1.5,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，緊急報告！邊境哨站凌晨三點七分觸發紅色警戒 — 整條防線進入最高戰備狀態。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '凌晨三點不該有訪客。艾莉絲，敵情如何？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '偵測到超過六十個未授權生物訊號，正從西方穩定推進。特徵不在任何資料庫中 — 和訓練結束前我提到的「無法分類讀數」完全吻合。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '六十個體⋯⋯這不是試探，是有目的的進攻。哨站駐軍呢？',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '二十名守軍已撤至後方堡壘，三人重傷、五人輕傷，全員存活。但第一波衝擊摧毀了彈藥倉與物資儲備 — 起始資金僅剩平時的四分之一。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '等於要靠擊殺敵人來循環經濟。每一座塔都必須打出最大效益。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '建議先以低成本基礎塔形成第一道防線，再透過升級應對後續波次。本場戰役您可解鎖第一個主動技能 — 請熟悉冷卻與釋放時機。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '軍部已批准擊殺懸賞加成，每擊敗一名敵人獲得 1.5 倍金錢。這代表風險評估為「未知威脅」等級。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '失敗的後果？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '防線將出現三十公里缺口，後方三個小鎮、約八千兩百名居民，疏散時間不足。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '八千兩百條命繫在我的決策上。撐住三波就是勝利 — 把每一發子彈打在刀口上。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '補充情報：傷員回報這些生物會主動避開光源。若戰後分析成立，可能影響後續部署策略。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '記下了。所有單位戰鬥準備 — 我要在這道防線上，證明瓜瓜防衛軍還沒老！',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '收到。第一波預計三十秒後抵達。願瓜瓜與您同在，指揮官。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '三波敵軍全數肅清，防線穩住了。在如此緊縮的預算下，這是一場漂亮的勝利。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '這些生物的外殼像甲蟲，體型卻大得多 — 眼睛還發著詭異的紫光。我從未見過這種裝甲結構。',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '樣本分析顯示，細胞結構含有人工誘導的不穩定能量，DNA 中夾雜非生物晶體 — 自然界不可能出現這種組合。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '不是野生突變，是被製造出來的。誰有這種能力？',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '尚待確認。哨站隊長米雅託我向您致意 — 後方八千兩百人的疏散已取消。但鄰近瓜瓜森林傳來相同波形的新讀數，下一個戰場可能在您家鄉。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '森林⋯⋯那是我從小看大的地方。通知總部 — 這場戰爭才剛開始，我們面對的是完全未知的敵人。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1000,
    talentPoints: 10,
  },
};
