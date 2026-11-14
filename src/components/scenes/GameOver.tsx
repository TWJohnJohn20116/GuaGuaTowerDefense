/**
 * GameOver.tsx - 遊戲結束介面（獨立場景，非彈窗）
 *
 * HARDLINE `Page` 版面：TopBar → 單欄 max-w-[1080px]
 *   1. 結果帶：大字「遊戲結束」+ mono 副資訊（關卡／難度／時間）+ 分數／波次／星等
 *   2. 本局數據：摘要、統計（可摺疊）、戰役失敗面板
 *   3. 成就解鎖：本局解鎖與差一點解鎖
 *   4. 挑戰報告：失敗分析 + 每日挑戰／突變試煉
 *   5. 回放：本局回放
 *   底部只留兩顆主行動：快速重試（signal）與返回（line）。
 *
 * 金幣結算、統計上報與 Enter 熱鍵行為皆未變更。
 */

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useShopStore, calculateCoinReward } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { useStatsStore } from '@/store/statsStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { useAchievementStore } from '@/store/achievementStore';
import { useTranslation } from '@/i18n';
import { SceneShell } from '@/components/ui/SceneShell';
import {
  BrokenHeartIcon, CrossIcon, LightbulbIcon, MapIcon, RefreshIcon, HomeIcon,
  ChevronUpIcon, ChevronDownIcon,
} from '@/components/ui/Icons';
import { formatPlayTime } from '@/types/gameEndReport';
import { formatGameRecordDifficulty, gameDifficultyLabelsFromDetail } from '@/data/gameRecordLabels';
import { getPathDisplayName } from '@/data/gameData/pathData';
import { findCampaignLevelById } from '@/data/campaignData';
import { Btn, Deck, SegHead, TopBar } from '@/components/hl';
import { GameEndSessionReport } from '@/components/scenes/game-end/GameEndSessionReport';
import { GameEndResultBand } from '@/components/scenes/game-end/GameEndResultBand';
import { GameEndStatGrid, type GameEndStatItem } from '@/components/scenes/game-end/GameEndStatGrid';
import { GameEndAchievementPanels } from '@/components/scenes/game-end/GameEndAchievementPanels';
import { GameEndChallengePanel } from '@/components/scenes/game-end/GameEndChallengePanel';
import { GameEndReplayPanel } from '@/components/scenes/game-end/GameEndReplayPanel';
import { GameOverCampaignPanel } from '@/components/scenes/campaign-end/GameOverCampaignPanel';
import { isGameEndTypingTarget, resolveGameEndHotkey } from '@/data/gameEndHotkey';
import { failureAnalysisSuggestionKey, resolveFailureAnalysisKeys } from '@/data/gameOverAnalysis';

// 面板外觀已全面改由 hl 原語（Deck / StatCell / Segments）提供；舊 SCENE_GLASS 覆蓋層不再使用。
export default function GameOver() {
  const { t } = useTranslation();
  const score = useGameStore((s) => s.score);
  const currentWave = useGameStore((s) => s.currentWave);
  const towers = useGameStore((s) => s.towers);
  const placementStats = useGameStore((s) => s.placementStats);
  const upgradeStats = useGameStore((s) => s.upgradeStats);
  const selectedPath = useGameStore((s) => s.selectedPath);
  const setScene = useGameStore((s) => s.setScene);
  const resetGame = useGameStore((s) => s.resetGame);
  const startGame = useGameStore((s) => s.startGame);
  const gameDifficulty = useGameStore((s) => s.gameDifficulty);
  const isCampaign = useGameStore((s) => s.isCampaign);
  const campaignLevelId = useGameStore((s) => s.campaignLevelId);
  const report = useAchievementStore((s) => s.lastGameEndReport);

  const metaCoinMult = useTalentStore((s) => s.getModifiers().metaCoinMult);
  const baseCoinReward = calculateCoinReward({ isVictory: false, score, currentWave, health: 0 });
  const coinReward = Math.floor(baseCoinReward * metaCoinMult);
  const addCoins = useShopStore((s) => s.addCoins);
  const incrementGamesPlayed = useShopStore((s) => s.incrementGamesPlayed);
  const endGameTracking = useStatsStore((s) => s.endGameTracking);
  const coinRewardedRef = useRef(false);

  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (!coinRewardedRef.current) {
      coinRewardedRef.current = true;
      addCoins(coinReward);
      incrementGamesPlayed();
      endGameTracking(selectedPath, gameDifficulty, false, score, currentWave, 0);
    }
    // 若教學中失敗，結束教學
    const tutorialStore = useTutorialStore.getState();
    if (tutorialStore.isActive) {
      tutorialStore.endTutorial({ awardGold: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalKills = towers.reduce((sum, tower) => sum + tower.kills, 0);
  const totalDamage = towers.reduce((sum, tower) => sum + tower.totalDamage, 0);
  const avgTowerLevel = towers.length > 0
    ? (towers.reduce((sum, tower) => sum + tower.level, 0) / towers.length).toFixed(1)
    : '0';

  const getFailureAnalysis = () => {
    const a = t.game.analysis;
    const keys = resolveFailureAnalysisKeys({
      towerCount: towers.length,
      upgradeCount: upgradeStats.totalUpgrades,
      towerTypes: towers.map((tower) => tower.type),
    });
    if (keys.length === 0) {
      return [{ issue: a.unlucky, suggestion: a.tryAgainHint }];
    }
    return keys.map((key) => ({
      issue: a[key],
      suggestion: a[failureAnalysisSuggestionKey(key)],
    }));
  };

  const analysis = getFailureAnalysis();

  const baseStatItems: GameEndStatItem[] = [
    { key: 'wave', label: t.game.wave, value: currentWave },
    { key: 'kills', label: t.game.kills, value: totalKills },
    {
      key: 'damage',
      label: t.game.pauseStatTotalDamage,
      value: Math.floor(totalDamage).toLocaleString(),
    },
    {
      key: 'coins',
      label: t.mainMenu.coinsUnit,
      value: `+${coinReward}`,
      tone: 'signal',
    },
  ];

  const extraStatItems: GameEndStatItem[] = showStats
    ? [
        { key: 'built', label: t.game.pauseStatBuilt, value: placementStats.totalPlaced },
        { key: 'avg', label: t.game.pauseStatAverageLevel, value: `Lv.${avgTowerLevel}` },
        {
          key: 'spent',
          label: t.game.spent,
          value: `$${placementStats.totalSpent + upgradeStats.totalSpent}`,
        },
      ]
    : [];

  const statItems = [...baseStatItems, ...extraStatItems];

  const campaignLevel = campaignLevelId ? findCampaignLevelById(campaignLevelId) : undefined;
  const stageLabel =
    isCampaign && campaignLevel ? campaignLevel.title : getPathDisplayName(selectedPath);
  const difficultyLabel = formatGameRecordDifficulty(
    gameDifficulty,
    gameDifficultyLabelsFromDetail(t.mutatorChallenge.detail),
  );
  const timeLabel = report ? formatPlayTime(report.playTimeSeconds) : '--';

  const handleQuickRetry = () => {
    // 複用本局啟動參數，避免丟失 maxWaves / 難度 / 無盡模式等設定
    const args = useGameStore.getState().lastStartArgs;
    resetGame();
    if (args) {
      startGame(args.pathName, args.difficulty, args.endless, args.maxWaves, args.customModifiers, args.customWaveSetId, args.mutator);
    } else {
      setScene('pathSelection');
    }
  };

  const handleSelectMap = () => {
    resetGame();
    setScene('pathSelection');
  };

  const handleMainMenu = () => {
    resetGame();
    setScene('mainMenu');
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const action = resolveGameEndHotkey(e.key, {
        inTextField: isGameEndTypingTarget(e.target),
      });
      if (action !== 'primary') return;
      e.preventDefault();
      handleQuickRetry();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [resetGame, startGame, setScene]);

  return (
    <SceneShell accent="danger">
      <div className="sticky top-0 z-30">
        <TopBar
          title={t.game.gameOver}
          meta={`${t.game.failureAnalysis} · ${difficultyLabel}`}
          glyph={<BrokenHeartIcon className="h-4 w-4" />}
          back={{ onClick: handleMainMenu }}
          right={
            <Btn
              variant="line"
              size="sm"
              icon={<MapIcon className="h-3.5 w-3.5" />}
              onClick={handleSelectMap}
            >
              {t.game.selectMap}
            </Btn>
          }
        />
      </div>

      <main className="px-6 pb-16 pt-6">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-7">
          <GameEndResultBand
            tone="alarm"
            headline={t.game.gameOver}
            tag={isCampaign ? t.campaignEnd.modeCampaign : t.campaignEnd.modeStandard}
            meta={[
              { label: 'stage', value: stageLabel },
              { label: 'difficulty', value: difficultyLabel },
              { label: 'time', value: timeLabel },
            ]}
            score={score.toLocaleString()}
            wave={currentWave}
            stars={0}
          />

          <GameEndSessionReport variant="danger">
            <Deck className="flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="hl-label">{t.game.stats}</span>
                <Btn
                  variant="ghost"
                  size="sm"
                  icon={
                    showStats ? (
                      <ChevronUpIcon className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDownIcon className="h-3.5 w-3.5" />
                    )
                  }
                  onClick={() => setShowStats((v) => !v)}
                >
                  {showStats ? t.game.hideStats : t.game.showStats}
                </Btn>
              </div>
              <GameEndStatGrid items={statItems} className="lg:grid-cols-3" />
            </Deck>

            {isCampaign && campaignLevelId && (
              <GameOverCampaignPanel levelId={campaignLevelId} wave={currentWave} />
            )}
          </GameEndSessionReport>

          <GameEndAchievementPanels unlockedIds={report?.unlockedAchievementIds ?? []} />

          <GameEndChallengePanel
            daily={report?.dailyChallenge}
            mutator={report?.mutatorChallenge}
          >
            <Deck tone="sunken" className="flex flex-col gap-3 p-4 sm:p-5">
              <SegHead label={t.game.failureAnalysis} />
              <div className="flex flex-col">
                {analysis.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1.5 border-b border-[var(--hl-line)] py-2.5 last:border-b-0"
                  >
                    <div className="flex items-start gap-2">
                      <CrossIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--hl-alarm)]" />
                      <span className="text-[13px] leading-snug text-[var(--hl-ink)]">
                        {item.issue}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 pl-5">
                      <LightbulbIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--hl-vital)]" />
                      <span className="text-[12px] leading-snug text-[var(--hl-ink-2)]">
                        {item.suggestion}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Deck>
          </GameEndChallengePanel>

          <GameEndReplayPanel />

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
            <Btn
              variant="signal"
              size="lg"
              className="w-full sm:w-auto"
              icon={<RefreshIcon className="h-4 w-4" />}
              kbd={t.game.enterToConfirm}
              onClick={handleQuickRetry}
            >
              {isCampaign && campaignLevelId ? t.game.retryCampaignLevel : t.game.quickRetry}
            </Btn>
            <Btn
              variant="line"
              size="lg"
              className="w-full sm:w-auto"
              icon={<HomeIcon className="h-4 w-4" />}
              onClick={handleMainMenu}
            >
              {t.game.mainMenuBtn}
            </Btn>
          </div>
        </div>
      </main>
    </SceneShell>
  );
}
