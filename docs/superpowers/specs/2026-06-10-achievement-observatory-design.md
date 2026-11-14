# 成就觀測站設計（B 數據儀表盤 + C 星空視覺 + A 目標軌道）

日期：2026-06-10
狀態：已獲用戶方向批准（「BC 還有一點點 A 的元素」）

## 目標

完全重做成就介面框架，取代「圖鑑殿堂」（achievement-codex）：以數據儀表盤為骨架（B）、星空收集為視覺語言（C）、「即將達成」軌道為目標驅動元素（A）。

## 佈局（v2 · 原神式雙欄，2026-06-10 用戶追加要求）

```
Header：返回 + 成就系統標題（SceneShell.Header，紫色 accent）
┌──────────────┬──────────────────────────────────────┐
│ CategorySidebar│ RarityStrip：星等分布緊湊橫條          │
│ ・總進度頭卡   │ NextTargetsRail（A）：即將達成軌道 ×6  │
│   完成率環+總數│ StarList（B+C）：                     │
│   點數/待領取  │   搜尋框 + 狀態篩選 chips             │
│ ・[全部]      │   星點行（未完成在前、已完成沉底）       │
│ ・15 分類豎列  │   點行展開：條件/獎勵/領取             │
│   各帶 x/y +  │   分頁 60 行 + 載入更多               │
│   迷你進度條   │                                      │
└──────────────┴──────────────────────────────────────┘
窄屏（< lg）：左欄變橫向滾動卡片行，右欄堆疊在下。
排序：in_progress > locked > completed > claimed；同組內稀有度高→低。
```

## 元件結構（每檔 < 888 行）

| 檔案 | 職責 |
|---|---|
| `scenes/Achievements.tsx` | 編排器：狀態管理、資料過濾、分布/目標計算 |
| `achievement-observatory/observatoryShared.tsx` | StarPoint 星點 SVG、isEarned、RARITY_ORDER、篩選類型 |
| `achievement-observatory/ObservatoryStats.tsx` | 觀測數據區三塊 |
| `achievement-observatory/NextTargetsRail.tsx` | 即將達成軌道 |
| `achievement-observatory/StarList.tsx` | 工具列 + 類別 tab + 星點行 + 展開詳情 + 分頁 |
| `achievement-observatory/conditionLabels.ts` | 條件類型 → 中文標籤（自 codex 遷移） |
| `ui/CircularProgress.tsx` | 圓形進度環（自 codex 升級為通用 UI 模組） |

## 資料流

- 全部讀 `useAchievementStore`：`getAchievementStatus / getAchievementProgress / getCompletionPercentage / getStats / claimAchievement`
- 訂閱 `playerAchievements` 保證領取後即時刷新
- 「即將達成」= 非 hidden/secret、未達成、0 < pct < 100，按 pct 降序取 6
- secret/hidden 未達成 → 名稱與條件顯示「？？？」

## 視覺

- SceneShell accent purple、56 粒子營造星空
- 星點 = 四角星 SVG，達成時帶稀有度色 drop-shadow 光暈
- 全 SVG 圖標零表情符號；毛玻璃卡片延續全局語言

## 取代關係

- 舊 `achievement-codex/`（11 檔）全部斷開引用，待用戶確認後刪除
- 詳情彈窗（CodexDetailModal）被行內展開取代
