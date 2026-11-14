import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { WAVE_CONFIGS, generateEndlessWaveConfig, ENEMY_DATA, DIFFICULTY_MODIFIERS, PATHS } from '@/data/gameData';
import { initializeGrid } from '@/store/gameStoreUtils';
import type { GameDifficulty } from '@/types/game';
import { useTranslation } from '@/i18n';
import { CoinIcon, HeartIcon, StarIcon, WaveIcon, EyeIcon, WarningIcon, MapIcon, InfinityIcon } from '@/components/ui/Icons';
import EnemyPreview from '@/components/ui/EnemyPreview';
import { DevSection, DevToggle, DevButton, DevNumberInput, DevInfoRow, DevSelect } from './common';
import { Deck } from '@/components/hl';

// ============================================================
// 金錢調整
// ============================================================

const MoneyControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const money = useGameStore((s) => s.money);
  const addMoney = useGameStore((s) => s.addMoney);
  const [delta, setDelta] = useState(1000);

  return (
    <div className="space-y-2">
      <DevInfoRow label={u.current} value={`$${Math.floor(money)}`} color="amber" />
      <DevNumberInput value={delta} onChange={setDelta} step={100} suffix="$" />
      <div className="grid grid-cols-2 gap-1.5">
        <DevButton label={u.addX} onClick={() => addMoney(delta)} variant="success" />
        <DevButton label={u.subtractX} onClick={() => addMoney(-delta)} variant="warning" />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <DevButton label="+100" onClick={() => addMoney(100)} />
        <DevButton label="+1k" onClick={() => addMoney(1000)} />
        <DevButton label="+10k" onClick={() => addMoney(10000)} />
      </div>
    </div>
  );
};

// ============================================================
// 生命調整
// ============================================================

const HealthControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const health = useGameStore((s) => s.health);
  const [delta, setDelta] = useState(10);

  const setHealth = (next: number) => {
    useGameStore.setState({ health: Math.max(0, next) });
  };

  return (
    <div className="space-y-2">
      <DevInfoRow label={u.current} value={health} color="rose" />
      <DevNumberInput value={delta} onChange={setDelta} step={1} suffix="HP" />
      <div className="grid grid-cols-2 gap-1.5">
        <DevButton label={u.addX} onClick={() => setHealth(health + delta)} variant="success" />
        <DevButton label={u.subtractX} onClick={() => setHealth(health - delta)} variant="warning" />
      </div>
      <DevButton label={u.restoreFullHealth} onClick={() => setHealth(100)} variant="primary" />
    </div>
  );
};

// ============================================================
// 分數調整
// ============================================================

const ScoreControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const score = useGameStore((s) => s.score);
  const [delta, setDelta] = useState(100);

  const addScore = (n: number) => {
    useGameStore.setState((s) => ({ score: Math.max(0, s.score + n) }));
  };

  return (
    <div className="space-y-2">
      <DevInfoRow label={u.current} value={score} color="purple" />
      <DevNumberInput value={delta} onChange={setDelta} step={10} suffix="pts" />
      <div className="grid grid-cols-2 gap-1.5">
        <DevButton label={u.addX} onClick={() => addScore(delta)} variant="success" />
        <DevButton label={u.subtractX} onClick={() => addScore(-delta)} variant="warning" />
      </div>
    </div>
  );
};

// ============================================================
// 波次調整
// ============================================================

const WaveControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const currentWave = useGameStore((s) => s.currentWave);
  const maxWaves = useGameStore((s) => s.maxWaves);
  const skipWave = useGameStore((s) => s.skipWave);
  const startWave = useGameStore((s) => s.startWave);
  const waveActive = useGameStore((s) => s.waveActive);
  const [target, setTarget] = useState(1);

  const jumpToWave = (n: number) => {
    useGameStore.setState({
      currentWave: Math.max(0, n - 1),
      waveActive: false,
      allEnemiesSpawned: false,
      enemies: [],
    });
  };

  return (
    <div className="space-y-2">
      <DevInfoRow label={u.currentMax} value={`${currentWave} / ${maxWaves || '∞'}`} color="cyan" />
      <DevInfoRow label={u.inProgress} value={waveActive ? u.yes : u.no} color={waveActive ? 'emerald' : 'white'} />
      <DevNumberInput label={u.target} value={target} onChange={setTarget} min={1} step={1} />
      <div className="grid grid-cols-2 gap-1.5">
        <DevButton label={u.jump} onClick={() => jumpToWave(target)} variant="primary" />
        <DevButton label={u.skipWave} onClick={skipWave} disabled={!waveActive} variant="warning" />
      </div>
      <DevButton label={u.startNextWave} onClick={startWave} disabled={waveActive} variant="success" />
    </div>
  );
};

// ============================================================
// 路徑（地圖）切換
// ============================================================

const PathControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const selectedPath = useGameStore((s) => s.selectedPath);
  const isPlaying = useGameStore((s) => s.isPlaying);

  const pathOptions = useMemo(() => {
    return Object.keys(PATHS).map((key) => ({
      value: key,
      label: `${PATHS[key].name} (${key})`,
    }));
  }, []);

  const switchPath = (newPath: string) => {
    if (!PATHS[newPath]) return;
    useGameStore.setState({
      selectedPath: newPath,
      grid: initializeGrid(newPath),
      towers: [],
      enemies: [],
      projectiles: [],
      waveActive: false,
      currentWave: 0,
      selectedTower: null,
      selectedTowerType: null,
    });
  };

  return (
    <div className="space-y-2">
      <DevSelect
        label={u.map}
        value={selectedPath}
        onChange={switchPath}
        options={pathOptions}
      />
      <div className="text-[9px] text-[var(--arc-ink-4)] leading-relaxed">
        {isPlaying ? u.mapSwitchPlaying : u.mapSwitchIdle}
      </div>
    </div>
  );
};

// ============================================================
// 無盡模式 toggle
// ============================================================

const EndlessModeControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const endlessMode = useGameStore((s) => s.endlessMode);
  const maxWaves = useGameStore((s) => s.maxWaves);

  const toggle = () => {
    useGameStore.setState((s) => ({
      endlessMode: !s.endlessMode,
      maxWaves: !s.endlessMode ? 0 : 15,
    }));
  };

  return (
    <div className="space-y-2">
      <DevToggle
        icon={<InfinityIcon className="w-3.5 h-3.5" />}
        label={endlessMode ? u.endlessEnabled : u.endlessDisabled}
        value={endlessMode}
        onChange={toggle}
        accent="purple"
      />
      <DevInfoRow label={u.maxWaves} value={endlessMode ? '∞' : maxWaves} color={endlessMode ? 'purple' : 'cyan'} />
    </div>
  );
};

// ============================================================
// 難度切換
// ============================================================

const DifficultyControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const gameDifficulty = useGameStore((s) => s.gameDifficulty);

  const difficulties: { id: GameDifficulty; label: string; accent: string }[] = [
    { id: 'easy', label: u.diffEasy, accent: 'emerald' },
    { id: 'normal', label: u.diffNormal, accent: 'cyan' },
    { id: 'hard', label: u.diffHard, accent: 'amber' },
    { id: 'nightmare', label: u.diffNightmare, accent: 'rose' },
    { id: 'impossible', label: u.diffImpossible, accent: 'purple' },
  ];

  const applyDifficulty = (d: GameDifficulty) => {
    const modifiers = DIFFICULTY_MODIFIERS[d] || DIFFICULTY_MODIFIERS.normal;
    useGameStore.setState({
      gameDifficulty: d,
      difficultyModifiers: modifiers,
    });
  };

  return (
    <div className="space-y-2">
      <DevInfoRow label={u.current} value={gameDifficulty} color="amber" />
      <div className="grid grid-cols-3 gap-1.5">
        {difficulties.map((d) => {
          const isActive = gameDifficulty === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => applyDifficulty(d.id)}
              className={`py-2  text-[10px] font-bold tracking-widest uppercase border transition-all ${
                isActive
                  ? 'bg-[var(--arc-deck-3)] text-[var(--arc-ink)] border-[var(--arc-line-strong)] '
                  : 'bg-[var(--arc-deck-2)] text-[var(--arc-ink-4)] border-[var(--cn-line-soft)] hover:bg-[var(--arc-deck-3)] hover:text-[var(--arc-ink-2)]'
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>
      <div className="text-[9px] text-[var(--arc-ink-4)] leading-relaxed">
        {u.diffApplyHint}
      </div>
    </div>
  );
};

// ============================================================
// 下三波預覽
// ============================================================

const WavePreview = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const currentWave = useGameStore((s) => s.currentWave);
  const endlessMode = useGameStore((s) => s.endlessMode);
  const maxWaves = useGameStore((s) => s.maxWaves);

  const waves = useMemo(() => {
    const result: { wave: number; enemies: { type: string; count: number }[] }[] = [];
    for (let i = 1; i <= 3; i++) {
      const waveNum = currentWave + i;
      if (!endlessMode && maxWaves > 0 && waveNum > maxWaves) break;
      let config: { enemies: { type: string; count: number }[] } | null = null;
      if (endlessMode) {
        config = generateEndlessWaveConfig(waveNum);
      } else {
        // 超出預定義波次時與實際生成邏輯一致：用無盡生成器預覽
        config = WAVE_CONFIGS[waveNum - 1] ?? generateEndlessWaveConfig(waveNum);
      }
      if (config) result.push({ wave: waveNum, enemies: config.enemies });
    }
    return result;
  }, [currentWave, endlessMode, maxWaves]);

  if (waves.length === 0) {
    return (
      <div className="text-[10px] text-[var(--arc-ink-4)] text-center py-3 tracking-widest uppercase">
        {u.noMoreWaves}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {waves.map(({ wave, enemies }) => (
        <Deck key={wave} className="arc-panel--flat p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold tracking-widest text-[var(--arc-reach)]/90 uppercase">{u.waveN.replace('{n}', String(wave))}</span>
            <span className="text-[9px] text-[var(--arc-ink-4)] font-mono">{u.enemyUnit.replace('{count}', String(enemies.reduce((s, e) => s + e.count, 0)))}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {enemies.map((g, i) => {
              const data = ENEMY_DATA[g.type as keyof typeof ENEMY_DATA];
              return (
                <div
                  key={i}
                  className="arc-panel--sunken flex items-center gap-1 pl-1 pr-2 py-0.5"
                  title={`${data?.name || g.type} × ${g.count}`}
                >
                  <div className="w-5 h-5  flex items-center justify-center" style={{ backgroundColor: `${data?.color || '#888'}15` }}>
                    <EnemyPreview enemyId={g.type} size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--arc-ink-2)] tracking-wider">×{g.count}</span>
                </div>
              );
            })}
          </div>
        </Deck>
      ))}
    </div>
  );
};

// ============================================================
// 主匯出
// ============================================================

export const StateSection = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <DevSection
        title={t.dev.secMoney}
        icon={<CoinIcon className="w-4 h-4" />}
        accent="amber"
        keywords={['money', 'gold', 'cash', 'coin', '金錢', '錢']}
      >
        <MoneyControl />
      </DevSection>
      <DevSection
        title={t.dev.secHealth}
        icon={<HeartIcon className="w-4 h-4" />}
        accent="rose"
        keywords={['health', 'hp', 'life', '生命', '血量']}
      >
        <HealthControl />
      </DevSection>
      <DevSection
        title={t.dev.secScore}
        icon={<StarIcon className="w-4 h-4" />}
        accent="purple"
        keywords={['score', 'point', '分數', '積分']}
      >
        <ScoreControl />
      </DevSection>
      <DevSection
        title={t.dev.secWave}
        icon={<WaveIcon className="w-4 h-4" />}
        accent="cyan"
        keywords={['wave', 'round', 'next', 'skip', '波次', '波', '回合']}
      >
        <WaveControl />
      </DevSection>
      <DevSection
        title={t.dev.secMap}
        icon={<MapIcon className="w-4 h-4" />}
        accent="emerald"
        keywords={['map', 'path', 'route', '地圖', '路徑']}
      >
        <PathControl />
      </DevSection>
      <DevSection
        title={t.dev.secEndless}
        icon={<InfinityIcon className="w-4 h-4" />}
        accent="purple"
        keywords={['endless', 'infinite', 'survival', '無盡', '無限']}
      >
        <EndlessModeControl />
      </DevSection>
      <DevSection
        title={t.dev.secDifficulty}
        icon={<WarningIcon className="w-4 h-4" />}
        accent="amber"
        keywords={['difficulty', 'easy', 'hard', 'nightmare', '難度', '簡單', '困難']}
      >
        <DifficultyControl />
      </DevSection>
      <DevSection
        title={t.dev.secWavePreview}
        icon={<EyeIcon className="w-4 h-4" />}
        accent="cyan"
        keywords={['preview', 'wave', 'enemy', 'next', '預覽', '波次', '敵人']}
      >
        <WavePreview />
      </DevSection>
    </div>
  );
};
