const PATH_LIKE = new Set(['path', 'start', 'end', 'fork']);

function isEnemyPathTileType(type: string): boolean {
  return PATH_LIKE.has(type);
}

/** 關掉「顯示敵人路徑」時，路徑格看起來跟空地一樣（起終點標記仍可另外畫）。 */
export function resolveDisplayedTileType(type: string, showEnemyPath: boolean): string {
  if (!showEnemyPath && isEnemyPathTileType(type)) return 'empty';
  return type;
}

export function shouldShowEnemyPathFx(showEnemyPath: boolean): boolean {
  return showEnemyPath;
}
