import type { CampaignLevel } from '@/types/campaign';

export const ch2_lv1: CampaignLevel = {
  id: 'ch2_lv1',
  chapter: 2,
  level: 1,
  title: '失落的補給站',
  description:
    '北境補給站斷聯已逾一日，紫色能量霧正從內部向外吞噬整座基地。雙條長廊同時傳來變異體的腳步聲 — 十二名倖存者的生命徵象正在衰減。指揮官，在污染源將這裡徹底抹除之前，把他們帶回家。',
  mapId: 'corridor',
  maxWaves: 4,
  specialRules: [
    '雙線夾擊：敵人從上下兩條長廊同時推進',
    '能量擾流：敵人移動速度提升 20%',
    '裝甲強化：敵人生命值增加 10%',
    '資源稀缺：起始資金減少 100',
  ],
  modifiers: {
    startingMoney: 400,
    enemySpeedMult: 1.2,
    enemyHealthMult: 1.1,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，北境補給站外圍已進入警戒區。空氣能量讀數超出危險閾值兩倍，被紫霧覆蓋的區域溫度反常偏高。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '跟初泉河追蹤到的波形一致。去年才完工的最新型護盾，居然擋不住這團霧。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '掃描顯示十二名倖存者仍在中央倉庫，生理數據急速衰退。我截獲了一段求救錄音，請聽。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【求救錄音】「這裡是北境補給站 ⋯ 紫色霧氣讓牆壁開始融化 ⋯ 不要派人來，這裡已經沒救了 ⋯」',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '他們叫我們別來，但他們還活著。北境距邊境森林八百公里 — 四座山脈、兩條大河都沒攔住污染。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '變異體已占領上下兩條主長廊，準備夾擊救援梯隊。敵人移動速度比標準值快兩成，裝甲也略為強化。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '彈藥倉庫先前被污染，起始資金低於標準配額。建議在兩條長廊交叉口優先部署狙擊塔，機槍塔負責清掃小怪。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '錢可以再賺，人命拖不起。倖存者撤離路線？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '穩住長廊後，運輸艇從倉庫頂部進入撤離。冰凍塔尚未下放，暫時無法用減速控場 — 任務時限四波。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '所有部隊就位。為了那十二條人命 — 出發！',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '了解。我會在戰況危急時提示您。願瓜瓜與您同在。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '威脅清除。十二名倖存者全數撤離，兩名重傷但已脫離險境。站長葛瑞想跟您通話。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【葛瑞通訊】霧氣出現前三小時，雷達收到一段奇怪廣播 — 像金屬撞擊夾低頻嗡鳴，語言不像任何人類語言。錄音檔我傳給您。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '謝謝，站長。補給站還有十名同事在霧氣第一小時就失去聯繫 — 我會記住他們。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '變異體攻擊節奏高度同步，像被遠端操控。戰鬥末尾截獲微弱能量訊號，目的地指向雄獅大橋。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '海岸線要是失守就完了。下一個目標：U 形山谷。',
      expression: 'angry',
    },
  ],
  rewards: {
    coins: 1500,
    talentPoints: 15,
  },
};
