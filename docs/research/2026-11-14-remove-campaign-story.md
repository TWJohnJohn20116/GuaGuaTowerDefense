# 移除戰役任務與劇情模式（2026-11-14）

## 範圍裁定

「劇情模式」在本專案 = 戰役章節的敘事內容（章節資料 + 戰前對話 + 章節旁白），
沒有獨立的 story 模式開關（grep 到的 `story` 幾乎都是 `history` 的誤命中）。
因此本次一併移除整個 campaign 系統。

## A. 直接刪除的檔案

| 群組 | 檔案 |
|---|---|
| 章節資料 | `src/data/campaignData/**`（chapter1–17、chapterNLevels/*、utils.ts，共 100+ 檔） |
| 型別 | `src/types/campaign.ts` |
| 狀態 | `src/store/campaignStore.ts` |
| 計算 | `src/utils/campaignStars.ts`、`src/utils/campaignRewards.ts` |
| 文案 | `src/data/campaignFailCopy.ts`、`src/i18n/campaignSpeakerUtils.ts` |
| 元件 | `src/components/scenes/campaign-end/**`（3 檔） |
| 元件 | `src/components/scenes/path-selection/CampaignDetail.tsx`、`CampaignList.tsx`、`CampaignProgressBanner.tsx` |
| 測試 | `src/test/campaignRewards.test.ts`、`src/test/campaignFailCopy.test.ts`、`src/test/protocolAndChapter.test.ts` |

## B. 需要改寫的消費端

| 檔案 | 動作 |
|---|---|
| `scenes/PathSelection.tsx` | 移除 campaign 分類（只留 advanced / mod）、移除 CampaignDetail/CampaignList 匯入與分支、移除 campaignStore 取值 |
| `scenes/GameOver.tsx`、`Victory.tsx` | 移除 campaign 面板與 campaign store 取值，只留一般戰役結果 |
| `scenes/GameScene.tsx` | 移除 campaign 相關選圖/章節參數 |
| `scenes/game-scene/useGameSceneEffects.ts` | 移除章節完成回報 |
| `scenes/main-menu/MenuHomeRail.tsx` | 移除章節／星數區塊（改成一般統計） |
| `ui/DialogueOverlay.tsx` | 移除 campaign 對話來源，僅保留教學／提示用途（若無其他來源則整個移除） |
| `ui/pause/PauseMainGoals.tsx`、`PauseSessionPanel.tsx`、`PauseWaveEconomy.tsx` | 移除 campaign 獎勵與章節目標 |
| `store/achievementStore.ts` | 移除 campaign 條件 |
| `store/gameStore.ts` | 移除 campaign 進度同步 |
| `data/achievements/*` | 移除引用 campaign 的成就條目（否則永遠無法達成） |

## C. i18n

- 10 個語系檔的 `pathSelection.campaign.*`、`mainMenu.campaign*`、`campaign.*` 段全數移除
- 先改 `zh-TW.ts`（型別由此推導），再跑 `npm run i18n:check --strict` 確認沒有孤兒鍵
- `src/i18n/fileMetaExtraLabels.ts` 若含 campaign 標籤一併移除

## D. 連帶影響（要一起處理，否則留死引用）

- `src/types/game.ts`：若 `GameScene` 或存檔欄位含 campaign 進度，移除
- `src/store/matchState.ts` / `statsStore.ts` / `replayStore.ts` / `placementHistory.ts`：grep 到的 campaign 欄位要清
- `src/data/memorialData.ts`、`src/data/replayRestart.ts`、`src/data/dailyChallengeKeyboardNav.ts`：只提到 campaign 文字者保留，引用模組者改寫
- `src/components/changelog/parsers.ts`：只是 changelog 文字，保留

## E. 驗收（缺一不可）

1. `grep -rn 'campaignData\|campaignStore\|types/campaign\|campaignStars\|campaignRewards\|campaignFailCopy' src` → 0
2. `grep -rn 'useCampaignStore' src` → 0
3. `npm run i18n:check` 通過、無孤兒鍵
4. `node scripts/ci/guards.mjs --debt` 全綠（移除不得新增 any / 死 export）
5. `gh run watch` 等 CI：typecheck 必須 0 error（這是唯一能證明沒有斷引用的手段，本機不編譯）
6. 手動確認：主選單不再有戰役入口；選擇路徑只剩「進階地圖 / Mod 地圖」；結算畫面沒有章節面板

## F. 執行順序

1. 先改消費端（B），讓引用歸零
2. 再刪檔案（A）
3. 最後清 i18n（C）與測試
4. push 等 CI 判型別 —— 這種刪除沒有 CI 就等於沒驗證