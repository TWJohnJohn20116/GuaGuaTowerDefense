# 機械工廠重作規格（產線建造器 · 階段一 MVP）

| 欄位 | 內容 |
|------|------|
| 設計日期 | 2026-05-30 |
| 範圍 | `src/components/scenes/Factory.tsx` 與全新 `factory/` 子模組、新增 `src/store/factoryGridStore.ts` |
| 目標 | 把現有「分頁數值掛機工廠」打掉重練為「戴森球／Factorio 風固定格子產線建造器」 |
| 玩法走向 | D 全新玩法 · A 產線連線 · A＋L 固定格子網格＋大型可捲動地圖（先交付階段一 MVP） |
| 渲染 | 方案 3 混合：Canvas 畫產線層 ＋ React/`src/ui` 畫面板疊層 |
| 約束 | 全部繁體中文、每檔 < 888 行、統一 `BackButton`、用 `src/ui` 模塊、以 SVG／程式化向量取代表情符號 |

---

## 一、現狀與動機

現有機械工廠（v3）為掛機式數值經營，約 45 檔、~13,000 行：主場景 `Factory.tsx` ＋ 12 分頁（生產／能源／研究／工人／藍圖／組合／訂單／收購商／每日／成就／統計／躍升）＋ 11 個 `factory*` store。使用者決定整個系統打掉重練，改為可互動的固定格子產線地圖：放置機台、鋪設輸送帶、多階合成最終產物，重視佈局規劃。

---

## 二、整體架構與檔案結構

路由不動：`App.tsx` 仍 `lazy` 載入 `@/components/scenes/Factory`、`case 'factory'` 不變，只重寫 `Factory.tsx` 內部與其子樹。

| 狀態 | 路徑 | 行數預估 | 職責 |
|------|------|----------|------|
| 重寫 | `scenes/Factory.tsx` | ≤ 160 | 薄殼：`SceneShell` ＋ `BackButton` ＋ 掛載 `CanvasStage` ＋ UI 疊層 ＋ tick 啟動 |
| 新增 | `factory/engine/types.ts` | ≤ 160 | 共用型別：`Tile / Item / Recipe / MachineType / Machine / Belt / ResourceNode / GridState` |
| 新增 | `factory/engine/grid.ts` | ≤ 220 | 格子座標、佔位查詢、放置／拆除合法性、礦脈查詢（純函式） |
| 新增 | `factory/engine/belts.ts` | ≤ 220 | 輸送帶路徑、帶上物品位置推進、帶尾交接與背壓（純函式） |
| 新增 | `factory/engine/simulation.ts` | ≤ 260 | 固定步長生產模擬：採礦／機台進度／消耗產出／搬運（純函式） |
| 新增 | `factory/engine/camera.ts` | ≤ 140 | 平移／縮放、世界↔螢幕座標轉換、邊界夾制、視窗裁切範圍 |
| 新增 | `factory/render/CanvasStage.tsx` | ≤ 240 | `<canvas>` 掛載、`requestAnimationFrame` 主迴圈、輸入事件、繪製分層調度 |
| 新增 | `factory/render/drawGrid.ts` | ≤ 140 | 畫網格、礦脈高亮、放置預覽／非法紅色提示 |
| 新增 | `factory/render/drawMachines.ts` | ≤ 200 | 畫機台外形、朝向箭頭、選取／hover 外框 |
| 新增 | `factory/render/drawBelts.ts` | ≤ 200 | 畫輸送帶人字紋動畫與帶上流動物品 |
| 新增 | `factory/render/sprites.ts` | ≤ 220 | 機台／物品的程式化向量繪製與色票（對齊北歐色，無圖片資源） |
| 新增 | `factory/data/items.ts` | ≤ 80 | 物品定義：`ore / ingot / part`（含色票） |
| 新增 | `factory/data/recipes.ts` | ≤ 100 | 配方定義：冶煉、組裝 |
| 新增 | `factory/data/machines.ts` | ≤ 160 | 機台定義：採礦機／冶煉爐／組裝機／出貨倉／輸送帶 |
| 新增 | `factory/ui/FactoryHud.tsx` | ≤ 180 | 頂部 HUD：資源計數＋產率（用 `src/ui` 卡片與 `Icons`） |
| 新增 | `factory/ui/FactoryToolbar.tsx` | ≤ 200 | 建造工具列：工具鈕＋tooltip、手機平移／建造切換 |
| 新增 | `factory/ui/MachineInspector.tsx` | ≤ 200 | 選取機台資訊面板：配方／吞吐／緩衝＋旋轉、拆除 |
| 新增 | `store/factoryGridStore.ts` | ≤ 320 | zustand persist：格子／機台／帶／物品／資源／鏡頭／工具，存檔 key `factory-grid-v1` |

職責分離原則：`engine/` 為純邏輯不碰 DOM（可單測）；`render/` 只讀狀態畫到 canvas；`ui/` 走 `src/ui` 元件＋SVG＋統一 `BackButton`；`store/` 管狀態與存檔。

舊碼處理（高風險，分段確認）：先「並存開發 → 切換路由內部 → 驗收」，確認新工廠能跑後，最後一步才刪除舊的 45 檔＋11 個 `factory*` store，且刪除前會再次向使用者確認。舊存檔 key 於清理階段一併移除；新系統用獨立 key，互不衝突。

---

## 三、資料模型

```ts
type Dir = 0 | 90 | 180 | 270;              // 朝向／輸送方向
interface Tile { x: number; y: number }
type ItemId = 'ore' | 'ingot' | 'part';
interface Recipe { id: string; inputs: { item: ItemId; qty: number }[]; output: ItemId; seconds: number }
interface MachineType {
  id: string; name: string; w: number; h: number;     // 佔格尺寸
  kind: 'miner' | 'processor' | 'sink';
  recipeId?: string;                                    // processor 綁定配方
  onlyOnResource?: boolean;                             // 採礦機需蓋礦脈
}
interface Machine {
  id: string; typeId: string; x: number; y: number; dir: Dir;
  inBuf: Partial<Record<ItemId, number>>;
  outBuf: Partial<Record<ItemId, number>>;
  progress: number;                                     // 0~1
}
interface Belt { id: string; x: number; y: number; dir: Dir; items: { item: ItemId; pos: number }[] }
interface ResourceNode { x: number; y: number; item: ItemId }
interface GridState {
  machines: Record<string, Machine>;
  belts: Record<string, Belt>;
  nodes: ResourceNode[];
  occupancy: Record<string, string>;                    // "x,y" -> machineId|beltId
  inventory: Partial<Record<ItemId, number>>;           // 出貨累計（HUD）
  camera: { x: number; y: number; zoom: number };
}
```

MVP 內容：物品 `ore 礦石 / ingot 金屬錠 / part 零件`；機台 採礦機 → 冶煉爐 → 組裝機 → 出貨倉 ＋ 輸送帶；配方 冶煉 `1 ore → 1 ingot（2s）`、組裝 `2 ingot → 1 part（3s，示範多輸入累積）`；最終 `part` 進出貨倉累計到 `inventory`。

---

## 四、生產模擬（固定步長 100ms）

1. **採礦機**：蓋在礦脈上，依速率把對應原料加入 `outBuf`（有上限）。
2. **輸送帶**：每個 `item.pos += speed * dt`；到帶尾（pos≥1）嘗試交接下一段帶或相鄰機台 `inBuf`；交接失敗則停在帶尾形成背壓。
3. **機台（processor）**：`inBuf` 滿足配方且 `outBuf` 有空位時，消耗輸入、`progress` 推進；完成後產出至 `outBuf`，再由朝向側的輸出帶帶走。
4. **出貨倉（sink）**：吞入的 `part` 計入 `inventory`，供 HUD 顯示。

渲染與模擬分離：渲染走 `requestAnimationFrame`；模擬以累積器跑固定步長（避免掉幀影響邏輯）。效能：只迭代啟用中的機台／帶；繪製只處理鏡頭裁切範圍內的格。

---

## 五、互動

- **鏡頭**：拖曳平移、滾輪縮放（手機：拖曳平移、雙指縮放），邊界夾制。
- **建造**：工具列選工具 → 點格放置；輸送帶用「按住拖曳」一次鋪一條，方向沿拖曳推導；放置前按 `R` 旋轉機台朝向。
- **拆除**：拆除工具點擊移除格內物。
- **檢視**：無工具時點機台開 `MachineInspector`。
- **手機**：工具列含「平移／建造」切換鈕，避免誤觸。

---

## 六、視覺（Canvas 程式化向量）

套用現有北歐色票（`--color-primary #5c83d6`、`--color-secondary #4a9e88`、工廠琥珀 `#fbbf24`）：

- 網格淡線、礦脈高亮塊。
- 機台各有辨識外形＋進出料箭頭；採礦機（鑽頭）、冶煉爐（爐火）、組裝機（齒輪臂）、出貨倉（箱）。
- 輸送帶用動畫人字紋；帶上物品為流動小方塊（礦石灰 `#9ca3af`、金屬錠鋼藍 `#5c83d6`、零件琥珀 `#fbbf24`）。
- hover 高亮、選取外框、非法放置紅色 `--color-danger` 提示。

---

## 七、UI 疊層（全走 `src/ui` ＋ SVG）

- 左上統一 `BackButton variant="glass" size="lg"`（符合返回鍵規範）。
- `FactoryHud`：頂列資源計數（ore/ingot/part）＋產率，用 `src/ui` 卡片與 `Icons`。
- `FactoryToolbar`：建造工具鈕（SVG 圖示＋tooltip 說明），含手機平移／建造切換。
- `MachineInspector`：選機台時顯示配方／吞吐／緩衝＋旋轉、拆除鈕。
- 外層用既有 `SceneShell` ＋ glassmorphism 變數，與其他場景一致。

---

## 八、錯誤處理

- 非法放置（佔用格、採礦機未蓋礦脈、輸送帶重疊）：擋下並以紅色提示，不改狀態。
- `canvas` context lost：監聽事件並自動重取、重繪。
- 存檔讀取／遷移失敗：回退到預設空地圖（含一片礦脈起始區）。

---

## 九、測試與驗證

- `engine/`（`grid`、`belts`、`simulation`、`camera`）皆為純函式，便於單元測試：
  - 放置合法性（佔用、礦脈限制）。
  - 輸送帶推進與背壓（給定佈局，N 步後物品位置／交接正確）。
  - 模擬步進（採礦→冶煉→組裝→出貨，M 步後 `inventory.part` 正確遞增）。
- 全域驗證：完成後執行 `npm run build:check`（`tsc && vite build`），確認零型別／編譯錯誤；以 `ReadLints` 檢查改動檔零 lint 錯誤。

---

## 十、範圍邊界（本階段不做，列入階段二／三）

- 階段二：擴充更多機台、多階配方、科技樹解鎖、十多種機台與可捲動大地圖內容。
- 階段三：整合塔防經濟、成就／統計／事件重建、離線結算、平衡打磨。
- 本階段 MVP 不含：離線結算、研究樹、訂單／收購商／躍升等舊系統。

---

## 十一、實作順序（供 writing-plans 展開）

1. `engine/types.ts` → `data/*`（items/recipes/machines）。
2. `store/factoryGridStore.ts`（狀態、放置／拆除、persist）。
3. `engine/grid.ts` → `engine/belts.ts` → `engine/simulation.ts` → `engine/camera.ts`。
4. `render/sprites.ts` → `drawGrid/drawMachines/drawBelts` → `CanvasStage.tsx`。
5. `ui/FactoryHud` → `FactoryToolbar` → `MachineInspector`。
6. 重寫 `Factory.tsx` 接線（tick、輸入、疊層）。
7. `npm run build:check` ＋ `ReadLints` 驗證。
8. 使用者驗收後，確認再清理舊 45 檔＋11 store 與舊存檔 key。
