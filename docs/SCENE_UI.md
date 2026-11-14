# Scene 共用 UI

> 路徑：`src/components/ui/`  
> **全介面視覺規格：** `docs/superpowers/specs/2026-09-08-nordic-ui-unification.md`  
> 佈局只准 Home / Page / Split / Battle / Overlay。新畫面先對表再寫。

> 路徑：`src/components/ui/`（規則中的 `src/ui` 指此目錄）

## 快速匯入

```ts
import {
  // 場景殼層
  SceneShell, SceneBrowseFrame, SCENE_GLASS,
  // 設定 / 分組
  SettingRow, SectionGroup, SceneChoiceButton, SceneChoiceRow,
  // 詳情面板
  DetailBlock, DetailHeroSection, DetailRow, DetailCell, DetailSurface,
  // 篩選 chip
  SceneFilterChip,
  // 字級 token
  SCENE_TYPOGRAPHY,
  // 暫停選單
  PauseSections, PauseSessionPanel, PauseSettingsPanel,
} from '@/components/ui';
```

暫停子模組也可從 `@/components/ui/pause` 按需引入。

## 模組對照

| 用途 | 檔案 | 主要匯出 |
|------|------|----------|
| Barrel | `index.ts` | 上方常用元件 |
| 場景殼層 | `SceneWorkshopLayout.tsx` | `SceneBrowseFrame`, `SCENE_GLASS` |
| 詳情區塊 | `SceneDetailParts.tsx` | `DetailBlock`, `DetailHeroSection`, `DetailRow`… |
| 篩選 chip | `SceneBrowseParts.tsx` | `SceneFilterChip` |
| 選項按鈕 | `SceneChoiceParts.tsx` | `SceneChoiceButton`, `sceneChoiceClass` |
| 字級 | `SceneTypography.ts` | `SCENE_TYPOGRAPHY.sectionTitle`, `microLabel`… |
| 設定列 | `SettingRow.tsx`, `SectionGroup.tsx` | 設定 Tab / 暫停設定 |
| 暫停 | `pause/index.ts` | 各 Tab 面板與戰況元件 |

## Typography 慣例

- 區塊標題 h4 → `SCENE_TYPOGRAPHY.sectionTitle`
- 小標 / 欄位名 → `SCENE_TYPOGRAPHY.microLabel`
- 輔助說明 → `SCENE_TYPOGRAPHY.microMuted`

## i18n 暫停 key

第二批 key 由 `scripts/add-pause-i18n-batch2.mjs` 注入，前綴 `game.pause*`。設定 Tab 優先複用 `t.settings.*`。

## 新增元件 checklist

1. 優先放 `src/components/ui/` 或 `pause/` 子資料夾
2. 在 `index.ts` / `pause/index.ts` 匯出
3. 硬編碼中文改 `t.game.*` 或 `t.settings.*`
4. 單檔 ≤ 888 行，超過則拆分
