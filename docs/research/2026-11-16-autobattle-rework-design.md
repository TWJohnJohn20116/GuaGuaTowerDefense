# AI 自動戰鬥全面重做 — 設計文件

> 日期：2026-11-16 · 狀態：設計定案（需求已由使用者逐題確認）
> 範圍：決策引擎 + 執行層 + 記錄層 + 可視化 UI + 配置層，舊 `gameStoreAutoBattle.ts`（1,016 行）廢棄。

## 1. 需求定案摘要

| 項目 | 決定 |
|---|---|
| 重寫範圍 | 全部重寫：引擎 + 狀態 + 可視化 UI；舊檔刪除 |
| 決策內核 | 效用評分（Utility AI）：每個候選動作算分取最高，分數表即為可視化 |
| 可視化 | 決策時間軸、候選評分表、戰區疊加層、資源曲線、內心獨白、回放／乾跑（六項全要） |
| 配置 | 分層：預設檔 → 滑桿微調 → 完整權重表，**加上**可視化規則編輯器 |
| 運行模式 | 五個可切換模式：教練（AI 主導可接管）／建議（只出建議）／分區／階段／全自動+報告 |
| 思考顯示 | 一句結論 + 展開完整推理（預設收合） |
| 契約 | 允許改 `gameStoreTypes.ts`，舊欄位可移除；存檔舊設定唯讀相容一版 |
| 模擬器 | `workshop/playtest` 與實戰共用同一顆引擎 |
| 節奏 | 事件驅動 + 前瞻，保留 200ms 兜底輪詢 |
| 驗收 | 固定種子模擬對局、經濟效率、決策品質（抖動／空轉）三項都要，且進 CI |
| 交付 | 一次做完再一起驗（單一分支），但 commit 仍按語意單位拆 |

## 2. 九個症狀 → 機制對照（驗收清單）

| # | 症狀 | 機制 |
|---|---|---|
| 1 | 放塔位置爛（重疊／離路太遠／卡要道） | 選點用「路徑覆蓋格數 × 威脅加權」網格評分，並硬性排除與既有塔重疊、占路、遮斷唯一通道 |
| 2 | 不會等錢（有錢就花／該花不花） | 金錢保留曲線 + 前瞻：以「下兩波預期壓力」推導 reserve，`tempo` 因子控制支出節奏 |
| 3 | 不會賣／不會換陣 | 賣塔候選與放塔同場競爭，用「邊際 DPS/覆蓋損失」計分；賣後進入 12s 重建冷卻 |
| 4 | 升級優先序錯 | 升級候選以「每金錢邊際 DPS／覆蓋增益」正規化，集中灌主塔 |
| 5 | 技能亂放 | 技能候選評分含「時機」（即將漏怪／大量聚怪／首領在射程），閾值隨壓力動態調整 |
| 6 | 無視敵人特性 | `typeMatch` 因子讀敵人能力旗標（flying／armorValue／shield／stealth／healer／jammer…）對位塔效果 |
| 7 | 決策抖動（買賣反覆） | 猶豫機制：同一動作 N 秒內重複 → 扣分；決策採「需領先第二名 X 分」才執行 |
| 8 | Boss／大波次反應不及 | 前瞻層讀下一波組合，提前 1 波調高 `threatFit`／`typeMatch` 權重 |
| 9 | 決策太慢或太頻繁 | 事件驅動觸發（敵人現身／金錢跨門檻／波次開始／塔受威脅／漏怪）+ 200ms 兜底；單次決策預算 < 1.5ms |

## 3. 架構

```
src/data/autobattle/            純資料（無 store、無副作用）
  scoreWeights.ts               因子定義、預設權重、正規化常數
  presets.ts                    五個預設檔
  defaultRules.ts               預設硬／軟規則
  typeMatchTable.ts             敵人能力 × 塔效果對位表
src/store/autobattle/           引擎
  types.ts                      所有型別
  context.ts                    一次決策的唯讀快照（world → DecisionContext）
  candidates.ts                 產生候選（放／升／賣／技能／略波／融合）
  scoring.ts                    因子計算與加總
  rules.ts                      硬規則否決／強制、軟規則加減分
  plan.ts                       前瞻（下一波分析、金錢曲線、閾值）
  decide.ts                     排序、猶豫門檻、防抖動、選出唯一動作
  execute.ts                    落地呼叫 store action（含模式與授權檢查）
  narration.ts                  自然語言獨白組裝（i18n key + 參數）
  triggers.ts                   事件驅動判定
  metrics.ts                    資源曲線、fitness 統計
  report.ts                     事後報告生成
  slice.ts                      掛進 gameStore 的 actions（自動戰鬥開關／模式／設定）
src/components/game/autobattle/ UI
  AutoBattlePanel.tsx           主面板（分頁：時間軸／評分／曲線／設定）
  DecisionTimeline.tsx          時間軸（篩選、展開推理）
  CandidateScoreTable.tsx       候選評分表（因子分解）
  NarrationFeed.tsx             內心獨白
  ResourceCurveChart.tsx        資源曲線（純 SVG，不新增依賴）
  ModeSwitch.tsx                五模式切換
  PresetPicker.tsx              預設檔
  WeightSliders.tsx             權重滑桿（分層：常用／全部）
  RuleEditor.tsx                規則編輯器（硬／軟標記）
  ReportModal.tsx               事後檢討報告
  BattlefieldOverlay.tsx        戰區疊加層（威脅熱區、覆蓋缺口、鎖定連線）
```

依賴方向：`data/autobattle` 只依賴 `types`；`store/autobattle` 依賴 data + store 契約；UI 只讀 store。模擬器直接呼叫 `decide()` 與 `execute()` 的無 UI 版本。

## 4. 評分模型

每個候選動作 = `{ kind, target, cost, components[], total }`。

```
total = Σ (normalized_i × weight_i) × presetScale
      + Σ softRuleBonus
      - Σ penalties（抖動、重建冷卻、風險）
```

因子（0..1 正規化，缺項記 0）：

| 因子 | 含意 | 主要用於 |
|---|---|---|
| coverage | 新增／變更後的路徑覆蓋格數（含既有塔重疊折扣） | 放塔 |
| threatFit | 射程內敵人加權威脅（血量 × 進度 × 速度 × 危險係數） | 放塔／技能 |
| typeMatch | 敵人能力與塔效果對位（flying vs 對空、armor vs 破甲、shield vs 破盾、cluster vs 濺射） | 放塔／升級 |
| economyROI | 每 100 金錢的邊際有效 DPS | 放塔／升級／融合 |
| tempo | 花錢時機（前期存錢、波前投資、波中補救） | 全部 |
| reserve | 花完後保留金是否仍高於前瞻 reserve | 全部 |
| synergy | 與現有塔的協同／融合可行性 | 放塔／融合 |
| marginal | 升級相對原塔的邊際增益（等級越高遞減） | 升級 |
| safety | 賣塔造成的覆蓋缺口與風險 | 賣塔 |
| timing | 技能時機（聚怪數／首領／即將漏怪） | 技能／玩家技能 |
| skipSafety | 略波安全性（清空時間、進度、血量） | 略波 |

預設權重（可改）：放塔 `coverage .22 / threatFit .20 / typeMatch .16 / economyROI .14 / tempo .10 / reserve .08 / synergy .10`；升級 `marginal .30 / economyROI .24 / typeMatch .18 / threatFit .16 / reserve .12`；賣塔 `safety .45 / economyROI .25 / tempo .15 / reserve .15`。

## 5. 規則層

```ts
interface AutoBattleRule {
  id: string;
  enabled: boolean;
  hardness: 'hard' | 'soft';   // hard＝否決或強制；soft＝加減分
  when: RuleCondition;         // 波次／金錢／血量／敵人能力／塔數／模式
  then: RuleEffect;            // veto(kind) | force(kind) | bonus(kind, amount) | weight(factor, multiplier)
  note?: string;               // 使用者自己寫的說明
  source: 'preset' | 'user';
}
```

- 硬規則先跑：任何 `veto` 直接把候選標記 `rejectedBy`，UI 顯示「被哪條規則擋掉」——這是「AI 為什麼不動手」的答案來源。
- 軟規則在評分後套用，僅加減分，永不單獨決定動作。
- 規則衝突（同時 force 與 veto）→ 記一筆 `ruleConflict` 警告，force 敗給 veto（保守優先）。

## 6. 決策節奏

```
每幀（既有主迴圈）：triggers.check() → 若 dirty 或 >= 200ms 兜底 → decideOnce()
dirty 來源：敵人首次進入任一塔射程 / 金錢跨越 reserve 或造價門檻 / 波次開始結束 /
            核心血量下降 / 漏怪 / 技能就緒 / 玩家手動操作後 500ms
```

- 每次 `decideOnce` 記錄一筆 `DecisionRecord`（含 top-5 候選與全部因子），UI 直接吃這份資料。
- 決策預算：候選產生上限 120、評分上限 60，超出先粗篩（覆蓋 < 門檻直接丟）。
- 需領先第二名 `minMargin`（預設 0.04）才執行，否則記為 `hold`（顯示「猶豫中」）。

## 7. 五模式

| 模式 | 行為 |
|---|---|
| coach（教練） | AI 執行；玩家動過的塔／格進入 `lockedTargets`，AI 不得覆蓋，UI 標記鎖定 |
| assist（建議） | 只產生建議（`verdict: 'suggested'`），幽靈預覽 + 一鍵採納；不落地 |
| zones（分區） | 玩家劃定允許區域（`allowedTiles`），AI 只在區域內動作 |
| phases（階段） | `aiUntilWave` 之前 AI 執行，之後交還玩家（可隨時切回） |
| full（全自動） | 全自動 + 結束時自動生成報告 |

切換即時生效，記住上次選擇（`autoBattleMode` 進 persist）。

## 8. 存檔與遷移

- 新欄位：`autoBattleMode`、`autoBattlePreset`、`autoBattleWeights`、`autoBattleRules`、`autoBattleDecisions`（上限 300 筆）、`autoBattleCurve`（每波取樣）、`autoBattleLockedTargets`、`autoBattleAllowedTiles`、`autoBattleAiUntilWave`。
- 遷移：讀到舊 `autoBattleStrategy` / `autoBattleConfig` 時**只讀不寫**——映射成對應預設檔（economy→經濟、aggressive→壓制、defensive→穩健、balanced→均衡）與 6 條軟規則，寫入新欄位；下一版移除映射碼。
- 決策記錄有上限並在每波結束時截斷，避免 persist 膨脹。

## 9. 可視化規格

| 元件 | 內容 |
|---|---|
| 時間軸 | 一行一決策：時間／波次／動作／一句結論／分數；可依類型篩選、可展開完整推理、點擊跳到當時快照摘要 |
| 評分表 | 動作 × 位置 × 因子分解（表格 + 分數條），被否決者顯示規則 id 與原因 |
| 疊加層 | 半透明熱區（威脅）、格線覆蓋缺口、選中候選的射程圈與目標連線；可開關 |
| 資源曲線 | 金錢／血量／DPS 覆蓋率，每波取樣，純 SVG |
| 獨白 | 最新一句 + 最近 10 句流；文案走 i18n `content.autoBattle.*` |
| 回放／乾跑 | 乾跑＝assist 模式的常態；回放＝時間軸拖動重播記錄（只重播已記錄資料，不做世界狀態回滾） |
| 事後報告 | 決策時間軸摘要、資源曲線對照、失誤標註（漏怪時段／有錢空轉／塔位重疊／技能浪費）、改進建議（該調哪個權重／換哪個預設） |

## 10. 測試與 CI 斷言

1. `src/test/autobattleScoring.test.ts`：因子正規化邊界、權重總和、規則否決與軟加分。
2. `src/test/autobattleDecide.test.ts`：同輸入同輸出（決定性）、猶豫門檻、防抖動、模式授權（lockedTargets／allowedTiles／phase）。
3. `src/test/autobattleSim.test.ts`：固定種子跑 N 場（fixture 自造 lookup，不依賴平衡數值），斷言：
   - 存活波次 ≥ 舊版基線（舊版邏輯以純函式基線 fixture 重現或記錄期望值）
   - 同波次金錢轉有效 DPS 比 ≥ 門檻
   - 抖動次數 = 0（同目標 10s 內反覆買賣）、空轉時間 ≤ 門檻
4. `src/test/autobattleReport.test.ts`：報告能標出注入的失誤案例。

## 11. 落地順序（commit 計畫）

1. `feat(autobattle): 新增決策型別與預設權重資料`
2. `feat(autobattle): 候選產生與效用評分`
3. `feat(autobattle): 規則層與前瞻`
4. `feat(autobattle): 決策主體（猶豫／防抖／模式授權）`
5. `feat(autobattle): 執行層與記錄層，掛進主迴圈`
6. `feat(autobattle): 面板與時間軸／評分表／獨白`
7. `feat(autobattle): 資源曲線、疊加層、報告、乾跑`
8. `feat(autobattle): 配置層（預設／滑桿／規則編輯器）`
9. `refactor(autobattle): 移除舊引擎與舊欄位，工作坊改接新引擎`
10. `test(autobattle): 評分／決策／模擬對局斷言`
11. `docs(autobattle): i18n 文案與設計文件更新`

每步獨立可回退；1–5 不影響現有 UI，6 起才換面板。

## 11.5 A/B 基準（2026-11-16 實測）

同一份簡化戰鬥模型（zigzag 地圖、真實 ENEMY_DATA／TOWER_DATA、同樣傷害與經濟公式、同樣 12 波），
只換決策者：`legacy` = 舊引擎行為複刻，`utility` = 新引擎（`decide()`，含 holdStreak）。

| 指標 | legacy（舊策略複刻） | utility（新引擎） | 差異 |
|---|---|---|---|
| 存活波次 | 12 | 12 | 相同（模型偏寬鬆，屬天花板效應） |
| 漏怪 | 0 | 0 | 相同 |
| 塔數 | 4 | 21 | **+17** |
| 路徑覆蓋總格數 | 56 | 322 | **×5.75** |
| 剩餘金錢 | 25 | 1311 | 新引擎偏保守，錢沒花完 |
| 空轉 tick（有錢不動） | 0 | 66 | 新引擎仍有空轉 |
| 抖動（同動作連三次） | 0 | 0 | 相同 |

執行方式：CI 單元測試 `src/test/autobattleBench.test.ts`，輸出 `[autobattle-bench]` 一行 JSON。

基準立刻抓到兩個真缺陷（已修）：

1. 首跑時新引擎只放 1 座塔就永久 hold——同種類塔位互相咬分，margin 永遠過不了。
   修正：margin 只與「不同種類的最佳候選」比較，並在連續 6 次 hold 後強制執行最佳候選。
2. 基準未傳 `holdStreak`，行為與線上不一致，導致低估花錢能力。已對齊。

調參紀錄（同一份基準、逐一驗證，不是憑感覺）：

| 輪次 | 變更 | 塔數 | 覆蓋 | 剩餘金 | 空轉 tick | 判定 |
|---|---|---|---|---|---|---|
| 0 | 修正永久 hold | 21 | 322 | 1311 | 66 | 基準線 |
| 1 | 金錢 ≥2× 保留金時壓低 reserve、放大 tempo | 24 | 367 | 611 | 47 | 採納 |
| 2 | 溢出門檻 2→1.5，hold 上限 6→3 | 26 | 369 | 549 | **101** | **回退 hold 上限** |
| 3 | 保留門檻 1.5，hold 上限回 6 | 24 | 367 | **461** | **43** | 本輪最終 |

第 2 輪顯示「強制執行太頻繁」反而讓空轉從 47 升到 101（候選還沒成立就被重算），因此回退。
殘留問題：剩餘金 461 仍高於目標 400、空轉 43 次；下一步應讓 upgrade 在「錢多但沒有好塔位」時取得跨種類優勢，
而不是繼續把錢堆著。

## 12. 風險與對策

| 風險 | 對策 |
|---|---|
| 決策記錄讓 persist 肥大 | 上限 300 筆 + 每波截斷 + 曲線只存每波取樣 |
| 效用 AI 在極端局面無人可選 | 保底 `hold` + 硬規則 `emergencyPlace`（漏怪時允許低分補位） |
| 事件驅動漏事件 | 200ms 兜底 + 每次 `waveStart` 強制 dirty |
| UI 資訊過載 | 分頁 + 預設收合 + 只在異常時展開（對應「一句結論 + 展開」） |
| 舊存檔壞 | 遷移層只讀相容，讀不到就用預設 |
| 本機不能驗證 | 每步 push 由 CI 判定；UI 改動跑 `visual-check` 並看圖 |
