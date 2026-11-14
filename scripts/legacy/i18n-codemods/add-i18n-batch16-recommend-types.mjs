/** batch16：encyclopedia recommendTypes 全語系 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');

const TYPES = {
  ja: {
    fast_enemies: '高速 / 超高速敵',
    berserker: 'バーサーク',
    swarm: 'スウォーム',
    tank: 'タンク / 重装敵',
    boss: 'ボス',
    healer: 'ヒーラー敵',
    shield_enemy: 'シールド敵',
    all_types: '全タイプ',
    armored_enemy: '装甲敵',
    normal_elite: '通常 / エリート敵',
  },
  ko: {
    fast_enemies: '빠른 / 초고속 적',
    berserker: '광폭화',
    swarm: '떼',
    tank: '탱크 / 중장갑 적',
    boss: '보스',
    healer: '힐러 적',
    shield_enemy: '방패 적',
    all_types: '모든 유형',
    armored_enemy: '장갑 적',
    normal_elite: '일반 / 정예 적',
  },
  de: {
    fast_enemies: 'Schnelle / sehr schnelle Gegner',
    berserker: 'Berserker',
    swarm: 'Schwarm',
    tank: 'Panzer / schwerer Gegner',
    boss: 'Boss',
    healer: 'Heiler-Gegner',
    shield_enemy: 'Gegner mit Schild',
    all_types: 'Alle Typen',
    armored_enemy: 'Gepanzerte Gegner',
    normal_elite: 'Normal / Elite-Gegner',
  },
  fr: {
    fast_enemies: 'Ennemis rapides / très rapides',
    berserker: 'Berserk',
    swarm: 'Essaim',
    tank: 'Tank / ennemi lourd',
    boss: 'Boss',
    healer: 'Ennemi soigneur',
    shield_enemy: 'Ennemi bouclier',
    all_types: 'Tous types',
    armored_enemy: 'Ennemi blindé',
    normal_elite: 'Ennemis normaux / élites',
  },
  es: {
    fast_enemies: 'Enemigos rápidos / muy rápidos',
    berserker: 'Berserk',
    swarm: 'Enjambre',
    tank: 'Tanque / enemigo pesado',
    boss: 'Jefe',
    healer: 'Enemigo sanador',
    shield_enemy: 'Enemigo con escudo',
    all_types: 'Todos los tipos',
    armored_enemy: 'Enemigo acorazado',
    normal_elite: 'Enemigos normales / élite',
  },
  ru: {
    fast_enemies: 'Быстрые / очень быстрые враги',
    berserker: 'Берсерк',
    swarm: 'Рой',
    tank: 'Танк / тяжёлый враг',
    boss: 'Босс',
    healer: 'Целитель',
    shield_enemy: 'Враг со щитом',
    all_types: 'Все типы',
    armored_enemy: 'Бронированный враг',
    normal_elite: 'Обычные / элитные враги',
  },
  pt: {
    fast_enemies: 'Inimigos rápidos / muito rápidos',
    berserker: 'Berserk',
    swarm: 'Enxame',
    tank: 'Tanque / inimigo pesado',
    boss: 'Chefe',
    healer: 'Inimigo curador',
    shield_enemy: 'Inimigo com escudo',
    all_types: 'Todos os tipos',
    armored_enemy: 'Inimigo blindado',
    normal_elite: 'Inimigos normais / elite',
  },
};

for (const loc of ['ja', 'ko', 'de', 'fr', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  let n = 0;
  for (const [key, val] of Object.entries(TYPES[loc])) {
    const re = new RegExp(`(recommendTypes: \\{[\\s\\S]*?${key}: )"[^"]*",`);
    const next = s.replace(re, `$1${JSON.stringify(val)},`);
    if (next !== s) { n++; s = next; }
  }
  fs.writeFileSync(file, s, 'utf8');
  console.log('recommendTypes', loc, n);
}

console.log('Done recommendTypes');
