# AGENTS.md — 瓜瓜塔防（guagua-tower-defense）

> 給 AI coding agent 的工作手冊。**不是**架構文件——需要背景知識時讀 [`架構圖.html`](./架構圖.html)。
> 版本基準：v1.2.0 · Tauri 2 + React 18 + TypeScript + Vite + Zustand + Three.js
> 程式碼 952 檔 / 164,918 行。**先讀完第 1、2、4 節再動手。**
> **全程必須邊做邊說（§10）＋即時更新任務清單（§11）——只跑工具不出聲＝違規；多步任務一律用 `進度 k/N` 標示。**

---

## 0. 使用方式

0. **邊做邊說＋進度編號**：每個回合都要讓使用者知道「現在在做什麼、為什麼、結果如何」；任務超過 2 步時，開場先給步驟清單，之後每次回報都用 `進度 k/N`（規則見 §10.2、§10.3）。
1. **任務清單即時更新**：多步任務一律先建任務清單（本環境為 `todo_write`），狀態一變就立刻改，不要批次補登（規則見 §11）。
2. 先確認任務屬於哪一類（§5 recipe），照著步驟改，不要自由發揮檔案位置。
3. 動手前跑一次 `npm run check` 確認起點是綠的；不是綠的就先回報，不要順手修無關的紅燈。
4. 改完必跑 §7 的驗證；沒跑完不要說「完成」。
5. 只讀不確定的地方：`架構圖.html`（現況）> 程式碼 > `docs/`（多為歷史設計稿）。
6. **每次改檔就 commit**：一個語意單位一個 commit，寧可多不要少（規則見 §12）。不要自行 `git init`、不要 `git push --force`，也**不要**新增 npm 依賴（先問）。

---

## 1. 這個專案是什麼

一個把「塔防遊戲引擎 + 22 個 UI 場景 + 創作工具」全部實作在瀏覽器渲染層的 Tauri 桌面程式。

**三個不變式（違反它們的改動一律視為錯的）**

| 不變式 | 含意 | 常見誤解 |
|---|---|---|
| **前端就是引擎** | Rust 端只有 13 行、零遊戲邏輯、零自訂 IPC | 不要去找 Rust 的遊戲迴圈或 command，那裡沒有 |
| **狀態單一真相** | 世界狀態 = `useGameStore` 的欄位；畫面只是投影 | 不要在 component 用 `useState` 存敵人／塔／金錢 |
| **資料與程式分離** | `src/data/**` 是純資料與純函式，無 React、無 store、無副作用 | 不要把邏輯塞進 data，也不要把數值寫進 component |

---

## 2. 指令（唯一正確的執行方式）

| 目的 | 指令 | 備註 |
|---|---|---|
| 開發（瀏覽器） | `npm run dev` | 埠 1421，`?scene=game` 可直接跳場景（僅 DEV） |
| 開發（桌面） | `npm run tauri dev` | 會先跑 `predev` 產生百科檔案清單 |
| **提交前總檢查** | `npm run check` | = typecheck + i18n:check + test **（必跑）** |
| 型別 | `npm run typecheck` | `tsc --noEmit`，0 error 是底線 |
| 語言鍵對齊 | `npm run i18n:check` | 動到 i18n 必跑，CI 是 `--strict` |
| 測試 | `npm run test` | Vitest + jsdom，測試檔在 `src/test/**/*.test.ts` |
| 建置 | `npm run build` / `npm run build:check` | 後者先型別再建置 |
| 打包 | `npm run tauri build` | NSIS，輸出 `src-tauri/target/release/bundle` |

---

## 3. 檔案該放哪（放錯就是債）

| 目錄 | 放什麼 | 不放什麼 |
|---|---|---|
| `src/components/scenes/<X>/` | 場景元件與其專屬子元件 | 跨場景共用元件 |
| `src/components/ui/` | 共用 UI（SceneShell、Modal、SettingRow…） | 業務邏輯、store 呼叫密集的元件 |
| `src/components/hl/` | HARDLINE 設計語言（方角、無陰影、單一強調色） | 一般玻璃質感樣式 |
| `src/store/` | Zustand store、action slice、`gameLoop/` 每幀更新 | JSX、DOM 操作 |
| `src/data/` | 塔／敵人／地圖／波次／成就／皮膚資料、`combatStatus` 等純函式 | 任何 store import、React 元素（成就 icon 是歷史例外，別再增加） |
| `src/services/` | 有副作用的 I/O（音訊、更新、檔案） | store import（用注入或 `import type`） |
| `src/utils/` | 無狀態工具（spatialHash、frameLoopGuard、perfMonitor） | 業務規則 |
| `src/types/` | 只有型別 | 執行期程式碼 |
| `src/i18n/` | 語言檔、key→label 映射 | 手寫 `Translations` interface（型別由 `zh-TW` 推導） |
| `src/test/` | 行為測試、`fixtures.ts` | 產品程式碼 |
| `docs/research/` | AI 產出的研究報告、分析、決策紀錄（`YYYY-MM-DD-slug.md`） | 規範類文件（留在 `docs/` 根） |

單檔上限 **888 行**（既有 `Icons.tsx` 2,182 行等是待償債，不要學）。

---

## 4. 硬規則

### 4.1 依賴方向（單向，違反會造成循環或時序 bug）

```
components/scenes → components/{ui,hl,game} → store → data → types
                                    ↘ utils ↗        ↘ utils
services → types（只能 import type 或由入口注入）
```

- ❌ `data/` 不得 import `store/`、`components/`、`services/`
- ❌ `services/` 不得 import `store/`（要偏好就用 `setAudioPrefsProvider` 這類注入）
- ❌ `types/` 不得有執行期程式碼
- ✅ store 之間的反向依賴用 `await import('./achievementStore')` 延遲載入
- ❌ 不要再新增 `index.ts` barrel（專案內已有 8 個無人 import 的檔案，其中 6 個是 barrel）

### 4.2 狀態與資料結構

- ✅ 格子只記 `Tile.towerId`；讀寫一律走 `src/store/gridTower.ts`。**不要**在 `Tile` 上另存塔物件。
- ✅ 開局／重開共用 `createEmptyMatchState()`；新增局內欄位時**兩邊都會拿到**，不要在 `resetGame` 另抄一份清單。
- ✅ 場景切換只透過 `setScene` / `goBackScene`（維持 `sceneHistory` 與暫停恢復語意）。
- ❌ 不要改 `GameStore` 契約（`gameStoreTypes.ts`）以免任務外的破壞；若必須改，同步所有 slice + `matchState`。
- ❌ 不要新增平行狀態（React state、模組級可變變數）來存放世界資料；模組級變數只允許計時器／快取（如 `loopFlags`、`lastSkillCheckTime`）。

### 4.3 型別（不准再借）

- ❌ 不新增 `as any` / `: any`。目前 19 + 13 處都是待償債。
  - 若卡在 Mod 動態欄位（`flameEffect`、`windEffect`、`moneyGeneration`…）：**先補 `TowerData` 可選欄位**，不要在 UI 端硬轉。
- ❌ 不用 `@ts-ignore` / `@ts-expect-error`（目前 0，保持 0）。
- ❌ 不要靠 `eslint-disable` 當護欄——專案沒有 ESLint，那些註解目前完全無效。
- ✅ canvas 的格子型別是 `Tile[][]`，不要 `any[][]`。

### 4.4 i18n

- ✅ 新文案只改 `src/i18n/locales/zh-TW.ts`（型別由此推導）；其他語言缺鍵會回退繁中。
- ❌ 不准手寫 `interface Translations`（歷史上有 4,077 行手抄造成 77 鍵不存在、UI 渲染 `undefined`）。
- ❌ 使用者可見字串不准硬編碼中文（目前 445 條待清）；Dev 面板可延後但仍不算好習慣。
- ✅ 動完 i18n 必跑 `npm run i18n:check`（`--strict`：語言檔不得有 zh-TW 沒有的鍵）。

### 4.5 效能（改動前先讀 §6 地雷）

- ❌ 不要移除 `spatialHash` 或 `updateTowers` 的冷卻快路徑（4,500 敵人下 18.3ms → 0.98ms/幀）。
- ❌ 靜態層不得訂閱 `towers` / `money`；只能訂閱 `towerLayoutKey` 與 `canAffordSelected`。
- ❌ 擊殺不得逐筆觸發成就／統計，必須 `batchOnEnemyKilled` / `trackEnemyKilledBatch`。
- ❌ 不要在每幀路徑新增物件配置（閉包、陣列、物件字面量）而不量測。
- ✅ 新增任何 `requestAnimationFrame` 迴圈 → 必須包 `createFrameLoopGuard({ label })`。

### 4.6 測試與檔案衛生

- ✅ 測試是行為斷言（真的呼叫 action、真的跑一幀），不是讀原始碼比對字串。
- ✅ fixture 用 `src/test/fixtures.ts`（`makeEnemy` / `makeTower` / `makeSkill`），不要 `as Enemy` 硬轉。
- ❌ 不新增死 export／死檔案：加完 export 若沒人用，就別加（目前 136 個零引用 export）。
- ❌ 不動 `dist/`、`.shots/`、`src/components/scenes/encyclopedia/srcFileManifest.json`（生成物，build 會覆寫）。

### 4.7 編輯方式：一律用編輯工具，不准用腳本改檔

**規則：改任何既有檔案（文件、程式、設定）只能用 `edit`（局部替換）或 `write`（整檔新建／覆寫）。**
**禁止**用 PowerShell / Node / Python / sed / awk 等腳本去改寫檔案內容，包括批次取代、字串注入、整段拼接（例如把 CSS 區塊換掉）。

為什麼是硬規則：

| 原因 | 說明 |
|---|---|
| 無法逐段審查 | 腳本一次改幾百行，diff 之前沒人看得到改了什麼；出錯只能整包回滾。 |
| 破壞編碼與換行 | 腳本常默默改掉 BOM、CRLF/LF、縮排，事後才發現整檔 diff。 |
| 違反 §10 | 使用者看不到「改了哪一行」，等於悶著做。 |
| 半成品風險 | 腳本中途失敗會留下改一半的檔案，比不改更危險。 |

**唯一允許用腳本的三種情況**

1. **產生衍生物**（不是編輯既有檔）：跑 `npm run build`、跑 `scripts/` 內既有產生器、跑格式化工具、跑測試。
2. **唯讀分析**：grep、行數統計、死碼掃描、覆蓋率計算——只要不寫檔。暫存腳本請放 `%TEMP%`，不要留在 repo。
3. **超過 20 檔的機械性改名**：必須先提出計畫並取得同意，優先走專案既有 codemod 流程（`scripts/legacy/i18n-codemods/`），而不是臨時寫一支新腳本。

**正確做法**

- 大範圍改動 → 拆成多次 `edit`，每次一個語意單位，改完立刻驗證。
- 需要整檔重寫 → 用 `write`（工具本身會顯示完整內容，可審查）。
- 想寫 `node -e`、`Out-File`、`Set-Content`、`sed -i` 去改檔 → **停手**，改用 `edit`。

### 4.8 產出檔案的位置（不准亂放）

**規則：AI 產生的任何檔案，只能落在下表的位置；專案根目錄不得新增檔案。**

| 產出類型 | 位置 | 命名 | 進版控 |
|---|---|---|---|
| 研究報告／改善計畫／分析 | `docs/research/` | `YYYY-MM-DD-<english-slug>.md` | ✅ |
| 決策／重構紀錄 | `docs/research/` | 同上 | ✅ |
| 截圖／預覽圖 | `.shots/` | `<主題>-<狀態>.png` | ❌（已 gitignore） |
| 臨時腳本／除錯 dump／一次性輸出 | 系統 `%TEMP%` | 自由 | ❌ 絕不進 repo |
| 測試程式碼 | `src/test/` | `<功能>.test.ts` | ✅ |
| 正式程式碼 | 依 §3 目錄職責 | 依 §3 | ✅ |

**硬性禁止**

- ❌ 在專案根目錄新增 `.md` / `.txt` / `.json` / `.png`（例：`研究.md`、`output.json`、`temp.png`）。
- ❌ 把報告或產出物放進 `src/`、`public/`、`scripts/`、`src-tauri/`。
- ❌ 在 repo 內留 `test.js`、`probe.ts`、`tmp.md`、`*.dump` 這類一次性檔案——跑完就刪，或一開始就寫在 `%TEMP%`。
- ❌ 建立本表與 §3 沒有定義的新目錄。

**例外（唯一需要問的情況）**：真的需要新目錄或新型態檔案 → 先用提問工具問一次「要放哪」，拿到答案才建；其餘情況照上表放，**不用問**。

**歷史檔案不搬**：`docs/` 根目錄現有的規範類文件（`SCENE_UI.md`、`2026-11-10-shishan-remediation.md` 等）維持原位，新產出一律進 `docs/research/`。

---

## 5. 任務 recipe

### 5.1 新增塔
1. `types/game.ts` → `TowerType` 加字串
2. `data/gameData/towerData.ts` → `TowerData` 數值（含新效果旗標，型別先補齊）
3. `data/upgradeBranches.ts` → 5 級 + A/B 分支
4. `data/towerCombatIdentity.ts`、`data/towerTargeting.ts` → 定位與預設優先級
5. 外觀：`components/game/towerModels/*` + `components/scenes/game-scene/three/towerModels3d.ts`
6. `data/skins/*` → 至少預設皮膚；`data/towerSynergyData.ts` → 協同（可選）
7. `i18n/locales/zh-TW.ts` → 名稱／描述
8. 測試：`src/test/towerData.test.ts` 或新增同類行為測試

### 5.2 新增敵人
1. `types/game.ts` → `EnemyType`；2. `data/gameData/enemyData.ts` 數值＋能力旗標
3. 造型：`utils/enemyRenderer.ts`（2D）、`three/walker3d.ts`（3D）
4. 排入 `data/gameData/waveData.ts` 或 `data/officialWaveSets.ts`
5. 新能力邏輯：`store/gameLoop/updateEnemies.ts` 或 `data/combatStatus.ts`（純函式優先）

### 5.3 新增場景
1. `types/game.ts` → `GameScene`；2. `components/scenes/YourScene.tsx`（default export）
3. `App.tsx` → `SCENE_COMPONENTS` 加 `lazy(() => import(...))`
4. 入口：`data/mainMenuHome.ts`（若要在主選單點到）；BGM：`services/musicService.ts`
5. i18n 文案；`devStore` 的 `SceneName` **不要**再手抄（應改 `GameScene` 別名）

### 5.4 新增語言／文案
1. 新增 `i18n/locales/xx.ts`（`DeepPartial<Translations>`）
2. `i18n/index.ts` → `Language`、`LANGUAGE_NAMES`、`LOCALE_LOADERS`
3. `npm run i18n:check`

### 5.5 新增成就
1. `data/achievements/<分類>.ts` 加 `Achievement`（條件用既有 `type`）
2. 新條件型別 → `store/achievementStoreCheck.ts` 的 `checkCondition`
3. 排序鍵：`data/achievementSort.ts`（`order → category → id`）
4. 文案：`i18n` + `data/achievementConditionLabels.ts`（長期應收斂到 locales）

### 5.6 調平衡數值
塔 `towerData.ts` / `upgradeBranches.ts`；敵人 `enemyData.ts`；狀態倍率 `combatStatus.ts`；難度與經濟 `waveData.ts`（`DIFFICULTY_MODIFIERS` / `GAME_CONSTANTS`）。
**改完必跑** `npm run test`——`damagePipeline`、`statusEffects`、`towerCombatIdentity` 會抓到被破壞的關係。

### 5.7 改 UI
1. 先確認屬於五種佈局之一（Home / Page / Split / Battle / Overlay），用 `components/ui` 的 SceneShell 系列
2. 樣式 token 用 `SCENE_TYPOGRAPHY` / `--hl-*`；不要自創顏色常數
3. 改完看 `src/test/designTokens.test.ts` 是否紅（它是 class 契約）

---

## 6. 地雷區（踩到會「看起來對、實際炸」）

| 地雷 | 後果 | 正確做法 |
|---|---|---|
| 遊戲邏輯寫在 component 的 `useEffect` | 與主迴圈搶時間、每次 re-render 重跑 | 只放 `useGameSceneEffects`（唯一 rAF 邏輯迴圈） |
| 新增裸 rAF | 繪製層一拋錯整層停住且無上報 | 包 `frameLoopGuard`（`GameCanvas`/`GameScene3D`/`ReplayCanvas` 目前仍是裸的——別再增加） |
| 在 `Tile` 存塔物件 | 幽靈塔（畫面有、點不到） | 只記 `towerId` + `gridTower` |
| 靜態層訂閱 `towers` | 每秒重繪 60 次，整張畫面畫兩遍 | 訂閱 `towerLayoutKey` |
| 成就逐筆檢查 | 一次大量死亡時卡幀 | `batchOnEnemyKilled` |
| 在 `data/` 放 React 元素 | 主 chunk 肥、node 測試不能跑 | icon 用字串 key |
| 手改 `srcFileManifest.json` | 下次 build 被覆寫 | 改 `scripts/generate-src-file-manifest.mjs` |
| 改 `PATHS` 結構但沒跑 `initializeGrid` | 格子與地圖不一致 | 走 `startGame` 流程 |
| 依賴「檔名同目錄」解析 | `data/gameData.ts` 蓋過 `data/gameData/index.ts` | 明確指定要改的那一個（index 版是死的） |
| 相信 `docs/superpowers/*` | 多為歷史設計稿，與現況有落差 | 以程式碼與 `架構圖.html` 為準 |

---

## 7. 完成定義（DoD）

改動被視為完成，必須**全部**成立：

1. `npm run check` 全綠（typecheck 0 error、i18n 通過、測試全過）。
2. 沒有新增 `as any` / `: any` / `@ts-ignore` / 硬編碼中文 / 死 export。
3. 動到戰鬥或渲染 → 手動驗證：
   - `npm run dev` 開 `?scene=game`，建塔、跑 2 波、確認無 console 錯誤。
   - 動到效能相關 → Dev 面板壓測 5,000 敵人 + 100 塔，看 `StressTestHud` 的 p95 與 `updateTowers` 階段耗時沒有退化。
4. 動到打包相關 → `npm run build` 後看 `dist/assets/index-*.js` 沒有明顯變大（目前 1.33 MB）。
5. 回報時附：改了哪些檔、為什麼、跑了什麼指令、結果如何；**不要**只說「已修好」，也不要只在最後才一次補述（過程就要說）。多步任務全程都要標 `進度 k/N`，見 §10.3。
6. 任務清單**全部 `completed`**（或明確標出哪幾項沒做與原因）；不得留著 `pending` / `in_progress` 就宣布完成，見 §11.5。

---

## 8. 技術債：可以修，不准新增

完整 42 項清單見 `架構圖.html` §22（含證據與 4 階段順序）。**每項都有固定編號 `TD-01`～`TD-42`**——
commit message、PR、回報、issue 一律引用 TD 編號（例：`fix(types): 移除 TD-13 的 7 處多餘 as any`），不要用「那個 as any 的債」這種說法。

| 不准 | 現況基準 | 替代做法 |
|---|---|---|
| `as any` / `: any` | 19 / 13 | 補型別（尤其 `TowerData` 的 Mod 欄位） |
| 硬編碼中文（可見字串） | 445 條 | `t(` + `locales/zh-TW.ts` |
| 零引用 export / 死檔 | 136 / 8 | 不確定就先不加；加了就要有引用 |
| 新 barrel `index.ts` | 已有 8 個無人 import 的檔案（6 個是 barrel） | 直接 import 目標檔 |
| `console.log` | 專案用 `console.error` 於錯誤路徑 | 沿用錯誤路徑的 `console.error`，不要加 log |
| > 888 行的新檔 | 7 個既有上帝檔 | 先拆模組 |
| 新 `eslint-disable` | 17 個（無 ESLint） | 修正依賴或用 ref 模式 |

**可以先不動**（成本 > 收益）：`gameStoreTypes.ts` 299 行介面、`perfTime` 微優化、10 個語言檔重構、`WaveEditor` 合併。

---

## 9. 文件索引

| 文件 | 用途 |
|---|---|
| `架構圖.html` | **現況權威**：八層架構、主迴圈、測試（§19）、42 項技術債（§22）（唯一架構文件，無 Markdown 版） |
| `docs/SCENE_UI.md` | 場景共用 UI 與五種佈局規範（路徑敘述已過時，以此處程式碼為準） |
| `docs/2026-11-10-shishan-remediation.md` | 過去重構的決策紀錄（為什麼 grid 只記 id、為什麼 i18n 型別要推導） |
| `docs/research/` | AI 產出的研究／分析報告（`YYYY-MM-DD-slug.md`，見 §4.8） |
| `CHANGELOG.md` | 版本演進紀錄 |
| `UPDATING.md` | 更新與打包流程 |
| `src-tauri/tauri.conf.json` | 視窗、打包、updater 公鑰（改這裡要同步簽章流程） |

---

## 10. 邊做邊說（強制）與協作

### 10.1 為什麼要講話

使用者只看得到你「說出來」的內容：工具呼叫、diff、console 輸出他都看不到全貌。
沒說的進度＝沒發生；做完才一次補述＝使用者整段時間都在等一個黑盒子。

**判定標準：任何連續 3 個工具呼叫之間沒有任何一句說明，就算違規。**

### 10.2 每回合的三段式

| 階段 | 時機 | 至少要說 |
|---|---|---|
| **開場** | 動手前 | 現在要做什麼、為什麼這樣做、預計會動哪些檔案 |
| **進行中** | 每完成一步，或每 2–3 個工具呼叫 | ✅ 剛做完什麼／結果如何；⚠️ 遇到什麼／改成怎樣；📄 正在讀哪個檔、要找什麼 |
| **收尾** | 做完時 | 改了什麼、驗證結果、**沒做什麼**、下一步建議 |

範例（開場）：

> 要把 `TowerData` 補上 Mod 欄位。先看 `types/game.ts` 的介面與 `towerData.ts` 的實際欄位，確認哪些屬於 Mod 專屬；預計改 2 個檔 + `FloatingTowerPanel` 的 3 處 `as any`。

範例（進行中）：

> ✅ 找到根因：`flameEffect`／`windEffect` 只在 Mod 塔出現，`TowerData` 沒宣告，所以 UI 只能 `as any` 探測。接著把欄位補成可選屬性。

範例（卡住）：

> ⚠️ `npm run check` 在 `i18n:check` 紅了：`towers.newTower.name` 只在 zh-TW 有。原因是 `--strict` 不允許語言檔多出鍵；我把新鍵同步到 `en.json` 後重跑。

### 10.3 進度編號（`k/N`，多步任務必用）

使用者要的是「還有多久」，不是「我正在努力」。所以**每個多步任務都要有分母**。

**規則**

1. **開場先編號**：任務可切成 3 步以上時，先列清單——「共 5 步：1) … 2) … 3) … 4) … 5) …」。
2. **每一步的開始與完成都要標**：
   - 開始：`▶ 進度 2/5：正在改 TowerData`
   - 完成：`✅ 進度 2/5 完成：型別補齊，tsc 0 error`
3. **全部做完**：`✅ 進度 5/5 完成`，後面接收尾（改了什麼、驗證結果、沒做什麼、下一步）。
4. **步數變更要說**：發現還要多一步 → 「原本 5 步，實際要多一步，改為 **6 步**」，之後用新的分母。
5. **單一步驟超過 3 個工具呼叫** → 說「2/5 進行中：還在找 X 的呼叫端（已查 3 個檔）」，不要讓分母停住不動。
6. **失敗不重編號**：某步失敗就標「⚠️ 3/5 失敗：原因…，改用 Y 重試」，重試仍算同一步，除非真的多出獨立工作才加步。
7. **與任務清單同步**：任務清單有 5 項，口頭進度就用 `k/5`；增刪步驟時兩邊同一個訊息改掉，**不要**出現「清單說 6 步、嘴巴說 5 步」。

**範例（完整一輪）**

```
共 4 步：1) 找根因 2) 改型別 3) 跑 check 4) 回報
▶ 進度 1/4：比對 19 處 as any 的根因
✅ 進度 1/4 完成：7 處是多餘斷言，可直接刪；2 處缺 union 成員
▶ 進度 2/4：開始改型別（types/game.ts + updateTowers.ts）
✅ 進度 2/4 完成：as any 19 → 0
▶ 進度 3/4：跑 npm run check（約 100 秒）
✅ 進度 3/4 完成：698 tests passed、exit 0
✅ 進度 4/4 完成：回報如下
```

**禁止**

- ❌ 有分母卻不報（做完 3 步才說「做到第 3 步」）。
- ❌ 用「處理中」「快好了」「差不多」代替 `k/N`。
- ❌ 把 10 步塞成一個 `進度 1/1`（分母必須反映真實顆粒度，一步 ≈ 一個可驗證的結果）。

### 10.4 頻率與顆粒度

- 一個檔案讀完 → 一句「看到什麼」；不要一次連讀 6 個檔都不出聲。
- 每次改檔 → 一句「改了哪個檔的什麼」；批次改多檔可合併成一句話列出。
- 跑指令前後 → 一句「要跑 X」＋「結果 Y」；紅燈要說原因與下一步。
- 長任務（> 5 步）→ 每 2–3 步給一次「進度 3/7：已完成 A、B，接著 C」。
- 不確定／有歧義 → 直接說出「我理解成 X，若你要的是 Y 請說」，不要靜默猜。

### 10.5 禁止

- ❌ 連續跑工具、中間零說明（俗稱「悶著做」）。
- ❌ 多步任務不給分母，或做完才補報步數。
- ❌ 只說「處理中」「稍等」這類沒有資訊量的話。
- ❌ 事後才一次補完整過程（過程就要即時說）。
- ❌ 用「已完成」一行收尾，卻沒說改了什麼、驗證了什麼。
- ❌ 隱藏失敗：指令紅了要講，不要默默換方法。

### 10.6 例外

- 純問答（例：「這個檔有幾行？」）可一句話答完，不需三段式。
- 使用者的指令明確要求安靜輸出（例如「只回程式碼」）時，以該指令優先。

### 10.7 協作規則

- 一次只做一件任務；不要「順手」重構相鄰檔案。
- 用最小差異編輯（`edit`），不要整檔重寫；**嚴禁用腳本改檔**（見 §4.7）。
- 不確定需求時**問一個具體問題**，不要用猜的做大範圍改動。
- 不要自行建立 commit／push／安裝依賴／改 CI 設定。
- 發現新技術債：記錄並回報，不要默默擴大戰線。

---

## 11. 任務清單（todo）使用規範

本環境的任務工具是 `todo_write`；其他環境用對應的 task／TODO 工具，規則相同。
**核心原則：清單是給使用者看的即時儀表板，不是給自己看的備忘錄——建了就要一直更新。**

### 11.1 什麼時候一定要建

| 情況 | 是否建清單 |
|---|---|
| 任務 ≥ 3 步 | ✅ 必建 |
| 預估 > 5 次工具呼叫（跨檔搜尋、重構、跑測試） | ✅ 必建 |
| 使用者說「列出步驟」「追蹤進度」 | ✅ 必建 |
| 單步查詢、一行修正、單純回答問題 | ❌ 不用 |

### 11.2 建立規則

- **開場就建**：全部 `pending`，然後立刻把第一個設成 `in_progress`。
- **項目要可驗證**：✅「移除 TowerShootPreview 的 5 處 as any」；❌「修型別」「處理一下」。
- **項目數＝§10.3 的分母 N**：清單 5 項，口頭就是 `k/5`。
- **一步 ≈ 一個可獨立驗證的結果**（跑一次 `tsc`、一次 `npm run test`、一次檔案改動）。
- 不要把同一件事拆成 5 項充數（例如「讀檔」「再讀檔」「存檔」）。

### 11.3 更新時機（最容易犯的錯）

| 事件 | 必須在**同一則訊息**內做到 |
|---|---|
| 開始做某項 | 該項 → `in_progress`（不是做完才補） |
| 做完某項 | 立刻 → `completed`，並開始下一項 `in_progress` |
| 發現新工作 | 新增 `pending` 項，並說明分母變更（例：5 → 6） |
| 某項不需要了 | 刪除或標 `completed`，並說明原因 |
| 卡住 | 保持 `in_progress`，文字寫「⚠️ 進行中：卡在 X」，**不要**假裝完成 |

- 同一時間**最多一個** `in_progress`；真的並行（多個工具同時跑）才可以多個，並在文字說明是哪幾項並行。

### 11.4 與口頭進度的對應

| 清單狀態 | 文字要長這樣 |
|---|---|
| 第 3 項開始 | `▶ 進度 3/5：正在…`（同時把第 3 項設 `in_progress`） |
| 第 3 項完成、第 4 項開始 | `✅ 進度 3/5 完成：…` ＋ `▶ 進度 4/5：…`（同時更新兩項） |
| 全部完成 | `✅ 進度 5/5 完成`（清單全 `completed`） |

### 11.5 收尾檢查（DoD 的一部分）

1. 最後一次 `todo_write` 必須**全部 `completed`**。
2. 有沒做的項 → 明白寫「沒做：X（原因）」，不要靜靜留著 `pending`。
3. 下一輪新任務 → **重建新清單**，不要沿用上一輪的殘留項。
4. 清單與文字回報不得矛盾（清單說 3/5、文字說完成 = 違規）。

### 11.6 禁止

- ❌ **建了不更新**（最常見：清單 5 項，全程停在第 1 項）。
- ❌ 最後才一次把全部標 `completed`（等於沒追蹤）。
- ❌ 只更新工具、不寫文字（使用者看不到你的清單）。
- ❌ 用清單取代說話——兩者都要有。
- ❌ 項目寫成模糊動詞（「優化」「調整」），導致無法判斷是否完成。

---

## 12. 提交節奏（每次改檔就 commit）

使用者要求：**每次改檔都要立即提交，最好拆成多個 commit**——因為回退比什麼都重要。

### 12.1 鐵則

- **改完一個語意單位 → 立刻 `git commit`**，不要累積到最後。
- 一次任務產生 **3–6 個 commit** 是正常的；寧可多，不可少。
- 每個 commit 都必須能單獨 `git revert` 而不連帶破壞別的改動。

### 12.2 怎麼判斷「一個語意單位」

| 情況 | 動作 |
|---|---|
| 同時動到「文件」與「程式」 | ✂️ 拆兩個 commit |
| 兩個不相關的功能 | ✂️ 拆 |
| 實作 + 它的測試 | ✅ 同一個 commit（測試是行為的一部分） |
| 修 bug + 順手排版 | ✂️ 拆（排版另開一個 `style:` commit） |
| 同一功能的 2–3 個檔案 | ✅ 同一個 commit |
| 一次動到 6 個以上檔案 | 🤔 先想能不能拆成多個 commit |

### 12.3 訊息格式（Conventional Commits，描述用繁中）

```
<type>(<scope>): <一句話，40 字內>

- 為什麼要改（問題或背景）
- 改了什麼（重點，不是逐行翻譯 diff）
- 驗證方式（跑了什麼指令、結果如何）
```

- **type**：`feat` / `fix` / `refactor` / `perf` / `docs` / `test` / `chore` / `ci` / `style`
- **scope**：`agents` / `doc-ui` / `store` / `data` / `ui` / `i18n` / `ci` / `research` / `debt`…
- 技術債一律引用編號（`fix(types): 移除 TD-13 的 7 處多餘 as any`）

### 12.4 push 時機

- 每個使用者請求**結束時**至少 push 一次（遠端是備份）。
- 一個請求內的多個 commit：全部完成後再一起 `git push`。
- 預設直接推 `main`；只有大型實驗才開 `feat/xxx` 分支。

### 12.5 禁止

- ❌ 把不相關的改動塞進同一個 commit（「順便修一下」）。
- ❌ `git add -A` 之後不看 `git status` 就 commit。
- ❌ `git push --force`（遠端是備份不是沙包；真的需要先問）。
- ❌ 對**已 push** 的 commit `--amend`（改用新 commit 修正）。
- ❌ 訊息只寫 `update` / `fix bug` / `wip` 這類沒有資訊的字。

### 12.6 收尾檢查

1. `git status` 乾淨——沒有忘了加入的檔案。
2. `git log --oneline -6` 讀起來像一串可理解的歷史，而不是一個大雜燴。
3. 該 push 的已經 push。
