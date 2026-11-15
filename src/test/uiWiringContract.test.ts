/**
 * 元件接線契約（唯一允許的原始碼契約測試）
 *
 * 原本散在 39 支測試裡的「元件有沒有接上共用 helper／token」字串斷言，跟行為
 * 斷言混在一起：改個寫法就紅、真 bug 卻不會紅。designTokens.test.ts 已用同一套
 * 做法處理 class 契約，這支只處理「接線」——元件有沒有呼叫那個共用函式。
 *
 * 規則：只驗呼叫關係，不驗排版、不驗字串內容。新元件要加接線檢查就往對應
 * describe 加一條，不要另外開檔案讀原始碼。
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/** 每個檔案只讀一次：多條契約共用同一份原始碼 */
const cache = new Map<string, string>();
const source = (relativePath: string): string => {
  const cached = cache.get(relativePath);
  if (cached !== undefined) return cached;
  const text = readFileSync(resolve(__dirname, relativePath), 'utf8');
  cache.set(relativePath, text);
  return text;
};

describe('戰鬥 HUD 接線', () => {
  it('底部控制列用 skipWave 與速度列的共用 helper，不寫死字串或舊 class', () => {
    const bottom = source('../components/game/sidebar/BottomControls.tsx');
    expect(bottom).toMatch(/canSkipWave/);
    expect(bottom).toMatch(/skipWaveTitleKey/);
    expect(bottom).not.toMatch(/title=\{t\.game\.skipWaveTooltip\}/);
    expect(bottom).toMatch(/GAME_SPEED_BAR_CLASS/);
    expect(bottom).not.toMatch(/hidden sm:flex gap-1/);
    expect(bottom).toMatch(/GAME_SPEED_PRESETS/);
    expect(bottom).not.toMatch(/commonSpeeds = \[1, 2, 3, 5\]/);
  });

  it('暫停選單吃同一份速度預設，不再自帶一組數字', () => {
    const pause = source('../components/ui/pause/PauseSettingsPanel.tsx');
    expect(pause).toMatch(/GAME_SPEED_PRESETS/);
    expect(pause).not.toMatch(/speedOptions = \[0\.5, 1, 2, 3, 5\]/);
  });

  it('3D 互動層用範圍環 helper', () => {
    const interaction = source('../components/scenes/game-scene/three/interaction3d.ts');
    expect(interaction).toMatch(/shouldShowTowerRangeRing/);
    expect(interaction).toMatch(/showTowerRange/);
  });

  it('2D／3D 共用同一條血量條顯示規則', () => {
    expect(source('../data/towerHealthBarVisibility.ts')).toMatch(/shouldShowTowerHealthBar/);
    expect(source('../components/scenes/game-scene/GameCanvasDynamic.ts')).toMatch(/shouldShowTowerHealthBar/);
    expect(source('../components/scenes/game-scene/three/towerHealthBars3d.ts')).toMatch(/shouldShowTowerHealthBar/);
    const scene3d = source('../components/scenes/game-scene/three/GameScene3D.tsx');
    expect(scene3d).toMatch(/createTowerHealthBars3D/);
    expect(scene3d).toMatch(/showHealthBars/);
  });

  it('畫布吃顯示開關與震動強度 helper', () => {
    const canvas = source('../components/scenes/game-scene/GameCanvas.tsx');
    expect(canvas).toMatch(/showHealthBars/);
    expect(canvas).toMatch(/showDamageNumbers/);
    expect(canvas).toMatch(/visibleDamageTexts/);
    expect(canvas).toMatch(/resolveCanvasShakeIntensity/);
    expect(source('../components/scenes/game-scene/GameCanvasDynamic.ts')).toMatch(/showHealthBars/);
  });
});

describe('3D 場景接線', () => {
  it('相機操控走共用速度 helper，不寫死倍率', () => {
    const scene3d = source('../components/scenes/game-scene/three/GameScene3D.tsx');
    expect(scene3d).toMatch(/applyOrbitControlSpeeds/);
    expect(scene3d).toMatch(/resolveWalkLookDelta/);
    expect(scene3d).toMatch(/resolveWalkZoomDelta/);
    expect(scene3d).not.toMatch(/\* 0\.0075/);
    expect(scene3d).not.toMatch(/\* 0\.004,/);
  });

  it('敵人路徑顯示走共用判定，環境層用 flow 開關', () => {
    const scene3d = source('../components/scenes/game-scene/three/GameScene3D.tsx');
    expect(scene3d).toMatch(/showEnemyPath/);
    // 自由制後不再有「逐格切換貼圖」，改驗環境層的 flow 開關與共用判定
    expect(scene3d).toMatch(/setPathFlowVisible/);
    expect(scene3d).toMatch(/shouldShowEnemyPathFx/);
    expect(source('../components/scenes/game-scene/three/environment3d.ts')).toMatch(/setPathFlowVisible/);
  });
});

describe('塔面板與特效接線', () => {
  it('塔面板用等級徽章與技能圖示 helper，不寫死 MAX 或 emoji', () => {
    const panel = source('../components/game/FloatingTowerPanel.tsx');
    expect(panel).toMatch(/formatTowerLevelBadge/);
    expect(panel).not.toMatch(/'MAX'/);
    expect(panel).toMatch(/<ThemeIcon icon=\{skillData\.icon\}/);
    expect(panel).not.toMatch(/>\{skillData\.icon\}</);
  });

  it('塔面板的路線說明走 i18n 與格式化 helper', () => {
    const panel = source('../components/game/FloatingTowerPanel.tsx');
    expect(panel).toMatch(/formatCurrentPathCaption/);
    expect(panel).toMatch(/t\.towers\.currentPath/);
  });

  it('升級特效與畫布都吃同一份等級文字', () => {
    const fx = source('../components/scenes/game-scene/GameCanvasUpgradeFx.ts');
    expect(fx).toMatch(/towerMaxLevelText/);
    expect(fx).not.toMatch(/fillText\('MAX'/);
    expect(source('../components/scenes/game-scene/GameCanvas.tsx')).toMatch(/t\.towers\.maxLevel/);
  });

  it('融合特效與橫幅都用翻譯文案，不畫英文或裸 emoji', () => {
    const fx = source('../components/scenes/game-scene/GameCanvasFusionFx.ts');
    expect(fx).toMatch(/fusionBurstText/);
    expect(fx).not.toMatch(/⚛ FUSION/);
    const banner = source('../components/game/FusionModeBanner.tsx');
    expect(banner).toMatch(/t\.towers\.fusion\.cancel/);
    expect(banner).not.toMatch(/>\s*取消\s*</);
  });
});

describe('批次操作接線', () => {
  it('多選面板用批次賣出 helper，不用 window.confirm', () => {
    const panel = source('../components/game/MultiSelectPanel.tsx');
    expect(panel).toMatch(/requestBatchSell/);
    expect(panel).not.toMatch(/\bconfirm\(/);
  });

  it('多選面板用批次升級提示 helper，不用 alert', () => {
    const panel = source('../components/game/MultiSelectPanel.tsx');
    expect(panel).toMatch(/resolveBatchUpgradeHint/);
    expect(panel).toMatch(/multiSelectNotEnough/);
    expect(panel).not.toMatch(/\balert\(/);
  });
});

describe('場景接線', () => {
  it('統計頁用確認對話框，不用 window.confirm', () => {
    const browse = source('../components/scenes/Statistics.tsx');
    expect(browse).toMatch(/StatsClearConfirmDialog/);
    expect(browse).not.toMatch(/\bconfirm\(/);
    const panel = source('../components/scenes/statistics/StatsHistoryPanel.tsx');
    expect(panel).toMatch(/StatsClearConfirmDialog/);
    expect(panel).not.toMatch(/\bconfirm\(/);
  });

  it('統計卡與回放詳情共用戰績標籤 helper', () => {
    const card = source('../components/scenes/statistics/StatsHistoryCard.tsx');
    expect(card).toMatch(/formatGameRecordMap/);
    expect(card).toMatch(/formatGameRecordDifficulty/);
    expect(source('../components/scenes/statistics/statsShared.tsx')).toMatch(/formatGameRecordMap/);
    expect(source('../components/scenes/statistics/StatsGameDetailPanel.tsx')).toMatch(/formatGameRecordMap/);
    const replay = source('../components/scenes/replay/ReplayDetail.tsx');
    expect(replay).toMatch(/formatGameRecordDifficulty/);
    expect(replay).not.toMatch(/>\s*無盡\s*</);
  });

  it('天賦樹用 Escape helper 並能回主選單', () => {
    const talent = source('../components/scenes/TalentTree.tsx');
    expect(talent).toMatch(/resolveTalentEscape/);
    expect(talent).toMatch(/setScene\('mainMenu'\)/);
    expect(talent).not.toMatch(/if \(e\.key === 'Escape'\) \{\s*if \(showResetModal\) return;/);
  });

  it('設定頁與選圖的返回都走場景歷史，不寫死主選單', () => {
    const settings = source('../components/scenes/Settings.tsx');
    expect(settings).toMatch(/goBackScene/);
    expect(settings).toMatch(/resolveSettingsEscape/);
    expect(settings).not.toMatch(/backTo="mainMenu"/);

    const pathSelection = source('../components/scenes/PathSelection.tsx');
    expect(pathSelection).toMatch(/resolvePathSelectionEscape/);
    expect(pathSelection).toMatch(/goBackScene/);
    expect(pathSelection).not.toMatch(/setScene\('mainMenu'\)/);
  });

  it('百科用 Escape helper 並回上一個場景', () => {
    const encyclopedia = source('../components/scenes/Encyclopedia.tsx');
    expect(encyclopedia).toMatch(/resolveEncyclopediaEscape/);
    expect(encyclopedia).toMatch(/goBackScene/);
    expect(encyclopedia).not.toMatch(/if \(e\.key === 'Escape' && selectedItem\)/);
  });

  it('結算頁的 Enter 走共用熱鍵 resolver', () => {
    const gameOver = source('../components/scenes/GameOver.tsx');
    expect(gameOver).toMatch(/resolveGameEndHotkey/);
    expect(gameOver).toMatch(/handleQuickRetry/);
    const victory = source('../components/scenes/Victory.tsx');
    expect(victory).toMatch(/resolveGameEndHotkey/);
    expect(victory).toMatch(/handleNextLevel/);
  });

  it('勝利結算用獎章 helper，不寫死血量條件', () => {
    const victory = source('../components/scenes/Victory.tsx');
    expect(victory).toMatch(/resolveVictoryMedalIds/);
    expect(victory).not.toMatch(/health === 100/);
  });

  it('失敗分析用共用文案 key，不自帶元素清單', () => {
    const gameOver = source('../components/scenes/GameOver.tsx');
    expect(gameOver).toMatch(/resolveFailureAnalysisKeys/);
    expect(gameOver).not.toMatch(/\['frost', 'poison', 'lightning'\]/);
  });

  it('主選單用 Hero／快捷磚／三群帶，不再有粒子層', () => {
    const mainMenu = source('../components/scenes/MainMenu.tsx');
    expect(mainMenu).toMatch(/MenuHomeHero/);
    expect(mainMenu).toMatch(/MenuHomeQuick/);
    expect(mainMenu).toMatch(/MenuHomeGroups/);
    expect(mainMenu).not.toMatch(/MenuBento/);
    expect(mainMenu).not.toMatch(/MenuStartHub/);
    expect(mainMenu).not.toMatch(/particleCount/);
  });

  it('載入畫面用共用提示 helper 與顯示設定', () => {
    const loading = source('../components/ui/Loading.tsx');
    expect(loading).toMatch(/LOADING_TIP_CLASS/);
    expect(loading).toMatch(/nextLoadingTipIndex/);
    expect(loading).toMatch(/visibleLoadingTip/);
    expect(loading).toMatch(/gameplay\.showTips/);
    expect(loading).not.toMatch(/text-white\/40 z-10/);
  });

  it('暫停預覽與覆蓋層的文案都走 i18n', () => {
    const preview = source('../components/ui/pause/PausePreviewSection.tsx');
    expect(preview).toMatch(/t\.game\.waveTagBoss|g\.waveTagBoss/);
    expect(preview).not.toMatch(/label=["']BOSS["']/);
    const overlay = source('../components/ui/PauseOverlay.tsx');
    expect(overlay).toMatch(/t\.game\.pauseTabBattle/);
    expect(overlay).toMatch(/t\.game\.pauseResumeHint/);
    expect(overlay).not.toMatch(/label: '戰況'/);
    expect(overlay).not.toMatch(/subtitle="按 ESC 或 P 繼續遊戲"/);
  });

  it('回放瀏覽與畫布用共用搜尋／繪製 helper', () => {
    const browse = source('../components/scenes/Replay.tsx');
    expect(browse).toMatch(/replayMatchesSearch/);
    expect(browse).toMatch(/gameDifficultyLabelsFromGameCopy/);
    const canvas = source('../components/scenes/replay/ReplayCanvas.tsx');
    expect(canvas).toMatch(/showEnemyPath/);
    expect(canvas).toMatch(/drawField\([\s\S]*showPath/);
    expect(canvas).toMatch(/shouldDrawReplayEnemyHealthBar/);
  });

  it('回放用自製對話框與提示條，不用瀏覽器 confirm／prompt／alert', () => {
    const browse = source('../components/scenes/Replay.tsx');
    expect(browse).toMatch(/ReplayConfirmDialog/);
    expect(browse).toMatch(/ReplayRenameDialog/);
    expect(browse).toMatch(/resolveReplayImportFeedback/);
    expect(browse).toMatch(/SceneNoticeToast/);
    expect(browse).not.toMatch(/\bconfirm\(/);
    expect(browse).not.toMatch(/\bprompt\(/);
    expect(browse).not.toMatch(/\balert\(/);

    const detail = source('../components/scenes/replay/ReplayDetail.tsx');
    expect(detail).toMatch(/resolveReplayExportFeedback/);
    expect(detail).toMatch(/SceneNoticeToast/);
    expect(detail).not.toMatch(/\bconfirm\(/);
    expect(detail).not.toMatch(/\balert\(/);

    const notes = source('../components/scenes/replay/ReplayNotesPanel.tsx');
    expect(notes).toMatch(/ReplayConfirmDialog/);
    expect(notes).not.toMatch(/\bconfirm\(/);
  });

  it('商店用購買／方向鍵 helper', () => {
    expect(source('../components/scenes/shop/ShopDetailPanel.tsx')).toMatch(/resolveShopPurchaseKey/);
    const shop = source('../components/scenes/Shop.tsx');
    expect(shop).toMatch(/nextShopSelection/);
    expect(shop).toMatch(/resolveShopHotkey/);
  });
});

describe('戰鬥熱鍵與場景效果接線', () => {
  const effects = () => source('../components/scenes/game-scene/useGameSceneEffects.ts');

  it('熱鍵解析走共用 resolver，不寫死分支或速度表', () => {
    expect(effects()).toMatch(/resolveMatchKeyAction/);
    expect(effects()).toMatch(/resolveTutorialHotkeyGate/);
    expect(effects()).toMatch(/nextGameSpeed/);
    expect(effects()).not.toMatch(/speedCycle = \[0\.5, 0\.75, 1, 1\.5, 2, 3, 4, 5, 10\]/);
  });

  it('返回鍵先取消融合再處理場景返回', () => {
    const text = effects();
    expect(text).toMatch(/fusionMode/);
    expect(text).toMatch(/cancelFusion/);
    expect(text).toMatch(/cancel_fusion/);
  });

  it('快速放置預設值只由 store 與共用判定提供', () => {
    expect(source('../store/gameStore.ts')).toMatch(/quickPlaceMode:[\s\S]*quickPlaceDefault/);
    expect(effects()).toMatch(/shouldApplyQuickPlaceDefaultSync/);
    expect(source('../components/scenes/Settings.tsx')).toMatch(/shouldApplyQuickPlaceDefaultSync/);
  });
});
