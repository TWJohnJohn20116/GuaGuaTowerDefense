# 成就圖鑑殿堂 實作計畫

> **面向實作者：** 依本計畫逐任務實作；每完成一個任務即跑驗證。完整設計見
> `docs/superpowers/specs/2026-05-30-achievement-codex-redesign.md`。

**目標：** 將成就場景介面重做為「成就圖鑑殿堂」（圖鑑骨架＋殿堂儀式感，版面 B）。
**架構：** 新資料夾 `src/components/scenes/achievement-codex/`；瘦身 `Achievements.tsx` 編排；沿用 store/data/types/tracking 不動。
**技術棧：** React + TypeScript、framer-motion、`src/ui` Icons（SVG）、`SceneShell`、`BackButton`、zustand（`useAchievementStore`）。

## 檔案結構（職責）

新增 `src/components/scenes/achievement-codex/`：
- `AchievementBadge.tsx`、`CircularProgress.tsx`、`conditionLabels.ts` — 由舊資料夾原樣移入（共用原語）。
- `codexTypes.ts` — `CodexFilterMode`、共用小工具（最稀有已達成計算）。
- `CodexCard.tsx` — 單卡四態（達成/進行中/未解鎖剪影/隱藏問號）。
- `CodexTopBar.tsx` — 返回＋標題＋搜尋＋狀態篩選。
- `CodexChapters.tsx` — 左欄章節（全部＋各類別）＋各區完成度。
- `HallBanner.tsx` — 殿堂概況（總完成度環＋最稀有已達成聚光＋總點數/已達成）。
- `CodexGrid.tsx` — 依章節分段網格＋「載入更多」＋空狀態。
- `CodexDetailModal.tsx` — 成就展示特寫（條件/獎勵/領取/上下切換/ESC）。
- `index.ts` — barrel 匯出。

重寫：`src/components/scenes/Achievements.tsx`。
刪除（最後）：舊 `src/components/scenes/achievement-system/` 全部。

## 共用型別（codexTypes.ts）

```ts
export type CodexFilterMode = 'all' | 'completed' | 'in_progress' | 'locked';
// 由已達成集合取稀有度最高者（legendary→common）
export function pickRarestEarned(/* achievements, getStatus */): Achievement | null
```

## 任務序列

每個任務完成後跑：`npx tsc --noEmit`（零新增錯誤）＋ `ReadLints`（受影響檔）。全部完成後跑 `npx vite build`。

1. **建立資料夾＋移入原語**：建立 `achievement-codex/`，將 `AchievementBadge.tsx`、`CircularProgress.tsx`、`conditionLabels.ts` 內容複製到新資料夾（import 路徑相對不變）。先不刪舊檔。
2. **codexTypes.ts**：定義 `CodexFilterMode` 與 `pickRarestEarned(achievements, getStatus)`。
3. **CodexCard.tsx**：props `{achievement,status,percentage,selected,onSelect}`；四態樣式（達成全彩光暈／進行中半亮＋進度條／未解鎖剪影＋鎖／隱藏問號），稀有度色取 `RARITY_CONFIG`，hover 微縮放。
4. **CodexTopBar.tsx**：props `{search,onSearchChange,filter,onFilterChange}`；`BackButton`＋標題「成就圖鑑」＋`SearchInput`＋四態篩選 chips。
5. **CodexChapters.tsx**：props `{selected,onSelect,byCategory,totalCount,totalCompleted}`；「全部」＋各 `CATEGORY_CONFIG` 類別，每項顯示完成度條（`byCategory[cat].completed/total`）。空類別不顯示。
6. **HallBanner.tsx**：props `{stats,rarestEarned}`；左 `CircularProgress`（總完成度）＋中 `AchievementBadge`（最稀有已達成聚光，無則提示）＋右 統計（總點數、已達成/總數）。金色殿堂點綴。
7. **CodexGrid.tsx**：props `{achievements,getStatus,getPercentage,selectedId,onSelect,visibleCount,onLoadMore,pageSize,onResetVisible,resetKey}`；網格渲染 `CodexCard`、「載入更多」、空狀態。
8. **CodexDetailModal.tsx**：props `{achievement,status,progress,percentage,onClaim,onPrev,onNext,onClose}`；大徽章＋稀有/類別標籤＋`CircularProgress`＋條件清單（用 `getConditionLabel`）＋獎勵列＋（達成未領）領取鈕；`ESC` 關、`←/→` 切換、點背景關。隱藏/秘密遮蔽。
9. **index.ts**：barrel 匯出全部元件與 `CodexFilterMode`。
10. **重寫 Achievements.tsx**：持有 `selectedCategory/filter/search/selectedId/modalOpen/visibleCount`；用 `useAchievementStore` selector；組合 TopBar→HallBanner→(Chapters｜Grid)→Modal；鍵盤左右切換（輸入框聚焦不攔截）。`SceneShell accent="warning"`。
11. **刪除舊資料夾**：確認 `tsc`/`vite build` 通過後，刪除 `achievement-system/` 全部檔案。
12. **最終驗證**：`npx tsc --noEmit`（僅既有 8 locale 錯誤）、`npx vite build` 成功、`ReadLints` 乾淨、新檔皆 <888 行。

## 自檢（規格覆蓋）

- 版面 B 四區塊：TopBar(任務4)、HallBanner(6)、Chapters(5)＋Grid(7)、Modal(8) ✓
- 卡片四態：CodexCard(3) ✓
- 篩選/搜尋/分區/載入更多：TopBar(4)+Chapters(5)+Grid(7)+Achievements(10) ✓
- 沿用 store/data/原語、不動邏輯：任務1、10、非目標 ✓
- 移除排序、不採無限捲動：TopBar 無排序、Grid 用載入更多 ✓
- 清理舊檔：任務11 ✓
- 無占位符：各任務皆有明確 props 與行為 ✓
