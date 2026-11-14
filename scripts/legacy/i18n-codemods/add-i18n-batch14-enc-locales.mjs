/** batch14：encyclopedia abilities + difficulties desc/tips 補譯 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');

const ABILITIES = {
  fr: {
    flying: 'Vol', healing: 'Aura de soin', spawning: 'Division à la mort', shield: 'Régén. bouclier',
    stealth: 'Furtivité', berserk: 'Berserk', armored: 'Armure lourde', teleport: 'Téléportation',
    miniboss: 'Mini boss', swarm: 'Essaim', phase: 'Changement de phase', explode: 'Explosion mortelle', sabotage: 'Saboter les tours',
  },
  es: {
    flying: 'Vuelo', healing: 'Aura curativa', spawning: 'División al morir', shield: 'Regeneración de escudo',
    stealth: 'Sigilo', berserk: 'Berserk', armored: 'Armadura pesada', teleport: 'Teletransporte',
    miniboss: 'Mini jefe', swarm: 'Enjambre', phase: 'Cambio de fase', explode: 'Explosión al morir', sabotage: 'Sabotea torres',
  },
  ru: {
    flying: 'Полёт', healing: 'Аура лечения', spawning: 'Разделение при смерти', shield: 'Реген. щита',
    stealth: 'Невидимость', berserk: 'Берсерк', armored: 'Тяжёлая броня', teleport: 'Телепорт',
    miniboss: 'Мини-босс', swarm: 'Рой', phase: 'Смена фазы', explode: 'Взрыв при смерти', sabotage: 'Саботаж башен',
  },
  pt: {
    flying: 'Voo', healing: 'Aura curativa', spawning: 'Divisão ao morrer', shield: 'Regeneração de escudo',
    stealth: 'Furtividade', berserk: 'Berserk', armored: 'Armadura pesada', teleport: 'Teletransporte',
    miniboss: 'Mini chefe', swarm: 'Enxame', phase: 'Mudança de fase', explode: 'Explosão ao morrer', sabotage: 'Sabota torres',
  },
};

const DIFF = {
  ja: {
    easy: {
      description: '初心者やカジュアル向け。資源が豊富で敵が弱く、ミスに余裕あり。',
      tips: ['初期 HP が高い', '敵 HP と速度が低下', '撃破報酬が増加', 'タワー建設コストが低下'],
    },
    normal: {
      description: '標準的なバランス。ある程度 TD 経験のあるプレイヤー向け。',
      tips: ['標準的な初期資源', '敵ステータスが均衡', '標準的な撃破報酬', '初見プレイにおすすめ'],
    },
    hard: {
      description: '高難度。敵が強く資源が少なく、綿密な防御計画が必要。',
      tips: ['初期資源が減少', '敵 HP と速度が上昇', '撃破報酬が低下', '戦略的配置が必須'],
    },
    nightmare: {
      description: '極限難度。敵 HP 2 倍、高速、ミス許容度が非常に低い。',
      tips: ['初期資源が大幅減少', '敵 HP が 2 倍', '敵速度が上昇', '完璧な実行が必要'],
    },
    impossible: {
      description: '究極の挑戦！真の達人のみ生存可能。すべての判断が重要。',
      tips: ['最小限の初期資源', '敵 HP が 3 倍', '非常に高速な敵', '上級者のみクリア可能'],
    },
  },
  ko: {
    easy: {
      description: '초보자·캐주얼용. 자원이 넉넉하고 적이 약해 실수 여지가 큼.',
      tips: ['초기 HP 증가', '적 HP·속도 감소', '처치 보상 증가', '타워 건설 비용 감소'],
    },
    normal: {
      description: '표준 밸런스. TD 경험이 있는 플레이어에게 적합.',
      tips: ['표준 초기 자원', '균형 잡힌 적 스탯', '표준 처치 보상', '첫 플레이 추천'],
    },
    hard: {
      description: '도전적. 적이 강하고 자원이 적어 신중한 방어 계획 필요.',
      tips: ['초기 자원 감소', '적 HP·속도 증가', '처치 보상 감소', '전략적 배치 필수'],
    },
    nightmare: {
      description: '극한 난이도. 적 HP 2배, 고속, 실수 허용도 매우 낮음.',
      tips: ['초기 자원 대폭 감소', '적 HP 2배', '적 속도 증가', '완벽한 실행 필요'],
    },
    impossible: {
      description: '궁극의 도전! 진정한 고수만 생존. 모든 판단이 중요.',
      tips: ['최소 초기 자원', '적 HP 3배', '매우 빠른 적', '전문가만 클리어 가능'],
    },
  },
  de: {
    easy: {
      description: 'Für Einsteiger oder Casual-Spieler. Viele Ressourcen, schwache Gegner, Fehler verzeihlich.',
      tips: ['Höheres Startleben', 'Reduzierte Gegner-LP und -Tempo', 'Mehr Kill-Belohnungen', 'Günstigere Turmkosten'],
    },
    normal: {
      description: 'Standard-Balance. Für Spieler mit etwas Tower-Defense-Erfahrung.',
      tips: ['Standard-Startressourcen', 'Ausgewogene Gegnerwerte', 'Standard-Kill-Belohnungen', 'Empfohlen für den ersten Durchlauf'],
    },
    hard: {
      description: 'Herausfordernd. Stärkere Gegner, weniger Ressourcen, sorgfältige Planung nötig.',
      tips: ['Weniger Startressourcen', 'Gegner mit mehr LP und Tempo', 'Geringere Kill-Belohnungen', 'Strategische Platzierung nötig'],
    },
    nightmare: {
      description: 'Extrem schwer. Doppelte Gegner-LP, schneller, kaum Fehlertoleranz.',
      tips: ['Drastisch weniger Startressourcen', 'Verdoppelte Gegner-LP', 'Schnellere Gegner', 'Perfekte Ausführung nötig'],
    },
    impossible: {
      description: 'Die ultimative Herausforderung! Nur Meister überleben. Jede Entscheidung zählt.',
      tips: ['Minimale Startressourcen', 'Dreifache Gegner-LP', 'Extrem schnelle Gegner', 'Nur Experten schaffen es'],
    },
  },
  fr: {
    easy: {
      description: 'Pour débutants ou joueurs casual. Ressources abondantes, ennemis faibles, marge d\'erreur.',
      tips: ['PV initiaux plus élevés', 'PV et vitesse ennemies réduits', 'Plus de récompenses par kill', 'Coût de construction réduit'],
    },
    normal: {
      description: 'Expérience standard équilibrée. Pour joueurs avec un peu d\'expérience TD.',
      tips: ['Ressources initiales standard', 'Stats ennemies équilibrées', 'Récompenses standard', 'Recommandé pour la première partie'],
    },
    hard: {
      description: 'Difficile. Ennemis plus forts, moins de ressources, planification requise.',
      tips: ['Ressources initiales réduites', 'Ennemis plus résistants et rapides', 'Récompenses réduites', 'Placement stratégique requis'],
    },
    nightmare: {
      description: 'Extrêmement difficile. PV ennemis doublés, vitesse élevée, peu de marge d\'erreur.',
      tips: ['Ressources initiales très réduites', 'PV ennemis doublés', 'Ennemis plus rapides', 'Exécution parfaite requise'],
    },
    impossible: {
      description: 'Le défi ultime ! Seuls les maîtres survivent. Chaque décision compte.',
      tips: ['Ressources initiales minimales', 'PV ennemis triplés', 'Ennemis extrêmement rapides', 'Réservé aux experts'],
    },
  },
  es: {
    easy: {
      description: 'Para principiantes o jugadores casuales. Recursos abundantes, enemigos débiles, margen de error.',
      tips: ['Más vida inicial', 'Menos vida y velocidad enemiga', 'Más recompensas por eliminación', 'Menor coste de torres'],
    },
    normal: {
      description: 'Experiencia estándar equilibrada. Para jugadores con algo de experiencia TD.',
      tips: ['Recursos iniciales estándar', 'Stats enemigas equilibradas', 'Recompensas estándar', 'Recomendado para la primera partida'],
    },
    hard: {
      description: 'Desafiante. Enemigos más fuertes, menos recursos, planificación cuidadosa.',
      tips: ['Menos recursos iniciales', 'Enemigos con más vida y velocidad', 'Menos recompensas', 'Colocación estratégica necesaria'],
    },
    nightmare: {
      description: 'Extremadamente difícil. Vida enemiga duplicada, alta velocidad, poca tolerancia al error.',
      tips: ['Recursos iniciales muy reducidos', 'Vida enemiga duplicada', 'Enemigos más rápidos', 'Ejecución perfecta requerida'],
    },
    impossible: {
      description: '¡El desafío definitivo! Solo los maestros sobreviven. Cada decisión cuenta.',
      tips: ['Recursos iniciales mínimos', 'Vida enemiga triplicada', 'Enemigos extremadamente rápidos', 'Solo expertos pueden completarlo'],
    },
  },
  ru: {
    easy: {
      description: 'Для новичков и casual. Много ресурсов, слабые враги, прощаются ошибки.',
      tips: ['Больше начального HP', 'Меньше HP и скорости врагов', 'Больше наград за убийства', 'Дешевле строительство башен'],
    },
    normal: {
      description: 'Стандартный баланс. Для игроков с опытом в tower defense.',
      tips: ['Стандартные начальные ресурсы', 'Сбалансированные параметры врагов', 'Стандартные награды', 'Рекомендуется для первого прохождения'],
    },
    hard: {
      description: 'Сложно. Сильнее враги, меньше ресурсов, нужен продуманный план.',
      tips: ['Меньше начальных ресурсов', 'Больше HP и скорости врагов', 'Меньше наград', 'Нужно стратегическое размещение'],
    },
    nightmare: {
      description: 'Экстремально сложно. HP врагов ×2, высокая скорость, мало прощения ошибок.',
      tips: ['Резко меньше ресурсов', 'HP врагов удвоено', 'Быстрее враги', 'Нужно идеальное исполнение'],
    },
    impossible: {
      description: 'Высший вызов! Выживают лишь мастера. Каждое решение важно.',
      tips: ['Минимум ресурсов', 'HP врагов утроено', 'Очень быстрые враги', 'Только эксперты пройдут'],
    },
  },
  pt: {
    easy: {
      description: 'Para iniciantes ou casual. Recursos abundantes, inimigos fracos, margem para erros.',
      tips: ['Mais vida inicial', 'Menos vida e velocidade inimiga', 'Mais recompensas por abate', 'Custo de torres reduzido'],
    },
    normal: {
      description: 'Experiência padrão equilibrada. Para quem já jogou tower defense.',
      tips: ['Recursos iniciais padrão', 'Stats inimigas equilibradas', 'Recompensas padrão', 'Recomendado na primeira partida'],
    },
    hard: {
      description: 'Desafiante. Inimigos mais fortes, menos recursos, planejamento cuidadoso.',
      tips: ['Menos recursos iniciais', 'Inimigos com mais vida e velocidade', 'Menos recompensas', 'Posicionamento estratégico necessário'],
    },
    nightmare: {
      description: 'Extremamente difícil. Vida inimiga dobrada, alta velocidade, pouca tolerância a erros.',
      tips: ['Recursos iniciais muito reduzidos', 'Vida inimiga dobrada', 'Inimigos mais rápidos', 'Execução perfeita necessária'],
    },
    impossible: {
      description: 'O desafio final! Só mestres sobrevivem. Cada decisão importa.',
      tips: ['Recursos iniciais mínimos', 'Vida inimiga triplicada', 'Inimigos extremamente rápidos', 'Só especialistas completam'],
    },
  },
};

function patchAbilities(s, loc) {
  const ab = ABILITIES[loc];
  if (!ab) return { s, n: 0 };
  let n = 0;
  for (const [key, val] of Object.entries(ab)) {
    const re = new RegExp(`(abilities: \\{[\\s\\S]*?${key}: )"[^"]*",`);
    const next = s.replace(re, `$1${JSON.stringify(val)},`);
    if (next !== s) { n++; s = next; }
  }
  return { s, n };
}

function patchDifficulties(s, loc) {
  const diff = DIFF[loc];
  if (!diff) return { s, n: 0 };
  let n = 0;
  for (const [id, block] of Object.entries(diff)) {
    const descRe = new RegExp(`(difficulties: \\{[\\s\\S]*?${id}: \\{[\\s\\S]*?description: )"[^"]*",`);
    const nextDesc = s.replace(descRe, `$1${JSON.stringify(block.description)},`);
    if (nextDesc !== s) { n++; s = nextDesc; }
    const tipsStr = block.tips.map((t) => JSON.stringify(t)).join(', ');
    const tipsRe = new RegExp(`(difficulties: \\{[\\s\\S]*?${id}: \\{[\\s\\S]*?tips: \\[)[^\\]]*(\\],)`);
    const nextTips = s.replace(tipsRe, `$1${tipsStr}$2`);
    if (nextTips !== s) { n++; s = nextTips; }
  }
  return { s, n };
}

for (const loc of ['ja', 'ko', 'de', 'fr', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  let total = 0;
  const r1 = patchDifficulties(s, loc);
  s = r1.s; total += r1.n;
  const r2 = patchAbilities(s, loc);
  s = r2.s; total += r2.n;
  fs.writeFileSync(file, s, 'utf8');
  console.log('enc locales', loc, total);
}

console.log('Done enc abilities + difficulties');
