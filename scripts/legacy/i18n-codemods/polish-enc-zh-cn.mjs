/** batch29：百科 enemyGuides zh-CN 用語潤飾 */
import fs from 'fs';
import path from 'path';

const file = path.resolve('src/i18n/locales/zh-CN.ts');
let s = fs.readFileSync(file, 'utf8');

const fixes = [
  ['不会 miss', '不会失手'],
  ['bomber 同时死亡', '自爆敌人同时死亡'],
  ['fileDetailSelectHintLine1: "點選左側檔案卡"', 'fileDetailSelectHintLine1: "点选左侧文件卡"'],
  ['fileDetailSelectHintLine2: "查看路徑與用途"', 'fileDetailSelectHintLine2: "查看路径与用途"'],
  ['iconDetailSelectHintLine1: "點選左側圖示"', 'iconDetailSelectHintLine1: "点选左侧图标"'],
  ['iconDetailSelectHintLine2: "預覽 SVG 詳情"', 'iconDetailSelectHintLine2: "预览 SVG 详情"'],
  ["emptySelectHint1: \"尚無今日挑戰\"", 'emptySelectHint1: "尚无今日挑战"'],
  ["emptySelectHint2: \"請稍後再試\"", 'emptySelectHint2: "请稍后再试"'],
  [
    "tips: ['前几波主力，1-2 座基础塔就能应对', '后期会出现大量普通敌人，需要 AOE 塔']",
    "tips: ['前几波主力，1-2 座基础塔就能应对', '后期会出现大量普通敌人，需要 AOE 塔', '无特殊抗性，所有塔都有效']",
  ],
  [
    "tips: ['比普通敌人更难对付，需要更多火力', '适合用狙击塔重点打击']",
    "tips: ['比普通敌人更难对付，需要更多火力', '适合用狙击塔重点打击', '堆叠火力即可应对']",
  ],
];

for (const [from, to] of fixes) {
  if (s.includes(from)) {
    s = s.replace(from, to);
    console.log('fixed:', from.slice(0, 40));
  }
}

fs.writeFileSync(file, s, 'utf8');
console.log('Done zh-CN enc polish');
