import fs from 'fs';
import path from 'path';

const FIX = {
  de: 'Kontrolleffekte priorisieren, sicher spielen',
  fr: 'Privilegier les effets de controle, jouer prudemment',
  es: 'Priorizar efectos de control, jugar seguro',
  pt: 'Priorizar efeitos de controle, jogar com seguranca',
  ru: 'Приоритет контролю, играть осторожно',
  ko: '제어 효과 우선, 안정적으로 플레이',
};

for (const [loc, desc] of Object.entries(FIX)) {
  const file = path.join('src/i18n/locales', `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes("strategyDefensiveDesc: '") || s.includes(`strategyDefensiveDesc: '${desc}'`)) {
    console.log('skip', loc);
    continue;
  }
  s = s.replace(
    /strategyDefensiveDesc: '[^']*,\n(\s+playerSkillsPage:)/,
    `strategyDefensiveDesc: '${desc}',\n$1`,
  );
  s = s.replace(/\},\s*[^'\n]+',\n(\s+sections:)/, '},\n$1');
  fs.writeFileSync(file, s, 'utf8');
  console.log('fixed', loc);
}
