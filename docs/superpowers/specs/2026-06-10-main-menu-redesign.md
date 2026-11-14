# 主選單重做設計（Bento 儀表盤 + 啟動器左欄混搭）

日期：2026-06-10
狀態：已獲用戶方向批准（「A 摻 B」）

## 目標

完全重做主選單框架：從「左標題右網格」雙欄改為「品牌欄 + Bento 儀表盤」結構，補上缺失的每日挑戰入口，消除硬編碼文案，全部資料徽章實時化。

## 佈局

```
┌──────────────┬──────────────────────────────────┐
│ 品牌欄(B元素) │  Bento 網格（A 主體，4 列）         │
│              │  ┌───────────┬─────┬─────┐       │
│ 版本 chip     │  │ 每日挑戰(2) │天賦  │商店  │       │
│ 大標題        │  ├───────────┼─────┼─────┤       │
│ 副標題        │  │ 成就(2)    │皮膚  │圖鑑  │       │
│ 狀態 chips×4  │  ├───────────┼─────┼─────┤       │
│              │  │ 工坊(2)    │回放  │紀念碑│       │
│ ▶ 開始遊戲    │  └───────────┴─────┴─────┘       │
│ (大 CTA)     │                                  │
│ ────────     │                                  │
│ 教學|日誌|設定 │                                  │
└──────────────┴──────────────────────────────────┘
```

窄屏（< lg）：縱向堆疊，品牌欄在上、網格在下，SceneShell 可捲動。

## 元件結構（每檔 < 888 行）

| 檔案 | 職責 |
|---|---|
| `scenes/MainMenu.tsx` | 入口：組合左右欄、mount 時 `refreshIfNeeded()` 刷新每日挑戰（App.tsx import 路徑不變） |
| `scenes/main-menu/MenuBrandPanel.tsx` | 左欄：版本、標題、狀態 chips（總星數/總出戰/金幣/天賦點）、開始 CTA、次要鏈接（教學/更新日誌/設定） |
| `scenes/main-menu/MenuBentoGrid.tsx` | 右欄：9 張功能卡的 bento 網格，含實時資料徽章 |

## 資料來源

| 徽章 | 來源 |
|---|---|
| 總星數 | `useCampaignStore.levelStars` 加總（useMemo） |
| 總出戰 / 金幣 | `useShopStore.totalGamesPlayed / coins` |
| 天賦點 | `useTalentStore.talentPoints` |
| 每日挑戰狀態 | `useDailyChallengeStore.todayChallenge.completed` + `currentStreak` |
| 成就進度 | `useAchievementStore.playerAchievements`（completed/claimed 計數）÷ `ALL_ACHIEVEMENTS.length` |

## 文案

全部走現有 i18n key（`t.mainMenu.*`、`t.dailyChallenge.title/streak/completedTag`、`t.memorial.title`、`t.replay.title`、`t.workshop.title`），**不新增 key**（完整 i18n 之後統一做）。紀念碑不再硬編碼。

## 視覺

- 延用 `SceneShell`（accent default、粒子、網格紋理）
- 卡片延續毛玻璃 + `rounded-[2rem]` 設計語言；各卡按功能配 accent 色（每日挑戰=琥珀、天賦=綠、商店=黃、成就=紫、皮膚=粉、圖鑑=藍、工坊=青）
- SVG 圖標全部來自 `ui/Icons.tsx`，零表情符號
- framer-motion stagger 入場、hover 微縮放，與舊版動效節奏一致

## 錯誤處理

- `todayChallenge` 為 null（首次啟動）→ 顯示「開始挑戰」引導態
- 成就 0 解鎖 → 進度條 0% 正常顯示

## 測試

- `tsc --noEmit` 全綠 + `vite build` 成功
- 手動驗證 13 個入口跳轉正確
