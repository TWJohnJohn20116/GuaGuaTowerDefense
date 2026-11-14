/** batch18：enemies.* 英文借詞深度替換 de/fr/es/ru/pt */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');

const LOCALE_PAIRS = {
  de: [
    ["'Mit Frost'", "'Mit Frost-Turm'"],
    ["'Burst vermeidet Berserker'", "'Hoher Burst vermeidet Berserker'"],
    ["'Frost als letzte Linie'", "'Frost als letzte Absicherung'"],
    ["counterReasons: { sniper: 'Burst', frost: 'Slow-Sicherung' }", "counterReasons: { sniper: 'Hoher Burst', frost: 'Verlangsamungs-Sicherung' }"],
    ["counterReasons: { sniper: 'Burst', poison: 'DoT' }", "counterReasons: { sniper: 'Hoher Burst', poison: 'Gift-DoT' }"],
    ["counterReasons: { laser: 'Massiver Schaden', frost: 'Verlangsamung', poison: 'DoT' }", "counterReasons: { laser: 'Massiver Schaden', frost: 'Verlangsamung', poison: 'Gift-DoT' }"],
    ["'AOE Konter'", "'Flaechen-Konter'"],
    ["counterReasons: { cannon: 'Flaechenschaden', lightning: 'Kette', flame: 'AOE' }", "counterReasons: { cannon: 'Flaechenschaden', lightning: 'Kette', flame: 'Flaechenbrand' }"],
    ["'Burst wenn solid'", "'Burst im soliden Zustand'"],
    ["'Slow wenn solid'", "'Verlangsamung wenn solid'"],
    ["'Cooldown auf Tarnung'", "'Abklingzeit auf Tarnung'"],
    ["'Splash kann treffen'", "'Flaechenschaden kann treffen'"],
  ],
  fr: [
    ["'Frost slow critique'", "'Ralentissement givre critique'"],
    ["'Avec frost'", "'Avec tour givre'"],
    ["'Slow solide'", "'Ralentissement solide'"],
    ["'Burst solide'", "'Burst solide'"],
    ["'Cooldown'", "'Temps de recharge'"],
    ["counterReasons: { poison: 'DoT' }", "counterReasons: { poison: 'Degats sur duree' }"],
    ["'AOE counter'", "'Contre zone'"],
    ["'AOE pret'", "'Zone prete'"],
  ],
  es: [
    ["'Frost slow critico'", "'Ralentizar gélido crítico'"],
    ["'Con frost'", "'Con torre gélida'"],
    ["'Slow solido'", "'Ralentizar sólido'"],
    ["'Burst solido'", "'Ráfaga sólida'"],
    ["'Cooldown'", "'Tiempo de recarga'"],
    ["'AOE counter'", "'Contra área'"],
    ["'AOE listo'", "'Área listo'"],
    ["counterReasons: { poison: 'DoT' }", "counterReasons: { poison: 'Daño continuo' }"],
  ],
  ru: [
    ["'Frost slow критично'", "'Замедление морозом критично'"],
    ["'С frost'", "'С башней мороза'"],
    ["'Slow когда твердый'", "'Замедление когда твёрдый'"],
    ["'Burst когда твердый'", "'Burst когда твёрдый'"],
    ["'Cooldown'", "'Перезарядка'"],
    ["'AOE counter'", "'Контр AOE'"],
    ["'AOE готов'", "'AOE готов'"],
    ["counterReasons: { poison: 'DoT' }", "counterReasons: { poison: 'Урон со временем' }"],
  ],
  pt: [
    ["'Frost slow critico'", "'Lentidao gelo critica'"],
    ["'Com frost'", "'Com torre gelo'"],
    ["'Slow solido'", "'Lentidao solida'"],
    ["'Burst solido'", "'Burst solido'"],
    ["'Cooldown'", "'Tempo de recarga'"],
    ["'AOE counter'", "'Contra area'"],
    ["'AOE pronto'", "'Area pronto'"],
    ["counterReasons: { poison: 'DoT' }", "counterReasons: { poison: 'Dano continuo' }"],
  ],
};

for (const [loc, pairs] of Object.entries(LOCALE_PAIRS)) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  let n = 0;
  for (const [from, to] of pairs) {
    if (s.includes(from)) {
      s = s.split(from).join(to);
      n++;
    }
  }
  fs.writeFileSync(file, s, 'utf8');
  console.log('enc loanwords', loc, n);
}

console.log('Done enc loanwords');
