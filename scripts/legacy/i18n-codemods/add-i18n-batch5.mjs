/**
 * 玩家技能名稱/描述 + 百科側欄 + batch4 小語系翻譯（batch5）
 * 執行：node scripts/add-i18n-batch5.mjs
 */
import fs from 'fs';
import path from 'path';

const SKILLS_ZH = {
  lightningStorm: { name: '雷霆風暴', desc: '對所有敵人造成 80 點傷害並眩暈 1 秒' },
  frozenTime: { name: '時間凍結', desc: '凍結所有敵人 5 秒' },
  cashRain: { name: '金幣雨', desc: '立即獲得 $300 金幣' },
  battleInspire: { name: '狂戰激勵', desc: '所有塔攻擊速度提升 2 倍持續 10 秒' },
  meteorStorm: { name: '隕石風暴', desc: '召喚隕石轟炸全場，造成 120 點傷害並引燃灼燒（每秒 30，持續 4 秒）' },
  chainLightning: { name: '閃電鏈', desc: '鎖定強敵，閃電在鄰近敵人間連鎖彈跳（最多 8 段），造成 160 點遞減傷害並眩暈 0.6 秒' },
  holyHeal: { name: '聖光治療', desc: '降下聖光立即恢復基地 25 點生命，並淨化全場敵人的所有增益狀態' },
  aegisBarrier: { name: '聖盾結界', desc: '展開聖盾結界 10 秒，期間基地免疫所有傷害；展開瞬間的衝擊波使全場敵人減速 50% 持續 2 秒' },
  warpTrap: { name: '傳送陷阱', desc: '佈下空間陷阱，把最逼近基地的 6 隻敵人沿路徑回溯傳送 4 格並暈眩 0.8 秒（首領類僅被傳送一半距離）' },
};

const SKILLS_EN = {
  lightningStorm: { name: 'Lightning Storm', desc: 'Strike all enemies for 80 damage + 1s stun' },
  frozenTime: { name: 'Frozen Time', desc: 'Freeze all enemies for 5 seconds' },
  cashRain: { name: 'Cash Rain', desc: 'Instantly gain $300' },
  battleInspire: { name: 'Battle Inspire', desc: 'All towers attack 2× speed for 10 seconds' },
  meteorStorm: { name: 'Meteor Storm', desc: 'Rain meteors for 120 damage + burn (30/s for 4s)' },
  chainLightning: { name: 'Chain Lightning', desc: 'Chain up to 8 jumps for 160 falloff damage + 0.6s stun' },
  holyHeal: { name: 'Holy Heal', desc: 'Restore 25 base HP and purge all enemy buffs' },
  aegisBarrier: { name: 'Aegis Barrier', desc: 'Base immune to damage 10s; opening burst slows all enemies 50% for 2s' },
  warpTrap: { name: 'Warp Trap', desc: 'Warp 6 nearest enemies 4 tiles back + 0.8s daze (bosses half distance)' },
};

const SKILLS_JA = {
  lightningStorm: { name: '雷霆ストーム', desc: '全敵に80ダメージ＋1秒スタン' },
  frozenTime: { name: '時間凍結', desc: '全敵を5秒間凍結' },
  cashRain: { name: 'ゴールドレイン', desc: '即座に$300獲得' },
  battleInspire: { name: 'バトル鼓舞', desc: '全塔の攻速2倍・10秒' },
  meteorStorm: { name: '隕石ストーム', desc: '120ダメ＋燃焼（30/s・4秒）' },
  chainLightning: { name: 'チェインライトニング', desc: '最大8跳弾、160減衰ダメ＋0.6秒スタン' },
  holyHeal: { name: 'ホーリーヒール', desc: '基地HP25回復＋敵バフ浄化' },
  aegisBarrier: { name: 'イージス結界', desc: '10秒基地無敵、展開時全体50%減速2秒' },
  warpTrap: { name: 'ワープトラップ', desc: '最寄り6体を4マス後退＋0.8秒気絶' },
};

const SKILLS_KO = {
  lightningStorm: { name: '번개 폭풍', desc: '모든 적에게 80 피해 + 1초 기절' },
  frozenTime: { name: '시간 정지', desc: '모든 적 5초 빙결' },
  cashRain: { name: '골드 비', desc: '즉시 $300 획득' },
  battleInspire: { name: '전투 격려', desc: '모든 타워 공속 2배 10초' },
  meteorStorm: { name: '운석 폭풍', desc: '120 피해 + 화상(30/s, 4초)' },
  chainLightning: { name: '연쇄 번개', desc: '최대 8연쇄, 160 감쇠 피해 + 0.6초 기절' },
  holyHeal: { name: '성스러운 치유', desc: '기지 HP 25 회복 + 적 버프 정화' },
  aegisBarrier: { name: '성스러운 방벽', desc: '10초 기지 무적, 전개 시 전체 50% 감속 2초' },
  warpTrap: { name: '워프 함정', desc: '가장 가까운 6기 4칸 후퇴 + 0.8초 기절' },
};

const SKILLS_FR = {
  lightningStorm: { name: 'Tempête foudre', desc: '80 dégâts à tous les ennemis + étourdissement 1 s' },
  frozenTime: { name: 'Gel temporel', desc: 'Gèle tous les ennemis pendant 5 s' },
  cashRain: { name: 'Pluie d\'or', desc: 'Gain instantané de 300 $' },
  battleInspire: { name: 'Inspiration de combat', desc: 'Toutes les tours attaquent 2× plus vite pendant 10 s' },
  meteorStorm: { name: 'Tempête de météores', desc: '120 dégâts + brûlure (30/s pendant 4 s)' },
  chainLightning: { name: 'Éclair en chaîne', desc: 'Jusqu\'à 8 rebonds, 160 dégâts décroissants + étourdissement 0,6 s' },
  holyHeal: { name: 'Soin sacré', desc: 'Restaure 25 PV de base et purge les buffs ennemis' },
  aegisBarrier: { name: 'Barrière Égide', desc: 'Base invulnérable 10 s ; ralentit tous les ennemis de 50 % pendant 2 s' },
  warpTrap: { name: 'Piège spatial', desc: 'Renvoie 6 ennemis proches de 4 cases + étourdissement 0,8 s' },
};

const SKILLS_DE = {
  lightningStorm: { name: 'Blitzsturm', desc: '80 Schaden an allen Gegnern + 1 s Betäubung' },
  frozenTime: { name: 'Zeitstillstand', desc: 'Friert alle Gegner 5 s ein' },
  cashRain: { name: 'Goldregen', desc: 'Sofort 300 $ erhalten' },
  battleInspire: { name: 'Kampfschub', desc: 'Alle Türme 2× Angriffstempo für 10 s' },
  meteorStorm: { name: 'Meteorsturm', desc: '120 Schaden + Brand (30/s für 4 s)' },
  chainLightning: { name: 'Kettenblitz', desc: 'Bis zu 8 Sprünge, 160 abnehmender Schaden + 0,6 s Betäubung' },
  holyHeal: { name: 'Heilige Heilung', desc: 'Stellt 25 Basis-LP wieder her und entfernt Gegner-Buffs' },
  aegisBarrier: { name: 'Aegis-Schild', desc: 'Basis 10 s unverwundbar; Öffnungsstoß verlangsamt alle Gegner 50 % für 2 s' },
  warpTrap: { name: 'Warp-Falle', desc: '6 nächste Gegner 4 Felder zurück + 0,8 s Benommenheit' },
};

const SKILLS_ES = {
  lightningStorm: { name: 'Tormenta eléctrica', desc: '80 de daño a todos los enemigos + aturdimiento 1 s' },
  frozenTime: { name: 'Tiempo congelado', desc: 'Congela a todos los enemigos 5 s' },
  cashRain: { name: 'Lluvia de oro', desc: 'Gana $300 al instante' },
  battleInspire: { name: 'Inspiración de batalla', desc: 'Todas las torres atacan 2× más rápido durante 10 s' },
  meteorStorm: { name: 'Tormenta de meteoros', desc: '120 de daño + quemadura (30/s durante 4 s)' },
  chainLightning: { name: 'Rayo en cadena', desc: 'Hasta 8 saltos, 160 de daño decreciente + aturdimiento 0,6 s' },
  holyHeal: { name: 'Sanación sagrada', desc: 'Restaura 25 PV de la base y purga buffs enemigos' },
  aegisBarrier: { name: 'Barrera Égida', desc: 'Base invulnerable 10 s; ralentiza a todos los enemigos 50 % durante 2 s' },
  warpTrap: { name: 'Trampa de teletransporte', desc: 'Retrocede 6 enemigos cercanos 4 casillas + aturdimiento 0,8 s' },
};

const SKILLS_RU = {
  lightningStorm: { name: 'Грозовой шторм', desc: '80 урона всем врагам + оглушение 1 с' },
  frozenTime: { name: 'Заморозка времени', desc: 'Замораживает всех врагов на 5 с' },
  cashRain: { name: 'Золотой дождь', desc: 'Мгновенно +$300' },
  battleInspire: { name: 'Боевой подъём', desc: 'Все башни атакуют в 2× быстрее 10 с' },
  meteorStorm: { name: 'Метеоритный шторм', desc: '120 урона + горение (30/с, 4 с)' },
  chainLightning: { name: 'Цепная молния', desc: 'До 8 прыжков, 160 убывающего урона + оглушение 0,6 с' },
  holyHeal: { name: 'Святое исцеление', desc: 'Восстанавливает 25 HP базы и снимает баффы врагов' },
  aegisBarrier: { name: 'Щит Эгиды', desc: 'База неуязвима 10 с; удар замедляет всех врагов на 50 % на 2 с' },
  warpTrap: { name: 'Ловушка искажения', desc: '6 ближайших врагов отбрасывает на 4 клетки + оглушение 0,8 с' },
};

const SKILLS_PT = {
  lightningStorm: { name: 'Tempestade elétrica', desc: '80 de dano a todos os inimigos + atordoamento 1 s' },
  frozenTime: { name: 'Tempo congelado', desc: 'Congela todos os inimigos por 5 s' },
  cashRain: { name: 'Chuva de ouro', desc: 'Ganhe $300 instantaneamente' },
  battleInspire: { name: 'Inspiração de batalha', desc: 'Todas as torres atacam 2× mais rápido por 10 s' },
  meteorStorm: { name: 'Tempestade de meteoros', desc: '120 de dano + queimadura (30/s por 4 s)' },
  chainLightning: { name: 'Raio em cadeia', desc: 'Até 8 saltos, 160 de dano decrescente + atordoamento 0,6 s' },
  holyHeal: { name: 'Cura sagrada', desc: 'Restaura 25 PV da base e remove buffs inimigos' },
  aegisBarrier: { name: 'Barreira Égide', desc: 'Base invulnerável por 10 s; explosão inicial reduz 50 % a velocidade de todos por 2 s' },
  warpTrap: { name: 'Armadilha de teletransporte', desc: 'Recua 6 inimigos mais próximos 4 casas + atordoamento 0,8 s' },
};

const SKILLS_MAP = {
  'zh-TW': SKILLS_ZH, 'zh-CN': SKILLS_ZH, en: SKILLS_EN, ja: SKILLS_JA, ko: SKILLS_KO,
  fr: SKILLS_FR, de: SKILLS_DE, es: SKILLS_ES, ru: SKILLS_RU, pt: SKILLS_PT,
};

const ENC_SIDEBAR_ZH = {
  sidebarGroupCombat: '戰鬥資料',
  sidebarGroupTactics: '關卡與戰術',
  sidebarGroupMeta: '後設系統',
  skillsTab: '主動技能',
  effectsTabFull: '狀態效果',
  iconsTab: '圖示庫',
  filesTab: '檔案庫',
};

const ENC_SIDEBAR_EN = {
  sidebarGroupCombat: 'Combat Data',
  sidebarGroupTactics: 'Maps & Tactics',
  sidebarGroupMeta: 'Meta Systems',
  skillsTab: 'Active Skills',
  effectsTabFull: 'Status Effects',
  iconsTab: 'Icon Library',
  filesTab: 'File Library',
};

const ENC_SIDEBAR_JA = {
  sidebarGroupCombat: '戦闘データ',
  sidebarGroupTactics: 'マップと戦術',
  sidebarGroupMeta: 'メタシステム',
  skillsTab: 'アクティブスキル',
  effectsTabFull: '状態効果',
  iconsTab: 'アイコン庫',
  filesTab: 'ファイル庫',
};

const ENC_SIDEBAR_KO = {
  sidebarGroupCombat: '전투 데이터',
  sidebarGroupTactics: '맵과 전술',
  sidebarGroupMeta: '메타 시스템',
  skillsTab: '액티브 스킬',
  effectsTabFull: '상태 효과',
  iconsTab: '아이콘 라이브러리',
  filesTab: '파일 라이브러리',
};

const ENC_SIDEBAR_FR = {
  sidebarGroupCombat: 'Données de combat',
  sidebarGroupTactics: 'Cartes et tactiques',
  sidebarGroupMeta: 'Systèmes méta',
  skillsTab: 'Compétences actives',
  effectsTabFull: 'Effets de statut',
  iconsTab: 'Bibliothèque d\'icônes',
  filesTab: 'Bibliothèque de fichiers',
};

const ENC_SIDEBAR_DE = {
  sidebarGroupCombat: 'Kampfdaten',
  sidebarGroupTactics: 'Karten & Taktik',
  sidebarGroupMeta: 'Meta-Systeme',
  skillsTab: 'Aktive Fähigkeiten',
  effectsTabFull: 'Statuseffekte',
  iconsTab: 'Icon-Bibliothek',
  filesTab: 'Datei-Bibliothek',
};

const ENC_SIDEBAR_ES = {
  sidebarGroupCombat: 'Datos de combate',
  sidebarGroupTactics: 'Mapas y táctica',
  sidebarGroupMeta: 'Sistemas meta',
  skillsTab: 'Habilidades activas',
  effectsTabFull: 'Efectos de estado',
  iconsTab: 'Biblioteca de iconos',
  filesTab: 'Biblioteca de archivos',
};

const ENC_SIDEBAR_RU = {
  sidebarGroupCombat: 'Боевые данные',
  sidebarGroupTactics: 'Карты и тактика',
  sidebarGroupMeta: 'Мета-системы',
  skillsTab: 'Активные навыки',
  effectsTabFull: 'Эффекты состояния',
  iconsTab: 'Библиотека иконок',
  filesTab: 'Библиотека файлов',
};

const ENC_SIDEBAR_PT = {
  sidebarGroupCombat: 'Dados de combate',
  sidebarGroupTactics: 'Mapas e tática',
  sidebarGroupMeta: 'Sistemas meta',
  skillsTab: 'Habilidades ativas',
  effectsTabFull: 'Efeitos de status',
  iconsTab: 'Biblioteca de ícones',
  filesTab: 'Biblioteca de arquivos',
};

const ENC_SIDEBAR_MAP = {
  'zh-TW': ENC_SIDEBAR_ZH, 'zh-CN': ENC_SIDEBAR_ZH, en: ENC_SIDEBAR_EN, ja: ENC_SIDEBAR_JA, ko: ENC_SIDEBAR_KO,
  fr: ENC_SIDEBAR_FR, de: ENC_SIDEBAR_DE, es: ENC_SIDEBAR_ES, ru: ENC_SIDEBAR_RU, pt: ENC_SIDEBAR_PT,
};

function formatPlayerSkillsBlock(skills) {
  const lines = Object.entries(skills).map(([id, { name, desc }]) => {
    return `    ${id}: { name: '${name.replace(/'/g, "\\'")}', desc: '${desc.replace(/'/g, "\\'")}' },`;
  });
  return `  playerSkills: {\n${lines.join('\n')}\n  },\n`;
}

function formatEncSidebarBlock(enc) {
  return Object.entries(enc).map(([k, v]) => `    ${k}: '${String(v).replace(/'/g, "\\'")}',`).join('\n');
}

const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join('src/i18n/locales', `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes('playerSkills:')) {
    const skills = SKILLS_MAP[loc] ?? SKILLS_EN;
    const block = formatPlayerSkillsBlock(skills);
    s = s.replace(/(\n  achievements: \{)/, `\n${block}$1`);
  }
  if (!s.includes('sidebarGroupCombat:')) {
    const enc = ENC_SIDEBAR_MAP[loc] ?? ENC_SIDEBAR_EN;
    const encBlock = formatEncSidebarBlock(enc);
    s = s.replace(/(\s+statsTab: '[^']*',)/, `$1\n${encBlock}`);
  }
  fs.writeFileSync(file, s, 'utf8');
  console.log('patched', loc);
}

console.log('Done batch5. Update src/i18n/index.ts and playerSkillLabels.ts');
