# HARDLINE · 硬線介面規格

> 建立：2026-11-09
> 狀態：**取代** `2026-09-08-nordic-ui-unification.md`。那份不再是標準，不要再照它改。
> 這份文件是之後所有介面改動的唯一依據。跟它衝突的樣式直接刪，不要留例外。

## 一句話

圓角是 0，裝飾是 1px 線，強調色只有一種酸性黃綠。面板像鋼板不像玻璃，按鈕像標籤不像糖果。

## 一、顏色

| Token | 值 | 用途 |
| --- | --- | --- |
| `--hl-void` | `#06070a` | 全畫面底 |
| `--hl-void-2` | `#080b0f` | 下沉區（畫布外框、輸入框底） |
| `--hl-deck` | `#0c0e12` | 面板 |
| `--hl-deck-2` | `#12151b` | 次級面、hover 底 |
| `--hl-deck-3` | `#191d25` | 按鈕底、浮起 |
| `--hl-deck-4` | `#20252e` | 最高層（極少用） |
| `--hl-line` | `#222831` | 1px 結構線（預設） |
| `--hl-line-strong` | `#333b47` | 互動元件邊 |
| `--hl-line-hot` | `#4a5462` | hover 邊 |
| `--hl-ink` | `#eceff2` | 主文字 |
| `--hl-ink-2` | `#a7afba` | 次文字 |
| `--hl-ink-3` | `#6c7480` | 標籤、說明 |
| `--hl-ink-4` | `#4a515b` | 裝飾、編號 |
| `--hl-signal` | `#d9ff3f` | **唯一強調色**：主行動、選中、金錢 |
| `--hl-signal-ink` | `#0a0b06` | 訊號色上的字 |
| `--hl-vital` | `#38e08f` | 生命、成功、完成 |
| `--hl-alarm` | `#ff4b3e` | 危險、出售、失敗 |
| `--hl-caution` | `#ffb627` | 警告、待領取 |
| `--hl-reach` | `#6fa8ff` | 射程、資訊、稀有度 |

**硬性規則**

- 一頁最多一個訊號色面積很大的元素（主按鈕或選中列）。不要整頁發光。
- 資料色只用來標記資料狀態，不准拿來當場景主題色。
- 禁止：漸層背景、`bg-gradient-*`、彩虹邊、`text-transparent bg-clip-text`。
- 禁止：`backdrop-blur`、`shadow-*`、任何發光 `box-shadow`。

## 二、形狀

- 圓角一律 **0**。`tailwind.config.js` 已把 `borderRadius` 全部映射到 0，`shadow` 全部映射到 none。
- **兩種切角，別無其他**：
  - `.hl-cut-tl` / `<Deck notch>`：面板左上 10px 切角
  - `.hl-btn-cut`：按鈕右下 6px 切角
- 用途限制：切角只放在**不會被 popover 撐破**的容器。有下拉選單的面板用 `Deck` 但不開 `notch`。

## 三、字

| 角色 | 規格 |
| --- | --- |
| 畫面主標 | 26px / 700 / `-0.015em` |
| 區塊標題 | 17px / 600 |
| 內文 | 13px / 400 / `--hl-ink-2` |
| 次文 | 11px / `--hl-ink-3` |
| 標籤 | mono 10px / uppercase / `0.08em` / `--hl-ink-3` |
| 數值 | mono / tabular-nums / 600 |

- 數值一律等寬（`.hl-num`、`<Num>`、`font-mono`）。任何會變動的數字都要 tabular。
- 標籤用小寫語意 + mono，**不要** 9px 全大寫 `tracking-widest` 當裝飾。
- 圖示只用 SVG（`@/components/ui/Icons`），不用 emoji 當結構元素。

## 四、五種版面（沒有第六種）

新畫面先對表挑一種，再寫 JSX。

### 1. `Home` — 只有主選單
左 340px 識別欄（標題、戰役進度、資源、主行動），右側索引列（`IndexRow` 01…N）。
底部一條 telemetry：版本、存檔、線上狀態。沒有外層大盒子。

### 2. `Page` — 單欄次頁
`TopBar` 52px（返回 + 標題）→ 內容 `max-w-[1080px]`，左右 24px。
用於：更新日誌、教學、戰績、紀念堂、成就、結算、勝利、失敗。

### 3. `Console` — 頂列 + 左軌 + 主區
`TopBar` → `flex`：`Rail` 212px（mono 編號 + 名稱）＋ 主區（`--hl-void`，可帶右側詳情 336–376px）。
用於：設定、圖鑑、商店、皮膚、選地圖、每日／突變、回放、工坊、Mod 管理／編輯、地圖編輯、天賦。

### 4. `Theater` — 對局
全幅畫布。上下各一條 HUD 帶（`h-11`，方塊分格，mono 數值）。右側塔塢／檢視用 `Deck` 浮在畫布上，不佔版面。
2D / 3D 共用同一套 HUD，只換畫布。

### 5. `Modal` — 蓋層
`bg-[rgba(6,7,10,0.82)]` 遮罩 + 一張置中 `Deck notch`（寬 340–460）。
按鈕直向全寬，主行動 `Btn variant="signal"`。
用於：暫停、對話、互動教學、Boss 警告、合體橫幅、成就通知、更新通知、載入、確認框。

## 五、元件契約

一律從 `@/components/hl` 匯入：

```ts
import { Deck, SegHead, Rule, StatCell, Key, Empty,
         Btn, Chip, IndexRow, Toggle,
         TopBar, BackKey, Rail, RailItem, Crumbs,
         Meter, Segments, Num, Field, Dot } from '@/components/hl';
```

| 元件 | 規定 |
| --- | --- |
| `TopBar` | 全專案唯一頂列。52px。`back` 給 `{}` 就有返回鈕，`back={false}` 才沒有 |
| `BackKey` | 唯一返回外觀。`BackButton`（舊名）已轉接給它 |
| `Rail` / `RailItem` | 唯一左軌。選中＝左緣 2px 訊號條 |
| `Deck` | 唯一面板。`tone` 選層級，`notch` 才切角 |
| `Btn` | 唯一按鈕。`variant`: signal / line / ghost / danger / quiet |
| `Chip` | 篩選與分頁 |
| `IndexRow` | 主選單與清單列 |
| `Meter` / `Segments` | 進度條。分段式優先（波次、星等、難度） |
| `Num` / `Field` / `StatCell` | 數值與欄位，全部 mono |
| `Empty` | 空狀態 |

## 六、舊類別的處理

`SCENE_GLASS`、`SCENE_BROWSE`、`SCENE_TYPOGRAPHY`、`btn-game`、`panel`、`tower-btn` 這些名字**保留**，內容已全部改寫成 HARDLINE。
新寫的程式碼**不要**再用它們，直接用 `hl` 元件與 `var(--hl-*)` token。

機械化掃描腳本：`node scripts/hardline-pass.mjs [--apply]`，處理 `bg-white/*`、`border-white/*`、`backdrop-blur`、`shadow-*`、`text-white*`。

## 七、驗收清單（每個畫面都要過）

1. 圓角是否全部為 0？切角方向是否只有左上／右下？
2. 有沒有 `backdrop-blur`、`shadow-*`、漸層？
3. 強調色是否只有一種（`--hl-signal`）？有沒有冒出第二個主色？
4. 所有數字是否等寬？
5. 標籤是否 mono 10px？
6. 頂列是否用 `TopBar`？返回鈕是否是 `BackKey`？
7. 左軌是否用 `Rail`？選中是否只有左緣訊號條？
8. 按鈕是否用 `Btn`？有沒有自己畫的按鈕？
9. 文案是否全部走 i18n？有沒有新增硬編碼中文？
10. `npx tsc --noEmit` 沒有新增錯誤？
