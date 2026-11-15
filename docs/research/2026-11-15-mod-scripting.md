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
| `onTowerPlaced` | `placeTower()` 成功 | `towerType`, `row`, `col` |
| `onTick` | 主迴圈節流 500ms（遊戲時間） | 無 |
| `onGameOver` | 基地血量歸零 | 無 |
| `onVictory` | `setVictory()` | 無 |

## 3. API 與權限

| api | 需要的權限 | 產生的指令 |
|---|---|---|
| `api.state` | `state.read` | （唯讀快照） |
| `api.log(msg, level?)` | `log` | `log` |
| `api.money.add(n)` | `economy` | `addMoney`（±100000 夾限） |
| `api.base.heal(n)` / `api.base.damage(n)` | `base.health` | `healBase` / `damageBase` |
| `api.spawn.enemy(type, count?, intervalMs?)` | `enemy.spawn` | `spawnEnemy`（1–20 隻、0–10000ms） |
| `api.status.apply(effect, durationMs, value?, target?)` | `enemy.modify` | `applyStatus`（≤60s、≤200 隻） |
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

1. 腳本專屬 CSP 與簽章（開放下載他人 mod 前必須）。
2. 更細的 hook：`onTowerSold`、`onBossSpawn`、`onMoneyChanged`（後者要節流，否則高頻）。
3. 腳本層的 `api.state` 欄位目前固定；若要做「腳本自訂狀態」，需要 per-script 儲存槽（要進存檔格式，屬高風險改動）。
4. 編輯器尚無語法高亮與自動完成（要引入編輯器依賴，需先取得同意）。
5. 自訂敵人仍未接進 `spawnEnemy`：`api.spawn.enemy` 目前只認內建 22 種，未知 id 會被丟棄並寫警告。
