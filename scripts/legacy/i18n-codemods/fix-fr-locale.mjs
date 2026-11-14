/**
 * 修復 fr.ts 因 batch5 插入損壞的 playerSkills 區塊
 */
import fs from 'fs';

const SKILLS_FR = {
  lightningStorm: { name: 'Tempête foudre', desc: '80 dégâts à tous les ennemis + étourdissement 1 s' },
  frozenTime: { name: 'Gel temporel', desc: 'Gèle tous les ennemis pendant 5 s' },
  cashRain: { name: "Pluie d'or", desc: 'Gain instantané de 300 $' },
  battleInspire: { name: 'Inspiration de combat', desc: 'Toutes les tours attaquent 2× plus vite pendant 10 s' },
  meteorStorm: { name: 'Tempête de météores', desc: '120 dégâts + brûlure (30/s pendant 4 s)' },
  chainLightning: { name: 'Éclair en chaîne', desc: "Jusqu'à 8 rebonds, 160 dégâts décroissants + étourdissement 0,6 s" },
  holyHeal: { name: 'Soin sacré', desc: 'Restaure 25 PV de base et purge les buffs ennemis' },
  aegisBarrier: { name: 'Barrière Égide', desc: 'Base invulnérable 10 s ; ralentit tous les ennemis de 50 % pendant 2 s' },
  warpTrap: { name: 'Piège spatial', desc: 'Renvoie 6 ennemis proches de 4 cases + étourdissement 0,8 s' },
};

const file = 'src/i18n/locales/fr.ts';
let s = fs.readFileSync(file, 'utf8');

// 移除第一個錯誤的 playerSkills 到檔案結尾，保留 game 區段
const gameEnd = s.indexOf('\n  playerSkills:');
if (gameEnd === -1) throw new Error('playerSkills not found');
const head = s.slice(0, gameEnd);

// 從重複區段擷取 achievements 之後的內容（第二次出現）
const dupAchIdx = s.indexOf('\n  achievements: {', gameEnd + 1);
if (dupAchIdx === -1) throw new Error('duplicate achievements not found');
const tail = s.slice(dupAchIdx);

const skillLines = Object.entries(SKILLS_FR).map(
  ([id, { name, desc }]) => `    ${id}: { name: ${JSON.stringify(name)}, desc: ${JSON.stringify(desc)} },`,
);
const playerBlock = `\n  playerSkills: {\n${skillLines.join('\n')}\n  },\n`;

fs.writeFileSync(file, head + playerBlock + tail, 'utf8');
console.log('Fixed fr.ts');
