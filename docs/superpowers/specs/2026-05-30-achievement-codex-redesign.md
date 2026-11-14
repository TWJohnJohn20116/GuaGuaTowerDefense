# 成就系統介面重做規格 · 成就圖鑑殿堂

> 日期：2026-05-30　狀態：待使用者審查
> 範圍：**只重做「成就系統介面（UI）」**，不更動成就內容、追蹤與領取邏輯。

## 1. 目標與範圍

### 目標
- 將成就場景的介面**完全重新構想**，以「**收集圖鑑（骨架）＋ 榮耀殿堂（儀式感）**」為核心體驗。
- 大量成就（多類別、多稀有度）下，兼顧**瀏覽 / 收集 / 炫耀**三種需求。
- 沿用既有設計規範：繁體中文、`src/ui` 模組、SVG 圖示（不用表情符號）、`SceneShell`、統一 `BackButton`、framer-motion 動效。

### 非目標（保持不動）
- 成就資料（`src/data/achievementData.ts` 與 `src/data/achievements/*`）。
- 成就邏輯與狀態：`useAchievementStore`（`getAchievementStatus / getAchievementProgress / getCompletionPercentage / getStats / claimAchievement`）、`achievementStoreCheck`、`useAchievementTracking`。
- 解鎖通知吐司 `src/components/ui/AchievementNotification.tsx`（與本介面無耦合）。

## 2. 設計概念

「成就圖鑑殿堂」＝以圖鑑分區呈現全部成就（含未解鎖剪影、隱藏問號），並在頂部以「殿堂概況帶」營造收藏炫耀的儀式感（總完成度、最稀有徽章聚光、總點數）。單一成就以「展示 Modal」聚光特寫。

## 3. 版面（方案 B）

```
┌──────────────────────────────────────────────────────────────┐
│ CodexTopBar：返回 ｜ 「成就圖鑑」 ｜ 搜尋 ｜ 篩選(全部/已達成/進行中/未解鎖)│
├──────────────────────────────────────────────────────────────┤
│ HallBanner（榮耀殿堂帶）                                       │
│   ◍ 總完成度大環 X%   ★ 最稀有已達成徽章聚光   ▣ 總點數 / 已達成數 │
├───────────────┬──────────────────────────────────────────────┤
│ CodexChapters │ CodexGrid（圖鑑徽章牆，依章節分段）           │
│ （左欄章節）   │   章節標題列：類別名 + X/Y 收集 + 完成度條     │
│ · 全部  ▓ 62% │   ┌────┬────┬────┬────┐                       │
│ · 進度  ▓ 80% │   │卡片│卡片│卡片│卡片│  CodexCard 三態        │
│ · 塔防  ▓ 45% │   ├────┼────┼────┼────┤                       │
│ · 獵殺  ▓ 30% │   │卡片│卡片│卡片│卡片│  漸進載入/分頁         │
│ · …（各區帶   │   └────┴────┴────┴────┘                       │
│   完成度條）   │                                              │
└───────────────┴──────────────────────────────────────────────┘
        點任一卡 → CodexDetailModal（聚光大徽章特寫）
```

**CodexDetailModal**：聚光大徽章＋稀有度／類別標籤＋`CircularProgress` 完成度＋條件進度清單＋獎勵列＋（達成未領取時）領取鈕＋攻略提示；支援 `←/→` 切換上一個/下一個、`ESC` 關閉、點背景關閉。

## 4. 元件分解

新資料夾：`src/components/scenes/achievement-codex/`，每檔 **< 888 行**、單一職責、以 props 溝通。

| 元件 | 職責 | 主要 props |
|---|---|---|
| `Achievements.tsx`（重寫·編排） | 持有 UI 狀態、組合各區塊 | — |
| `CodexTopBar.tsx` | 返回、標題、搜尋、狀態篩選 | `search,onSearchChange,filter,onFilterChange` |
| `HallBanner.tsx` | 殿堂概況：總完成度環、最稀有已達成聚光、總點數/已達成 | `stats, rarestEarned` |
| `CodexChapters.tsx` | 左欄章節（含「全部」＋各類別）與各區完成度 | `selected,onSelect,byCategory` |
| `CodexGrid.tsx` | 依章節分段渲染卡片網格、漸進載入、空狀態 | `achievements,getStatus,getPercentage,selectedId,onSelect,...` |
| `CodexCard.tsx` | 單一成就卡（三態：達成/進行中/未解鎖/隱藏） | `achievement,status,percentage,selected,onSelect` |
| `CodexDetailModal.tsx` | 成就展示特寫 Modal（條件/獎勵/領取/切換） | `achievement,status,progress,percentage,onClaim,onPrev,onNext,onClose` |
| `index.ts` | 匯出上述元件與型別 | — |

**沿用既有原語（自 `achievement-system/` 移入 `achievement-codex/`）**：`AchievementBadge.tsx`、`CircularProgress.tsx`、`conditionLabels.ts`（三者目前僅被 `achievement-system/` 內部使用，可安全移動）。

**型別**：新增 `CodexFilterMode = 'all' | 'completed' | 'in_progress' | 'locked'`（取代舊 `AchievementFilterMode`）。本版**移除排序選單**（圖鑑以章節分段＋稀有度預設排序，簡化操作；YAGNI）。

## 5. 資料與狀態流

- 資料來源（唯讀）：`ALL_ACHIEVEMENTS`、`ACHIEVEMENTS_BY_CATEGORY`（`@/data/achievementData`）；型別 `@/types/achievement`（`RARITY_CONFIG`、`CATEGORY_CONFIG`）。
- 邏輯來源：`useAchievementStore`（既有 selector 與 `claimAchievement`）。
- UI 狀態（留在 `Achievements.tsx`）：`selectedCategory`、`filter`、`search`、`selectedId`（Modal 開關＝`selectedId != null` 或獨立 `modalOpen`）、漸進載入 `visibleCount`。
- 「最稀有已達成徽章」計算：在已達成集合中依稀有度（legendary→common）取最高者，供 `HallBanner` 聚光。

## 6. 互動與狀態

- **卡片三態**：
  - 已達成（completed/claimed）：全彩徽章＋稀有度光暈；已領取顯示已領標記。
  - 進行中（in_progress）：半亮＋底部進度條（`getCompletionPercentage`）。
  - 未解鎖（locked）：剪影（去彩、暗化）＋鎖標。
  - 隱藏/秘密（hidden/secret 且未達成）：問號徽章，名稱顯示「???」、描述隱藏。
- **領取**：達成未領取時，卡片與 Modal 皆可領取，呼叫 `claimAchievement(id)`。
- **鍵盤**：圖鑑層 `←/→` 切換選中卡；Modal 開啟時 `←/→` 切上/下一個成就、`ESC` 關閉（沿用既有鍵盤模式，注意輸入框聚焦時不攔截）。
- **空狀態**：篩選/搜尋無結果時顯示提示與「清除條件」。

## 7. 視覺語言

- 深色基底（沿用 `SceneShell` accent，建議 `warning`/金調）＋**金色殿堂點綴**（HallBanner、達成光暈）。
- 稀有度色彩一律取自 `RARITY_CONFIG[rarity].color`（common 灰 / uncommon 綠 / rare 藍 / epic 紫 / legendary 金），驅動徽章框、光暈、進度色。
- 類別圖示取自 `CATEGORY_CONFIG[cat].icon`（皆為 SVG）。
- 動效：framer-motion 進場、卡片 hover 微縮放、Modal 聚光淡入、領取鈕掃光；尊重 `reduced-motion`。

## 8. 效能

- 成就數量多：以**章節分段**渲染，整體採漸進載入——**沿用既有 `PAGE_SIZE`（100）＋「載入更多」按鈕**模式（低風險、與既有 UX 一致；不採無限捲動）。
- `useMemo` 快取篩選/搜尋/分段結果；卡片以 `id` 當 key，`AnimatePresence` 控制進出。

## 9. 檔案異動與遷移

**新增**：`achievement-codex/{CodexTopBar,HallBanner,CodexChapters,CodexGrid,CodexCard,CodexDetailModal,index}.tsx`。
**移動**：`AchievementBadge.tsx`、`CircularProgress.tsx`、`conditionLabels.ts` → `achievement-codex/`。
**重寫**：`src/components/scenes/Achievements.tsx`（改用新元件）。
**刪除**（遷移完成後）：`achievement-system/` 其餘檔案（`AchievementTopBar / AchievementCategoryChips / AchievementHero / AchievementWall / AchievementCard / AchievementFilterBar / AchievementNextUp / AchievementStatsDashboard / AchievementHeader / index.ts`）。
**不動**：store、data、types、tracking、`ui/AchievementNotification.tsx`。

> 實作前須再次確認 `achievement-system/` 諸元件無外部引用（目前掃描僅內部互引與 `Achievements.tsx`）。

## 10. 驗證標準

- `npx tsc --noEmit`：本次改動**零新增型別錯誤**（既有 8 個非中文語系 locale 錯誤與本任務無關）。
- `npx vite build`：成功打包。
- `ReadLints`：受影響檔案無 lint 錯誤。
- 每個新檔 **< 888 行**。
- 手動檢查點：四種卡片狀態正確、隱藏/秘密遮蔽、領取流程、鍵盤切換、空狀態、章節完成度數字一致。

## 11. 風險與回滾

- 風險：本專案非 git 倉庫，無版本快照 → 刪除舊資料夾前先確認無外部引用、且新介面通過建置。
- 回滾：保留舊 `achievement-system/` 直到新介面驗證通過後才刪除（分階段：先新增＋重寫 `Achievements.tsx` 並通過 build，再刪舊檔）。
