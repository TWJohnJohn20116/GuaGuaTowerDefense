import { useDevStore } from '@/store/devStore';
import { useGameStore } from '@/store/gameStore';
import { generateId } from '@/store/gameStoreUtils';
import { TOWER_SKILLS } from '@/data/skillData';
import { defaultTargetPriority } from '@/data/towerTargeting';
import { ENEMY_DATA, GAME_CONSTANTS } from '@/data/gameData';
import { DEFAULT_TOWER_RADIUS, sampleBuildablePoints } from '@/data/mapGeometry';
import type { Tower } from '@/types/game';
import { useTranslation } from '@/i18n';
import {
  AlienIcon, TowerIcon, ShieldIcon, FlameIcon, LightningIcon,
  PlusIcon, TrashIcon, WarningIcon, HeartIcon, CoinIcon, RobotIcon,
  ScalesIcon, SwordsIcon,
} from '@/components/ui/Icons';
import { DevSection, DevToggle, DevButton, DevNumberInput } from './common';
import { EnemyTypePicker } from './EnemyTypePicker';
import { TowerTypePicker } from './TowerTypePicker';

// ============================================================
// 敵人生成器
// ============================================================

const EnemySpawner = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const spawnEnemyType = useDevStore((s) => s.spawnEnemyType);
  const spawnEnemyCount = useDevStore((s) => s.spawnEnemyCount);
  const setSpawnEnemyType = useDevStore((s) => s.setSpawnEnemyType);
  const setSpawnEnemyCount = useDevStore((s) => s.setSpawnEnemyCount);
  const spawnEnemy = useGameStore((s) => s.spawnEnemy);
  const isPlaying = useGameStore((s) => s.isPlaying);

  const handleSpawn = () => {
    for (let i = 0; i < spawnEnemyCount; i++) {
      setTimeout(() => spawnEnemy(spawnEnemyType), i * 80);
    }
  };

  return (
    <div className="space-y-2.5">
      <EnemyTypePicker value={spawnEnemyType} onChange={setSpawnEnemyType} />
      <DevNumberInput label={u.spawnCount} value={spawnEnemyCount} onChange={setSpawnEnemyCount} min={1} max={200} step={1} />
      <DevButton
        icon={<PlusIcon className="w-3.5 h-3.5" />}
        label={u.spawnEnemyBatch.replace('{count}', String(spawnEnemyCount))}
        onClick={handleSpawn}
        variant="primary"
        disabled={!isPlaying}
        title={isPlaying ? u.spawnEnemyTitle : u.spawnEnemyNeedGame}
      />
    </div>
  );
};

// ============================================================
// 塔生成器（直接在隨機空格放塔，不扣錢、不影響統計）
// ============================================================

const TowerSpawner = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const spawnTowerType = useDevStore((s) => s.spawnTowerType);
  const spawnTowerCount = useDevStore((s) => s.spawnTowerCount);
  const setSpawnTowerType = useDevStore((s) => s.setSpawnTowerType);
  const setSpawnTowerCount = useDevStore((s) => s.setSpawnTowerCount);

  const handleSpawn = () => {
    const state = useGameStore.getState();
    // 自由制：沒有空格可枚舉，用共用的取樣器挑可建造點（已含路徑淨空與禁建區）
    const candidates = sampleBuildablePoints(state.activeMap, spawnTowerCount * 4);
    if (candidates.length === 0) return;
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const targets = shuffled.slice(0, Math.min(spawnTowerCount, shuffled.length));

    const skillType = TOWER_SKILLS[spawnTowerType];
    const maxLevel = useDevStore.getState().maxTowerLevel;
    const newTowers: Tower[] = targets.map((pos) => ({
      id: generateId(),
      type: spawnTowerType,
      pos,
      radius: DEFAULT_TOWER_RADIUS,
      level: maxLevel ? GAME_CONSTANTS.MAX_TOWER_LEVEL : 1,
      upgradePath: null,
      rotation: 0,
      target: null,
      lastFireTime: 0,
      kills: 0,
      totalDamage: 0,
      targetPriority: defaultTargetPriority(spawnTowerType),
      placedAt: Date.now(),
      health: 100,
      maxHealth: 100,
      skill: skillType ? { skillId: skillType, lastUsedTime: 0, isActive: false, activeUntil: 0 } : undefined,
    }));

    useGameStore.setState({
      towers: [...state.towers, ...newTowers],
    });
  };

  const emptyCount = useGameStore((s) => sampleBuildablePoints(s.activeMap, 400).length);

  const actualSpawn = Math.min(spawnTowerCount, emptyCount);

  return (
    <div className="space-y-2.5">
      <TowerTypePicker value={spawnTowerType} onChange={setSpawnTowerType} />
      <DevNumberInput label={u.spawnCount} value={spawnTowerCount} onChange={setSpawnTowerCount} min={1} max={100} step={1} />
      <DevButton
        icon={<PlusIcon className="w-3.5 h-3.5" />}
        label={emptyCount === 0 ? u.spawnTowerNone : u.spawnTowerCount.replace('{count}', String(actualSpawn)).replace('{empty}', String(emptyCount))}
        onClick={handleSpawn}
        variant="primary"
        disabled={emptyCount === 0}
        title={u.spawnTowerTitle}
      />
    </div>
  );
};

// ============================================================
// 敵人控制
// ============================================================

const EnemyControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const enemyCount = useGameStore((s) => s.enemies.length);

  const damageAll = (amount: number) => {
    useGameStore.setState((s) => ({
      enemies: s.enemies.map((e) => ({ ...e, health: Math.max(0, e.health - amount) })),
    }));
  };

  const killAll = () => damageAll(99999);

  const setAllTo1HP = () => {
    useGameStore.setState((s) => ({
      enemies: s.enemies.map((e) => ({ ...e, health: 1 })),
    }));
  };

  // 重設速度為原始 baseSpeed × multiplier（向 ENEMY_DATA 取值）
  const setSpeedMultiplier = (mult: number) => {
    useGameStore.setState((s) => ({
      enemies: s.enemies.map((e) => {
        const data = ENEMY_DATA[e.type];
        const baseSpeed = data?.speed ?? e.speed;
        return { ...e, speed: baseSpeed * mult };
      }),
    }));
  };

  return (
    <div className="space-y-2">
      <DevButton
        icon={<FlameIcon className="w-3.5 h-3.5" />}
        label={u.killAllEnemies.replace('{count}', String(enemyCount))}
        onClick={killAll}
        variant="danger"
        disabled={enemyCount === 0}
      />
      <DevButton
        icon={<HeartIcon className="w-3.5 h-3.5" />}
        label={u.enemyDamage100}
        onClick={() => damageAll(100)}
        variant="warning"
        disabled={enemyCount === 0}
      />
      <DevButton
        icon={<LightningIcon className="w-3.5 h-3.5" />}
        label={u.enemyHpOne}
        onClick={setAllTo1HP}
        variant="primary"
        disabled={enemyCount === 0}
      />
      {/* 速度倍率 */}
      <div className="pt-2 mt-1 border-t border-[var(--cn-line-soft)] space-y-1.5">
        <div className="text-[10px] text-[var(--arc-ink-4)] tracking-widest uppercase font-bold">{u.speedMultiplierHint}</div>
        <div className="grid grid-cols-4 gap-1">
          {[0.25, 1, 2, 4].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSpeedMultiplier(m)}
              disabled={enemyCount === 0}
              className={`py-1.5  text-[10px] font-bold tracking-widest border transition-all ${
                enemyCount === 0
                  ? 'bg-[var(--arc-deck-2)] border-[var(--cn-line-soft)] text-[var(--arc-ink-4)] cursor-not-allowed'
                  : 'bg-[var(--arc-deck-2)] border-[var(--cn-line-soft)] text-[var(--arc-ink-2)] hover:bg-[rgba(255,61,113,0.12)] hover:border-[rgba(255,61,113,0.38)] hover:text-[var(--arc-alert)]'
              }`}
            >
              {m}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// AI 自動戰鬥控制
// ============================================================

const AIControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const autoBattleEnabled = useGameStore((s) => s.autoBattleEnabled);
  const autoBattleStrategy = useGameStore((s) => s.autoBattleStrategy);
  const toggleAutoBattle = useGameStore((s) => s.toggleAutoBattle);
  const setAutoBattleStrategy = useGameStore((s) => s.setAutoBattleStrategy);

  const strategies: { id: 'balanced' | 'economy' | 'aggressive' | 'defensive'; label: string; icon: React.ReactNode; accent: string }[] = [
    { id: 'balanced', label: u.aiBalanced, icon: <ScalesIcon className="w-3.5 h-3.5" />, accent: 'cyan' },
    { id: 'economy', label: u.aiEconomy, icon: <CoinIcon className="w-3.5 h-3.5" />, accent: 'amber' },
    { id: 'aggressive', label: u.aiAggressive, icon: <SwordsIcon className="w-3.5 h-3.5" />, accent: 'rose' },
    { id: 'defensive', label: u.aiDefensive, icon: <ShieldIcon className="w-3.5 h-3.5" />, accent: 'emerald' },
  ];

  return (
    <div className="space-y-2">
      <DevToggle
        icon={<RobotIcon className="w-3.5 h-3.5" />}
        label={autoBattleEnabled ? u.aiBattleEnabled : u.aiBattleDisabled}
        value={autoBattleEnabled}
        onChange={toggleAutoBattle}
        accent="emerald"
      />
      <div className="text-[10px] text-[var(--arc-ink-4)] tracking-widest uppercase font-bold pt-1">{u.strategyLabel}</div>
      <div className="grid grid-cols-4 gap-1">
        {strategies.map((s) => {
          const isActive = autoBattleStrategy === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setAutoBattleStrategy(s.id)}
              className={`py-2  flex flex-col items-center gap-0.5 border transition-all ${
                isActive
                  ? 'bg-[var(--arc-deck-3)] text-[var(--arc-ink)] border-[var(--arc-line-strong)] '
                  : 'bg-[var(--arc-deck-2)] text-[var(--arc-ink-4)] border-[var(--cn-line-soft)] hover:bg-[var(--arc-deck-3)] hover:text-[var(--arc-ink-2)]'
              }`}
              title={s.label}
            >
              {s.icon}
              <span className="text-[9px] font-bold tracking-wider">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// 塔控制
// ============================================================

const TowerControl = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const maxTowerLevel = useDevStore((s) => s.maxTowerLevel);
  const freeUpgrades = useDevStore((s) => s.freeUpgrades);
  const toggleMaxTowerLevel = useDevStore((s) => s.toggleMaxTowerLevel);
  const toggleFreeUpgrades = useDevStore((s) => s.toggleFreeUpgrades);
  const towerCount = useGameStore((s) => s.towers.length);

  const upgradeAllTowersToMax = () => {
    useGameStore.setState((s) => ({
      towers: s.towers.map((t) => ({
        ...t,
        level: GAME_CONSTANTS.MAX_TOWER_LEVEL,
      })),
    }));
  };

  const upgradeAllTowers = () => {
    useGameStore.setState((s) => ({
      towers: s.towers.map((t) => ({
        ...t,
        level: Math.min(GAME_CONSTANTS.MAX_TOWER_LEVEL, t.level + 1),
      })),
    }));
  };

  const sellAllTowers = () => {
    // 塔的資料只有 towers 一份，清空就是清空
    useGameStore.setState({ towers: [] });
  };

  return (
    <div className="space-y-2">
      <DevToggle icon={<ShieldIcon className="w-3.5 h-3.5" />} label={u.autoMaxTower} value={maxTowerLevel} onChange={toggleMaxTowerLevel} accent="purple" />
      <DevToggle icon={<CoinIcon className="w-3.5 h-3.5" />} label={u.freeUpgrades} value={freeUpgrades} onChange={toggleFreeUpgrades} accent="purple" />
      <div className="pt-1 border-t border-[var(--cn-line-soft)] space-y-1.5">
        <DevButton
          icon={<PlusIcon className="w-3.5 h-3.5" />}
          label={u.upgradeAllOne.replace('{count}', String(towerCount))}
          onClick={upgradeAllTowers}
          variant="success"
          disabled={towerCount === 0}
        />
        <DevButton
          icon={<LightningIcon className="w-3.5 h-3.5" />}
          label={u.upgradeAllMax.replace('{count}', String(towerCount))}
          onClick={upgradeAllTowersToMax}
          variant="primary"
          disabled={towerCount === 0}
        />
        <DevButton
          icon={<TrashIcon className="w-3.5 h-3.5" />}
          label={u.clearAllTowers.replace('{count}', String(towerCount))}
          onClick={sellAllTowers}
          variant="danger"
          disabled={towerCount === 0}
        />
      </div>
    </div>
  );
};

// ============================================================
// 全域作弊
// ============================================================

const CheatToggles = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const infiniteMoney = useDevStore((s) => s.infiniteMoney);
  const infiniteHealth = useDevStore((s) => s.infiniteHealth);
  const godMode = useDevStore((s) => s.godMode);
  const toggleInfiniteMoney = useDevStore((s) => s.toggleInfiniteMoney);
  const toggleInfiniteHealth = useDevStore((s) => s.toggleInfiniteHealth);
  const toggleGodMode = useDevStore((s) => s.toggleGodMode);

  return (
    <div className="space-y-2">
      <DevToggle icon={<CoinIcon className="w-3.5 h-3.5" />} label={u.infiniteMoney} value={infiniteMoney} onChange={toggleInfiniteMoney} accent="amber" />
      <DevToggle icon={<HeartIcon className="w-3.5 h-3.5" />} label={u.infiniteHealth} value={infiniteHealth} onChange={toggleInfiniteHealth} accent="rose" />
      <DevToggle icon={<ShieldIcon className="w-3.5 h-3.5" />} label={u.godMode} value={godMode} onChange={toggleGodMode} accent="emerald" />
    </div>
  );
};

// ============================================================
// 主匯出
// ============================================================

export const CombatSection = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <DevSection
        title={t.dev.secEnemySpawner}
        icon={<AlienIcon className="w-4 h-4" />}
        accent="rose"
        keywords={['enemy', 'spawn', 'monster', '敵人', '生成', '怪物']}
      >
        <EnemySpawner />
      </DevSection>
      <DevSection
        title={t.dev.secEnemyControl}
        icon={<FlameIcon className="w-4 h-4" />}
        accent="rose"
        keywords={['enemy', 'damage', 'kill', 'speed', '敵人', '消滅', '速度']}
      >
        <EnemyControl />
      </DevSection>
      <DevSection
        title={t.dev.secTowerSpawner}
        icon={<PlusIcon className="w-4 h-4" />}
        accent="cyan"
        keywords={['tower', 'spawn', 'build', '塔', '生成', '建造']}
      >
        <TowerSpawner />
      </DevSection>
      <DevSection
        title={t.dev.secTowerControl}
        icon={<TowerIcon className="w-4 h-4" />}
        accent="cyan"
        keywords={['tower', 'upgrade', 'level', 'max', 'sell', '塔', '升級', '滿級']}
      >
        <TowerControl />
      </DevSection>
      <DevSection
        title={t.dev.secAIAutoBattle}
        icon={<RobotIcon className="w-4 h-4" />}
        accent="emerald"
        keywords={['ai', 'auto', 'bot', 'robot', 'strategy', '自動', 'AI', '策略']}
      >
        <AIControl />
      </DevSection>
      <DevSection
        title={t.dev.secGlobalCheats}
        icon={<WarningIcon className="w-4 h-4" />}
        accent="amber"
        keywords={['cheat', 'god', 'infinite', '作弊', '無敵', '無限', '上帝']}
      >
        <CheatToggles />
      </DevSection>
    </div>
  );
};
