# 遊戲內 3D 視圖模式設計（three.js · 方案 C）

日期：2026-06-10
狀態：方向已獲用戶批准（「C」），第一階段已交付

## 核心架構：雙渲染器並存

**遊戲邏輯零改動**。gameStore 是唯一事實源，3D 渲染器只是另一個「視圖」：

```
gameStore（敵人/塔/投射物/grid 狀態）
   ├─ 2D 視圖：GameCanvas（三層 Canvas，預設）
   └─ 3D 視圖：GameScene3D（three.js，RAF 每幀 getState() 同步）
```

- 切換按鈕在遊戲左上角（教學模式強制 2D 並隱藏按鈕）
- `GameScene3D` 以 `lazy()` 延遲載入：three.js（~517KB chunk）只在首次切 3D 時下載，主包零增重
- 3D 模式 bug 不影響 2D 玩法，可隨時切回

## 分階段交付計劃

| 階段 | 內容 | 狀態 |
|---|---|---|
| 1 | three 基建：場景/相機/OrbitControls/光影、立體地圖格、塔/敵人/投射物幾何體同步、2D⇄3D 切換 | ✅ 已交付 |
| 2 | 戰鬥表現：命中粒子、死亡碎片、血條 billboard、相機震動（`effects3d.ts` 消費 store 同一特效資料源） | ✅ 已交付 |
| 3 | 3D 內交互：raycaster 拾取放塔/選塔、射程圈、懸停高亮、選中金環（`interaction3d.ts`） | ✅ 已交付 |
| 4 | 性能：敵人/血條/投射物/粒子全 InstancedMesh 化（`instanced3d.ts`），無盡模式 draw call ~400 → ~5 | ✅ 已交付 |
| 5 | 打磨：塔皮膚主色映射、相機預設（斜視/俯視/自由＋拖拽自動回自由）、`visual.prefer3DView` 偏好持久化 | ✅ 已交付（3D 模式全部 5 階段完成） |

## 第一階段實現細節

### 座標系
- 1 格 = 1 世界單位，地圖置中：`(col,row) → (col-COLS/2+0.5, y, row-ROWS/2+0.5)`
- 2D rotation（canvas 順時針）→ 3D `rotation.y` 取負

### 地圖
- 依 `grid` tile 類型擠出 BoxGeometry：path 亮面低台、blocked 高台投影、start 綠 / end 紅發光
- waypoints 發光導引線（支援 advanced 地圖 segments 多線）
- 大地面接收 PCFSoft 陰影

### 實體同步（Map<id, Object3D> 增刪池）
- 敵人：球體，顏色取 `ENEMY_DATA[type].color`，size 等比縮放，血量越低發光越暗
- 塔：底座圓柱 + 發光球形砲塔 + 砲管，顏色取 `TOWER_DATA[type].color`，等級放大、旋轉跟隨
- 投射物：發光小球

### 資源管理
- 元件卸載時 traverse dispose 全部 geometry/material + renderer.dispose
- 實體移除時 dispose 材質；幾何體共享不重複建

## 檔案

| 檔案 | 行數 | 職責 |
|---|---|---|
| `game-scene/three/GameScene3D.tsx` | ~330 | three 場景管理與 store 同步 |
| `game-scene/three/ViewModeToggle.tsx` | ~60 | 2D/3D 切換按鈕（內聯 SVG 圖標） |
| `GameScene.tsx` | +15 | 視圖分支與按鈕掛載 |
