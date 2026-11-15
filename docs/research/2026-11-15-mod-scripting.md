# Mod 腳本系統（創意工坊可編程層）

- 日期：2026-11-15
- 範圍：`src/mod-script/**`、`src/types/modScript.ts`、`src/store/modScriptStore.ts`、`src/components/mod-editor/ScriptEditor.tsx`
- 狀態：已接入（塔／地圖／波次之外新增第五種 Mod 內容）

## 1. 為什麼是 Worker + 指令模型

工坊原本只有資料（塔／敵人／地圖／波次），能組裝但不能新增規則。腳本層要解決兩件事：

1. 讓 mod 作者能寫「事件 → 反應」的邏輯（例：每波補錢、擊殺連殺獎勵、Boss 波生成援軍）。
2. **不能讓腳本弄壞遊戲**：不得直接碰 `useGameStore`、不得阻塞主迴圈、不得亂改畫面。

因此採用「腳本在 Worker 裡跑，只能回傳指令」的模型：

```
game loop ──hook──▶ runtime ──postMessage──▶ Worker(腳本)
   ▲                                            │
   └──── applyModScriptCommands ◀──commands──────┘
```

- 腳本拿到的 `api.state` 是**深拷貝快照**，改它不影響遊戲。
- 腳本唯一的輸出是 `ModScriptCommand[]`，由主執行緒逐條驗證權限與參數後落地。
- 每次事件都有 **250ms 看門狗**：超時直接 `terminate()` 並停用該腳本（卡死的 `while(true)` 只會殺掉自己）。

## 2. 腳本契約

一支腳本 = 具名函式 + hook 清單 + 權限清單 + 程式碼字串（存在 `mod.content.scripts[]`）。

```js
function onWaveStart(ctx, api) {
  if (ctx.wave % 2 === 0) api.money.add(20);
  const tanks = api.state.enemiesByType.tank || 0;
  if (tanks > 0) api.log('場上有 ' + tanks + ' 隻坦克');
}
```

- 只支援「具名函式」宣告；`import`／`export` 在 `new Function` 內不可用（模組語法本來就不合法）。
- 未宣告的 hook 一律回傳空指令（不會報錯）。

### Hook 一覽

| hook | 觸發點 | 事件欄位 |
|---|---|---|
| `onGameStart` | `startGame()` 完成建局後 | 無（狀態快照有局資訊） |
| `onWaveStart` | `startWave()` 開波 | `wave` |
| `onWaveClear` | 本波生成完且場上清空 | `wave` |
| `onEnemyKilled` | 擊殺批次（與成就／統計同一個批次點） | `killCount`, `enemyTypes` |
| `onEnemyLeaked` | 敵人抵達基地（漏怪，緊接 `takeDamage` 之後） | `enemyTypes`, `amount`, `wave` |
| `onTowerPlaced` | `placeTower()` 成功 | `towerType`, `row`, `col` |
| `onTowerSold` | `sellTower()` 成功 | `towerType`, `row`, `col` |
| `onBossSpawn` | Boss／精英生成 | `enemyType`, `wave` |
| `onMoneyChanged` | store 的 `money` 變動（節流 250ms） | `amount` |
| `onTick` | 主迴圈節流 500ms（遊戲時間） | 無 |
| `onGameOver` | 基地血量歸零 | 無 |
| `onVictory` | `setVictory()` | 無 |
| `onTowerUpgraded` | `upgradeTower()` 成功後 | `towerType`, `row`, `col` |
| `onEnemySpawned` | `spawnEnemy()` 追加敵人後 | `enemyType`, `wave` |
| `onSkillUsed` | `activateSkill()` 成功後 | `towerType`, `row`, `col` |
| `onBossKilled` | 擊殺批次中含 boss／miniboss | `enemyType`, `killCount` |
| `onWavePrepared` | `startWave()` 佇列建立後、派發前 | `wave` |

## 3. API 與權限

| api | 需要的權限 | 產生的指令 |
|---|---|---|
| `api.state` | `state.read` | （唯讀快照） |
| `api.log(msg, level?)` | `log` | `log` |
| `api.money.add(n)` | `economy` | `addMoney`（±100000 夾限） |
| `api.base.heal(n)` / `api.base.damage(n)` | `base.health` | `healBase` / `damageBase` |
| `api.spawn.enemy(type, count?, intervalMs?)` | `enemy.spawn` | `spawnEnemy`（1–20 隻、0–10000ms） |
| `api.status.apply(effect, durationMs, value?, target?)` | `enemy.modify` | `applyStatus`（≤60s、≤200 隻） |
| `api.store.get/set/all` | `storage` | `setScriptState`（≤32 鍵、字串 ≤512 字元） |
| `api.score.add(n)` | `economy` | `addScore`（結果不會低於 0） |
| `api.tower.modify(scope, stat, mult)` | `tower.modify` | `modifyTower`（總量夾 0.1~5，重複套用累乘） |
| `api.tower.upgrade(row, col)` / `sell(row, col)` | `tower.modify` | `upgradeTowerAt` / `sellTowerAt`（Lv2 預設 A 路線） |
| `api.tower.grant(type, row, col)` | `tower.modify` | `grantTower`（空格才放，佔用格跳過） |
| `api.enemy.teleport(type, row, col)` | `enemy.modify` | `teleportEnemy`（只搬指定型別） |
| `api.difficulty.set({ healthMult, speedMult, rewardMult })` | `match.modify` | `setDifficulty`（總量夾 0.1~10，避免反覆觸發失控） |
| `api.wave.setDelay(ms)` | `match.modify` | `setWaveDelay`（0~60000） |
| `api.fx.burst(row, col, color?)` | `match.modify` | `playEffect` |
| `api.rng()` / `rngInt` / `chance` / `pick` | 免權限 | （決定性 RNG，seed＝hash(scriptId)+事件序號） |

- 沒有勾的權限 → 指令被丟棄，並在 UI 日誌寫一筆 `權限不足` 警告（不中斷腳本）。
- 權限是**每個指令**檢查一次，不是每個事件檢查一次。

## 4. 預算與斷路器

| 限制 | 值 | 行為 |
|---|---|---|
| 程式碼長度 | 20,000 字元 | 超過 → 驗證紅燈、編譯失敗 |
| 單事件指令數 | 64 | 超過 → 該事件剩下的指令丟棄 |
| 事件處理 | 250ms | 超時 → `terminate()` + 本次啟動內停用 |
| 初始化 | 1500ms | 同上 |
| 連續錯誤 | 3 次 | 停用 |
| 日誌 | 200 筆（UI 每支腳本顯示最近 6 筆） | 環狀裁切 |

全域總開關在 `modScriptStore.enabled`（persist）；關閉時不建立任何 Worker。

## 5. 沙箱邊界（誠實說明）

`new Function` 的參數逐一遮蔽了 `fetch`／`XMLHttpRequest`／`WebSocket`／`self`／`window`／`document`／`localStorage`／`indexedDB`／`Worker`／`postMessage`／`setTimeout`／`setInterval`／`Function` 等全域（`eval` 因為是嚴格模式保留字不能當參數名，故未遮蔽）。

因此：

- **擋得住的是「手滑」**：誤用網路、誤取 DOM、誤用 `setTimeout` 造出殭屍迴圈、誤把遊戲 store 改壞。
- **擋不住的是「惡意」**：`(function(){}).constructor` 之類的原型鏈逃逸在 JS 內無法從 `new Function` 層完全封死；Worker 也沒有獨立 CSP。若要防惡意，正確做法是把 Worker 的 CSP 收緊（`script-src 'self' blob:` + 不含 `unsafe-eval` 就等於禁掉整個機制），或改用自製 bytecode VM。

目前定位：**單機遊戲的 mod 作者＝使用者本人**，目標是「不讓腳本毀掉這一局與存檔」，不是「執行不受信任的第三方程式碼」。未來若要開放下載他人 mod，必須先補上簽章與權限審查。

## 6. 編輯器

`創意工坊 → 模組編輯 → 腳本` 分頁：

1. 新增腳本（自動帶範例骨架與最小權限 `log`＋`state.read`）。
2. 勾選 hook 與權限（HHARDLINE 方角 toggle）。
3. 寫程式碼；右上角即時語法狀態（`new Function` 只編譯不執行）。
4. 若程式碼用到未勾選的權限，下方顯示缺哪個權限（靜態掃描 `api.xxx`）。
5. 底部顯示這支腳本最近的日誌（`api.log` 與錯誤）。
6. 匯入／匯出與其他內容一致（JSON，含 `scripts` 勾選項）。

## 7. 測試

- `src/test/modScriptSandbox.test.ts`：編譯、權限門檻、夾限、指令上限、錯誤隔離、語法檢查。
- `src/test/modScriptRng.test.ts`：同 seed 同序列、`int` 範圍、`pick` 邊界。
- `src/test/modValidationScript.test.ts`：空程式碼／語法錯／無 hook／缺權限／ID 重複。

## 8. 之後補完的五項（2026-11-15 第二輪）

### 8.1 三個新 hook

| hook | 觸發點 | 節流 |
|---|---|---|
| `onTowerSold` | `sellTower()` 成功後（帶 refund `amount`） | 無 |
| `onBossSpawn` | `spawnEnemy()` 生成 boss／miniboss（含自訂敵人映回的基底） | 無 |
| `onMoneyChanged` | 訂閱 store 的 `money` 欄位，不是逐處插樁 | 250ms（`moneyNotifyIntervalMs`） |

金錢事件刻意用「單一訂閱點 + 節流」：金錢在一次結算裡可能被改很多次，逐筆派發會把 Worker 塞爆。

### 8.2 腳本自訂狀態槽

- `api.store.get(key)` / `set(key, value)` / `all()`，需要 `storage` 權限。
- 只接受 JSON 純量（string / number / boolean / null），字串上限 512 字元、最多 32 個鍵。
- 存在 `modScriptStore.scriptState`，跟隨 `guagua-mod-scripts` persist；重開程式仍在。
- 編輯器提供「清除腳本狀態（n 鍵）」按鈕。

### 8.3 語法高亮與自動完成（無新依賴）

- `scriptHighlight.ts`：自己寫的小 tokenizer（註解／字串／數字／關鍵字／api／函式名），
  契約是「token 串接後必須等於原文」，有單元測試守住。
- `ScriptCodeEditor.tsx`：`<pre>` 疊層上色 + 透明 textarea 輸入 + 捲動同步；
  `Ctrl+Space` 開自動完成（20 個 API 入口，右側標需要哪個權限）。
- 刻意**沒有**引入 CodeMirror／Monaco：專案規則要求新增依賴前先問，而這裡的需求用 150 行就夠。

### 8.4 簽章與信任

- `signing.ts`：ECDSA P-256 + SHA-256，公鑰以 SPKI base64 夾帶在 `mod.signature`。
- `canonicalizeMod`：遞迴鍵排序、略過 `signature`；前端與 CLI 必須用同一份規則。
- CLI：`node scripts/mod-sign.mjs keygen|sign|verify`（Node 端用 `ieee-p1363`，否則 WebCrypto 驗不過）。
- 信任模式：`all`（預設，本機自寫）／`signed`（簽章有效且公鑰指紋已被信任）。
  編輯器顯示簽章狀態、指紋，並可「信任這把金鑰」。
- 驗簽快取：`modId → bool`，信任模式或指紋清單變更時整批失效。

### 8.5 Tauri CSP

`app.security.csp` 從 `null` 收窄成白名單：

- `script-src 'self' 'unsafe-eval' blob:`（`new Function` 與 Worker 需要）
- `worker-src 'self' blob:`
- `connect-src` 只放行 `ipc:`、`http://ipc.localhost`、Jamendo／Freesound／GitHub API
- `img-src`／`media-src` 允許 `data:`、`blob:`、`https:`（封面圖與音樂串流）

**回滾**：把 `src-tauri/tauri.conf.json` 的 `security.csp` 改回 `null` 即可。
改 CSP 後一定要實際啟動桌面版點過一輪（音樂、更新檢查、圖片、腳本 Worker），
CSP 錯誤在 webview 裡通常只表現成白畫面或資源靜默失敗。

### 8.6 自訂敵人可生成

- `getEnemyData(type)`：內建優先 → 已啟用 mod 的自訂敵人 → 退回 `normal`（永不放 undefined 進戰鬥）。
- `inferEnemyBaseType(data)`：把 `ability`（flying／healing／shield…）映回內建基底 type，
  讓引擎既有的能力分支照常運作。
- `Enemy.originType` 記住原始 mod id；外觀、名稱、數值一律走 `getEnemyData(originType ?? type)`。
- data 層（`enemyVisibility`、`renderSnapshot`）不能 import store，所以用
  `enemyDataProvider` 注入解析器（與 audio prefs 的注入模式一致）。
- 波次編輯器的敵人選擇器多了 `MOD` 群組；`WaveConfig.enemies[].type` 放寬為 `string`。
- 腳本 `api.spawn.enemy` 現在接受自訂敵人 id（`isKnownEnemyType` 驗證）。

## 9. 已知未做（下一步）

1. **桌面版 CSP 實機驗證**：這次只驗了瀏覽器（dev server）。
   打包後必須實際點過：開場音樂、專輯下載、更新檢查、mod 圖示（data URL）、腳本 Worker。
   CSP 寫錯在 webview 只會白畫面或資源靜默失敗，不會有清楚錯誤。
2. 腳本狀態槽目前存在 app 層（`guagua-mod-scripts`），沒進遊戲存檔；
   要做「每個存檔各自一份狀態」需要動 persist 結構，屬高風險改動。
3. 還沒有金鑰庫／撤銷清單：目前只有指紋 pinning，換金鑰等於重新信任一次。
4. 自訂敵人在成就／統計仍以基底 `type` 計數（擊殺統計是 `EnemyType[]`）。
   要精確統計得把 stats 的 key 換成 `originType ?? type`。
5. 編輯器色票走低彩度（AA 可讀優先）：`api 2.49:1 → 通過` 之後視覺上偏素；
   若要更鮮豔需要先算過一輪對比，再加高彩度 token。
6. 自動完成沒有參數提示（signature help）；目前只插入範例片段。

> 節點層的目錄、未實作項目與限制見下一節。

## 10. 節點目錄（114 個）

節點庫 `src/workshop/graph/nodeLibrary.ts` 是唯一真相：畫布、檢視器、規則表、驗證器、codegen 都從它讀規格。節點 type 一旦發布不可改名（存檔與 .ggmod 都靠它）。

三層關係：**規格**（nodeLibrary）→ **產生程式碼**（codegen）→ **落地**（commands，只有新指令才需要動）。
`src/test/workshopNodeCoverage.test.ts` 會逐型別建最小圖並編譯，任何漏接 codegen 的節點都會讓 CI 紅。

### 10.1 事件（17）

| type | 名稱 |
|---|---|
| `event.gameStart` | 遊戲開始 |
| `event.waveStart` | 波次開始 |
| `event.wavePrepared` | 波次準備 |
| `event.waveClear` | 波次結束 |
| `event.enemySpawned` | 敵人生成 |
| `event.enemyKilled` | 敵人死亡 |
| `event.enemyLeaked` | 漏怪 |
| `event.bossSpawn` | Boss 出現 |
| `event.bossKilled` | Boss 擊殺 |
| `event.towerPlaced` | 塔放置 |
| `event.towerUpgraded` | 塔升級 |
| `event.towerSold` | 塔出售 |
| `event.skillUsed` | 技能啟用 |
| `event.moneyChanged` | 金錢變動 |
| `event.tick` | 每幀 |
| `event.victory` | 勝利 |
| `event.gameOver` | 遊戲失敗 |

### 10.2 條件（31）

| type | 名稱 | 讀什麼 |
|---|---|---|
| `cond.chance` | 隨機機率 | `api.chance(p)` |
| `cond.compare` | 數值比較 | 兩個數值埠 |
| `cond.between` | 區間判定 | 數值埠＋上下限 |
| `cond.and` / `cond.or` / `cond.not` | 且／或／非 | 布林埠 |
| `cond.xor` / `cond.nand` / `cond.nor` | 互斥／非且／非或 | 布林埠 |
| `cond.anyOf` / `cond.allOf` | 任一成立／全部成立 | 三個布林埠 |
| `cond.wave` | 波次門檻 | `api.state.wave` |
| `cond.waveModulo` | 每 N 波 | `api.state.wave % n` |
| `cond.waveParity` | 波次奇偶 | `api.state.wave % 2` |
| `cond.health` | 基地生命門檻 | `api.state.health` |
| `cond.towerCount` | 塔數門檻 | `api.state.towerCount` |
| `cond.towerType` | 場上有某種塔 | `api.state.towerTypes` |
| `cond.enemyCount` | 場上敵人數 | `api.state.enemyCount` |
| `cond.enemyType` | 指定敵人數量 | `api.state.enemiesByType` |
| `cond.bossOnField` | Boss 在場 | boss／miniboss 計數 |
| `cond.fieldEmpty` | 場上清空 | `enemyCount === 0` |
| `cond.money` | 金錢比較 | `api.state.money` |
| `cond.score` | 分數門檻 | `api.state.score` |
| `cond.kills` | 擊殺數門檻 | `api.state.kills` |
| `cond.leaks` | 漏怪數門檻 | `api.state.leaks` |
| `cond.elapsed` | 經過時間 | `api.state.elapsedMs / 1000` |
| `cond.difficulty` | 難度比對 | `api.state.difficulty` |
| `cond.endless` | 是否無盡模式 | `api.state.endless` |
| `cond.pathName` | 地圖比對 | `api.state.pathName` |
| `cond.varCompare` | 變數比對 | `api.store.get`（storage） |
| `cond.varString` | 字串變數比對 | `api.store.get`（storage） |

### 10.3 動作（20）

| type | 名稱 | 產生 |
|---|---|---|
| `action.addMoney` | 加錢 | `api.money.add` |
| `action.addScore` | 加分 | `api.score.add` |
| `action.healBase` / `action.damageBase` | 回復／扣除基地生命 | `api.base.*` |
| `action.spawnEnemy` | 生成敵人 | `api.spawn.enemy` |
| `action.applyStatus` | 施加狀態 | `api.status.apply` |
| `action.applyStatusAll` | 全體施加狀態 | `api.status.apply`（無目標） |
| `action.modifyTower` | 修改塔能力 | `api.tower.modify` |
| `action.upgradeTowerAt` | 升級座標塔 | `api.tower.upgrade` |
| `action.sellTowerAt` | 出售座標塔 | `api.tower.sell` |
| `action.grantTower` | 送塔 | `api.tower.grant` |
| `action.teleportEnemy` | 傳送敵人 | `api.enemy.teleport` |
| `action.setDifficulty` | 調整難度倍率 | `api.difficulty.set` |
| `action.setWaveDelay` | 設定下一波延遲 | `api.wave.setDelay` |
| `action.playEffect` | 播放特效 | `api.fx.burst` |
| `action.log` / `action.logValue` | 寫入日誌／印出數值 | `api.log` |
| `action.setVar` / `action.addVar` / `action.clearVar` | 設定／累加／清除變數 | `api.store.set` |

### 10.4 流程（8）

| type | 名稱 | 說明 |
|---|---|---|
| `flow.if` | 條件分支 | then／else 兩路 |
| `flow.switch` | 多分支 | 三個具名分支＋預設，沒接線的分支不產生空 if |
| `flow.sequence` | 序列 | 三路依序 |
| `flow.sequenceN` | 序列（六路） | 六路依序 |
| `flow.loop` | 迴圈 | 上限 50 次 |
| `flow.throttle` | 節流 | 依 `elapsedMs` 間隔 |
| `flow.gate` | 每 N 次通過 | 持久計數 |
| `flow.once` | 只執行一次 | 持久旗標 |

### 10.5 數值（31）

| type | 名稱 |
|---|---|
| `num.literal` | 固定數值 |
| `num.add` / `num.sub` / `num.mul` / `num.div` | 四則運算（除以 0 回 0） |
| `num.mod` / `num.pow` / `num.abs` | 餘數／次方／絕對值 |
| `num.floor` / `num.ceil` / `num.round` | 捨去／進位／四捨五入 |
| `num.min` / `num.max` / `num.clamp` | 取最小／取最大／夾在範圍 |
| `num.random` / `num.randomFloat` | 隨機整數／隨機小數 |
| `num.state` / `num.var` | 讀狀態欄位／讀腳本變數 |
| `num.wave` / `num.maxWaves` | 目前波次／總波數 |
| `num.health` / `num.money` | 基地生命／目前金錢 |
| `num.towerCount` / `num.towerLevelSum` | 場上塔數／塔等級總和 |
| `num.enemyCount` / `num.enemiesOfType` | 場上敵人數／指定敵人數量 |
| `num.bossHealth` | 場上 Boss 最高血量 |
| `num.score` / `num.kills` / `num.leaks` | 分數／擊殺數／漏怪數 |
| `num.elapsedSec` | 經過秒數 |

### 10.6 字串（6）

| type | 名稱 | 說明 |
|---|---|---|
| `text.literal` | 文字 | 固定字串 |
| `text.concat` | 串接文字 | 兩段相接 |
| `text.number` | 數字轉文字 | `String(v)` |
| `text.template` | 文字模板 | `漏了 {n} 隻` 插值 |
| `text.upper` | 轉大寫 | `toUpperCase` |
| `text.slice` | 取子字串 | 起始＋長度 |

### 10.7 JS（1）

`js.node`：直接寫 JS，與腳本同一個 Worker 沙箱與權限模型，標記為不可靜態分析。

### 10.8 尚未實作的節點（需要先動核心系統）

| 節點 | 卡在哪 |
|---|---|
| `action.setTargeting` | 塔沒有「目標優先級」欄位，要先定義覆寫機制 |
| `action.shieldTower` | 塔沒有血量系統（敵人只會穿過），護盾沒有意義 |
| `action.spawnWave` | 生成佇列在 rAF 的 ref 裡，要重構成 store 佇列才能插波 |
| `action.revealWave` | 預告資料不在 store，需要先開 UI 通道 |
| `cond.enemyInRange` | 等於把挑目標邏輯搬進沙箱，容易與主迴圈不一致 |

