# 背景音樂（BGM）

## 本地檔案（優先）

將 `.ogg` 放在此目錄即可覆蓋 API 來源。

| 檔案 | 用途 |
|------|------|
| `menu.ogg` | 主選單等選單場景 |
| `battle.ogg` | 戰鬥中 |
| `victory.ogg` | 勝利結算（短曲） |
| `defeat.ogg` | 失敗結算（短曲） |

## API 自動下載（無本地檔時）

設定 `VITE_JAMENDO_CLIENT_ID` 後，遊戲會從 [Jamendo](https://www.jamendo.com) 搜尋 CC 授權音樂，下載至 IndexedDB 快取。詳見專案根目錄 `env.example`。
