# 自動戰鬥（Auto-Battle）加強研究

> 版本基準：v1.2.0 · 研究日期 2026-11-14 · 對應程式碼 commit `049a456`
> 方法：靜態閱讀 + 一支臨時探測測試（`canBatchUpgradeTower` 語意，跑完即刪）
> 範圍：`src/store/gameStoreAutoBattle.ts`(1,016) + `gameStoreAutoBattlePlayerSkills.ts`(480) + 相關 UI
> **修復狀態（2026-11-14）**：**B1、B2、B3 已修**（`c9ed6cd` 費用算式共用、`075c8f4` B1+B2、`bcdbfaa` B3 開關），
> 回歸測試 `src/test/autoBattleFixes.test.ts`（12 例，含「跑一輪決策後塔真的升到 Lv2」的行為級驗證）；**B4–B7 仍未處理**。

---

## 0. 結論（先看這段）

現有自動戰鬥**不是「不夠強」，而是有 4 個功能性缺陷讓它少做了大半工作**，其中兩個是「功能實際不存在」：

| # | 缺陷 | 嚴重度 | 一句話 |
|---|---|---|---|
| **B1** | 升級閘門用錯謂詞 → **AI 永遠不會升級任何塔** | 🔴 P0 | 塔永遠停在 Lv1（上限 5） |
| **B2** | 建塔／升級扣款未乘 `towerCostMult` | 🔴 P0 | 與手動價格不一致，困難圖少付 30%、簡單圖多付一倍 |
| **B3** | `autoFusion` 無 UI 且預設關閉 → **融合功能不可達** | 🔴 P0 | 600–687 行是死碼 |
| **B4** | 決策閘門用 `Date.now()`，遊戲用 `× gameSpeed` | 🟠 P1 | 5 倍速下 AI 反應慢 5 倍 |
| **B5** | 威脅評估用歐氏距離 + 型別白名單 | 🟠 P1 | 忽略 `progress`／盾／護甲，誤判局勢 |
| **B6** | 從不調整 `targetPriority` | 🟠 P1 | 無法應對漏怪衝線 |
| **B7** | 160 個測試檔中 **0 個**涵蓋自動戰鬥 | 🟠 P1 | B1 這種 bug 5 行測試就能抓到 |

**修完 B1–B4 的預估效果**：AI 可用戰力約為現在的 2–3 倍（塔等級 1 → 5、融合可開啟、經濟正確、高倍速不掉決策）。

---

## 1. 現況架構

### 1.1 檔案與規模

| 檔案 | 行數 | 職責 |
|---|---|---|
| `src/store/gameStoreAutoBattle.ts` | 1,016 | 主決策：威脅評估、技能、略波、放塔、升級、拆塔、融合、批次寫入 |
| `src/store/gameStoreAutoBattlePlayerSkills.ts` | 480 | 玩家主動技能評分（10 個 skill 各一個 scorer） |
| `src/components/game/sidebar/AdvancedOptionsPanel.tsx` | 199 | 策略選擇 + 5 個開關 + 日誌（8 筆） |
| `src/components/game/sidebar/AIStatusHeader.tsx` | 77 | 最新決策 + `thinking` 步驟（最多 8 行） |
| `src/components/game/sidebar/TopStatsBar.tsx` | — | 放置數／花費／決策數／策略名 |

### 1.2 決策節奏（模組級計時器，`gameStoreAutoBattle.ts:21-23`）

| 決策 | 間隔 | 閘門位置 | 每次上限 |
|---|---|---|---|
| 塔技能 | 500 ms | `:138` | 2 個技能 |
| 玩家技能 | 700 ms | `:225` | 1 個（分數最高） |
| 略波 | 2,000 ms | `:231` | 1 次 |
| 放塔／升級／拆塔／融合 | 300 / 600 / 1000 ms（依威脅 `:307`） | `:309` | 3–5 個動作（`:418`） |

呼叫點：`useGameSceneEffects.ts:442`，每幀進入但被上述閘門攔住，外層已包 `perfTime('runAutoBattleLogic')`。

### 1.3 資料流

```
rAF → runAutoBattleLogic()
      ├─ calculateThreatLevel()        :82   （純讀 enemies + path）
      ├─ 技能 / 玩家技能 / 略波        :138 / :225 / :231  （直接呼叫 store action）
      ├─ 拆塔（最多 1）                :504
      ├─ 融合（最多 1）                :601
      └─ 動作迴圈 ×3–5                :690
            ├─ 升級（優先）           :729
            └─ 放塔（否則）           :832  （掃全部空格 → 評分 → 取最高）
      └─ 一次 set() 批次寫入           :1007
```

設計上**有兩個好底子**，重構時要保留：

1. **批次寫入**：整輪決策只呼叫一次 `set()`，動畫／成就／飄字都先緩衝（`:1007-1061`）。
2. **思考過程可視化**：每個動作都產生 `thinking: string[]`，`AIStatusHeader` 可展開。

---

## 2. 已驗證的缺陷

### B1 🔴 AI 永遠不會升級（升級區塊是死碼）

**證據鏈**

- `gameStoreAutoBattle.ts:730-731`
  ```ts
  const upgradableTowers = curTowers
    .filter(t => canBatchUpgradeTower(t, maxLevel))
  ```
- `src/data/towerUpgradeCost.ts:15-21`
  ```ts
  return tower.level >= 2 && tower.level < maxLevel && Boolean(tower.upgradePath);
  ```
- AI 建塔時（`:938`）與融合時（`:643`）都是 `level: 1, upgradePath: null`。

**實測**（臨時 vitest 檔，已刪除）

```
canBatchUpgradeTower({ level: 1, upgradePath: null }) → false
MAX_TOWER_LEVEL = 5
getTowerUpgradeCost(150, 1) = 112 / (150, 2) = 225
```

**後果**

- 純自動戰鬥（玩家不手動升級）時，所有塔永遠 Lv1 → AI 的上限被砍到 1/5。
- `:766-772` 的「Lv1→2 選路線」分支永遠不會執行；`:803` 的 `pathName` 永遠是空字串。
- `autoBattleStats` 根本沒有「升級次數」欄位（`gameStoreTypes.ts:157-162` 只有 placed / moneySpent / decisionsCount / towersSold）→ 沒人發現。

**修法**（最小差異）

```ts
// AI 用：允許 Lv1（自己決定路線），對齊 upgradeTower 的 newLevel===2 需 path 規則
const canAiUpgrade = (t: Tower) => t.level < maxLevel;
```

驗證：連跑 3 波後 `towers.some(t => t.level >= 2)` 必須為 true。

---

### B2 🔴 費用未計入 `towerCostMult`

| 路徑 | 計算 |
|---|---|
| 手動建塔 `gameStoreActions.ts:48` | `Math.round(towerData.cost * difficultyModifiers.towerCostMult)` |
| AI 建塔 `:915 / :918 / :928 / :949` | `TOWER_DATA[type].cost`（**原始值**） |
| AI 融合 `:620` | `computeFusionCost(..., difficultyModifiers.towerCostMult)` ✅ |
| 手動／AI 升級 | `getTowerUpgradeCost(baseCost, level)`（兩邊都無倍率，一致） |

`towerCostMult` 實際範圍（章節資料）：**0.5–1.3**（`ch1_lv3` 0.5、`ch3_lv3` 1.3、難度 preset `waveData.ts:201-246`）。

**後果**：AI 直接寫 `money: curMoney`（`:1008`），所以扣款就以 AI 的錯誤算式為準 →

- 1.3 倍圖：AI 實際少付 23%（`1 - 1/1.3`），等於**免費賺錢**。
- 0.5 倍圖：AI 多付一倍，經濟被自己掐死。
- 難度 preset 的設計意圖完全失效。

**修法**：抽一個 `towerCost(type, modifiers)` 給 AI 與 UI 共用，別再各自算。

---

### B3 🔴 融合功能不可達

- 預設 `autoFusion: false`（`gameStore.ts:143`）。
- `AdvancedOptionsPanel.tsx:103-120` 只有 5 個開關（place / upgrade / skills / skip / sell），**沒有 fusion**。
- Dev 面板 `CombatSection.tsx:225-254` 只有 `autoBattleEnabled` 與策略，也沒有 config 開關。
- 因此 `:601-687`（87 行融合評分＋執行）在任何正常操作下都不會執行。

**修法**：補一個 ToggleSwitch（沿用 `t.aiAutoSell` 樣式，新增 i18n key `game.aiAutoFusion`）＋ 依策略給預設值（aggressive: true）。

---

### B4 🟠 決策時鐘與遊戲時間脫鉤

- 遊戲推進：`useGameSceneEffects.ts:409` `deltaTime = (currentTime - lastTime) * gameSpeed`
- 速度選項：`0.5 / 1 / 2 / 3 / 5`（`src/data/gameSpeedPresets.ts`）
- AI 全部用 `Date.now()`（`:58-61`、`:307`）→ 5 倍速時，「500ms 技能窗」實際等於 **2.5 秒遊戲時間**；放塔間隔 300ms 等於 1.5 秒。

**後果**：玩家的直覺是「開 5 倍速讓 AI 快點打」，實際是 AI 變笨 5 倍。這也是體感上「自動戰鬥在高倍速會崩」的根因。

**修法**：store 內維護 `gameTimeMs`（每幀累加 `deltaTime`），AI 閘門全部改讀它；或最簡版：`interval / gameSpeed`。

---

### B5 🟠 威脅評估用歐氏距離與類型白名單

- 自己算「敵人→終點直線距離」（`:90-106`、`:249-265`），並用魔數 `maxDist * 0.7` 換算進度。
- `Enemy` 明明有 `progress`、`currentSegmentId`、`segmentWaypointIndex`（`types/game.ts`），AI 完全沒用。
- 危險度只依 `enemy.type` 白名單加成（`:116-122`），忽略 `EnemyData` 的 `armorValue`、`shieldAmount`、`stealthDuration`、`phaseDuration`、`jamRadius`、`escortArmor`、`spawnOnDeath`、`berserkThreshold`。

**後果**：高護甲／高護盾波次被低估（總 DPS 看起來夠、實際打不動）；隱形／相位敵人被當普通怪；叉路地圖的「到終點距離」用直線會算錯。

**修法**：
```ts
const effHp = enemy.health + (enemy.shield ?? 0);
const armorFactor = 1 / (1 + (enemyData.armorValue ?? 0) / 100);
const progress = enemy.progress ?? fallback;   // 直接信引擎
threat += progress * (effHp / maxHp) * speedFactor * armorFactor * dangerMul;
```

---

### B6 🟠 從不調整 `targetPriority`

- 只在建塔／融合時寫 `defaultTargetPriority(type)`（`:644`、`:939`）。
- `src/data/towerTargeting.ts` 已有多種優先級（first / last / strongest / closest 等），AI 一個都沒換過。

**後果**：無法做最基本的戰術——「快漏怪時讓前段塔打 first、最後防線打 strongest」。

**修法**：威脅 > 0.6 或某敵 `progress > 0.85` 時，把最後 1/3 路段的塔切成 `'first'`；首領波切成 `'strongest'`。

---

### B7 🟠 零測試覆蓋

`src/test/` 共 160 檔，**沒有任何一個** import 或提到 `autoBattle` / `runAutoBattleLogic`。

`npm run test`（698 tests）對這 1,496 行決策邏輯的保護是 0。B1 這種 bug 只需 5 行斷言就能抓到。

---

## 3. 決策品質的加強空間（P1）

B1–B7 修完後，AI 才算「有在正常工作」。以下是讓它「變聰明」的具體項目。

### 3.1 放置評分：`baseRange` 是魔數

`:841` `const baseRange = 150;` — 用固定 150px 判斷覆蓋，但實際塔射程是 `TowerData.range × 40px`（射程 3 = 120px、射程 5 = 200px）。

**問題**：對短射程塔高估覆蓋 25%、對長射程塔低估。且 `score` 與「真的放下這座塔」無關（先定格、再猜塔種 :885-905）。

**改法**：對每個「(空格 × 可負擔塔種)」配對算分：

```ts
const rangePx = towerData.range * 40;
const coverage = segs.filter(s => pointToSegDist(...) < rangePx).length;
const score = coverage * 1.5 + strategic + synergy + spacing;  // 用真的射程
const valuePerDollar = estimateDeltaDps(towerData) / cost;      // 加這個排序鍵
```

只掃 top-30 空格 × 3 塔種，成本與現在同一量級。

### 3.2 升級路線選擇的語意是錯的

`:803` `newPath === 'A' ? '傷害路線' : '效果路線'` — 但 `basic` 塔的 **A 是攻速、B 才是傷害**（`upgradeBranches.ts`：pathA `fireRateMultiplier`、pathB `damageMultiplier`）。

**改法**：不要硬編碼「A=傷害」，改成讀 `UPGRADE_BRANCHES[type].pathA/B` 的 `damageMultiplier` / `fireRateMultiplier` / `rangeMultiplier` 決定哪條是傷害、哪條是控制，再依當前需求（缺輸出／缺控制）選。

### 3.3 技能決策只看「範圍內敵人數」

`:174-186` 全是 `nearbyCount >= 3 → 10 分` 這類門檻。

**改法**：估 EV = 「預期擊殺數 × 平均 reward + 省下的 HP 損失」，與「技能冷卻剩餘」比較。擊殺價值可從 `ENEMY_DATA[type].reward` 與 `enemy.health` 直接算，成本很低。

### 3.4 略波判準用總量，不看分佈

`:236-283` 用「總剩餘 HP / 總 DPS < 門檻」——一隻快到終點的 Boss 與十隻剛出生的雜兵，總 HP 可能相同。

**改法**：加兩個條件：(a) 最前線敵人的 `progress` 換算「剩餘秒數」> `timeToKill`；(b) 該敵人是否 boss（boss 不略波）。

### 3.5 沒有下一波預判

`WAVE_CONFIGS`（`waveData.ts:4`）是靜態陣列，可直接讀下一波組成。目前 AI 完全被動。

**改法**：波間（`!waveActive`）時讀下一波 → 若 `armorValue` 高就優先補破甲/高單傷、若 `stealthDuration` 高就提前鋪偵測、若 `spawnOnDeath` 就準備 AoE。

### 3.6 經濟模型過於靜態

- `minReserve` 固定 30/60/80/100（`:380-403`）。
- 經濟塔上限固定 1–4 座，拆除條件用「覆蓋 ≥ 2 段」（`:552`）。

**改法**：保留金幣 = 「下一座目標塔 cost + 升級費」；`currentWave >= 7` 後主動把覆蓋要地的經濟塔換成輸出塔（現在 autoSell 只在 `threatLevel < 0.5` 才會考慮）。

---

## 4. 架構重構（P2，讓「加強」變成可持續的事）

現況最大問題：**1,496 行決策邏輯全部藏在 store action 裡**，無法測、無法對照、無法實驗。

建議拆成純函式（放在 `src/data/autoBattle/`，符合「data 層無 store、無副作用」的架構規則）：

```
src/data/autoBattle/
  snapshot.ts     // 從 GameStore 抽出最小決策輸入（純資料）
  threat.ts       // threat(snapshot) → number
  placement.ts    // scorePlacements(snapshot, type) → ScoredSpot[]
  upgrade.ts      // pickUpgrade(snapshot) → UpgradeAction | null
  sell.ts         // pickSell(snapshot) → SellAction | null
  fusion.ts       // pickFusion(snapshot) → FusionAction | null
  skills.ts       // pickTowerSkills(snapshot) → SkillAction[]
  skip.ts         // shouldSkipWave(snapshot) → boolean
  decide.ts       // decide(snapshot, config) → Action[]   ← 唯一入口
```

`gameStoreAutoBattle.ts` 退化成「產生 snapshot → 呼叫 decide → applyActions 批次寫入」，預估剩 200 行以內。

**好處**：每個決策都能寫行為測試；可做 golden snapshot；可並排比較策略；可離線跑平衡。

---

## 5. Benchmark Harness（P3，最重要的一步）

沒有量化基準，「加強」只能靠感覺。建議：

1. **模擬器**：headless 跑簡化戰鬥（重用 `updateEnemies` / `updateTowers` 或寫 200 行近似模型）。
2. **輸入**：39 張地圖 × 4 策略 × 3 難度，每組跑 3 次固定種子。
3. **輸出**：勝率、平均剩餘 HP、平均通關波次、每波花費效率、決策次數/秒。
4. **用法**：每次改 AI 前後各跑一次，只看數字有沒有變好。

---

## 6. 優先順序

| 順序 | 項目 | 工作量 | 預期收益 | 風險 |
|---|---|---|---|---|
| 1 | **B1** 升級閘門 | 1–2 h | 🔥🔥🔥 上限 1→5 級 | 低（多花錢，需一起調 minReserve） |
| 2 | **B2** 費用倍率 | 1 h | 🔥🔥 經濟正確 | 低 |
| 3 | **B3** 融合 UI | 1 h | 🔥🔥 87 行死碼復活 | 低 |
| 4 | **B4** 遊戲時鐘 | 2–3 h | 🔥🔥🔥 高倍速可用 | 中（動到 AI 節奏，需實測） |
| 5 | B5/B6 威脅與目標優先級 | 4–6 h | 🔥🔥 判斷變準 | 中 |
| 6 | 3.1 放置射程／聯合搜尋 | 4 h | 🔥🔥 位置變好 | 中 |
| 7 | 3.3–3.5 技能 EV / 略波 / 預判 | 1–2 d | 🔥 體感明顯 | 中 |
| 8 | P2 純函式拆分 | 2–3 d | 🔥🔥 可維護 | 中（純搬移，行為不變） |
| 9 | P3 benchmark | 3–5 d | 🔥🔥🔥 之後每次改動都有依據 | 低 |

**建議節奏**：1→2→3 一起做（同一個 commit 系列，都是「讓現有功能真的生效」）→ 4 單獨做（要調閘門參數）→ 8 先於 6/7（先有可測結構再改策略）→ 9 最後但一定要做。

---

## 7. 驗證計畫

修 B1–B4 時至少要新增這些測試（`src/test/`）：

| 測試檔 | 斷言 |
|---|---|
| `autoBattleUpgrade.test.ts` | 給 Lv1 塔 + 充足金幣，跑 3 輪決策後 `tower.level >= 2` 且 `upgradePath !== null` |
| `autoBattleCost.test.ts` | `towerCostMult = 1.3` 時，AI 放一座 cost 100 的塔要扣 130 |
| `autoBattleSpeed.test.ts` | `gameSpeed = 5` 時，同樣遊戲時間內決策次數應為 1 倍速的 ~5 倍（或至少不被稀釋） |
| `autoBattleThreat.test.ts` | 高護甲／高護盾敵人使 `threatLevel` 上升；`progress` 高者權重更大 |
| `autoBattleFusion.test.ts` | `autoFusion = true` + 兩個可融合塔 → 產生融合塔 |
| `autoBattleDecision.test.ts` | （P2 後）`decide(snapshot)` 是純函式，同輸入同輸出 |

---

## 8. 刻意先不動

- **玩家技能 scorer（480 行）品質不錯**：10 個 skill 各有專屬評分與策略閾值（`SKILL_THRESHOLDS`），先別碰，等 benchmark 有數字再說。
- **批次寫入 / 動畫緩衝**：設計正確，重構時原樣搬。
- **`thinking` 日誌**：這是本專案少見的「AI 可解釋性」設計，保留並在重構後補型別（目前是 `string[]`，建議改成結構化 `ThinkingStep[]`）。

---

## 9. 建議的技術債條目（待編號確認）

目前 `架構圖.html` §22 的 42 項沒有涵蓋「AI 決策」這一塊。建議新增分類 **J. 自動戰鬥**：

| 建議編號 | 內容 | 對應本文件 |
|---|---|---|
| TD-43 | AI 升級閘門錯誤（永不升級） | B1 |
| TD-44 | 建塔費用未計 `towerCostMult` | B2 |
| TD-45 | `autoFusion` 無 UI 開關 | B3 |
| TD-46 | 決策閘門未隨 `gameSpeed` 縮放 | B4 |
| TD-47 | 威脅評估忽略 `progress`／盾／護甲 | B5、B6 |
| TD-48 | 自動戰鬥零測試 | B7 |
| TD-49 | 1,496 行決策邏輯未純函式化 | P2 |
