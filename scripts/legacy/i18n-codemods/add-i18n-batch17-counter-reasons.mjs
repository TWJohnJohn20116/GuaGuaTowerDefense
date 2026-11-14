/** batch17：圖鑑 enemies.*.counterReasons 短標籤補譯（de/fr/es/ru/pt） */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');

const REPLACEMENTS = {
  de: [
    ["counterReasons: { frost: 'Slow', machine:", "counterReasons: { frost: 'Verlangsamung', machine:"],
    ["frost: 'Slow', poison:", "frost: 'Verlangsamung', poison:"],
    ["frost: 'Slow' }", "frost: 'Verlangsamung' }"],
    ["cannon: 'Splash', lightning:", "cannon: 'Flaechenschaden', lightning:"],
    ["cannon: 'Splash', lightning: 'Kette', flame: 'AOE'", "cannon: 'Flaechenschaden', lightning: 'Kette', flame: 'Flaechenbrand'"],
    ["frost: 'Slow solid'", "frost: 'Verlangsamung wenn solid'"],
  ],
  fr: [
    ["counterReasons: { frost: 'Slow', machine:", "counterReasons: { frost: 'Ralentissement', machine:"],
    ["frost: 'Slow', poison:", "frost: 'Ralentissement', poison:"],
    ["frost: 'Slow' }", "frost: 'Ralentissement' }"],
    ["cannon: 'Splash', lightning:", "cannon: 'Zone', lightning:"],
    ["cannon: 'Splash', lightning: 'Chaine', flame: 'AOE'", "cannon: 'Zone', lightning: 'Chaine', flame: 'Zone brulure'"],
    ["frost: 'Slow solide'", "frost: 'Ralentissement solide'"],
  ],
  es: [
    ["counterReasons: { frost: 'Slow', machine:", "counterReasons: { frost: 'Ralentizar', machine:"],
    ["frost: 'Slow', poison:", "frost: 'Ralentizar', poison:"],
    ["frost: 'Slow' }", "frost: 'Ralentizar' }"],
    ["cannon: 'Splash', lightning:", "cannon: 'Area', lightning:"],
    ["cannon: 'Splash', lightning: 'Cadena', flame: 'AOE'", "cannon: 'Area', lightning: 'Cadena', flame: 'Quemadura area'"],
    ["frost: 'Slow solido'", "frost: 'Ralentizar solido'"],
  ],
  ru: [
    ["counterReasons: { frost: 'Slow', machine:", "counterReasons: { frost: 'Zamedlenie', machine:"],
    ["frost: 'Slow', poison:", "frost: 'Zamedlenie', poison:"],
    ["frost: 'Slow' }", "frost: 'Zamedlenie' }"],
    ["cannon: 'Splash', lightning:", "cannon: 'Splesh', lightning:"],
    ["cannon: 'Splash', lightning: 'Cep', flame: 'AOE'", "cannon: 'Splesh', lightning: 'Cep', flame: 'AOE ogon'"],
    ["frost: 'Slow tverdyj'", "frost: 'Zamedlenie tverdyj'"],
  ],
  pt: [
    ["counterReasons: { frost: 'Slow', machine:", "counterReasons: { frost: 'Lentidao', machine:"],
    ["frost: 'Slow', poison:", "frost: 'Lentidao', poison:"],
    ["frost: 'Slow' }", "frost: 'Lentidao' }"],
    ["cannon: 'Splash', lightning:", "cannon: 'Area', lightning:"],
    ["cannon: 'Splash', lightning: 'Cadeia', flame: 'AOE'", "cannon: 'Area', lightning: 'Cadeia', flame: 'Queimadura area'"],
    ["frost: 'Slow solido'", "frost: 'Lentidao solida'"],
  ],
};

for (const [loc, pairs] of Object.entries(REPLACEMENTS)) {
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
  console.log('counterReasons', loc, n, 'rules applied');
}

console.log('Done counter reasons patch');
