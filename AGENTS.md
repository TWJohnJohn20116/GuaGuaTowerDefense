# AGENTS.md — 瓜瓜塔防（guagua-tower-defense）

> 給 AI coding agent 的工作手冊。**不是**架構文件——需要背景知識時讀 [`架構圖.html`](./架構圖.html)。
> 版本基準：v1.2.0 · Tauri 2 + React 18 + TypeScript + Vite + Zustand + Three.js
> 程式碼 952 檔 / 164,918 行。**先讀完第 1、2、4 節再動手。**
> **全程必須邊做邊說（§10）＋即時更新任務清單（§11）——只跑工具不出聲＝違規；多步任務一律用 `進度 k/N` 標示。**
> **本機不得編譯／建置／執行測試，唯一驗證途徑是 GitHub Actions（§13.9）。**

---

## 0. 使用方式

0. **邊做邊說＋進度編號**：每個回合都要讓使用者知道「現在在做什麼、為什麼、結果如何」；任務超過 2 步時，開場先給步驟清單，之後每次回報都用 `進度 k/N`（規則見 §10.2、§10.3）。
1. **任務清單即時更新**：多步任務一律先建任務清單（本環境為 `todo_write`），狀態一變就立刻改，不要批次補登（規則見 §11）。
2. 先確認任務屬於哪一類（§5 recipe），照著步驟改，不要自由發揮檔案位置。
3. 動手前先確認起點狀態：`gh run list --workflow ci.yml --limit 3` 看 `main` 最近一次是不是 success。**不要**在本機跑 `npm run check`（§13.9 禁止）。
4. 改完 push，讓 CI 驗（§7 的完成定義以 CI 結果為準）；**本機不編譯、不建置、不跑測試**（§13.9）。
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

## 2. 指令（誰可以執行）

**本機不得編譯／建置／執行測試（§13.9）**——下表「位置」欄標 ❌ 的，只能在 GitHub Actions 跑；代理端連 `npm run dev` 都不跑。

| 目的 | 指令 | 位置 | 備註 |
|---|---|---|---|
| 開發（瀏覽器） | `npm run dev` | ❌ 使用者自己跑 | 埠 1421，`?scene=game` 可跳場景（僅 DEV） |
| 開發（桌面） | `npm run tauri dev` | ❌ 使用者自己跑 | 會先跑 `predev` 產生百科檔案清單 |
| 型別 | `npm run typecheck` | ❌ CI | `tsc --noEmit`，0 error 是底線 |
| 測試 | `npm run test` | ❌ CI | Vitest + jsdom，測試檔在 `src/test/**/*.test.ts` |
| 建置 | `npm run build` / `build:check` | ❌ CI | 後者先型別再建置 |
| 打包 | `npm run tauri build` | ❌ CI（release.yml） | NSIS，輸出 `src-tauri/target/release/bundle` |
| 總檢查 | `npm run check` / `check:full` | ❌ CI | 組合指令，本機禁止 |
| 技術債棘輪 | `node scripts/ci/guards.mjs --debt` | ✅ 本機可（純讀檔） | 只讀原始碼計數，不編譯 |
| 語言鍵對齊 | `npm run i18n:check` | ✅ 本機可（AST 解析） | 內部用 `ts.createSourceFile`，不編譯不執行 |
| bundle 預算 | `node scripts/ci/guards.mjs --bundle` | ❌ CI | 需要 `dist/`，本機沒有 |
| 看 CI 結果 | `gh run list` / `gh run watch` / `gh run view --log-failed` | ✅ 本機可 | 這就是本機的「編譯輸出」 |

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

單檔上限 **888 行**（既有 `gameStoreAutoBattle.ts` 1,016 行等是待償債，不要學）。
新 icon 一律放進 `src/components/ui/icons/` 的對應分區檔（`ui-basic`／`gameplay`／`overlays`／`theme-svg`／`achievements`／`achievements-extra`／`theme-icon`），不要把 `Icons.tsx` 這支 12 行門面撐胖（TD-20）。

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
- ❌ 不要再新增 `index.ts` barrel（專案內已有 7 個無人 import 的檔案，其中 5 個是 barrel）

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

1. **產生衍生物**（不是編輯既有檔）：跑 `scripts/` 內既有產生器、跑格式化工具。**注意 §13.9：編譯、建置、測試已全面禁止**，`npm run build` 與 `npm run test` 不在允許之列。
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

### 4.9 樣式：Tailwind v4（別用 v3 的寫法）

工具鏈：`tailwindcss@4` ＋ `@tailwindcss/postcss`，設定只有 **`postcss.config.js`** 這一份。CSS 進入點是 `src/styles/index.css`，順序固定：

```
@import './hardline.css';      /* 先 hardline，維持既有的 base 層覆蓋方向 */
@import "tailwindcss";
@config "../../tailwind.config.js";   /* 必須在 @import 之後 */
```

| 規則 | 說明 |
|---|---|
| **postcss 設定只能一份** | `postcss.config.js` 與 `postcss.config.mjs` 曾同時存在，PostCSS 只讀 `.js`（搜尋順序 `.js` 在 `.mjs` 前），`.mjs` 那份等於死的。不要再新增第二份。 |
| **`@config` 必須在 import 之後** | 放前面時 theme 預設值還沒註冊，`@apply font-semibold` 這種吃 theme 的工具類會直接爆 `Cannot apply unknown utility class`。 |
| **`@apply` 只能套工具類或 `@utility`** | 不能 `@apply` 自己寫的 `.btn-game`。要共用基底就掛同一組選擇器（現行 `.btn-game, .btn-primary, …`），或把該類別改寫成 `@utility`。 |
| **v4 改名，舊名不再產生 CSS** | `flex-shrink-*`→`shrink-*`、`shadow`→`shadow-sm`、`shadow-sm`→`shadow-xs`、`rounded`→`rounded-sm`、`rounded-sm`→`rounded-xs`、`outline-none`→`outline-hidden`、`ring`→`ring-3`、`bg-gradient-to-*`→`bg-linear-to-*`。**新程式碼一律寫新名**。 |
| **`flex-shrink-0` 有相容層** | 專案仍有 88 處舊名，靠 `index.css` 的 `.flex-shrink-*` 規則撐著；那塊是待清償的相容層，不要再往裡面加東西。 |
| **預設 `border-color` 變了** | v4 預設是 `currentColor`，已在相容層還原成 v3 的 `#e5e7eb`。新元件請顯式指定顏色（`border-[var(--hl-line)]`），不要依賴預設值。 |
| **瀏覽器基線提高** | v4 產物用到 `@property` 與 `color-mix()`，需要 Safari 16.4+／Chrome 111+。`vite.config.ts` 的 `build.target` 仍是 `safari13`（瀏覽器版），舊瀏覽器會掉樣式——要相容就得先降級這些特性。 |

**還沒做**：`tailwind.config.js` 的 token 仍走 `@config` 相容路徑，尚未搬進 CSS 的 `@theme`。搬遷時要一起處理：`hl-*`／`nordic-*` 色票、把 `borderRadius` 與 `boxShadow` 全部歸零的宣告、`mask-edges-x` 等自訂 utility。

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
5. i18n 文案（含 Dev 面板的 `scene*` 標籤）；場景清單只有 `GameScene` 一個真相——`devStore.ts` 的 `SceneName` 是它的別名、Dev 面板選單由 `Record<GameScene, string>` 產生，**都不要手抄**（TD-09 已還）

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
**改完 push，讓 CI 跑測試**（§13.9 禁止本機執行）——`damagePipeline`、`statusEffects`、`towerCombatIdentity` 會抓到被破壞的關係。紅燈就 `gh run view <id> --log-failed` 讀那一步。

### 5.7 改 UI
1. 先確認屬於五種佈局之一（Home / Page / Split / Battle / Overlay），用 `components/ui` 的 SceneShell 系列
2. 樣式 token 用 `SCENE_TYPOGRAPHY` / `--hl-*`；不要自創顏色常數
3. push 後看 CI 的 `designTokens.test.ts` 有沒有紅（它是 class 契約；§13.9 禁止本機跑測試）

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
| 依賴「檔名同目錄」解析 | 同名檔案與目錄並存時，`x.ts` 一定蓋過 `x/index.ts`（TD-10 已經清掉唯一實例，但別再造一個） | 不要在目錄旁再放同名檔案；非放不可就明確寫出要哪一個 |
| 相信 `docs/superpowers/*` | 多為歷史設計稿，與現況有落差 | 以程式碼與 `架構圖.html` 為準 |

---

## 7. 完成定義（DoD）

改動被視為完成，必須**全部**成立：

1. **CI 綠**：`gh run watch <id> --exit-status` 得到 success，且 job 不是 `skipped`（§13.2）。typecheck 0 error、i18n 通過、710 個測試全過都由 CI 判定——**本機不得自己跑**（§13.9）。
2. 沒有新增 `as any` / `: any` / `@ts-ignore` / 硬編碼中文 / 死 export（可用 `node scripts/ci/guards.mjs --debt` 唯讀自查，那是純讀檔）。
3. 動到戰鬥或渲染 → 需要視覺驗證時**請使用者自己跑 `npm run dev`**（代理端不跑，§13.9）；效能相關改動要靠 Dev 面板的 p95 數據，請使用者提供。
4. 動到打包相關 → 由 CI 的 `打包體積預算` 步驟判定（主 chunk 上限 1.18 MB），本機不跑 build。
5. 回報時附：改了哪些檔、為什麼、跑了什麼指令、結果如何；**不要**只說「已修好」，也不要只在最後才一次補述（過程就要說）。多步任務全程都要標 `進度 k/N`，見 §10.3。
6. 任務清單**全部 `completed`**（或明確標出哪幾項沒做與原因）；不得留著 `pending` / `in_progress` 就宣布完成，見 §11.5。
7. **CI 綠才算完成**：push 後必須拿到 CI 結論（`gh run watch` 或下次 `gh run list`）。**低風險改動可以不阻塞等待**（見 §13.7），但宣告完成前不能是未知狀態，紅燈要回頭修。

---

## 8. 技術債：可以修，不准新增

完整 42 項清單見 `架構圖.html` §22（含證據與 4 階段順序）。**每項都有固定編號 `TD-01`～`TD-42`**——
commit message、PR、回報、issue 一律引用 TD 編號（例：`fix(types): 移除 TD-13 的 7 處多餘 as any`），不要用「那個 as any 的債」這種說法。

| 不准 | 現況基準 | 替代做法 |
|---|---|---|
| `as any` / `: any` | 19 / 13 | 補型別（尤其 `TowerData` 的 Mod 欄位） |
| 硬編碼中文（可見字串） | 445 條 | `t(` + `locales/zh-TW.ts` |
| 零引用 export / 死檔 | 136 / 7 | 不確定就先不加；加了就要有引用 |
| 新 barrel `index.ts` | 已有 7 個無人 import 的檔案（5 個是 barrel） | 直接 import 目標檔 |
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
共 4 步：1) 找根因 2) 改型別 3) push 等 CI 4) 回報
▶ 進度 1/4：比對 19 處 as any 的根因
✅ 進度 1/4 完成：7 處是多餘斷言，可直接刪；2 處缺 union 成員
▶ 進度 2/4：開始改型別（types/game.ts + updateTowers.ts）
✅ 進度 2/4 完成：as any 19 → 0
▶ 進度 3/4：push 後等 CI（run 43552101919）
✅ 進度 3/4 完成：CI 綠，710 個測試全過、型別 0 error
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
- commit／push 依 §12 的節奏（改完就 commit、請求結束就 push）；CI／workflow 的改動依 §13。
- 不要自行新增 npm 依賴（先問）。
- 發現新技術債：記錄並回報，不要默默擴大戰線。

### 10.8 回報的品質

- **講結論，不要複述原始輸出**：工具吐 300 行 log，你要說「紅在 `npm ci`：lock 缺 esbuild 0.28.2」，不是把 log 貼出來。
- **未經 CI 驗證就要明說**：還在 commit 沒 push → 寫「尚未推送」；推了還沒跑完 → 寫「CI 進行中（run <id>）」；**不要**把本機綠講成「已通過」。
- **委派出去的任務也要出聲**：交給 subagent 的指令必須要求它回報進度與結論，不能讓它安靜跑完才一次吐結果；回報時要說明哪部分是子代理做的。

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
- **一步 ≈ 一個可獨立驗證的結果**（一次檔案改動、一次 push、一次 CI 綠）。
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
- 驗證方式（push 後的 CI run／結論；**不要**寫「本機跑過 check」——§13.9 禁止）
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

---

## 13. CI 與 GitHub 規則

> 這一節的規則來自實際踩坑（含另一個專案的 CI 事故紀錄）。**違反它們的症狀都很安靜**：CI 看起來綠、其實什麼都沒驗證。

### 13.1 觸發條件與執行環境

| 項目 | 規則 | 為什麼 |
|---|---|---|
| `push` | 可加 `paths-ignore`（`**/*.md`、`docs/**`、`.shots/**`） | 純文件／截圖變更不燒 CI 分鐘 |
| `pull_request` | **不可**加 `paths` / `paths-ignore` | 某個 PR 因路徑被過濾而沒觸發時，未來的必要檢查會永遠停在 waiting，那個 PR 無法合併 |
| `runs-on` | 固定版本（`ubuntu-24.04`），不用 `ubuntu-latest` | `latest` 會在某天默默換 Ubuntu（2026-10-19 起遷 26），同一個 commit 的行為就變了 |
| Node 版本 | 固定主版本（目前 24），且必須與 `package-lock.json` 的產生環境一致 | npm 10 與 npm 11 對 vitest 的嵌套 `vite` 解析不同，會讓 `npm ci` 誤判「lock 不完整」（實際發生過：`Missing: esbuild@0.28.2`） |
| Job 切分 | 7 個平行 job：`static`（型別／i18n／棘輪／建置／體積）、`test`（matrix `--shard=k/6`）、`summary`（`if: failure()`，成功時不跑） | 時間幾乎都花在**每個 job 的固定成本**（啟動 1–3s＋checkout 1–5s＋setup-node 1–7s＋npm ci 3–5s＝6–18s），不是工作本身。實測：單一 job 1m31s → 3 片 53s → 8 片（11 個 job）41s（VM 擠爆反而更慢）→ 收斂成 7 個 job 並把型別與建置合併 **27s** |
| 顯示名稱 | workflow 名、`run-name`、job 名、step 名**一律繁體中文**；但 **job id 必須 ASCII**（`static`／`test`／`summary`），中文只能放在 `name:` | CI 是給人看的介面；job id 有 `^[A-Za-z_][A-Za-z0-9_-]*$` 限制，放中文會讓整份 workflow 解析失敗 |

### 13.2 改 workflow 後的驗證（不准用「看起來沒問題」結案）

1. 本機先驗語法：`python -c "import yaml;yaml.safe_load(open('.github/workflows/ci.yml',encoding='utf-8'))"`。
2. push 後 `gh run list --limit 1` 確認**真的有 run 產生**——workflow 語法錯時，run 名稱會變成檔案路徑、`jobs` 數為 0。
3. `gh run watch <id> --exit-status` 等到結束；失敗用 `gh run view <id> --log-failed` 看**失敗那一步**。
4. `gh run view <id> --json jobs` 確認 job 的 `conclusion` 不是 `skipped`：名稱打錯／matrix 寫錯會靜默略過，而整體仍顯示 success。
5. **本機綠 ≠ 已通過**：沒 push 的寫「尚未推送」、push 了還沒跑完的寫「CI 進行中（run <id>）」（見 §10.8）。

### 13.3 不准為了讓 CI 變綠而做的四件事

- ❌ 刪測試、`describe.skip` 掉紅的測試 → 修程式或修測試的假設。
- ❌ 放寬守門（`scripts/ci/guards.mjs` 的 `BASELINE`、`BUNDLE_BUDGET_BYTES`、`i18n:check --strict`）→ 先修造成超標的東西。
- ❌ 在 `on:` 加 `paths-ignore` 讓 CI 乾脆不跑。
- ❌ 加 `continue-on-error` 把紅燈染綠。

**要修的是程式碼，不是閘門。**（與 §8「技術債只准降」同一條精神）

### 13.4 常見坑

- GitHub 運算式**沒有** `replace`／`trim` 這類字串函式，只有 `contains`、`startsWith`、`endsWith`、`format`、`join`、`toJSON`、`fromJSON`、`hashFiles` 與狀態函式。要字串處理就丟到 `run:` 用 bash／node。
- job 層 `if:` 讓 job 被略過 → 依賴它的彙總 job 會卡在 waiting；要略過就略過 **step**，job 本身仍要回報成功。
- 不要為了量測反覆觸發 workflow：把改動批次處理，一次執行驗證多項。
- `gh` 指令一律加 `-R TWJohnJohn20116/GuaGuaTowerDefense`（或先 `gh repo set-default`），不要依賴 cwd 推斷遠端。
- Windows 上用 PowerShell 寫 JSON／設定給 API 時，用 `[System.IO.File]::WriteAllText($p,$s,[System.Text.UTF8Encoding]::new($false))`：`Set-Content -Encoding utf8` 會寫 BOM，GitHub API 會回 `400 Problems parsing JSON`。

### 13.5 憑證出問題時

若 push 出現 `could not read Username for 'https://github.com'`，用**單次命令**借用已登入的 `gh`，不要改全域 git 設定：

```bash
git -c 'credential.helper=' -c 'credential.helper=!gh auth git-credential' push -u origin main
```

### 13.6 刻意不採納（別人的規則與我們不適用）

> 原本這裡第一條是「本機不得編譯／建置／執行測試，只能靠 CI」，2026-11-14 已由使用者拍板**採納**，移到 §13.9 成為絕對規則。

| 規則 | 為什麼不抄 |
|---|---|
| 多目標 matrix、Gradle 快取、JDK toolchain、跨平台建置矩陣 | 本專案只有一條 JS 工具鏈（npm + vitest + vite），CI 雖然已拆成多個平行 job（§13.1）但沒有多平台矩陣需求；等真的需要再加，不要預先複雜化。 |
| 產物（artifact）上傳與保留策略 | 只有 tag 觸發的 release 需要產物，現由 `tauri-action` 處理。 |

### 13.7 低風險改動不必等 CI（繼續往下做）

**使用者要求：判斷風險不大就不要卡在 CI 前面**——等待的時間應該拿去寫下一個東西，而不是盯著進度條。

| 低風險 → push 後直接繼續 | 高風險 → 必須等綠再往下 |
|---|---|
| 文件／註解／README／`AGENTS.md` | 戰鬥數值、演算法、狀態機、AI 決策 |
| 純新增測試、強化既有測試的斷言 | 改 `gameStoreTypes.ts` 契約、slice 拆分 |
| CSS class／樣式 token／純字串／i18n 文案 | 改 `vite.config.ts`、`package.json`、lock、新增依賴 |
| 純函式 + 它的測試（例：`towerCost.ts`） | `.github/workflows/**`、`scripts/ci/**`、bundle 預算臨界 |
| 生成物更新、格式化、`docs/research/` 報告 | 動到存檔格式／persist 欄位（舊檔會壞） |

**操作方式**

1. push 後用**背景工作**盯 CI（`run_in_background` 跑 `gh run watch <id> --exit-status`），不要在前景阻塞。
2. 立刻做下一件事；每個回合開始時順手 `gh run list --limit 1` 看結果，不要輪詢、不要 sleep 等。
3. 宣告整個任務完成前若拿到紅燈 → **立刻回頭修**，不准忽略、不准當成「後面再說」。
4. 回報時照 §10.8 標清楚：`CI 未確認（run <id>）` / `CI 進行中（run <id>）` / `CI 成功`。**跳過等待是一回事，把未知講成通過是另一回事。**
5. 判斷為低風險時要**說一句理由**（例：「只改註解，低風險，繼續下一項」），不能默默跳過。

**例外（一定要等）**

- 正在修的就是 CI 紅的那一條。
- 準備發版／打 tag／動 release workflow。
- 連續兩次 push 都被同一類錯誤打紅（代表判斷失準，停下來重新評估）。

### 13.8 Dependabot（依賴更新）

設定檔：`.github/dependabot.yml`。三個生態系，全部排在**週一 09:00（Asia/Taipei）**：

| 生態系 | 目錄 | PR 上限 | 分組 |
|---|---|---|---|
| npm（13 deps + 14 devDeps） | `/` | 3 | minor + patch 合成一張；major 各自一張 |
| github-actions | `/` | 3 | minor + patch 合成一張 |
| cargo（`src-tauri/`） | `/src-tauri` | 2 | minor + patch 合成一張 |

**規則**

- ❌ **不 auto-merge、不加 `dependabot-auto-merge` 之類的 workflow**。依賴升級會動 `package.json` / lock，屬 §13.7 的高風險改動。
- ✅ npm 的 PR 怎麼審：讀 diff 與 changelog → **讓 CI 跑**（Push 已由 Dependabot 完成，PR 會自動觸發 `pull_request`）→ 四道閘門（型別／i18n＋棘輪／測試／建置＋體積）全綠才合。**不要在合併前自己在本機跑 `npm ci`、`npm run check`（§13.9）。**
- ⚠️ 若 PR 動到 `package-lock.json` 且 CI 紅在 `npm ci`（`Missing: esbuild@0.28.2` 這類），代表 lock 是在 **npm 10** 環境生的；處理方式是叫 Dependabot 重跑（在 PR 留言 `@dependabot recreate`）或請使用者用 Node 24 重生 lock 後推上去，**不要**在本機重生。
- ❌ major 版本 PR 若 CI 紅，**在 PR 裡修**，不要合進 `main` 再修（會讓 `main` 有一段時間是紅的）。
- ⏫ 安全警報（Dependabot alerts／`npm audit`）優先於一般更新；目前 `npm audit` 有 14 個（1 low / 6 moderate / 7 high）尚未處理。
- ❌ 不要為了讓依賴 PR 變綠而放寬 guards、刪測試或跳過步驟（§13.3）。
- 🏷️ `labels` 指定的標籤**必須先在 repo 存在**，否則 Dependabot 會在 PR 留「The following labels could not be found」警告（PR 照樣會開，但清單難篩）。目前已有 `dependencies`／`npm`／`github-actions`／`rust` 四個。

**為什麼 PR 一定會被檢查**：`ci.yml` 的 `pull_request` 觸發刻意不加 `paths` 過濾（§13.1），所以 Dependabot 開的 PR 不會靜默跳過 CI。

### 13.9 絕對規則：本機不得編譯、建置或執行測試

**唯一允許的驗證途徑是 GitHub Actions。** 在使用者這台 Windows 電腦上，不得執行任何會編譯、建置、打包或測試本專案的指令。**沒有「順手跑一下」的例外。**

#### 禁止（一律不得在本機執行）

| 類別 | 具體指令 |
|---|---|
| 型別編譯 | `npm run typecheck`、`npx tsc`、任何 `tsc --noEmit` |
| 測試 | `npm run test`、`test:watch`、`test:coverage`、`npx vitest` |
| 建置／打包 | `npm run build`、`build:check`、`npm run tauri build`、`npx vite build` |
| 開發伺服器 | `npm run dev`、`npm run tauri dev`、`npx vite`（**Vite dev 會即時編譯 TS，一樣算**） |
| 組合指令 | `npm run check`、`npm run check:full`、`npm run ci:guards`（`--bundle` 需要 `dist/`）、`npm run verify:isms`（走 `npx tsx`，會編譯） |
| 環境調校 | 手動維護 `node_modules`、新增本機建置腳本、用 `npm ci` 之後自己跑任何上面那幾項 |

#### 允許（本機只做唯讀與編輯）

| 可以做 | 例子 |
|---|---|
| 讀取／搜尋／理解程式碼 | `read`、`grep`、`glob`、`git log`、`git diff` |
| 編輯任何檔案 | 程式、文件、`package.json`、`.github/workflows/**` |
| Git 操作 | `status`／`diff`／`log`／`add`／`commit`／`push`／`fetch`／`switch` |
| 用 `gh` 觀察與觸發 CI | `gh run list`、`gh run watch`、`gh run view --log-failed`、`gh run download`、`gh workflow run` |
| **唯讀靜態檢查**（不編譯、不執行專案程式） | `npm run i18n:check`（內部用 `ts.createSourceFile` 做 AST 比對）、`node scripts/ci/guards.mjs --debt`（純讀檔計數）、`python -c "import yaml…"` 驗 workflow 語法、`node -e` 讀 JSON |

判斷標準只有一句：**這條指令會不會編譯或執行 `src/**` 的程式？** 會 → 不准跑；不會 → 可以跑。

#### 沒有例外

- 若認為某項改動非得在本機編譯才能確認 → **停下來問使用者**，不要自行執行。
- 使用者若明確、逐次授權某一次本機執行，該次授權只適用那一次，不會改變本規則。
- 「只是跑一下 typecheck 而已」也算違規：`tsc` 就是編譯器，只是不輸出檔案。

#### 那要怎麼驗證改動？

1. push 之後用 `gh run watch <id> --exit-status` 等結論（低風險改動可先做別的事，見 §13.7）。
2. 紅燈時用 `gh run view <id> --log-failed` 讀**失敗那一步的 CI 日誌**——那就是本機編譯輸出的替代品。
3. 需要視覺驗證（畫面、動畫、手感）時，**請使用者自己開 `npm run dev`**，代理端不跑。
4. 回報時要分清「CI 已驗證」與「尚未驗證」（§10.8）。

#### 為什麼要這麼嚴

本專案的 `npm run check` 只要 80 秒，看起來很划算，但允許本機跑會產生三個實際問題：

| 問題 | 實例 |
|---|---|
| 本機綠 ≠ CI 綠 | Node 20（npm 10）與 Node 24（npm 11）對 vitest 的嵌套 `vite` 解析不同，本機 `npm ci` 過、CI 卻 `Missing: esbuild@0.28.2` |
| 用本機結果冒充結論 | 跑過 `npm run check` 就宣布「已通過」，但程式碼根本還沒 push、CI 從沒看過 |
| 與 §13.7 衝突 | §13.7 允許 push 後不阻塞等待；若同時又允許本機跑，就會出現兩套「驗證」互相蓋過對方結論 |

**CI 是唯一可信的驗證來源**：本機能編過不代表 CI 會過，反之亦然。
