# CANDY 元件收斂規範（2026-11-14）

> 目的：把散落在 className 字串裡的樣式，收斂回共用元件，讓同一個外觀只有一個實作。
> 背景數據：`arc-panel` 手寫 187 處、`arc-num` 手寫 199 處、原生 `<button>` 195 處、原生 `<input>` 66 處。

## 0. 硬限制

1. 只准改 JSX 標籤與 className，**不准改邏輯、props 名稱、事件處理、i18n key、檔案路徑、export**。
2. 只能用 `tools.edit` / `tools.write` 改檔；禁止 shell / node / sed。
3. 禁止執行 npm / npx / tsc / vite / vitest。
4. 轉換後如果 props 對不上、或你不確定語意，**跳過並回報**，不要硬轉。
5. 每個檔案改完，import 必須同步補上或更新（從 `@/components/hl` 匯入）。

## 1. 可用元件（全部從 `@/components/hl` 匯入）

| 元件 | 簽名 |
|---|---|
| `Deck` | `{ children, className?, tone?: 'base'\|'sunken'\|'raised'\|'bare', active?, as? }` |
| `Num` | `{ value, unit?, tone?: 'ink'\|'signal'\|'vital'\|'alarm'\|'caution'\|'reach'\|'muted', size?: 'sm'\|'md'\|'lg', className? }` |
| `Btn` | `{ variant?: 'signal'\|'line'\|'ghost'\|'danger'\|'quiet', size?: 'sm'\|'md'\|'lg', block?, icon?, kbd?, ...button props }` |
| `IconBtn` | `{ label: string, children, ...button props }` — 圖示鍵專用，無立體厚邊 |
| `Chip` | `{ active?, onClick?, icon?, children }` |
| `Input` | `{ invalid?, ...input props }` — 原生 input 全屬性直通 |
| `Field` | `{ label, children, hint? }` |
| `StatCell` | `{ label, value, unit?, tone? }` |
| `SegHead` | `{ label, right?, className? }` |
| `Empty` | `{ title, hint?, action?, className? }` |

## 2. 任務 1：面板 → `<Deck>`

判定：任何 `<div>` / `<section>` / `<aside>` 的 className 含 `arc-panel`。

```diff
- <div className="arc-panel p-4 flex flex-col gap-2">…</div>
+ <Deck className="p-4 flex flex-col gap-2">…</Deck>
```

- `arc-panel` 從 className 移除（Deck 自帶）。
- 若含 `arc-panel--active` → 改用 `active` prop，並移除該 class。
- 若含 `arc-panel--sunken` / `--flat` → `tone="sunken"`，或直接用 `Deck` 加回該 class（`--flat` 沒有 tone，用 className 保留）。
- 原標籤若是 `section`/`aside` 且沒有 semantic 需求衝突，可用 `as="section"` / `as="aside"` 保留語意。
- **不要**轉換：`absolute`／`fixed` 定位的浮層（tooltip、popover、dropdown），它們依賴 precise 定位 class，改用 Deck 會多一層節點。這類保留原 div + class。

## 3. 任務 2：數值 → `<Num>`

判定：`<span>` 的 className 含 `arc-num`。

```diff
- <span className="arc-num text-[15px] text-[var(--arc-gold)]">{coins}</span>
+ <Num value={coins} tone="signal" size="md" />
```

tone 對照（看 className 裡的顏色）：

| 原 class | tone |
|---|---|
| `--arc-gold` / `--cn-coral` | `signal` |
| `--arc-vital` / `--cn-mint*` | `vital` |
| `--arc-alert` | `alarm` |
| `--arc-caution` / `--cn-sun*` | `caution` |
| `--arc-reach` / `--cn-grape*` | `reach` |
| `--arc-ink-3` / `--arc-ink-4` | `muted` |
| 其他（`--arc-ink`） | `ink` |

size 對照（看字級）：≥20px → `lg`；≤12px → `sm`；其餘 → `md`。

- 其餘排版 class（`truncate`、`ml-1`、`w-8`…）用 `className` 傳入，不要丟。
- 若內容不是單純變數而是複雜 JSX（例如含兩個 span 拼接），保留原 span，跳過。

## 4. 任務 3：輸入框 → `<Input>`

判定：原生 `<input>`（type 為 text / number / search / password）。

```diff
- <input className="arc-field" value={q} onChange={...} placeholder={...} />
+ <Input value={q} onChange={...} placeholder={...} />
```

- 原本的 className 若只有 `arc-field` 或 `arc-input` → 全部丟掉。
- 若有其他排版 class → 用 `className` 保留。
- **不要**轉換：`type="checkbox"`、`type="range"`、`type="color"`、`type="file"`（有專屬外觀元件或原生語意）。

## 5. 任務 4：按鈕 → `<Btn>` / `<IconBtn>`

判定與分流：

| 情況 | 用什麼 |
|---|---|
| 有可見文字標籤的動作鍵（開始、購買、確認、取消、返回、刪除） | `<Btn variant size>` |
| 只有圖示、尺寸 ≤40px 的方鍵（關閉、摺疊、上一步、工具列） | `<IconBtn label="...">` |
| 整列可點的清單項／選單列（`w-full text-left`） | **保留原生 button**，不動 |
| 分段控制器的選項（tab、難度段、速度段） | **保留原生 button**，不動 |
| 整塊卡片可點（卡片本身是 button） | **保留原生 button**，不動 |

variant 對照：

| 原 class 特徵 | variant |
|---|---|
| `arc-btn--gold` / 珊瑚底 / 主要行動 | `signal` |
| `arc-btn--danger` / 紅底 | `danger` |
| `arc-btn--ghost` / 透明底 | `ghost` |
| 有邊框、白底 | `quiet`（預設）或 `line` |

size 對照：`h-9` 以下 → `sm`；`h-10`／`h-11` → `md`；`h-12` 以上 → `lg`。

## 6. 收尾驗證（每個代理都要做）

1. `grep -c 'arc-panel'`／`arc-num` 在你的範圍內應該大幅下降（浮層與複雜案例除外）。
2. 每個改過的檔都要能通過肉眼檢查：標籤成對、props 完整、import 有補。
3. 回報：改了幾個檔、每檔一行、跳過的檔案與原因。