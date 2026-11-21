import { splitKind } from "./schema";

const tips: Record<string, string> = {
  behavioral: "מצב, משימה, פעולה ותוצאה. ככה קל לעקוב אחרי הסיפור שלך.",
  resume: "מצב, משימה, פעולה ותוצאה. ככה קל לעקוב אחרי הסיפור שלך.",
  role: "לפתוח במשפט שעונה על השאלה, ואז להסביר עם דוגמה מהניסיון.",
  technical:
    "להסביר את ההיגיון ואת השיקולים, לא רק את התשובה הסופית. אם משהו לא ברור, לומר איזו הנחה מניחים.",
  design:
    "לפרק לשלבים, לומר אילו הנחות מניחים, ולהסביר כל החלטה ומה מוותרים בגללה.",
};

/** A short tip for answering a spoken question of this kind. */
export function answerTip(kind: string): string {
  return tips[splitKind(kind).kind] ?? tips.behavioral;
}
