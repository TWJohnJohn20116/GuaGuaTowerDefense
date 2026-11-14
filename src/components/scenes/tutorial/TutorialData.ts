export interface TutorialStep {
  title: string;
  description: string;
  tip?: string;
  icon?: string;
  highlight?: string;
  action?: string;
  image?: string;
}

export interface TutorialCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  steps: TutorialStep[];
}

// 遊戲基礎教學
const GAME_BASICS_TUTORIAL: TutorialStep[] = [
  {
    title: '遊戲目標',
    description: '阻止敵人到達終點！敵人會沿著路徑前進，你需要在路徑旁建造防禦塔來消滅它們。',
    tip: '如果敵人到達終點，你會損失生命值。生命值歸零則遊戲結束。',
    icon: '🎯',
    highlight: 'path',
  },
  {
    title: '放置防禦塔',
    description: '點選右側面板的防禦塔，然後點擊地圖上的空白格子來放置。防禦塔會自動攻擊範圍內的敵人。',
    tip: '塔只能放在空白格子上，不能放在路徑上。',
    icon: '🏗️',
    action: 'place_tower',
  },
  {
    title: '開始波次',
    description: '準備好後，點擊「開始波次」按鈕來派遣敵人。每波敵人會越來越強。',
    tip: '提前完成波次可獲得額外金幣獎勵。',
    icon: '🌊',
    action: 'start_wave',
  },
  {
    title: '升級防禦塔',
    description: '點擊已放置的塔可以查看詳情並升級。升級會提高傷害、範圍等屬性。',
    tip: '塔最高可升到 5 級，高等級塔非常強力！',
    icon: '⬆️',
    action: 'upgrade_tower',
  },
  {
    title: '出售防禦塔',
    description: '不需要的塔可以出售，獲得部分成本返還。這能幫助你調整策略。',
    tip: '出售價格是購買價格的 50%。',
    icon: '💰',
    action: 'sell_tower',
  },
  {
    title: '為塔命名',
    description: '點擊浮動面板中的塔名稱，可以為每座塔取一個專屬名字（最多 20 字元）。命名後原始塔類型名稱會顯示在下方。',
    tip: '為關鍵塔取名可以更快找到它們，例如「前線冰牆」或「Boss 殺手」。',
    icon: '✏️',
  },
  {
    title: '查看遊戲統計',
    description: '點擊側邊欄頂部資源區的放大鏡按鈕，可以開啟詳細的遊戲資訊總覽彈窗。',
    tip: '彈窗顯示金幣、生命、波次、分數的大字版，還有放置/升級/AI 的詳細統計。',
    icon: '🔍',
  },
];

// 防禦塔詳解
const TOWER_TUTORIAL: TutorialStep[] = [
  {
    title: '基礎塔',
    description: '最基礎的防禦塔，價格便宜、均衡的傷害和射程。適合早期防禦。',
    tip: '技能：超載 - 大幅提升攻速 5 秒',
    icon: '🔫',
    highlight: 'basic',
  },
  {
    title: '狙擊塔',
    description: '超遠射程、高傷害但攻速慢。適合在路徑轉彎處放置，最大化攻擊時間。',
    tip: '技能：專注狙擊 - 下一次攻擊造成5倍傷害',
    icon: '🎯',
    highlight: 'sniper',
  },
  {
    title: '加農砲',
    description: '發射爆炸彈藥，對範圍內所有敵人造成傷害。對付成群敵人非常有效。',
    tip: '技能：彈幕風暴 - 同時攻擊範圍內所有敵人',
    icon: '💥',
    highlight: 'cannon',
  },
  {
    title: '機槍塔',
    description: '極快的攻擊速度，但單發傷害較低。適合對付大量小型敵人。',
    tip: '技能：超載 - 大幅提升攻擊速度持續5秒',
    icon: '🔥',
    highlight: 'machine',
  },
  {
    title: '冰霜塔',
    description: '攻擊會減緩敵人移動速度。雖然傷害較低，但能讓其他塔有更多時間攻擊。',
    tip: '技能：冰凍爆發 - 凍結範圍內所有敵人3秒',
    icon: '❄️',
    highlight: 'frost',
  },
  {
    title: '毒液塔',
    description: '對敵人施加持續傷害的毒素效果。特別適合對付高血量敵人。',
    tip: '技能：毒霧擴散 - 釋放毒雲，持續造成傷害',
    icon: '☠️',
    highlight: 'poison',
  },
  {
    title: '雷射塔',
    description: '發射瞬間命中的雷射光束，永不落空。穩定的傷害輸出。',
    tip: '技能：精準射擊 - 下一次攻擊造成3倍傷害',
    icon: '⚡',
    highlight: 'laser',
  },
  {
    title: '閃電塔',
    description: '攻擊可以連鎖到多個敵人，對密集敵群效果拔群。',
    tip: '技能：連鎖激流 - 電擊連鎖數量翻倍',
    icon: '⛈️',
    highlight: 'lightning',
  },
  {
    title: '火焰塔',
    description: '對敵人施加燃燒效果，造成持續傷害並降低護甲。',
    tip: '技能：地獄烈焰 - 在目標位置創建火焰區域',
    icon: '🔥',
    highlight: 'flame',
  },
  {
    title: '金幣塔',
    description: '每隔一段時間自動產出金幣，不會攻擊敵人。是經濟型策略的核心。',
    tip: '技能：戰術修復 - 減少周圍塔50%技能冷卻',
    icon: '💎',
    highlight: 'money',
  },
];

// 進階策略
const ADVANCED_TUTORIAL: TutorialStep[] = [
  {
    title: '選擇攻擊目標',
    description: '點擊塔可以設置攻擊優先順序：最前面、最強、最弱、最近。根據情況選擇最佳策略。',
    tip: '對付 BOSS 時設成「最強」，清小怪時設成「最前面」。',
    icon: '🎯',
  },
  {
    title: '戰術視圖',
    description: '開啟戰術視圖可以看到放置建議。綠色區域是最佳放置點，數字表示優先度。',
    tip: 'AI 會根據路徑覆蓋、已有塔的位置等因素計算最佳位置。',
    icon: '📊',
  },
  {
    title: '撤銷與重做',
    description: '放錯塔？使用撤銷功能可以取消最近的放置操作，獲得全額退款。',
    tip: '撤銷只在波次開始前有效。',
    icon: '↩️',
  },
  {
    title: 'AI 自動戰鬥',
    description: '啟用 AI 後會自動放塔和升級。你可以選擇不同策略：平衡、經濟、進攻、防守。',
    tip: 'AI 是學習遊戲的好方法，觀察它的決策可以幫助你進步。',
    icon: '🤖',
  },
  {
    title: '組合搭配',
    description: '冰霜塔 + 高傷塔是經典組合。減速讓其他塔能打出更多傷害。',
    tip: '毒液塔 + 機槍塔也很強，快速疊加毒層。',
    icon: '🔗',
  },
  {
    title: '金幣塔經濟學',
    description: '早期投資金幣塔，後期會有更多資源。但要注意防禦平衡。',
    tip: '建議第一波前放 1-2 個金幣塔。',
    icon: '📈',
  },
];

// 模組製作教學
const MOD_CREATION_TUTORIAL: TutorialStep[] = [
  {
    title: '什麼是模組？',
    description: '模組（Mod）可以讓你自訂遊戲內容：新的防禦塔、敵人、地圖等。創意無限！',
    tip: '模組可以分享給其他玩家使用。',
    icon: '🧩',
  },
  {
    title: '進入模組編輯器',
    description: '從主選單點擊「模組工坊」，然後選擇「建立模組」開始你的創作。',
    tip: '你也可以編輯現有的模組。',
    icon: '🛠️',
    action: 'open_mod_workshop',
  },
  {
    title: '創建自訂防禦塔',
    description: '在「防禦塔」分頁設計你的塔：名稱、顏色、傷害、範圍、特殊效果等都可以自訂。',
    tip: '試著創建有特色的塔，例如超高傷害但射程很短的「近戰塔」。',
    icon: '🏰',
  },
  {
    title: '自訂塔模型外觀',
    description: '在塔編輯器中選擇「模型外觀」，從 10 種內建模型中挑選。還可以調整模型大小、砲管長度和光暈效果。',
    tip: '光暈效果可以讓你的塔更醒目，還能自訂光暈顏色！',
    icon: '🎨',
  },
  {
    title: '創建自訂敵人',
    description: '在「敵人」分頁設計新敵人：生命值、速度、獎勵、特殊能力等。',
    tip: '可以創建飛行敵人（忽略路徑）或治療敵人（恢復周圍敵人血量）。',
    icon: '👾',
  },
  {
    title: '自訂敵人模型外觀',
    description: '從 19 種內建敵人模型中選擇外觀，調整大小和光暈。所有設定會在即時預覽中顯示。',
    tip: '選擇 Boss 或小 Boss 模型可以讓你的自訂敵人看起來更有威脅感。',
    icon: '👹',
  },
  {
    title: '創建自訂地圖',
    description: '在「地圖」分頁使用地圖編輯器繪製路徑。設定起點、終點和路徑走向。',
    tip: '複雜的路徑（多轉彎）讓玩家有更多放塔的選擇。',
    icon: '🗺️',
  },
  {
    title: '測試你的模組',
    description: '完成後記得測試！點擊「測試模組」可以直接開始一場使用你模組的遊戲。',
    tip: '平衡性很重要，確保遊戲既有趣又有挑戰性。',
    icon: '🎮',
  },
  {
    title: '保存與分享',
    description: '滿意後點擊「保存模組」。模組會存在本機，你可以導出 JSON 檔案分享給朋友。',
    tip: '好的模組名稱和描述能讓其他玩家更想嘗試。',
    icon: '💾',
  },
];

// 所有教學分類
export const TUTORIAL_CATEGORIES: TutorialCategory[] = [
  {
    id: 'basics',
    name: '遊戲基礎',
    icon: '📖',
    description: '學習遊戲的基本玩法和操作',
    color: 'blue',
    steps: GAME_BASICS_TUTORIAL,
  },
  {
    id: 'towers',
    name: '防禦塔詳解',
    icon: '🏰',
    description: '了解每種防禦塔的特性和使用技巧',
    color: 'green',
    steps: TOWER_TUTORIAL,
  },
  {
    id: 'advanced',
    name: '進階策略',
    icon: '🎓',
    description: '進階技巧讓你成為塔防大師',
    color: 'purple',
    steps: ADVANCED_TUTORIAL,
  },
  {
    id: 'modding',
    name: '模組製作',
    icon: '🛠️',
    description: '學習如何創建自己的遊戲內容',
    color: 'orange',
    steps: MOD_CREATION_TUTORIAL,
  },
];
