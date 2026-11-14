function fillToken(template: string, token: string, value: string): string {
  return template.split(`{${token}}`).join(value);
}

/** 勝利主按鈕：插入「下一關」動詞與下一關標題。 */
export function formatVictoryNextLabel(template: string, action: string, title: string): string {
  return fillToken(fillToken(template, 'action', action), 'title', title);
}
