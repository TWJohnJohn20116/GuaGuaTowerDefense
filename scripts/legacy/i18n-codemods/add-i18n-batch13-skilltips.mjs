/** batch13：encyclopedia skillTips / recommendReasons / counterReasons 全語系 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');

const SKILL_TIPS = {
  ja: {
    lightningStorm: ['密集ウェーブ向き', '減速タワーと組み合わせ'],
    frozenTime: ['ボスウェーブ用に温存', '凍結中にタワー強化'],
    cashRain: ['序盤の経済用', '大量建設と相性良し'],
    battleInspire: ['ボス前に発動', '高 DPS タワーと重ね'],
    meteorStorm: ['経路合流点に照準', 'エリートに高爆発'],
    chainLightning: ['群れに特に強い', '敵の密集が必要'],
    holyHeal: ['緊急回復用', '氷タワーの制御は代替不可'],
    aegisBarrier: ['漏れウェーブで発動', '売却・再建の時間稼ぎ'],
    warpTrap: ['長い直線に配置', '高速敵の進行をリセット'],
  },
  ko: {
    lightningStorm: ['밀집 웨이브에 적합', '감속 타워와 조합'],
    frozenTime: ['보스 웨이브용 보관', '빙결 중 타워 강화'],
    cashRain: ['초반 경제용', '대량 건설과 궁합'],
    battleInspire: ['보스 전 발동', '고 DPS 타워와 중첩'],
    meteorStorm: ['경로 합류점 조준', '정예에게 고폭발'],
    chainLightning: ['떼에 특히 강함', '적 밀집 필요'],
    holyHeal: ['긴급 회복용', '얼음 타워 제어 대체 불가'],
    aegisBarrier: ['누수 웨이브에 발동', '매각·재건 시간 확보'],
    warpTrap: ['긴 직선에 배치', '고속 적 진행 리셋'],
  },
  de: {
    lightningStorm: ['Ideal bei dichten Wellen', 'Mit Verlangsamungstürmen kombinieren'],
    frozenTime: ['Für Boss-Wellen aufheben', 'Türme während Einfrieren upgraden'],
    cashRain: ['Früh für Wirtschaft', 'Passt zu viel Bauen'],
    battleInspire: ['Vor Boss aktivieren', 'Mit hohem DPS stapeln'],
    meteorStorm: ['Auf Wegkreuzungen zielen', 'Hoher Burst gegen Elites'],
    chainLightning: ['Stark gegen Schwärme', 'Gegner müssen gruppiert sein'],
    holyHeal: ['Notfall-Heilung', 'Ersetzt kein Eis-Kontrolle'],
    aegisBarrier: ['Bei durchgelassenen Wellen', 'Zeit für Verkauf und Neubau'],
    warpTrap: ['Auf lange Geraden', 'Setzt schnelle Gegner zurück'],
  },
  fr: {
    lightningStorm: ['Idéal sur vagues denses', 'Combiner avec tours de ralentissement'],
    frozenTime: ['Garder pour vagues boss', 'Améliorer tours pendant gel'],
    cashRain: ['Économie en début de partie', 'Associer à construction massive'],
    battleInspire: ['Activer avant le boss', 'Cumuler avec haut DPS'],
    meteorStorm: ['Viser les croisements de chemin', 'Gros burst sur élites'],
    chainLightning: ['Fort contre essaims', 'Nécessite des groupes d\'ennemis'],
    holyHeal: ['Soin d\'urgence', 'Ne remplace pas le contrôle de glace'],
    aegisBarrier: ['Sur vagues avec fuites', 'Gagner du temps pour vendre/reconstruire'],
    warpTrap: ['Sur longues lignes droites', 'Réinitialise les ennemis rapides'],
  },
  es: {
    lightningStorm: ['Ideal en oleadas densas', 'Combinar con torres de ralentización'],
    frozenTime: ['Guardar para oleadas boss', 'Mejorar torres durante congelación'],
    cashRain: ['Economía temprana', 'Combina con mucha construcción'],
    battleInspire: ['Activar antes del boss', 'Apilar con alto DPS'],
    meteorStorm: ['Apuntar a cruces de camino', 'Alto burst contra élites'],
    chainLightning: ['Fuerte contra enjambres', 'Requiere enemigos agrupados'],
    holyHeal: ['Curación de emergencia', 'No reemplaza control de hielo'],
    aegisBarrier: ['En oleadas con fugas', 'Tiempo para vender y reconstruir'],
    warpTrap: ['En rectas largas', 'Reinicia progreso de enemigos rápidos'],
  },
  ru: {
    lightningStorm: ['Лучше на плотных волнах', 'Сочетать с башнями замедления'],
    frozenTime: ['Беречь для волн боссов', 'Улучшать башни во время заморозки'],
    cashRain: ['Для ранней экономики', 'Хорошо с массовой постройкой'],
    battleInspire: ['Включать перед боссом', 'Стакать с высоким DPS'],
    meteorStorm: ['Целиться в перекрёстки пути', 'Высокий burst по элитам'],
    chainLightning: ['Силён против роя', 'Нужна скученность врагов'],
    holyHeal: ['Экстренное лечение', 'Не заменяет ледяной контроль'],
    aegisBarrier: ['При пропуске волн', 'Время на продажу и перестройку'],
    warpTrap: ['На длинных прямых', 'Сбрасывает прогресс быстрых врагов'],
  },
  pt: {
    lightningStorm: ['Ideal em ondas densas', 'Combinar com torres de lentidão'],
    frozenTime: ['Guardar para ondas de boss', 'Melhorar torres durante congelamento'],
    cashRain: ['Economia no início', 'Combina com muita construção'],
    battleInspire: ['Ativar antes do boss', 'Empilhar com alto DPS'],
    meteorStorm: ['Mirar em cruzamentos de rota', 'Alto burst em elites'],
    chainLightning: ['Forte contra enxames', 'Precisa de inimigos agrupados'],
    holyHeal: ['Cura de emergência', 'Não substitui controle de gelo'],
    aegisBarrier: ['Em ondas com vazamentos', 'Tempo para vender e reconstruir'],
    warpTrap: ['Em retas longas', 'Reseta progresso de inimigos rápidos'],
  },
};

const RECOMMEND = {
  ja: {
    reason_slow_fast: '減速効果は高速敵の脅威を大幅に下げる',
    reason_slow_berserk: '減速はバーサークの速度上昇に対抗できる',
    reason_splash_swarm: '範囲/連鎖ダメージで弱い敵を一掃',
    reason_high_dmg_tank: '高単体ダメージは高 HP ターゲット向き',
    reason_high_dmg_boss: '強力な単体火力がボス撃破の鍵',
    reason_poison_healer: '継続毒で回復効果を相殺',
    reason_poison_shield: '毒はシールドを貫通してダメージ',
    reason_wind_all: 'ノックバックで通過時間を延ばし他タワーの攻撃機会を増やす',
    reason_flame_armor: '継続火炎で高防御敵を削る',
    reason_balanced: 'バランス出力で大多数の敵に対応',
  },
  ko: {
    reason_slow_fast: '감속 효과는 빠른 적의 위협을 크게 줄임',
    reason_slow_berserk: '감속은 광폭화 속도 증가에 대응',
    reason_splash_swarm: '범위/연쇄 피해로 약한 적 다수 제거',
    reason_high_dmg_tank: '높은 단일 피해는 고 HP 대상에 적합',
    reason_high_dmg_boss: '강력한 단일 화력이 보스 처치의 핵심',
    reason_poison_healer: '지속 독으로 회복 효과 상쇄',
    reason_poison_shield: '독은 방패를 관통해 피해',
    reason_wind_all: '넉백으로 통과 시간을 늘려 다른 타워 공격 기회 증가',
    reason_flame_armor: '지속 화염으로 고방어 적 소모',
    reason_balanced: '균형 출력으로 대부분의 적 대응',
  },
  de: {
    reason_slow_fast: 'Verlangsamung reduziert die Bedrohung schneller Gegner deutlich',
    reason_slow_berserk: 'Verlangsamung kontert Berserker-Temposchub',
    reason_splash_swarm: 'Flächen-/Kettenschaden räumt viele schwache Gegner auf',
    reason_high_dmg_tank: 'Hoher Einzelschaden für Ziele mit viel Leben',
    reason_high_dmg_boss: 'Starker Einzel-DPS ist der Schlüssel gegen Bosse',
    reason_poison_healer: 'Dauer-Gift hebt Heilung auf',
    reason_poison_shield: 'Gift durchdringt Schilde und verursacht Schaden',
    reason_wind_all: 'Rückstoß verlängert die Durchlaufzeit für mehr Angriffsfenster',
    reason_flame_armor: 'Dauer-Feuer nutzt hohe Verteidigung ab',
    reason_balanced: 'Ausgewogener Schaden für die meisten Gegner',
  },
  fr: {
    reason_slow_fast: 'Le ralentissement réduit fortement la menace des ennemis rapides',
    reason_slow_berserk: 'Le ralentissement contre le boost de vitesse berserk',
    reason_splash_swarm: 'Dégâts de zone/chaîne éliminent de nombreux faibles',
    reason_high_dmg_tank: 'Gros dégâts mono-cible pour cibles à hauts PV',
    reason_high_dmg_boss: 'Fort DPS mono-cible est clé contre les boss',
    reason_poison_healer: 'Poison continu annule les soins',
    reason_poison_shield: 'Le poison perce les boucliers',
    reason_wind_all: 'Repoussement prolonge le passage pour plus de fenêtres d\'attaque',
    reason_flame_armor: 'Feu continu use les ennemis à haute défense',
    reason_balanced: 'Dégâts équilibrés pour la plupart des ennemis',
  },
  es: {
    reason_slow_fast: 'Ralentizar reduce mucho la amenaza de enemigos rápidos',
    reason_slow_berserk: 'Ralentizar contrarresta el impulso de velocidad berserk',
    reason_splash_swarm: 'Daño en área/cadena elimina muchos débiles',
    reason_high_dmg_tank: 'Alto daño single-target para objetivos con mucha vida',
    reason_high_dmg_boss: 'Fuerte DPS single-target es clave contra jefes',
    reason_poison_healer: 'Veneno continuo anula curaciones',
    reason_poison_shield: 'Veneno atraviesa escudos y causa daño',
    reason_wind_all: 'Empuje alarga el paso y da más ventanas de ataque',
    reason_flame_armor: 'Fuego continuo desgasta enemigos con alta defensa',
    reason_balanced: 'Daño equilibrado para la mayoría de enemigos',
  },
  ru: {
    reason_slow_fast: 'Замедление сильно снижает угрозу быстрых врагов',
    reason_slow_berserk: 'Замедление против скорости берсерка',
    reason_splash_swarm: 'AoE/цепной урон зачищает слабых врагов',
    reason_high_dmg_tank: 'Высокий одиночный урон для целей с большим HP',
    reason_high_dmg_boss: 'Сильный одиночный DPS — ключ к боссам',
    reason_poison_healer: 'Постоянный яд отменяет лечение',
    reason_poison_shield: 'Яд пробивает щиты и наносит урон',
    reason_wind_all: 'Отбрасывание удлиняет проход и даёт больше окон атаки',
    reason_flame_armor: 'Огненный урон со временем изнашивает броню',
    reason_balanced: 'Сбалансированный урон против большинства врагов',
  },
  pt: {
    reason_slow_fast: 'Lentidão reduz muito a ameaça de inimigos rápidos',
    reason_slow_berserk: 'Lentidão contraria o impulso de velocidade berserk',
    reason_splash_swarm: 'Dano em área/cadeia elimina muitos fracos',
    reason_high_dmg_tank: 'Alto dano single-target para alvos com muita vida',
    reason_high_dmg_boss: 'Forte DPS single-target é chave contra chefes',
    reason_poison_healer: 'Veneno contínuo anula curas',
    reason_poison_shield: 'Veneno perfura escudos e causa dano',
    reason_wind_all: 'Empurrão prolonga a passagem e dá mais janelas de ataque',
    reason_flame_armor: 'Fogo contínuo desgasta inimigos com alta defesa',
    reason_balanced: 'Dano equilibrado para a maioria dos inimigos',
  },
};

const COUNTER = {
  ja: {
    cr_speed_frost: '減速効果は高速敵の脅威を大幅に下げる',
    cr_speed_wind: 'ノックバックで高速敵の突進を中断',
    cr_health_sniper: '高単体ダメージで高 HP 敵に対応',
    cr_health_poison: '継続毒で HP を効果的に削る',
    cr_healer_poison: '毒で回復効果を相殺',
    cr_healer_sniper: '高バーストでヒーラーを素早く排除',
    cr_shield_lightning: '雷属性はシールド貫通に有効',
    cr_shield_poison: '毒は時間経過でシールド保護を迂回',
    cr_split_cannon: 'スプラッシュで分裂後の子体にも命中',
    cr_split_lightning: '連鎖雷で分裂ユニットを一掃',
    cr_flyer_machine: '高射速で飛行敵を素早く撃墜',
    cr_flyer_lightning: '即時命中は飛行敵が回避できない',
    cr_default_basic: 'バランス属性で大多数の通常敵に対応',
    cr_default_machine: '高射速で弱い敵を素早く処理',
  },
  ko: {
    cr_speed_frost: '감속 효과는 빠른 적의 위협을 크게 줄임',
    cr_speed_wind: '넉백으로 빠른 적 돌진 중단',
    cr_health_sniper: '높은 단일 피해로 고 HP 적 대응',
    cr_health_poison: '지속 독으로 HP 효과적 소모',
    cr_healer_poison: '독으로 회복 효과 상쇄',
    cr_healer_sniper: '고 폭발로 힐러 빠르게 제거',
    cr_shield_lightning: '번개는 방패 관통에 효과적',
    cr_shield_poison: '독은 시간에 따라 방패 보호 우회',
    cr_split_cannon: '스플래시로 분열 자식에도 명중',
    cr_split_lightning: '연쇄 번개로 분열 유닛 일소',
    cr_flyer_machine: '고 사거리로 비행 적 빠르게 격추',
    cr_flyer_lightning: '즉시 명중은 비행 적이 피할 수 없음',
    cr_default_basic: '균형 속성으로 대부분 일반 적 대응',
    cr_default_machine: '고 사거리로 약한 적 빠르게 처리',
  },
  de: {
    cr_speed_frost: 'Verlangsamung reduziert die Bedrohung schneller Gegner deutlich',
    cr_speed_wind: 'Rückstoß unterbricht schnelle Anstürme',
    cr_health_sniper: 'Hoher Einzelschaden gegen Gegner mit viel Leben',
    cr_health_poison: 'Dauer-Gift nutzt Leben effektiv ab',
    cr_healer_poison: 'Gift hebt Heilung auf',
    cr_healer_sniper: 'Hoher Burst eliminiert Heiler schnell',
    cr_shield_lightning: 'Blitz durchdringt Schilde effektiv',
    cr_shield_poison: 'Gift umgeht Schutz über Zeit',
    cr_split_cannon: 'Flächenschaden trifft geteilte Nachkommen',
    cr_split_lightning: 'Kettenblitz räumt geteilte Einheiten auf',
    cr_flyer_machine: 'Hohe Feuerrate schießt Flieger schnell ab',
    cr_flyer_lightning: 'Soforttreffer kann von Fliegern nicht ausgewichen werden',
    cr_default_basic: 'Ausgewogene Werte für die meisten normalen Gegner',
    cr_default_machine: 'Hohe Feuerrate räumt schwache Gegner schnell weg',
  },
  fr: {
    cr_speed_frost: 'Ralentissement réduit fortement la menace des ennemis rapides',
    cr_speed_wind: 'Repoussement interrompt les charges rapides',
    cr_health_sniper: 'Gros dégâts mono-cible contre ennemis à hauts PV',
    cr_health_poison: 'Poison continu use efficacement les PV',
    cr_healer_poison: 'Poison annule les soins',
    cr_healer_sniper: 'Fort burst élimine rapidement les soigneurs',
    cr_shield_lightning: 'Foudre perce efficacement les boucliers',
    cr_shield_poison: 'Poison contourne la protection au fil du temps',
    cr_split_cannon: 'Dégâts de zone touchent les clones divisés',
    cr_split_lightning: 'Éclair en chaîne nettoie les unités divisées',
    cr_flyer_machine: 'Cadence élevée abat vite les volants',
    cr_flyer_lightning: 'Coup instantané impossible à esquiver en vol',
    cr_default_basic: 'Attributs équilibrés pour la plupart des ennemis normaux',
    cr_default_machine: 'Cadence élevée nettoie vite les faibles',
  },
  es: {
    cr_speed_frost: 'Ralentizar reduce mucho la amenaza de enemigos rápidos',
    cr_speed_wind: 'Empuje interrumpe cargas rápidas',
    cr_health_sniper: 'Alto daño single-target contra enemigos con mucha vida',
    cr_health_poison: 'Veneno continuo desgasta vida eficazmente',
    cr_healer_poison: 'Veneno anula curaciones',
    cr_healer_sniper: 'Alto burst elimina sanadores rápido',
    cr_shield_lightning: 'Rayo perfora escudos eficazmente',
    cr_shield_poison: 'Veneno evita protección de escudo con el tiempo',
    cr_split_cannon: 'Salpicadura golpea descendientes divididos',
    cr_split_lightning: 'Rayo en cadena limpia unidades divididas',
    cr_flyer_machine: 'Alta cadencia derriba voladores rápido',
    cr_flyer_lightning: 'Golpe instantáneo no esquivable por voladores',
    cr_default_basic: 'Atributos equilibrados para la mayoría de enemigos normales',
    cr_default_machine: 'Alta cadencia limpia débiles rápido',
  },
  ru: {
    cr_speed_frost: 'Замедление сильно снижает угрозу быстрых врагов',
    cr_speed_wind: 'Отбрасывание прерывает быстрые рывки',
    cr_health_sniper: 'Высокий одиночный урон против врагов с большим HP',
    cr_health_poison: 'Постоянный яд эффективно изнашивает здоровье',
    cr_healer_poison: 'Яд отменяет лечение',
    cr_healer_sniper: 'Высокий burst быстро убивает целителей',
    cr_shield_lightning: 'Молния эффективно пробивает щиты',
    cr_shield_poison: 'Яд со временем обходит защиту щита',
    cr_split_cannon: 'Splash попадает по потомкам после разделения',
    cr_split_lightning: 'Цепная молния зачищает разделённые юниты',
    cr_flyer_machine: 'Высокая скорострельность быстро сбивает летающих',
    cr_flyer_lightning: 'Мгновенное попадание не уклонить летающим',
    cr_default_basic: 'Сбалансированные параметры против большинства обычных врагов',
    cr_default_machine: 'Высокая скорострельность быстро зачищает слабых',
  },
  pt: {
    cr_speed_frost: 'Lentidão reduz muito a ameaça de inimigos rápidos',
    cr_speed_wind: 'Empurrão interrompe investidas rápidas',
    cr_health_sniper: 'Alto dano single-target contra inimigos com muita vida',
    cr_health_poison: 'Veneno contínuo desgasta vida eficazmente',
    cr_healer_poison: 'Veneno anula curas',
    cr_healer_sniper: 'Alto burst elimina curadores rápido',
    cr_shield_lightning: 'Raio perfura escudos eficazmente',
    cr_shield_poison: 'Veneno contorna proteção de escudo com o tempo',
    cr_split_cannon: 'Splash atinge descendentes divididos',
    cr_split_lightning: 'Raio em cadeia limpa unidades divididas',
    cr_flyer_machine: 'Alta cadência derruba voadores rápido',
    cr_flyer_lightning: 'Acerto instantâneo não esquivável por voadores',
    cr_default_basic: 'Atributos equilibrados para a maioria dos inimigos normais',
    cr_default_machine: 'Alta cadência limpa fracos rápido',
  },
};

function patchObjectBlock(s, blockName, data) {
  let n = 0;
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val)) {
      const arrStr = val.map((x) => JSON.stringify(x)).join(', ');
      const re = new RegExp(`(${blockName}: \\{[\\s\\S]*?${key}: \\[)[^\\]]*(\\],)`);
      const next = s.replace(re, `$1${arrStr}$2`);
      if (next !== s) { n++; s = next; }
    } else {
      const re = new RegExp(`(${blockName}: \\{[\\s\\S]*?${key}: )"[^"]*",`);
      const next = s.replace(re, `$1${JSON.stringify(val)},`);
      if (next !== s) { n++; s = next; }
    }
  }
  return { s, n };
}

for (const loc of ['ja', 'ko', 'de', 'fr', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  let total = 0;
  for (const [block, data] of [
    ['recommendReasons', RECOMMEND[loc]],
    ['counterReasons', COUNTER[loc]],
    ['skillTips', SKILL_TIPS[loc]],
  ]) {
    const r = patchObjectBlock(s, block, data);
    s = r.s;
    total += r.n;
  }
  fs.writeFileSync(file, s, 'utf8');
  console.log('skilltips patch', loc, total);
}

console.log('Done skilltips locales');
