/**
 * Tutorial 教學分頁字串 — 從 TutorialMetaHub / GameModes / TalentTree /
 * WaveEconomy / AdvancedTactics 提取繁中 + EN fallback
 */

export const TUTORIAL_PAGES_ZH = {
  metaHubPage: {
    pageTitle: '元進度與中心設施',
    pageIntro: '單局金幣會留在商店；天賦與成就則讓每一局都變強一點。圖鑑、皮膚與工坊則是長期收集與創作向內容。',
    loopsTitle: '資源循環一覽',
    loops: [
      { label: '單局', items: ['金幣', '生命', '波次獎勵'] },
      { label: '跨局', items: ['商店永久解鎖', '天賦點', '成就獎勵'] },
      { label: '收集', items: ['皮膚', '圖鑑完成度', 'Mod 庫'] },
    ],
    hubs: [
      {
        title: '商店',
        path: '主選單 → 商店',
        desc: '用戰局金幣購買新塔、主動技能與部分升級項目。左欄選商品，右欄看詳情再購買。',
        tips: ['優先解鎖一個主動技能', '新塔可擴充戰術組合', '購買前確認右欄屬性與售價'],
      },
      {
        title: '天賦樹',
        path: '主選單 → 天賦樹',
        desc: '消耗天賦點強化經濟、輸出、防禦或工藝。詳見「天賦樹」教學分頁。',
        tips: ['難度越高越需要天賦', '可隨時退階重配', 'Keystone 節點改變玩法'],
      },
      {
        title: '成就觀測站',
        path: '主選單 → 成就',
        desc: '追蹤長期目標：通關、流派、收集等。完成後記得領取獎勵。',
        tips: ['環狀分類列快速篩選', '「不限狀態」vs 分類「全部」不同', '待領取可一鍵領取'],
      },
      {
        title: '戰績中心',
        path: '主選單 → 戰績',
        desc: '查看歷史對局、勝率、輸出統計，並可匯出紀錄。',
        tips: ['左側網格選戰局', '右欄看詳細數據', '圖鑑統計分頁有捷徑入口'],
      },
      {
        title: '圖鑑',
        path: '主選單 → 圖鑑',
        desc: '查塔、敵、地圖、技能與原始碼檔案結構。開局前做功課的好幫手。',
        tips: ['支援搜尋與分類篩選', '圖示庫 / 檔案庫為進階分頁', '點卡片開詳情彈窗'],
      },
      {
        title: '皮膚工坊',
        path: '主選單 → 皮膚',
        desc: '替換塔的視覺模型與配色，不影響數值。解鎖後可收藏套裝。',
        tips: ['左欄選皮膚或套裝', '右欄預覽並裝備', '星標收藏常用套裝'],
      },
      {
        title: '創意工坊',
        path: '主選單 → 創意工坊',
        desc: '管理與編輯 Mod：自訂塔、敵、地圖、波次，並可匯入他人作品。',
        tips: ['Mod 管理器開關啟用', 'Mod 編輯器內建預覽', '詳見 Mod 教學分類'],
      },
    ],
  },

  gameModesPage: {
    pageTitle: '遊戲模式總覽',
    pageIntro: '瓜瓜塔防不只單一開局：戰役推進、每日資源、突變考驗與回放復盤各自服務不同目標。先認識入口，再決定今天想玩哪一種。',
    flowTipsTitle: '推薦節奏',
    modes: [
      {
        title: '戰役模式',
        desc: '依章節推進主線，解鎖新地圖與難度。每關有星等評價，三星代表完美通關。',
        bullets: ['主選單 → 開始遊戲 → 選擇戰役章節', '完成關卡解鎖下一節點', '缺星可回頭重打補星'],
      },
      {
        title: '自選地圖 / 無盡',
        desc: '在路徑選擇中挑選任意已解鎖地圖，可開啟無盡模式讓波次無上限延伸。',
        bullets: ['路徑選擇左欄切換進階 / Mod 地圖', '開局前可調整難度與突變（若有）', '無盡模式著重後期經濟與 Keystone'],
      },
      {
        title: '每日挑戰',
        desc: '每天一組固定條件與地圖，完成可領取金幣、天賦點等獎勵並累積連勝。',
        bullets: ['主選單 → 每日挑戰', '左欄查看今日條件，右欄領取獎勵', '連勝越高額外獎勵越豐厚'],
      },
      {
        title: '突變挑戰',
        desc: '在特定地圖上套用限制規則（如塔種禁用、敵人加速），挑戰最高評分。',
        bullets: ['主選單 → 突變挑戰', '左欄選挑戰卡，右欄看規則與紀錄', '完成可解鎖成就與排行感'],
      },
      {
        title: '回放中心',
        desc: '自動保存最近戰局，可重播、匯出或從中斷點再戰。',
        bullets: ['主選單 → 回放', '點選左側卡片查看摘要', '支援批次匯出與重新播放'],
      },
    ],
    flowTips: [
      { title: '新手建議路線', text: '快速入門 → 戰役前 3 章 → 商店買第一個主動技能 → 每日挑戰拿資源' },
      { title: '卡關時', text: '回教學「波次與經濟」「進階戰術」調整配塔，或回戰役低星關重打練手' },
      { title: '時間有限', text: '優先每日挑戰 + 一關戰役；突變與無盡留週末長玩' },
    ],
  },

  talentTreePage: {
    pageTitle: '天賦樹系統',
    pageIntro: '完成關卡可獲得天賦點數，用來點亮天賦節點獲得跨局永久加成。天賦分為經濟、攻擊、防禦、工藝四大分支，可依玩法風格自由搭配。',
    branchEconomy: '經濟',
    branchOffense: '攻擊',
    branchDefense: '防禦',
    branchUtility: '工藝',
    categoriesSection: '四大分支',
    categories: [
      { id: 'economy', name: '金財分支', desc: '提升起始金幣、敵人賞金、首擊獎勵等資源面向', highlights: ['起始金幣 +', '敵人賞金 +', '首擊獎金', '貪婪'] },
      { id: 'offense', name: '攻擊分支', desc: '提升所有塔的傷害、攻速、爆擊、Boss 殺手等戰鬥能力', highlights: ['塔傷害 +', '攻速 +', '爆擊', 'Boss 殺手'] },
      { id: 'defense', name: '防禦分支', desc: '提升起始生命、護甲、鋼鐵意志、要塞 Keystone', highlights: ['初始生命 +', '護甲', '鋼鐵意志', 'Keystone：要塞'] },
      { id: 'utility', name: '工藝分支', desc: '降低塔成本、增加範圍、駕馭升級的多功能輔助分支', highlights: ['塔成本 −', '範圍 +', '匠藝精通'] },
    ],
    flowSection: '操作流程',
    flowSteps: [
      { num: '1', title: '完成關卡', desc: '勝利或挑戰特定關卡可獲得天賦點' },
      { num: '2', title: '分配天賦', desc: '進入「天賦樹」場景，點擊節點消耗點數升階' },
      { num: '3', title: '滿足前置', desc: '部分節點需要前置節點達到指定階數才解鎖' },
      { num: '4', title: '右鍵退階', desc: '對已點亮節點按右鍵可降階回收（一階一階退）' },
      { num: '5', title: '一鍵重置', desc: '左側面板「重置全部」可一次取回全部點數' },
    ],
    buildsSection: '推薦配點 Build',
    bestForLabel: '適用：',
    builds: [
      {
        name: '經濟流（雪球開局）',
        steps: ['優先：起始金幣 → 入門套裝 → 賞金獵人', '中段：貪婪（爆擊金幣）→ 首擊獎金', '後段：補上攻擊核心（傷害 / Boss 殺手）'],
        bestFor: '長線無盡模式、收益最大化',
      },
      {
        name: '防禦流（穩健慢攻）',
        steps: ['優先：額外生命 → 護甲 → 鋼鐵意志', '中段：Keystone 要塞解鎖', '後段：補上少量攻擊與工藝'],
        bestFor: '夢魘 / 不可能難度、降低風險',
      },
      {
        name: '攻擊流（壓制速攻）',
        steps: ['優先：傷害 → 攻速 → 爆擊', '中段：Boss 殺手 + 過載', '後段：補入工藝降低成本與擴大範圍'],
        bestFor: '速通、波次少的戰役',
      },
    ],
    keystoneTipTitle: '提示：Keystone',
    keystoneTipDesc: 'Keystone 節點為單階終極天賦，提供強力效果。需要前置節點達標才能解鎖。',
    refundTipTitle: '退階機制',
    refundTipDesc: '點亮節點後可右鍵單階退回，或左側「重置全部」一次回收。回退不會損失點數。',
  },

  waveEconomyPage: {
    pageTitle: '波次與經濟系統',
    pageIntro: '理解波次規則、收益來源與資金分配，讓每一塊金幣花得最有價值。',
    waveRulesSection: '波次規則',
    waveFacts: [
      { title: '標準波次', desc: '戰役關卡 10-15 波，每波難度遞增' },
      { title: '無盡模式', desc: '波次無限延伸，敵人血量、速度持續放大' },
      { title: 'Boss 波', desc: '通常為 5、10、15 整數波，會出現首領單位' },
      { title: '暫停與略波', desc: '清空敵人後可手動略過倒數，節省時間' },
    ],
    economySection: '經濟來源',
    economySources: [
      { title: '擊殺賞金', desc: '每殺死一個敵人立即獲得金幣，敵人類型決定金額' },
      { title: '波次獎勵', desc: '每波結束後獲得固定獎勵，越後期越多' },
      { title: '金幣塔產出', desc: '經濟塔每秒被動產生金幣，等級越高產量越高' },
      { title: '主動技能：金幣雨', desc: '釋放後立即獲得 300 金幣' },
    ],
    savingSection: '資金分配技巧',
    ruleLabel: '規則：',
    savingTips: [
      { title: '保留警戒線', rule: '至少保留 50 金應對突發', tip: '多數塔的最低售價也在 30-50 金；保留底線可以即時補位' },
      { title: '優先一座金幣塔', rule: '前 3 波先放 1 座 money 塔', tip: '金幣塔的長期收益遠高於額外輸出塔' },
      { title: '保留升級資金', rule: '塔陣完整後，60% 資金升級', tip: 'Lv.4 一隻 ≥ Lv.1 兩隻；升級回報率最高' },
      { title: '考慮拆塔回收', rule: '低績效塔（Kill < 5）可拆', tip: '回收 50% 成本，搬到更需要的位置' },
    ],
    scalingSection: '敵人擴展對照表',
    scalingHeaders: { wave: '波次', enemyHP: 'HP 倍率', enemySpeed: '速度', reward: '賞金', tip: '建議' },
    scalingRows: [
      { wave: '1-3', enemyHP: 'x1.0', enemySpeed: 'x1.0', reward: '基礎', tip: '建立經濟基礎' },
      { wave: '4-6', enemyHP: 'x1.5', enemySpeed: 'x1.05', reward: '+30%', tip: '補強控制與輸出' },
      { wave: '7-9', enemyHP: 'x2.5', enemySpeed: 'x1.1', reward: '+60%', tip: '升級主力 Lv.3+' },
      { wave: '10+', enemyHP: 'x4+', enemySpeed: 'x1.2+', reward: '+100%', tip: '主動技能 + Keystone 應對' },
    ],
    difficultySection: '難度策略',
    difficultyTips: [
      { difficulty: '簡單', tip: '練習熟悉系統，幾乎不需精打細算' },
      { difficulty: '一般', tip: '標準難度，平衡策略適用' },
      { difficulty: '困難', tip: '經濟需精打，前期 1 金幣塔絕不可省' },
      { difficulty: '夢魘', tip: '只能贏速攻，慢一波則崩盤；天賦防禦樹必點' },
      { difficulty: '不可能', tip: '極限考驗：Keystone 全開、所有主動技能就位' },
    ],
  },

  advancedTacticsPage: {
    pageTitle: '進階戰術',
    pageIntro: '掌握配置技巧、塔組合、節奏控制與反向思考，才能在高難度與無盡模式生存更久。',
    placementSection: '佈局戰術',
    placementTactics: [
      {
        title: '轉角優先（高效覆蓋）',
        bullets: ['路徑轉折處最少能同時覆蓋 2 段路徑', '敵人在轉角會減速移動方向', '優先放置遠程塔（狙擊、雷射）'],
      },
      {
        title: '叉路節點（戰略要地）',
        bullets: ['進階地圖叉路口同時連接多條敵軍路線', '此處放範圍塔（炮塔、雷電）效益最大化', '搭配冰凍塔卡住瓶頸'],
      },
      {
        title: '層次防線（層層阻擋）',
        bullets: ['前段：減速塔（冰凍 / 風）拉長敵人通過時間', '中段：高 DPS（機關槍 / 火焰）持續輸出', '後段：高傷單體（狙擊 / 雷射）補刀漏網'],
      },
      {
        title: '抗 Boss 配置',
        bullets: ['Boss 通常 5、10、15 波出現', '提前在 Boss 必經路徑佈署狙擊與雷射', '搭配冰凍塔卡 Boss 行動', '凍結 + 激勵 雙技能可在 5 秒內爆發傷害'],
      },
    ],
    combosSection: '推薦塔組合',
    bestForLabel: '適用：',
    towerCombos: [
      {
        title: '冰雷組合（Frost + Lightning）',
        rating: 5,
        towers: ['冰凍塔', '雷電塔'],
        desc: '冰凍降速 → 雷電連鎖一網打盡，對蜂群波次極為有效。',
        best: '蜂群波、群體敵人',
      },
      {
        title: '冰狙組合（Frost + Sniper）',
        rating: 5,
        towers: ['冰凍塔', '狙擊塔'],
        desc: '冰凍敵人讓狙擊命中與爆擊機率最大化，對 Boss 與高血量極佳。',
        best: 'Boss 戰、坦克類',
      },
      {
        title: '毒火組合（Poison + Flame）',
        rating: 4,
        towers: ['毒塔', '火焰塔'],
        desc: '雙重持續傷害，對護盾與重甲敵人破除緩慢但持續。',
        best: '護盾、重甲、回血敵人',
      },
    ],
    rhythmSection: '節奏控制',
    rhythmTips: [
      { title: '前期（1-3 波）', desc: '放 1-2 個經濟塔奠基，再補 2-3 個輸出塔；保留 50 金以應急' },
      { title: '中期（4-8 波）', desc: '依據敵人組成補強控制（冰凍/毒）和範圍塔；開始升級主力到 Lv.2' },
      { title: '後期（9 波後）', desc: '主力升至 Lv.4-5，補放 Keystone 級塔（雷射/脈衝）；保留主動技能應對 Boss' },
    ],
    antiPatternsSection: '常見錯誤與修正',
    antiPatterns: [
      { warn: '單一塔型過度依賴', fix: '至少配 1 控制 + 1 範圍 + 2 輸出' },
      { warn: '把塔擠在一格', fix: '保持 2-3 格間距，避免單點被范圍 AoE 削弱' },
      { warn: '經濟塔放錯位', fix: '經濟塔放遠離戰鬥的角落，不佔用要地' },
      { warn: '忽略升級', fix: 'Lv.4 一隻塔遠勝 Lv.1 兩隻塔' },
      { warn: '主動技能囤積不用', fix: 'CD 結束就開始評估釋放時機，別讓 CD 全部閒置' },
    ],
  },
};

export const TUTORIAL_PAGES_EN = {
  metaHubPage: {
    pageTitle: 'Meta Progress & Hubs',
    pageIntro: 'Run gold stays in the shop; talents and achievements make every run stronger. Encyclopedia, skins, and workshop are long-term collection and creation.',
    loopsTitle: 'Resource loops',
    loops: [
      { label: 'Per run', items: ['Gold', 'Health', 'Wave rewards'] },
      { label: 'Cross-run', items: ['Shop unlocks', 'Talent points', 'Achievement rewards'] },
      { label: 'Collection', items: ['Skins', 'Encyclopedia', 'Mod library'] },
    ],
    hubs: [
      { title: 'Shop', path: 'Main menu → Shop', desc: 'Spend run gold on towers, active skills, and upgrades. Pick items left, buy from detail panel right.', tips: ['Unlock one active skill first', 'New towers expand tactics', 'Check stats and price before buying'] },
      { title: 'Talent tree', path: 'Main menu → Talents', desc: 'Spend talent points on economy, offense, defense, or utility. See Talent Tree tutorial tab.', tips: ['Higher difficulty needs talents', 'Refund and respec anytime', 'Keystone nodes change playstyle'] },
      { title: 'Achievement observatory', path: 'Main menu → Achievements', desc: 'Track long-term goals: clears, playstyles, collection. Claim rewards when done.', tips: ['Ring categories for quick filter', '"Any status" vs category "All" differ', 'Claim all for pending rewards'] },
      { title: 'Stats center', path: 'Main menu → Stats', desc: 'View match history, win rate, DPS stats; export records.', tips: ['Grid select on left', 'Details on right', 'Shortcut from encyclopedia stats'] },
      { title: 'Encyclopedia', path: 'Main menu → Encyclopedia', desc: 'Look up towers, enemies, maps, skills, and source files before a run.', tips: ['Search and category filters', 'Icon / file library tabs', 'Click cards for detail modal'] },
      { title: 'Skin workshop', path: 'Main menu → Skins', desc: 'Swap tower visuals without changing stats. Unlock and collect sets.', tips: ['Pick skin or set on left', 'Preview and equip on right', 'Star favorites for quick access'] },
      { title: 'Creative workshop', path: 'Main menu → Workshop', desc: 'Manage and edit mods: custom towers, enemies, maps, waves; import community work.', tips: ['Toggle mods in manager', 'Built-in preview in editor', 'See Mod tutorial category'] },
    ],
  },

  gameModesPage: {
    pageTitle: 'Game modes overview',
    pageIntro: 'Guagua TD is more than one start type: campaign, daily resources, mutators, and replays serve different goals. Know the entries, then pick today\'s mode.',
    flowTipsTitle: 'Suggested rhythm',
    modes: [
      { title: 'Campaign', desc: 'Progress chapters, unlock maps and difficulty. Star ratings per level; 3 stars = perfect clear.', bullets: ['Main menu → Play → Campaign chapter', 'Clear levels to unlock next node', 'Replay low-star levels for missing stars'] },
      { title: 'Custom map / Endless', desc: 'Pick any unlocked map in path selection; endless extends waves without cap.', bullets: ['Switch advanced / mod maps in left column', 'Adjust difficulty and mutators before start', 'Endless focuses late economy and keystones'] },
      { title: 'Daily challenge', desc: 'Fixed daily map and rules; earn gold, talent points, and streak bonuses.', bullets: ['Main menu → Daily challenge', 'Today\'s rules left, rewards right', 'Higher streak = richer bonus'] },
      { title: 'Mutator challenge', desc: 'Restricted rules on specific maps (banned towers, faster enemies) for high scores.', bullets: ['Main menu → Mutators', 'Pick card left, rules and records right', 'Unlock achievements and leaderboard feel'] },
      { title: 'Replay center', desc: 'Auto-saves recent runs; replay, export, or resume from checkpoint.', bullets: ['Main menu → Replays', 'Click left cards for summary', 'Batch export and rewatch supported'] },
    ],
    flowTips: [
      { title: 'New player route', text: 'Quick start → First 3 campaign chapters → Buy first active skill → Daily for resources' },
      { title: 'When stuck', text: 'Review Wave & Economy and Advanced Tactics tutorials, or replay low-star campaign levels' },
      { title: 'Limited time', text: 'Daily + one campaign level; mutators and endless on weekends' },
    ],
  },

  talentTreePage: {
    pageTitle: 'Talent tree',
    pageIntro: 'Clear levels to earn talent points for permanent cross-run bonuses. Four branches: economy, offense, defense, utility — mix freely.',
    branchEconomy: 'Economy',
    branchOffense: 'Offense',
    branchDefense: 'Defense',
    branchUtility: 'Utility',
    categoriesSection: 'Four branches',
    categories: [
      { id: 'economy', name: 'Economy', desc: 'Starting gold, bounties, first-kill bonuses', highlights: ['Start gold +', 'Bounty +', 'First kill bonus', 'Greed'] },
      { id: 'offense', name: 'Offense', desc: 'Tower damage, attack speed, crit, boss killer', highlights: ['Tower dmg +', 'AS +', 'Crit', 'Boss killer'] },
      { id: 'defense', name: 'Defense', desc: 'Starting HP, armor, iron will, fortress keystone', highlights: ['Start HP +', 'Armor', 'Iron will', 'Keystone: Fortress'] },
      { id: 'utility', name: 'Utility', desc: 'Lower tower cost, range, upgrade mastery', highlights: ['Tower cost −', 'Range +', 'Craft mastery'] },
    ],
    flowSection: 'How it works',
    flowSteps: [
      { num: '1', title: 'Clear levels', desc: 'Win or complete specific levels for talent points' },
      { num: '2', title: 'Allocate', desc: 'Open Talent Tree, click nodes to spend points' },
      { num: '3', title: 'Prerequisites', desc: 'Some nodes need prior nodes at required rank' },
      { num: '4', title: 'Right-click refund', desc: 'Right-click lit nodes to refund one rank at a time' },
      { num: '5', title: 'Reset all', desc: 'Left panel "Reset all" refunds every point at once' },
    ],
    buildsSection: 'Recommended builds',
    bestForLabel: 'Best for:',
    builds: [
      { name: 'Economy (snowball)', steps: ['Start gold → Starter kit → Bounty hunter', 'Mid: Greed → First-kill bonus', 'Late: Add offense core (damage / boss killer)'], bestFor: 'Long endless, max income' },
      { name: 'Defense (steady)', steps: ['Extra HP → Armor → Iron will', 'Mid: Fortress keystone', 'Late: Light offense and utility'], bestFor: 'Nightmare / impossible, lower risk' },
      { name: 'Offense (rush)', steps: ['Damage → AS → Crit', 'Mid: Boss killer + Overload', 'Late: Utility for cost and range'], bestFor: 'Speedrun, short-wave campaign' },
    ],
    keystoneTipTitle: 'Tip: Keystone',
    keystoneTipDesc: 'Keystones are single-rank capstones with strong effects. Need prerequisite ranks to unlock.',
    refundTipTitle: 'Refund mechanic',
    refundTipDesc: 'Right-click to refund one rank, or "Reset all" on the left. Refunds return all points.',
  },

  waveEconomyPage: {
    pageTitle: 'Waves & economy',
    pageIntro: 'Understand wave rules, income sources, and gold allocation to spend every coin wisely.',
    waveRulesSection: 'Wave rules',
    waveFacts: [
      { title: 'Standard waves', desc: 'Campaign levels 10–15 waves, scaling each wave' },
      { title: 'Endless', desc: 'Unlimited waves; enemy HP and speed keep scaling' },
      { title: 'Boss waves', desc: 'Usually waves 5, 10, 15 — boss units appear' },
      { title: 'Pause & skip', desc: 'Clear enemies then manually skip countdown to save time' },
    ],
    economySection: 'Income sources',
    economySources: [
      { title: 'Kill bounty', desc: 'Gold per kill; amount depends on enemy type' },
      { title: 'Wave reward', desc: 'Fixed reward after each wave; grows later' },
      { title: 'Money tower', desc: 'Passive gold per second; higher level = more output' },
      { title: 'Skill: Cash rain', desc: 'Instant +300 gold on cast' },
    ],
    savingSection: 'Gold allocation tips',
    ruleLabel: 'Rule:',
    savingTips: [
      { title: 'Keep reserve', rule: 'Keep at least 50 gold for emergencies', tip: 'Many towers cost 30–50; reserve lets you react fast' },
      { title: 'One money tower early', rule: 'Place 1 money tower in waves 1–3', tip: 'Long-term income beats an extra DPS tower' },
      { title: 'Upgrade budget', rule: 'After full line, spend 60% on upgrades', tip: 'One Lv.4 ≥ two Lv.1; upgrades have best ROI' },
      { title: 'Sell underperformers', rule: 'Sell towers with Kill < 5', tip: '50% refund; relocate to better spots' },
    ],
    scalingSection: 'Enemy scaling table',
    scalingHeaders: { wave: 'Wave', enemyHP: 'HP mult', enemySpeed: 'Speed', reward: 'Bounty', tip: 'Advice' },
    scalingRows: [
      { wave: '1-3', enemyHP: 'x1.0', enemySpeed: 'x1.0', reward: 'Base', tip: 'Build economy' },
      { wave: '4-6', enemyHP: 'x1.5', enemySpeed: 'x1.05', reward: '+30%', tip: 'Add control and DPS' },
      { wave: '7-9', enemyHP: 'x2.5', enemySpeed: 'x1.1', reward: '+60%', tip: 'Upgrade mains to Lv.3+' },
      { wave: '10+', enemyHP: 'x4+', enemySpeed: 'x1.2+', reward: '+100%', tip: 'Active skills + keystones' },
    ],
    difficultySection: 'Difficulty strategy',
    difficultyTips: [
      { difficulty: 'Easy', tip: 'Learn systems; little budgeting needed' },
      { difficulty: 'Normal', tip: 'Standard; balanced strategy works' },
      { difficulty: 'Hard', tip: 'Tight economy; never skip early money tower' },
      { difficulty: 'Nightmare', tip: 'Win fast or collapse; defense talents required' },
      { difficulty: 'Impossible', tip: 'Extreme: full keystones and all active skills ready' },
    ],
  },

  advancedTacticsPage: {
    pageTitle: 'Advanced tactics',
    pageIntro: 'Master placement, combos, pacing, and anti-patterns to survive high difficulty and endless.',
    placementSection: 'Placement tactics',
    placementTactics: [
      { title: 'Corners first (coverage)', bullets: ['Corners cover 2 path segments', 'Enemies slow at turns', 'Place long-range towers (sniper, laser)'] },
      { title: 'Fork nodes (choke)', bullets: ['Advanced maps connect multiple routes at forks', 'AoE towers (cannon, lightning) excel here', 'Pair with frost to bottleneck'] },
      { title: 'Layered defense', bullets: ['Front: slow (frost / wind)', 'Mid: high DPS (machine / flame)', 'Back: single-target finish (sniper / laser)'] },
      { title: 'Anti-boss setup', bullets: ['Bosses on waves 5, 10, 15', 'Pre-place sniper and laser on boss path', 'Frost to lock boss', 'Freeze + Inspire burst in 5s'] },
    ],
    combosSection: 'Recommended combos',
    bestForLabel: 'Best for:',
    towerCombos: [
      { title: 'Frost + Lightning', rating: 5, towers: ['Frost', 'Lightning'], desc: 'Slow then chain — great vs swarms.', best: 'Swarm waves, groups' },
      { title: 'Frost + Sniper', rating: 5, towers: ['Frost', 'Sniper'], desc: 'Frozen targets maximize hits and crit vs bosses.', best: 'Boss fights, tanks' },
      { title: 'Poison + Flame', rating: 4, towers: ['Poison', 'Flame'], desc: 'Double DoT — slow but steady vs shielded/armored.', best: 'Shields, armor, healers' },
    ],
    rhythmSection: 'Pacing',
    rhythmTips: [
      { title: 'Early (1–3)', desc: '1–2 economy towers, 2–3 DPS; keep 50 gold reserve' },
      { title: 'Mid (4–8)', desc: 'Add control and AoE by enemy mix; upgrade mains to Lv.2' },
      { title: 'Late (9+)', desc: 'Mains Lv.4–5, keystone towers; save skills for bosses' },
    ],
    antiPatternsSection: 'Common mistakes & fixes',
    antiPatterns: [
      { warn: 'Over-relying on one tower', fix: 'At least 1 control + 1 AoE + 2 DPS' },
      { warn: 'Stacking towers in one cell', fix: '2–3 cell spacing avoids AoE wipes' },
      { warn: 'Wrong money tower spot', fix: 'Money towers in quiet corners, not choke points' },
      { warn: 'Skipping upgrades', fix: 'One Lv.4 beats two Lv.1' },
      { warn: 'Hoarding active skills', fix: 'Evaluate casts when CD ends; don\'t idle all CDs' },
    ],
  },
};
