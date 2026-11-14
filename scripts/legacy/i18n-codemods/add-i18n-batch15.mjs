/** batch15：encyclopedia 新 key + statusDescriptions 補譯 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');

const EXTRA_KEYS = {
  'zh-TW': {
    fileCategoryOther: '其他',
    fileInferredDescription: '{category} · {folder} · {format} 檔案',
    previewSplitHint: '分裂成 {count} 個小敵人',
  },
  'zh-CN': {
    fileCategoryOther: '其他',
    fileInferredDescription: '{category} · {folder} · {format} 文件',
    previewSplitHint: '分裂成 {count} 个小敌人',
  },
  en: {
    fileCategoryOther: 'Other',
    fileInferredDescription: '{category} · {folder} · {format} file',
    previewSplitHint: 'Splits into {count} small enemies',
  },
  ja: {
    fileCategoryOther: 'その他',
    fileInferredDescription: '{category} · {folder} · {format} ファイル',
    previewSplitHint: '{count} 体の小敵人に分裂',
  },
  ko: {
    fileCategoryOther: '기타',
    fileInferredDescription: '{category} · {folder} · {format} 파일',
    previewSplitHint: '{count}마리의 작은 적으로 분열',
  },
  de: {
    fileCategoryOther: 'Sonstige',
    fileInferredDescription: '{category} · {folder} · {format}-Datei',
    previewSplitHint: 'Teilt sich in {count} kleine Gegner',
  },
  fr: {
    fileCategoryOther: 'Autre',
    fileInferredDescription: 'Fichier {category} · {folder} · {format}',
    previewSplitHint: 'Se divise en {count} petits ennemis',
  },
  es: {
    fileCategoryOther: 'Otros',
    fileInferredDescription: 'Archivo {category} · {folder} · {format}',
    previewSplitHint: 'Se divide en {count} enemigos pequeños',
  },
  ru: {
    fileCategoryOther: 'Прочее',
    fileInferredDescription: '{category} · {folder} · файл {format}',
    previewSplitHint: 'Делится на {count} маленьких врагов',
  },
  pt: {
    fileCategoryOther: 'Outros',
    fileInferredDescription: 'Arquivo {category} · {folder} · {format}',
    previewSplitHint: 'Divide-se em {count} inimigos pequenos',
  },
};

const STATUS = {
  ja: {
    burn: '燃焼効果は継続火炎ダメージを与え、重ねがけ可能。',
    bleed: '出血効果は敵が移動中にダメージを与える。',
    weakness: '弱体化効果は敵が受けるダメージを増加させる。',
    marked: 'マーク効果は敵を優先攻撃対象にする。',
    exposed: '露出効果は敵の防御力を下げる。',
    fear: '恐怖効果は敵を一時的に後退させる。',
    root: '拘束効果は移動を止めるが攻撃は可能。',
    curse: '呪い効果は回復効果を大幅に減少させる。',
    confuse: '混乱効果は敵の移動を不安定にする。',
    silence: '沈黙効果は特殊能力の使用を阻止する。',
    petrify: '石化効果は完全に動けなくするが被ダメージ半減。',
    shield: 'シールド効果は一定量のダメージを吸収。',
    regen: '再生効果は HP を継続回復する。',
    haste: '加速効果は移動速度を上げる。',
    berserk: 'バーサーク効果は速度を大幅に上げる。',
    immune: '免疫効果はすべてのデバフを無効化する。',
  },
  ko: {
    burn: '화상 효과는 지속 화염 피해를 주며 중첩 가능.',
    bleed: '출혈 효과는 적 이동 중 피해.',
    weakness: '약화 효과는 적이 받는 피해 증가.',
    marked: '표식 효과는 적을 우선 공격 대상으로.',
    exposed: '노출 효과는 적 방어력 감소.',
    fear: '공포 효과는 적을 일시 후퇴.',
    root: '속박 효과는 이동만 막고 공격은 가능.',
    curse: '저주 효과는 회복 효과 대폭 감소.',
    confuse: '혼란 효과는 적 이동 불안정.',
    silence: '침묵 효과는 특수 능력 사용 차단.',
    petrify: '석화 효과는 완전 정지 but 받는 피해 절반.',
    shield: '방패 효과는 일정 피해 흡수.',
    regen: '재생 효과는 HP 지속 회복.',
    haste: '가속 효과는 이동 속도 증가.',
    berserk: '광폭화 효과는 속도 대폭 증가.',
    immune: '면역 효과는 모든 디버프 무효.',
  },
  de: {
    burn: 'Brand verursacht dauerhaften Feuerschaden und stapelt sich.',
    bleed: 'Blutung verursacht Schaden während der Bewegung.',
    weakness: 'Schwäche erhöht erlittenen Schaden.',
    marked: 'Markierung macht den Gegner zum Prioritätsziel.',
    exposed: 'Exponiert senkt die Verteidigung.',
    fear: 'Furcht lässt den Gegner kurz zurückweichen.',
    root: 'Wurzeln stoppen Bewegung, Angriffe bleiben möglich.',
    curse: 'Fluch reduziert Heilung drastisch.',
    confuse: 'Verwirrung macht Bewegung unruhig.',
    silence: 'Stille verhindert Spezialfähigkeiten.',
    petrify: 'Versteinerung lähmt vollständig, halbiert erlittenen Schaden.',
    shield: 'Schild absorbiert Schaden.',
    regen: 'Regeneration stellt LP kontinuierlich wieder her.',
    haste: 'Eile erhöht Bewegungsgeschwindigkeit.',
    berserk: 'Berserker steigert Tempo deutlich.',
    immune: 'Immunität gegen alle negativen Effekte.',
  },
  fr: {
    burn: 'Brûlure inflige des dégâts de feu continus, cumulable.',
    bleed: 'Saignement inflige des dégâts en mouvement.',
    weakness: 'Faiblesse augmente les dégâts subis.',
    marked: 'Marquage fait de l\'ennemi une cible prioritaire.',
    exposed: 'Exposé réduit la défense.',
    fear: 'Peur fait reculer temporairement l\'ennemi.',
    root: 'Enracinement bloque le mouvement, attaques possibles.',
    curse: 'Malédiction réduit fortement les soins.',
    confuse: 'Confusion rend le mouvement instable.',
    silence: 'Silence empêche les capacités spéciales.',
    petrify: 'Pétrification immobilise mais divise les dégâts par deux.',
    shield: 'Bouclier absorbe des dégâts.',
    regen: 'Régénération restaure les PV en continu.',
    haste: 'Hâte augmente la vitesse.',
    berserk: 'Berserk augmente fortement la vitesse.',
    immune: 'Immunité à tous les effets négatifs.',
  },
  es: {
    burn: 'Quemadura causa daño de fuego continuo, acumulable.',
    bleed: 'Sangrado causa daño al moverse.',
    weakness: 'Debilidad aumenta el daño recibido.',
    marked: 'Marcado hace al enemigo objetivo prioritario.',
    exposed: 'Expuesto reduce la defensa.',
    fear: 'Miedo hace retroceder temporalmente al enemigo.',
    root: 'Raíz impide movimiento pero permite ataques.',
    curse: 'Maldición reduce mucho la curación.',
    confuse: 'Confusión hace inestable el movimiento.',
    silence: 'Silencio impide habilidades especiales.',
    petrify: 'Petrificación inmoviliza pero reduce a la mitad el daño recibido.',
    shield: 'Escudo absorbe daño.',
    regen: 'Regeneración restaura vida continuamente.',
    haste: 'Prisa aumenta la velocidad.',
    berserk: 'Berserk aumenta mucho la velocidad.',
    immune: 'Inmunidad a todos los efectos negativos.',
  },
  ru: {
    burn: 'Горение наносит постоянный огненный урон, накапливается.',
    bleed: 'Кровотечение наносит урон при движении.',
    weakness: 'Слабость увеличивает получаемый урон.',
    marked: 'Метка делает врага приоритетной целью.',
    exposed: 'Уязвимость снижает защиту.',
    fear: 'Страх временно отбрасывает врага.',
    root: 'Обездвиживание останавливает движение, атаки возможны.',
    curse: 'Проклятие сильно снижает лечение.',
    confuse: 'Смятение делает движение нестабильным.',
    silence: 'Немота блокирует особые способности.',
    petrify: 'Окаменение полностью обездвиживает, урон получаемый ÷2.',
    shield: 'Щит поглощает урон.',
    regen: 'Регенерация восстанавливает HP со временем.',
    haste: 'Ускорение повышает скорость.',
    berserk: 'Берсерк сильно повышает скорость.',
    immune: 'Иммунитет ко всем негативным эффектам.',
  },
  pt: {
    burn: 'Queimadura causa dano de fogo contínuo, acumulável.',
    bleed: 'Sangramento causa dano ao se mover.',
    weakness: 'Fraqueza aumenta dano recebido.',
    marked: 'Marcado torna o inimigo alvo prioritário.',
    exposed: 'Exposto reduz defesa.',
    fear: 'Medo faz o inimigo recuar temporariamente.',
    root: 'Enraizar impede movimento, ataques ainda possíveis.',
    curse: 'Maldição reduz muito a cura.',
    confuse: 'Confusão torna movimento instável.',
    silence: 'Silêncio impede habilidades especiais.',
    petrify: 'Petrificação imobiliza mas reduz dano recebido pela metade.',
    shield: 'Escudo absorve dano.',
    regen: 'Regeneração restaura vida continuamente.',
    haste: 'Pressa aumenta velocidade.',
    berserk: 'Berserk aumenta muito a velocidade.',
    immune: 'Imunidade a todos efeitos negativos.',
  },
};

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes('fileCategoryOther:')) {
    const ek = EXTRA_KEYS[loc] ?? EXTRA_KEYS.en;
    const lines = Object.entries(ek).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join('\n');
    s = s.replace(/(\s+fileCategoryRoot: [^,\n]+,)/, `$1\n${lines}`);
  }
  const st = STATUS[loc];
  if (st) {
    for (const [key, val] of Object.entries(st)) {
      const re = new RegExp(`(statusDescriptions: \\{[\\s\\S]*?${key}: )"[^"]*",`);
      const next = s.replace(re, `$1${JSON.stringify(val)},`);
      if (next !== s) s = next;
    }
  }
  fs.writeFileSync(file, s, 'utf8');
  console.log('batch15 extra+status', loc);
}

console.log('Done batch15 extra keys + status');
