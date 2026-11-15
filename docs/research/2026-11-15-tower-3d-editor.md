# 塔的 3D 模型編輯器（完整版）

日期：2026-11-15 · 範圍：創意工坊第 8 頁「模型」 · 相關程式：`src/components/workshop/models/**`、`src/workshop/model/**`

## 1. 為什麼重做

原本的編輯器是資產頁右側的一張數字表格：一個部件七個欄位、一個只能拖著轉視角的預覽畫布。
它不能點選部件、不能拖曳、不能對位，也就不是 3D 工具——只是「3D 模型的參數表」。
使用者要求「像真正的 3D 編輯工具」，因此整個互動與資料模型重做。

## 2. 已確認的設計決策（提問工具兩輪）

| 項目 | 決策 |
|---|---|
| 操作方式 | 完整 gizmo：三軸手柄拖曳移動／旋轉／縮放 + 點選 + 框選 |
| 資料模型 | 逐部件顏色、自發光、透明度、非等比縮放、名稱、隱藏、鎖定、父子階層 |
| 工作流 | 撤銷重做、複製、鏡像 X/Z、網格吸附、拖曳排序、群組摺疊、JSON 匯入匯出、四種模板 |
| 視窗 | 軌道相機、四視圖＋等角、正交／透視、地塊邊界＋網格＋軸指示、實體／線框／法線、燈光背景可調 |
| 遊戲內 | 同步生效（顏色／非等比／階層／隱藏全部進遊戲渲染） |
| 版面 | 全螢幕獨立頁（第 8 頁），資產頁只留跳轉按鈕 |
| 快捷鍵 | 1／2／3 切工具、X／Y／Z 鎖軸、F 聚焦、Del 刪除、Ctrl+Z／Y／D（明確不用 WASD） |
| 父子建立 | 部件樹拖到另一個部件上；右鍵「解除父子」 |
| 模板 | 逼近遊戲內既有外觀（把 buildBasic／Sniper／Cannon／Laser 的幾何翻譯成部件） |
| 部件上限 | 不設上限，只在狀態列顯示 draw call 數 |

## 3. 資料模型

`Custom3DPart` 在原有 `shape/material/x,y,z/rx,ry,rz/scale/spin` 上新增（全部可選，舊資料不需遷移）：

```ts
sx?: number; sy?: number; sz?: number;   // 非等比縮放，缺省回退 scale
color?: string;                          // CSS 色字串，覆蓋材質角色色
emissive?: number;                       // 0~3
opacity?: number;                        // 0~1
name?: string; hidden?: boolean; locked?: boolean;
parentId?: string | null;                // 父子階層
```

契約要點：

- **座標語意**：部件的 `x/y/z` 是父件局部座標；換父不改座標（`reparent` 只換 `parentId`），這是刻意的取捨，已在 `doc.ts` 檔頭寫明。
- **hidden**：本體不渲染，節點仍存在（空 Group），子件照常渲染。
- **循環安全**：`parentId` 指向不存在、指向自己、成環 → 一律升為根層，不拋錯。
- **越界**：XZ 半徑超過地塊半寬 0.47 時整體等比收縮，並把 `userData.shrink` 回報給編輯器；編輯器只在真的被收縮時顯示警告（早期用估算公式會誤報，已改掉）。

## 4. 編輯器互動契約

- **滑鼠**：左鍵選取／拖 gizmo／空白拖框選、右鍵旋轉視角、中鍵平移、滾輪縮放。
- **拖曳期間只改 Object3D transform，放手才提交**：避免每一幀重建模型與材質；提交後才寫 store 與歷史。
- **歷史**：`createModelHistory` 上限 100 步；`undo/redo` 走「只寫 store 不 push」的路徑，否則 push 會清空 redo。
- **著色模式**用共享覆蓋材質；重建前先還原原材質再交給 `disposeTowerModel`，避免材質洩漏。
- **幀迴圈**包 `createFrameLoopGuard`（AGENTS §4.5）。
- **點選**靠渲染層提供的 `userData.partId` 與 `userData.partNodes`；`partNodes` 在越界收縮時會搬到最外層 group。

## 5. 檔案

| 檔案 | 職責 |
|---|---|
| `src/workshop/model/doc.ts` | 純資料層：正規化、部件樹操作、序列化、統計、越界、歷史 |
| `src/workshop/model/templates.ts` | 四種預設模板（基礎／狙擊／加農／水晶） |
| `src/workshop/model/gizmo.ts` | gizmo 拖曳數學與視角球座標（純函式，可測） |
| `src/components/workshop/models/ModelsPage.tsx` | 頁面裝配、快捷鍵、匯出入、模板 |
| `src/components/workshop/models/ModelViewport.tsx` | three.js 視窗：相機、gizmo、點選、框選、著色、輔助線 |
| `src/components/workshop/models/ModelTree.tsx` | 部件樹：階層、拖曳建父子／排序、右鍵選單、隱藏鎖定 |
| `src/components/workshop/models/ModelInspector.tsx` | 部件屬性：變換、對齊軸、外觀、父子 |
| `src/components/workshop/models/ModelToolbar.tsx` | 工具列：工具／視角／顯示／著色／動作／模板／統計 |

## 6. 驗證

- 單元測試：`workshopModelGizmo`（20）、`workshopModelDoc`（28）、`workshopModel3d`（11）。
- 視覺驗證：`node scripts/visual-check.mjs --scenes=workshop` 搭配注入腳本走完「資產 → 新增塔 → 模型頁 → 載入模板 → 選部件」，確認 gizmo、屬性面板、部件樹、統計列皆正確；稽核只剩既有的標題截斷與離線 403。
- CI：型別、i18n、棘輪、6 片測試、建置、體積預算全綠。

## 7. 已知限制

- 貼上（Ctrl+V）沒有獨立剪貼簿，複製走 Ctrl+D／右鍵「複製部件」。
- 換父不改世界座標（見 §3），需要保留視覺位置時得手動調整。
- 框選以部件中心點判定，未做螢幕空間包圍盒相交。
- 自訂模型仍忽略 Lv1~Lv5 的等級差異（引擎預設外觀才有等級進化）。
