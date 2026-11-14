# 北歐指揮所全介面統一 · 實作計畫

> **面向後續實作：** 規格在 `docs/superpowers/specs/2026-09-08-nordic-ui-unification.md`。只准五種佈局。版本維持 1.2.0。

**目標：** 所有介面共用北歐指揮所語言，看起來像同一個專案。  
**架構：** 先改 token 與殼層（`SCENE_GLASS`、`SceneShell`、`BackButton`），讓已接殼的場景一次變實色北歐；再依 Home → Page → Split → Battle → Overlay 改佈局。  
**技術棧：** React + Tailwind class token、現有 `src/components/ui`、Vitest 字串／契約測試。

## 檔案

| 路徑 | 職責 |
| --- | --- |
| `src/styles/index.css` | CSS 變數改北歐 |
| `src/components/ui/SceneWorkshopLayout.tsx` | `SCENE_GLASS` / `SCENE_BROWSE` 去玻璃 |
| `src/components/ui/SceneShell.tsx` | 單色底、無粒子預設、頂列 56px |
| `src/components/ui/BackButton.tsx` | 唯一返回外觀 |
| `src/components/ui/SceneTypography.ts` | 字級對齊規格 |
| `src/test/nordicUiUnification.test.ts` | 禁止 blur／彩虹殼／全大寫頂列 |
| 各 `src/components/scenes/*` | 後續階段改佈局，本階段不一次重寫 |

工作區不是 git repo，任務結束不 commit。

## 任務 1：契約測試（紅）

**檔案：** `src/test/nordicUiUnification.test.ts`

讀 `SceneWorkshopLayout.tsx`、`SceneShell.tsx`、`BackButton.tsx`：

- `SCENE_GLASS` 字串不得含 `backdrop-blur`
- `SceneShell` 預設不得掛 `ParticleField`（`showParticles` 預設 false）
- `BackButton` 根 class 不得含 `tracking-widest uppercase`

驗證：`npx vitest run src/test/nordicUiUnification.test.ts` 先失敗。

## 任務 2：Token 與殼（綠）

把玻璃 class 換成 `rounded-[10px] border border-[#3d4a5c] bg-[#1c2430]` 一系。  
SceneShell 底 `#0b0d11`，拿掉雙光暈；Header 用預設 BackButton。  
BackButton 改實色邊框、正常字重。

驗證：上述測試通過；再 `npx vitest run` 全綠。

## 任務 3 之後（不在本提交一次做完）

依規格清冊：主選單 Home → Page 場景 → Split 場景 → Battle HUD → Overlay。  
每改一類就對規格表打勾，並維持單檔 ≤ 888 行、返回鈕只走 `BackButton`。
