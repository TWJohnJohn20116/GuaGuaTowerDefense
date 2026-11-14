/**
 * Mod 平衡報告 · Markdown 匯出
 */
import type { analyzeModBalance } from './modBalanceAnalysis';
import type { Translations } from '@/i18n';

type BalMsg = Translations['modEditorExt'];
type ModBalanceAnalysis = ReturnType<typeof analyzeModBalance>;

export function buildBalanceMarkdownReport(
  analysis: ModBalanceAnalysis,
  m: BalMsg,
): string {
  const lines: string[] = [
    `# ${m.balAiTitle}`,
    '',
    `| ${m.balAiTitle} | ${analysis.score} |`,
    `| ${m.balTotalDps} | ${analysis.totalDps.toFixed(0)} |`,
    `| ${m.balTotalThreat} | ${analysis.totalThreat.toFixed(0)} |`,
    `| ${m.balKillEstimate} | ${analysis.killSeconds !== null ? `~${analysis.killSeconds.toFixed(0)}s` : '—'} |`,
    `| ${m.balMetricTowers} | ${analysis.towerCount} |`,
    `| ${m.balMetricEnemies} | ${analysis.enemyCount} |`,
    `| ${m.balMetricEfficiency} | ${analysis.dpsPer100Gold.toFixed(2)} |`,
    '',
    `## ${m.suggestions}`,
  ];

  if (analysis.categorizedSuggestions.length === 0) {
    lines.push('- —');
  } else {
    const byCat = new Map<string, string[]>();
    analysis.categorizedSuggestions.forEach((item) => {
      const key = item.category;
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key)!.push(item.text);
    });
    byCat.forEach((texts, cat) => {
      lines.push(`### ${cat}`);
      texts.forEach((text) => lines.push(`- ${text}`));
      lines.push('');
    });
  }

  if (analysis.waveThreats.length > 0) {
    lines.push(`## ${m.tabWaves}`);
    analysis.waveThreats.forEach((pt) => {
      const boss = pt.hasBoss ? ' [Boss]' : '';
      lines.push(`- ${pt.label}: threat ${pt.threat.toFixed(0)}${boss}`);
    });
  }

  return lines.join('\n');
}
