# 波次編輯器重做（單軌序列 + 曲線擬合）

日期：2026-11-15
範圍：`src/workshop/content/**`、`src/components/workshop/content/**`、`WaveConfig` 型別、生成佇列

## 為什麼要重做

舊版是「三塊 + 每種敵人一列」的假多軌時間軸。實際引擎的生成佇列是**嚴格序列**：

```
每組的 delay 從「前一組最後一隻」之後才開始累加
組內間隔固定 GAME_CONSTANTS.ENEMY_SPAWN_DELAY（800ms）
```

也就是說時間軸上不可能有真正的並行。多軌視圖讓「把方塊往右拖」看起來只動那一格，
實際上後面全部被推遲——使用者看不到因果，就會覺得編輯器壞了。

第二個問題是資料模型太薄：`WaveConfig` 只有 `enemies(type/count/delay)` 與 `reward`，
作者無法表達「第 8 波開始變硬」「這波出怪快一點」「這波先跳過」。

## 決策一：單軌序列軌

整關一條軌，片段依序排開，**片段之間的空隙就是 delay**。

- `TrackSegment` 同時帶「波內時間」與「整關絕對時間」，UI 不必自己累加。
- 波次邊界畫成垂直線 + 標頭，跨波拖曳＝搬片段到另一波。
- 「依型別分列」只留給摘要（清單列的敵人數／HP），不再當成時間軸。

## 決策二：三種拖曳語意

| 操作 | 語意 | 實作 |
|---|---|---|
| 拖片段身體（水平） | 改時間，**同波後面的組一起等量後移** | `shiftSegment` |
| 拖過鄰居中線 | 換順序，不產生空隙 | `reorderSegments` |
| 拖片段右緣 | 改數量 | `resizeSegment` |

第一種刻意不是「只動這一格」：序列佇列裡只動一格會製造重疊，驗證會判 `overlap`，
使用者還是得手動補償。整段後移才符合「拖到哪就是哪」的直覺。

## 決策三：資料模型只擴波次層

`WaveConfig` 新增五個**可選**欄位（缺省值＝現行行為，舊存檔與官方波次零影響）：

| 欄位 | 語意 | 引擎端 |
|---|---|---|
| `hpScale` | 絕對血量倍率，缺省 1 | `spawnEnemy(type, hpScale)`，乘在難度修飾之後 |
| `intervalMs` | 該波組內間隔，缺省用全域常數 | 生成佇列改讀每波間隔 |
| `enabled` | false＝停用 | **編譯期**轉成空波 + 0 獎勵，引擎看到空佇列立刻結束該波 |
| `chapter` | 章節標籤 | 引擎不讀，只影響編輯器分組 |
| `name` | 自訂波次名稱 | 引擎不讀 |

為什麼 `enabled` 放在編譯期而不是引擎：停用波要「不生成、不給獎勵、波數仍計」，
在編譯期做成空波就同時滿足三件事，引擎一行都不用改，也不會在戰鬥中多一個分支。

## 決策四：難度與經濟都是相對值

```
難度 = 該波總 HP ÷ 該波開始前的可用金幣，再對全場峰值正規化成 0–100
可用金幣 = 起始金幣 + Σ(前面各波的擊殺獎勵 + 通關獎勵) × 收入折扣
```

面板把「起始金幣／平均塔價／收入折扣／平滑視窗」攤開來調——因為這四個數字一變，
分數就會變。把它藏起來會讓作者誤以為那是絕對強度。

「買不起任何塔」的波次會單獨列出來（`starvedWaves`），那是最常見的曲線斷點。

## 決策五：曲線擬合

`WaveConfig` 沒有全域 HP 欄位，所以「拉一條目標 HP 曲線」只能用**數量 × hpScale** 逼近：

```
w_i = shape(i/N)                     // linear / ease / spike
target_i = 目標總HP × w_i / Σw
count_i = max(1, round(target_i / baseHealth))
hpScale_i = clamp(target_i / (count_i × baseHealth), 0.05, 20)
```

形狀：`linear`＝後段線性變硬；`ease`＝前緩後急；`spike`＝每 N 波一個尖峰（乘 `spikeScale`）。

## 決策六：撤銷只記波次這一層

歷史堆疊放在 `useWaveHistory`，不進 `workshopStore`：

- store 的契約是「專案資料」，加歷史會讓每次寫入都多一份快照；
- 撤銷粒度應該由編輯器決定（一次拖曳＝一步），不是由 store 決定；
- 換關卡（signature 改變）自動清空——跨關卡撤銷會把 A 關的波次寫進 B 關。

深度 50，`Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y`，輸入框內不攔截。

## 播放頭

`snapshotAt(waves, lookup, atMs)` 純函式回傳「此刻已生成數、場上估算、累積 HP、累積金幣」。

- 場上敵人用「生成後 20 秒仍在場」估算，**不是**真實戰鬥模擬；
- 通關獎勵只計入「結束時刻已過」的波；
- 播放頭用 `setInterval(33ms)` 推進，不新增 rAF 迴圈（避免踩 `frameLoopGuard` 規則）。

真正跑一局要接 `playtest/simulator`（會註冊波次組、接管虛擬時鐘、吃掉數秒），
不適合放在拖曳即時回饋的路徑上，所以編輯器內用估算、需要真數據時走「試玩」頁。

## 沒做的部分（誠實列出）

- **沒有寫測試**：本次依指示只做實作與文件；`waveModel`/`waveAnalysis` 的純函式很適合補一組
  行為測試（重排後空隙保留、`enabled` 編譯歸零、`hpScale` 進曲線、`snapshotAt` 邊界）。
- **沒有同步 9 語言**：新文案只寫 zh-TW，其餘語言回退繁中。
- **沒有做跨波拖曳的「插入位置」視覺提示**：目前跨波搬移走右鍵選單（移到上一／下一波），
  拖曳只在同一波內換順序。
- **章節只有標籤**：不能摺疊整章（清單以章節分組顯示，但每一波仍各自渲染）。

## 檔案

| 檔案 | 職責 |
|---|---|
| `src/workshop/content/waveModel.ts` | 單軌模型與所有結構操作（純函式） |
| `src/workshop/content/waveAnalysis.ts` | 摘要、難度、經濟、播放頭快照 |
| `src/workshop/content/waveFormula.ts` | 基本公式 + 曲線擬合 |
| `src/workshop/content/timeline.ts` | 波次↔時間軸往返、曲線、驗證（既有，本次擴充波次層欄位） |
| `src/components/workshop/content/WaveListPanel.tsx` | 左欄清單 |
| `src/components/workshop/content/WaveTrack.tsx` | 中欄單軌時間軸 |
| `src/components/workshop/content/WaveInspector.tsx` | 右欄檢視器 |
| `src/components/workshop/content/WaveAnalysisPanel.tsx` | 右欄分析 |
| `src/components/workshop/content/WaveFormulaPanel.tsx` | 公式產生器 |
| `src/components/workshop/content/useWaveHistory.ts` | 撤銷重做 |
| `src/components/workshop/content/ContentPage.tsx` | 三欄工作台 |
