/**
 * batch12-C：encyclopedia difficulties.name + 部分 statusDescriptions 巢狀 key 補譯
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');

const DIFF_NAMES = {
  ja: { easy: 'イージー', normal: 'ノーマル', hard: 'ハード', nightmare: 'ナイトメア', impossible: 'インポッシブル' },
  ko: { easy: '쉬움', normal: '보통', hard: '어려움', nightmare: '악몽', impossible: '불가능' },
  de: { easy: 'Leicht', normal: 'Normal', hard: 'Schwer', nightmare: 'Albtraum', impossible: 'Unmöglich' },
  fr: { easy: 'Facile', normal: 'Normal', hard: 'Difficile', nightmare: 'Cauchemar', impossible: 'Impossible' },
  es: { easy: 'Fácil', normal: 'Normal', hard: 'Difícil', nightmare: 'Pesadilla', impossible: 'Imposible' },
  ru: { easy: 'Лёгкий', normal: 'Нормальный', hard: 'Сложный', nightmare: 'Кошмар', impossible: 'Невозможный' },
  pt: { easy: 'Fácil', normal: 'Normal', hard: 'Difícil', nightmare: 'Pesadelo', impossible: 'Impossível' },
};

const STATUS = {
  ja: { slow: '減速効果は移動速度を下げます。', poison: '毒は時間経過でダメージを与え、重ねがけ可能。', freeze: '凍結は敵の移動を完全に止めます。', stun: 'スタンは一時的に行動不能にします。' },
  ko: { slow: '감속 효과는 이동 속도를 낮춥니다.', poison: '독은 시간에 따라 피해를 주며 중첩 가능합니다.', freeze: '빙결은 적 이동을 완전히 멈춥니다.', stun: '기절은 일시적으로 행동 불능 상태로 만듭니다.' },
  de: { slow: 'Verlangsamung reduziert die Bewegungsgeschwindigkeit.', poison: 'Gift verursacht Schaden über Zeit und stapelt sich.', freeze: 'Einfrieren stoppt die Bewegung vollständig.', stun: 'Betäubung deaktiviert den Gegner kurzzeitig.' },
  fr: { slow: 'Ralentissement réduit la vitesse de déplacement.', poison: 'Poison inflige des dégâts dans le temps, cumulable.', freeze: 'Gel immobilise complètement l\'ennemi.', stun: 'Étourdissement désactive temporairement l\'ennemi.' },
  es: { slow: 'Ralentizar reduce la velocidad de movimiento.', poison: 'Veneno causa daño con el tiempo y se acumula.', freeze: 'Congelar detiene por completo el movimiento.', stun: 'Aturdir desactiva temporalmente al enemigo.' },
  ru: { slow: 'Замедление снижает скорость передвижения.', poison: 'Яд наносит урон со временем и накапливается.', freeze: 'Заморозка полностью останавливает врага.', stun: 'Оглушение временно блокирует действия.' },
  pt: { slow: 'Lentidão reduz a velocidade de movimento.', poison: 'Veneno causa dano ao longo do tempo e acumula.', freeze: 'Congelar impede completamente o movimento.', stun: 'Atordoamento desativa o inimigo temporariamente.' },
};

function patchNested(loc) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  let n = 0;
  const diff = DIFF_NAMES[loc];
  if (diff) {
    for (const [id, name] of Object.entries(diff)) {
      const re = new RegExp(`(difficulties: \\{[\\s\\S]*?${id}: \\{\\s*name: )"[^"]*",`);
      const next = s.replace(re, `$1${JSON.stringify(name)},`);
      if (next !== s) { n++; s = next; }
    }
  }
  const st = STATUS[loc];
  if (st) {
    for (const [id, text] of Object.entries(st)) {
      const re = new RegExp(`(statusDescriptions: \\{[\\s\\S]*?${id}: )"[^"]*",`);
      const next = s.replace(re, `$1${JSON.stringify(text)},`);
      if (next !== s) { n++; s = next; }
    }
  }
  if (n > 0) {
    fs.writeFileSync(file, s, 'utf8');
    console.log('nested patch', loc, n);
  } else {
    console.log('skip nested', loc);
  }
}

for (const loc of ['ja', 'ko', 'de', 'fr', 'es', 'ru', 'pt']) {
  patchNested(loc);
}

console.log('Done encyclopedia nested');
