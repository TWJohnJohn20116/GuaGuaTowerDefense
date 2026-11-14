# 音效（SFX）

## 本地檔案（優先）

| 檔案 | 用途 |
|------|------|
| `basic_shoot.wav` | 基礎塔射擊 |
| `machine_shoot.wav` | 機槍塔 |
| `sniper_shoot.wav` | 狙擊 / 弩炮 |
| `cannon_shoot.wav` | 加農炮 / 技能 |
| `enemy_hit.wav` | 受擊 |
| `enemy_death.wav` | 死亡 |
| `coin_collect.wav` | 建造 / 升級 |
| `wave_start.wav` | 波次 / 勝利 |
| `pause.wav` | 暫停 |
| `button_click.wav` | UI 點擊 |
| `button_hover.wav` | UI 懸停 |
| `game_over.wav` | 失敗 |
| `error.wav` | 漏怪 |

## API 自動下載（無本地檔時）

設定 `VITE_FREESOUND_API_KEY` 後，從 [Freesound](https://freesound.org) 下載 preview 音效並快取。詳見 `env.example`。
