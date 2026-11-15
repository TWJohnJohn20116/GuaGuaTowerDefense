# 創意工坊重設計（Project / Asset 架構）

- 日期：2026-11-15
- 狀態：設計定案，實作中（lead 統一整合）
- 取代：`CreativeWorkshop.tsx` 的五分頁 Mod 編輯器（舊資料直接捨棄，不寫遷移）

## 1. 為什麼重做

舊工坊把「一個 Mod」當成一個包：塔、敵人、地圖、波次、腳本五個分頁各自獨立，
作者做一張關卡要在四個分頁之間跳，改完還得存檔、切場景、手動挑設定才知道能不能玩。
使用者選出的痛點正好對應四個缺口：

| 痛點 | 根因 | 這次的解法 |
|---|---|---|
| 五個分頁沒有整體感 | Mod 是資料容器，不是作品 | **專案（Project）＋關卡（Level）** 當主體，資產退到背景 |
| 沒有一鍵試玩 | 編輯與執行是兩條路 | **臨時局**：草稿直接編譯進執行期，內嵌試玩 |
| 參數太多沒引導 | 只有欄位，沒有玩法模型 | **範本庫＋規則表／節點圖＋平衡模擬** |
| 只能匯出 JSON | 沒有封裝格式 | **.ggmod**（縮圖／版本／簽章／資產快照） |

## 2. 三個原則

1. **作者看到的就是玩家看到的**：地圖編輯直接跑遊戲渲染（2D／3D 切換、真實貼圖、射程圈）。
2. **一套執行器、兩種作者介面**：節點圖編譯成同一份 hook 腳本，腳本是進階逃生口。
3. **資產即時引用、發佈時快照**：編輯期「改一處、全部跟著變」；封裝時把引用打成快照，離線可玩。

## 3. 資訊架構（IA）

工坊只有一個一級場景 `workshop`，左軌七頁：

| # | 頁面 | 內容 | 負責模組 |
|---|---|---|---|
| 1 | 專案 | 專案卡片（縮圖／狀態／最近編輯）、新增／複製／刪除、快速試玩 | `components/scenes/Workshop.tsx`（lead） |
| 2 | 關卡 | 關卡清單＋地圖工作台（真實渲染） | `components/workshop/map/*` |
| 3 | 內容 | 波次時間軸＋塔／敵人陣容 | `components/workshop/content/*` |
| 4 | 規則 | 規則表 ↔ 節點圖 ↔ 產生的腳本 | `components/workshop/graph/*` |
| 5 | 資產 | 六類資產庫（塔／敵人／地圖／規則集／腳本模組／美術） | `components/workshop/assets/*`（lead） |
| 6 | 試玩 | 內嵌臨時局＋全螢幕切換＋平衡模擬 | `components/workshop/playtest/*` |
| 7 | 發佈 | .ggmod 匯出／匯入、簽章、翻譯包 | `components/workshop/publish/*` |

頁面契約：所有頁面級元件吃 `{ projectId: string; levelId?: string }`，自己讀寫 store。

## 4. 資料模型

```
Project
├─ meta { id, name, description, thumbnail, version, author, license, signature, timestamps }
├─ assets: AssetRef[]            // 這個專案用到的資產（即時引用）
└─ levels: Level[]               // 1..N
   └─ Level { id, name, mapAssetId, waves, winConditions, ruleOverrides, startingResources }
```

資產六類（全域資產庫，可跨專案引用）：`TowerAsset` / `EnemyAsset` / `MapAsset` /
`RuleSetAsset`（節點圖或規則表）/ `ScriptModuleAsset`（可被節點呼叫的函式庫）/ `ArtAsset`（圖示／縮圖／音效）。

- 引用 = `AssetRef { assetId, version }`；**編輯期即時引用**，**封裝時快照**。
- 規則作用域：專案層 RuleSet ＋ 關卡層覆寫（關卡覆寫以節點 id 對齊，缺的繼承）。
- 勝負條件：守住 N 波／N 秒、基地生命值、初始金錢、波次間隔、Boss 擊殺、自訂失敗（漏怪 > K、超時）、自訂計分（欄位＋權重）。

## 5. 編譯管線（作者模型 → 執行期）

```
Project + Assets
   │  compileProject()            // 純函式，回傳 { mod, warnings }
   ▼
Mod 形狀的執行期內容（現有 CustomTowerData / CustomEnemyData / CustomMapData / CustomWaveData / scripts）
   │  playtest: 安裝成臨時 mod（isPlaytest）
   │  publish : 打包成 .ggmod
   ▼
遊戲（沿用既有 getTowerData / getEnemyData / mod-script Worker）
```

**關鍵決策：不重寫引擎。** 新工坊把作品編譯成引擎既有的內容形狀，
所以塔的效果旗標、自訂敵人解析、腳本沙箱、波次組、地圖注入全部照舊，
重做只發生在「作者端」。

## 6. 規則：規則表、節點圖、腳本

- 三者共用同一份模型（`src/workshop/graph/model.ts`）：規則表是節點鏈的表格視圖。
- 節點庫固定：事件（11 個 hook）／條件／動作／流程／數值，另有 **JS 節點**（可寫任意 JS）。
- JS 節點與腳本執行在**同一個 Worker 沙箱**、**同一組權限**；靜態分析會標記「含 JS，無法靜態檢查」。
- `codegen` 產生具名函式 `onXxx(ctx, api)`，只用 `api.*`／`ctx.*`；產出可直接餵給 `compileScriptHandlers`。
- 可切換「看產生的程式碼」（唯讀），這是教學與除錯路徑。

## 7. 地圖編輯：用真實渲染

- 重用遊戲畫布（2D／3D 切換沿用 `ViewModeToggle` 語彙）；若元件只能從 store 讀，
  就以「編輯緩衝寫入 store、離開 try/finally 還原」的方式重用，避免另寫一套畫布。
- 路徑點：拖曳移動／雙擊新增／Delete 刪除；方向箭頭、格線座標。
- 障礙格：真實貼圖筆刷，與路徑重疊即時標紅。
- 擺塔預覽：放／移／刪，顯示射程圈，不扣錢、不開局。
- 波次路線動畫：純視覺，重用路徑推導純函式。

## 8. 試玩與平衡

- **臨時局**：`isPlaytest` 旗標打開時，不寫統計、不觸發成就、不寫回放、不落存檔；
  離開即丟棄本局內容。預設內嵌在工坊（可切全螢幕）。
- **平衡模擬**：無渲染跑 N 局，重用 `gameStoreAutoBattle` 的 AI，輸出勝率、平均存活波次、
  平均剩餘血量、每波存活曲線；分片執行不阻塞 UI，可取消。

## 9. 發佈：.ggmod

- JSON 容器：`{ magic: "GGMOD", formatVersion, project, assets(快照), thumbnail(base64), signature? }`。
- 引用資產快照＋記錄 `{ assetId, version }`，之後可提示「來源已更新」。
- 簽章沿用 `src/mod-script/signing.ts`（ECDSA P-256 / SHA-256、canonicalize 鍵排序）。
- 翻譯包：`{ locale, entries }`；匯出未翻譯鍵清單、匯入只補不覆蓋、回報缺鍵／多餘鍵。

## 10. 舊東西怎麼處理

- 舊 Mod UI 與資料 `modStore` 的「作者端」全部作廢；**執行期**的 mod 解析（塔／敵人／地圖／波次／腳本）
  保留，因為新管線就是編譯成它。
- 內建四個範例 mod 不再出現在工坊；它們不再被當成「作品」，只作為執行期測試資料。

## 11. 風險與對策

| 風險 | 影響 | 對策 |
|---|---|---|
| 節點圖＋規則表雙視圖 | 兩套資料就會漂移 | 同一份模型、表格是視圖；單元測試守雙向轉換 |
| JS 節點破壞可分析性 | 平衡模擬無法只靠靜態 | 模擬實際執行（沙箱內），靜態只做提示 |
| 重用遊戲渲染 | store 被編輯緩衝污染 | 進出 try/finally 還原；試玩用臨時局 |
| 專案/資產引用 | 刪資產造成專案壞掉 | deleteAsset 回傳阻擋原因；編譯缺資產只 warning |
| 一次做完的範圍 | 型別與整合風險 | lead 統一整合、CI 為唯一驗證、每段可回滾 |

## 12. 驗證計畫

1. 每個純函式模組（compile / graph / timeline / package / map edit model）都有 vitest 單元測試。
2. CI：typecheck、i18n、棘輪、建置、體積預算、710+ 測試。
3. 視覺驗證：七個頁面逐一截圖並看圖（空白、對比、溢出、窄版）。
4. 手動：桌面版跑一次 CSP（音樂／更新／圖片／腳本 Worker）。
