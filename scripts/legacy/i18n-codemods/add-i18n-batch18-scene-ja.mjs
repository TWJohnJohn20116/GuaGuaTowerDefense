/** batch18：ja 場景占位英文 → 日文 */
import fs from 'fs';
import path from 'path';

const file = path.join(path.resolve('src/i18n/locales'), 'ja.ts');
let s = fs.readFileSync(file, 'utf8');

const pairs = [
  ["title: 'Mutator Challenge'", "title: '変異チャレンジ'"],
  ["subtitle: 'Rule-based mutators · Curated challenges'", "subtitle: 'ルール型変異 · 厳選チャレンジ'"],
  ["menuSub: 'Rule mutators'", "menuSub: 'ルール変異'"],
  ["start: 'Start'", "start: '開始'"],
  ["claim: 'Claim'", "claim: '受取'"],
  ["completed: 'Completed'", "completed: '完了'"],
  ["completedCount: 'Completed'", "completedCount: '完了数'"],
  ["bestScore: 'Best Score'", "bestScore: '最高スコア'"],
  ["title: 'Daily Challenge'", "title: 'デイリーチャレンジ'"],
  ["subtitle: 'Hand-picked daily challenge missions'", "subtitle: '毎日厳選チャレンジ'"],
  ["startChallenge: 'Start Challenge'", "startChallenge: 'チャレンジ開始'"],
  ['loading: "Loading today\'s challenge..."', 'loading: "今日のチャレンジを読み込み中..."'],
  ["totalCompleted: 'Total Completed'", "totalCompleted: '累計完了'"],
  ["streak: 'Streak'", "streak: '連続'"],
  ["longestStreak: 'Best'", "longestStreak: '最高'"],
  ["pastThirtyDays: 'Past 30 Days'", "pastThirtyDays: '過去30日'"],
  ["noHistory: 'No history yet'", "noHistory: '履歴なし'"],
  ["completed: 'Completed'", "completed: '完了'"],
  ["incomplete: 'Incomplete'", "incomplete: '未完了'"],
  ["poolSize: 'Daily challenge pool of {n}'", "poolSize: 'デイリーチャレンジ {n} プール'"],
  ["completedTag: 'Done'", "completedTag: '完了'"],
  ["overallProgress: 'Overall Progress'", "overallProgress: '全体進捗'"],
  ["completionConditions: 'Completion Conditions'", "completionConditions: '達成条件'"],
  ["rewardContent: 'Rewards'", "rewardContent: '報酬'"],
  ["coins: 'Coins'", "coins: 'コイン'"],
  ["achievementPoints: 'Achievement Points'", "achievementPoints: '実績ポイント'"],
  ["talentPoints: 'Talent Points'", "talentPoints: 'タレントポイント'"],
  ["strategyTips: 'Strategy Tips'", "strategyTips: '攻略ヒント'"],
  ["claimReward: 'Claim Reward'", "claimReward: '報酬受取'"],
  ["rewardClaimed: 'Reward Claimed'", "rewardClaimed: '報酬受取済'"],
  ['tabToday: "Today"', 'tabToday: "今日"'],
  ['todayHint: "Complete conditions on the left, claim reward on the right"', 'todayHint: "左の条件達成後、右で報酬を受取"'],
  ['historyHint: "Last 30 days completion log"', 'historyHint: "過去30日の完了記録"'],
  ["title: 'Memorial'", "title: '記念碑'"],
  ["subtitle: 'Resting Grounds'", "subtitle: '安息の地'"],
  ["empty: 'No memorials yet'", "empty: '記念碑なし'"],
  ["emptyHint: 'Fallen commanders will leave their memorials here'", "emptyHint: '陣亡した指揮官の記念がここに残る'"],
  ["fallen: 'Fallen'", "fallen: '陣亡'"],
  ["survived: 'Survived'", "survived: '生還'"],
  ["waveLabel: 'Wave'", "waveLabel: 'ウェーブ'"],
  ["dateLabel: 'Date'", "dateLabel: '日付'"],
  ["scoreLabel: 'Score'", "scoreLabel: 'スコア'"],
  ["killsLabel: 'Kills'", "killsLabel: '撃破'"],
  ["timeLabel: 'Duration'", "timeLabel: '時間'"],
  ["mapLabel: 'Map'", "mapLabel: 'マップ'"],
  ["difficultyLabel: 'Difficulty'", "difficultyLabel: '難易度'"],
  ["epitaph: 'Epitaph'", "epitaph: '碑文'"],
  ["detailTitle: 'Memorial Details'", "detailTitle: '記念碑詳細'"],
  ["finalWords: 'Final Words'", "finalWords: '遺言'"],
  ["backToList: 'Back to List'", "backToList: '一覧へ'"],
  ["deleteEntry: 'Delete'", "deleteEntry: '削除'"],
  ["confirmDelete: 'Are you sure you want to delete this memorial?'", "confirmDelete: 'この記念碑を削除しますか？'"],
  ["clearAll: 'Clear All'", "clearAll: 'すべて削除'"],
  ["confirmClearAll: 'Are you sure you want to clear all memorials?'", "confirmClearAll: 'すべての記念碑を削除しますか？'"],
  ["sortNewest: 'Newest'", "sortNewest: '新しい順'"],
  ["sortOldest: 'Oldest'", "sortOldest: '古い順'"],
  ["sortByScore: 'By Score'", "sortByScore: 'スコア順'"],
  ["filterAll: 'All'", "filterAll: 'すべて'"],
  ["filterVictory: 'Victory'", "filterVictory: '勝利'"],
  ["filterDefeat: 'Defeat'", "filterDefeat: '敗北'"],
];

let n = 0;
for (const [from, to] of pairs) {
  if (s.includes(from)) {
    s = s.split(from).join(to);
    n++;
  }
}
fs.writeFileSync(file, s, 'utf8');
console.log('scene ja', n, 'replacements');
console.log('Done scene ja');
