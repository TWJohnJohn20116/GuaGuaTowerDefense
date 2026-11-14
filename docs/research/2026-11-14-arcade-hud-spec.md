# CANDY POP 設計規範（2026-11-14 定案）

> 這是目前唯一的 UI 語言。前兩版（HARDLINE 深色終端、ARCADE 深色霓虹）都已廢除。
> 載入順序：candy.css → tailwind → index.css。

## 1. 為什麼是這個方向

HARDLINE 是軍事終端：扁、克制、零物理回饋。ARCADE 是深色霓虹：那是開發者工具審美。
CANDY POP 的假設是「這是一款要在客廳玩的塔防」：明亮、厚實、好按、看得到笑點。

## 2. 五條不可違反的規則

1. 淺色紙底。介面本體是奶油白 `--cn-paper`，卡片是純白 `--cn-card`。深色只保留給遊戲畫布 / 預覽區。
2. 圓角常態。最小 12px，卡片 20–22px，按鈕 16px。**禁止 0 圓角與 clip-path 切角。**
3. 粗墨線。外框 2–3px `--cn-line`（#2E2440）。1px 細線只允許出現在表格內部分隔。
4. 貼紙投影。深度 = `0 5px 0 墨色` 這種實心位移投影，不是模糊陰影、不是發光。
5. 糖果色語意。珊瑚＝行動/購買、薄荷＝成功/資源、天空＝資訊、鵝黃＝獎勵/選中、葡萄＝稀有、紅＝危險。

## 3. Token

| 用途 | 變數 |
|---|---|
| 紙底 / 內凹 | --cn-paper / --cn-paper-2 |
| 卡片 | --cn-card / --cn-card-2 |
| 墨與字 | --cn-ink / --cn-ink-2 / --cn-ink-3 / --cn-ink-4 |
| 線 | --cn-line / --cn-line-mid / --cn-line-soft |
| 糖果色 | --cn-coral / --cn-mint / --cn-sky / --cn-sun / --cn-grape / --cn-rose / --cn-alert |
| 圓角 | --cn-r-lg 22 / --cn-r-md 16 / --cn-r-sm 12 / --cn-r-pill |
| 線寬 | --cn-bw 2px / --cn-bw-strong 3px |

舊的 `--arc-*` 已是別名（指向 cn），程式碼不必改名；新程式碼一律用 `--cn-*`。

## 4. 元件 class（candy.css 提供）

| class | 外觀 |
|---|---|
| arc-panel | 白卡 + 3px 墨框 + 22px 圓角 + 貼紙投影 |
| arc-panel--flat | 白卡 + 2px 軟線 + 16px 圓角，無投影 |
| arc-panel--sunken | 桃色內凹卡 + 3px 軟線 |
| arc-panel--active | 珊瑚軟底 + 珊瑚框 + 雙層投影 |
| arc-btn | 白色厚鍵，3px 墨框，底部 4px 墨色投影 |
| arc-btn--gold / --cyan / --danger | 珊瑚 / 天空 / 紅 實心鍵 |
| arc-chip | 膠囊標籤，選中＝鵝黃軟底 |
| arc-switch | 52×30 膠囊開關，開＝薄荷 |
| arc-field | 白底內凹輸入框 |
| arc-num | 深墨粗等寬數字，無發光 |
| arc-label | 11px / 800 字重 / 深灰 |
| arc-title | 20px / 900 字重 |
| arc-divider | 3px 圓頭軟線 |

## 5. 版面通則

- 頁面主體：`p-4` + `gap-3`～`gap-4`，卡片之間至少 12px。
- 場景頂列：68–70px 高、獨立圓角厚卡（不是貼視窗上緣的橫條）。
- 側欄：236px、卡片內距 8px、每個選項是一顆圓角膠囊。
- 清單：每列要嘛是獨立卡片，要嘛用 3px 軟線分隔；不要 1px 細線密排。
- 空狀態：`Empty` 元件（大 emoji + 標題 + 說明）。

## 6. 禁止

- 玻璃模糊（backdrop-blur）、霓虹發光（shadow 0 0 …）、網格背景、掃描線。
- `rounded-[2px]` 這類小圓角；`clip-path` 切角。
- 深色面板底（#0a0c10 / #1a1d24 …）出現在介面層；只有 canvas / 預覽畫布可以深色。
- 淺色主題上使用 `text-white` 或 `-300`/`-400` 的淺色字。

## 7. 檔案位置

- 語言層：`src/styles/candy.css`（token + primitives）。
- 入口：`src/styles/index.css`（全域 base + 舊語意 class + keyframes）。
- 基礎元件：`src/components/hl/*`（Deck / Btn / Chip / Toggle / TopBar / Rail / Meter / Num / Field / Dot / SegHead / Key / Empty / StatCell）。
- Tailwind：`tailwind.config.js`，圓角尺度 12–26px，陰影全部是硬投影。