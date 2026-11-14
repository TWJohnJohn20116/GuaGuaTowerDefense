/** batch19：圖鑑 enemyGuides 整段 de/fr/es/ru/pt（對齊 zh-TW 深度） */

import { ES as ES_FULL, RU as RU_FULL, PT as PT_FULL } from './batch20EncEsRuPt.mjs';
import { DE_POLISH, FR_POLISH } from './batch23EncDeFrPolish.mjs';

export const ENEMY_IDS = [
  'normal', 'fast', 'elite', 'speedy', 'tank', 'heavy', 'boss', 'flyer', 'healer',
  'spawner', 'shield', 'stealth', 'berserker', 'armored', 'mage', 'miniboss', 'swarm', 'ghost', 'bomber',
];

function line(id, d) {
  const tips = d.tips.map((t) => JSON.stringify(t)).join(', ');
  const cr = Object.entries(d.counterReasons).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ');
  return `      ${id}: { abilityDesc: ${JSON.stringify(d.abilityDesc)}, tips: [${tips}], weakness: ${JSON.stringify(d.weakness)}, spawnWave: ${JSON.stringify(d.spawnWave)}, counterReasons: { ${cr} } },`;
}

const EN = {
  normal: { abilityDesc: 'No special ability - basic unit.', tips: ['Main early waves - 1-2 basic towers enough', 'Many normals late - need AOE', 'No resistance'], weakness: 'No resistance, all towers work', spawnWave: 'From Wave 1', counterReasons: { basic: 'Best value early' } },
  fast: { abilityDesc: 'Speed 1.6x, lower HP. Rushes defenses.', tips: ['Firepower at path start', 'Frost slow is critical', 'Low HP - fast towers kill quickly'], weakness: 'Low HP, burst kill', spawnWave: 'From Wave 2', counterReasons: { frost: 'Slow catches it', machine: 'Fast fire kills low HP' } },
  elite: { abilityDesc: 'Higher speed and HP than normal.', tips: ['Harder than normal', 'Sniper ideal', 'Stack firepower'], weakness: 'No special ability', spawnWave: 'From Wave 3', counterReasons: { sniper: 'High burst removes HP' } },
  speedy: { abilityDesc: 'Speed 2.0x, extremely fast.', tips: ['Deploy in advance', 'Laser/lightning never miss', 'Slow at entrance'], weakness: 'Very low HP (40)', spawnWave: 'From Wave 5', counterReasons: { frost: 'Required without slow', laser: 'Instant hit', lightning: 'Instant + chain' } },
  tank: { abilityDesc: 'HP 200, slow but tough.', tips: ['Slow - plenty of time', 'Concentrated high damage', 'Poison DoT effective'], weakness: 'Slow, long attack window', spawnWave: 'From Wave 4', counterReasons: { sniper: 'Burst on HP', poison: 'DoT chips HP' } },
  heavy: { abilityDesc: 'HP 280, extremely armored.', tips: ['Multiple DPS towers', 'Pair with frost', 'Upgrade beats new build'], weakness: 'Slowest (0.5x)', spawnWave: 'From Wave 6', counterReasons: { laser: 'Huge single damage', frost: 'Slow extends window', poison: 'Sustained chip' } },
  boss: { abilityDesc: 'Boss HP 500, reward 100 $.', tips: ['Prepare ahead!', 'Max upgrade core towers', 'Freeze near end'], weakness: 'Slow but massive HP', spawnWave: 'From Wave 10', counterReasons: { frost: 'Freeze buys time', laser: 'Huge damage', sniper: 'Piercing massive hit' } },
  flyer: { abilityDesc: 'Flies straight to end, ignores path.', tips: ['Only in-range towers hit', 'Defend straight line', 'Long range better'], weakness: 'Low HP (60)', spawnWave: 'From Wave 5', counterReasons: { laser: 'Long range covers path', sniper: 'Long range high damage' } },
  healer: { abilityDesc: 'Heals nearby enemies 5 HP/s within 80px.', tips: ['Priority kill!', 'Burst towers', 'Separate from tanks'], weakness: 'Own HP not high', spawnWave: 'From Wave 7', counterReasons: { sniper: 'Burst kills healer', laser: 'Precise long kill' } },
  spawner: { abilityDesc: 'Splits into 3 normals on death.', tips: ['Threat after death!', 'Prep AOE for splits', 'Need rear defense'], weakness: 'Slow body first', spawnWave: 'From Wave 8', counterReasons: { cannon: 'Splash clears splits', lightning: 'Chain kills splits' } },
  shield: { abilityDesc: '80 shield + 2 regen/s. Break shield first.', tips: ['Shield regenerates', 'Fast attack breaks shield', 'Focus after break'], weakness: 'Normal after shield breaks', spawnWave: 'From Wave 6', counterReasons: { machine: 'Fast break shield', flame: 'Suppress regen' } },
  stealth: { abilityDesc: 'Stealths 3s every 5s.', tips: ['Towers may not attack', 'AOE/DoT still work', 'Poison before stealth'], weakness: 'Cooldown between stealth', spawnWave: 'From Wave 7', counterReasons: { poison: 'Damages in stealth', flame: 'Burn ignores stealth', cannon: 'Splash may hit' } },
  berserker: { abilityDesc: 'Berserks below 30% HP, doubles speed.', tips: ['Kill fast!', 'Burst avoids berserk', 'Frost if berserked'], weakness: 'Slow until 30% HP', spawnWave: 'From Wave 6', counterReasons: { sniper: 'Burst avoids berserk', frost: 'Slow safety net' } },
  armored: { abilityDesc: 'Armor reduces each hit by 5.', tips: ['Low damage useless', 'High single-hit needed', 'Poison ignores armor'], weakness: 'Weak vs high damage', spawnWave: 'From Wave 7', counterReasons: { sniper: 'High single hit', poison: 'Ignores armor', laser: 'High damage' } },
  mage: { abilityDesc: 'Teleports 2 cells forward every 8s.', tips: ['Very dangerous!', 'Multiple defense points', 'Single point bypassed', 'Freeze stops teleport'], weakness: 'Medium HP', spawnWave: 'From Wave 8', counterReasons: { frost: 'Freeze stops teleport', laser: 'Long range tracking' } },
  miniboss: { abilityDesc: 'Mid Boss HP 350, reward 75 $.', tips: ['Weaker than Boss', 'More frequent', 'Upgrades key'], weakness: 'Slow, time to attack', spawnWave: 'From Wave 8', counterReasons: { laser: 'High core damage', frost: 'Slow buys time' } },
  swarm: { abilityDesc: 'HP 25 but many, can overrun.', tips: ['Quantity wins', 'AOE counter', 'Do not underestimate'], weakness: 'Very low HP', spawnWave: 'From Wave 5', counterReasons: { cannon: 'Splash clears group', lightning: 'Chain multi-kill', flame: 'AOE burn' } },
  ghost: { abilityDesc: 'Phase 2s every 4s, immune while phased.', tips: ['Wait during phase', 'Burst when solid', 'DoT useless in phase'], weakness: 'Vulnerable when solid', spawnWave: 'From Wave 9', counterReasons: { sniper: 'Burst when solid', frost: 'Slow when solid' } },
  bomber: { abilityDesc: 'Explodes on death, 15 dmg in 60px.', tips: ['Towers not too close', 'Ranged safer', 'Stacked deaths hurt'], weakness: 'Medium HP, kill early', spawnWave: 'From Wave 7', counterReasons: { sniper: 'Safe distance kill', laser: 'Very long range' } },
};

const DE = DE_POLISH;

const FR = FR_POLISH;

const ES = ES_FULL;

const RU = RU_FULL;

const PT = PT_FULL;

const GUIDES = { en: EN, de: DE, fr: FR, es: ES, ru: RU, pt: PT };

export function formatEnemyGuidesBlock(loc) {
  const data = GUIDES[loc] ?? EN;
  return ENEMY_IDS.map((id) => line(id, data[id] ?? EN[id])).join('\n');
}
