import type { RubricKey } from "@/lib/interview/feedback";

/**
 * Short lessons on answering interview questions, each ending with one
 * practice question. Written in Hebrew, the language most users prepare in;
 * the examples stay short so the lesson takes about five minutes.
 */

export interface LessonSection {
  heading: string;
  body: string;
  /** An example answer or phrase, shown in a highlighted box. */
  example?: string;
}

export interface Lesson {
  slug: string;
  title: string;
  /** One line shown on the lesson card. */
  summary: string;
  minutes: number;
  /** The rubric criterion this lesson improves most. */
  focus: RubricKey;
  sections: LessonSection[];
  exercise: {
    question: string;
    /** What the feedback should check, in the lesson's terms. */
    goal: string;
    hint: string;
  };
}

export const lessons: Lesson[] = [
  {
    slug: "star",
    title: "שיטת STAR: לספר סיפור שעובד",
    summary: 'המבנה שהופך כל שאלת "ספר על פעם ש..." לתשובה ברורה.',
    minutes: 5,
    focus: "structure",
    sections: [
      {
        heading: "למה צריך מבנה",
        body: "בשאלות התנהגותיות המראיין רוצה לשמוע מה עשית בפועל, כי זה מנבא מה תעשה אצלו. בלי מבנה, קל ללכת לאיבוד בפרטים ולשכוח את החלק החשוב: מה אתה עשית ומה יצא מזה.",
      },
      {
        heading: "ארבעת החלקים",
        body: "מצב: איפה זה קרה, במשפט או שניים.\nמשימה: מה היה צריך להשיג, ולמה זה היה קשה.\nפעולה: מה אתה עשית, צעד אחרי צעד. זה החלק הארוך.\nתוצאה: מה יצא, עדיף עם מספר, ומה למדת.",
      },
      {
        heading: "דוגמה",
        body: "השאלה: ספר על פעם שעמדת בדדליין צפוף.",
        example:
          "מצב: בעבודה הקודמת שלי, לקוח גדול הקדים השקה בשבועיים.\nמשימה: הייתי אחראי להכין את כל חומרי ההדרכה בזמן, בלי לוותר על איכות.\nפעולה: חילקתי את העבודה לחלקים, ויתרתי על מה שלא היה הכרחי להשקה וגייסתי עמית לבדיקה.\nתוצאה: סיימנו יומיים לפני הזמן, והלקוח אימץ את החומרים לכל הצוותים שלו.",
      },
      {
        heading: "הטעות הנפוצה",
        body: 'לדבר על "אנחנו" במקום על "אני". המראיין מעסיק אותך, לא את הצוות. ספר מה הצוות עשה במשפט, ומה אתה עשית בכל השאר.',
      },
    ],
    exercise: {
      question: "ספר על פעם שפתרת בעיה בעבודה, בלימודים או בצבא.",
      goal: "The answer follows the STAR structure: a short situation, the task, the candidate's own actions in detail, and a clear result.",
      hint: "כתוב ארבע פסקאות קצרות: מצב, משימה, פעולה ותוצאה.",
    },
  },
  {
    slug: "tell-me-about-yourself",
    title: '"ספר לי על עצמך" בדקה וחצי',
    summary: "השאלה שפותחת כמעט כל ראיון, והדרך לענות עליה בביטחון.",
    minutes: 5,
    focus: "content",
    sections: [
      {
        heading: "מה באמת שואלים",
        body: "זו לא בקשה לסיפור חיים. המראיין רוצה לדעת מי אתה מקצועית, ולמה אתה מתאים דווקא לתפקיד הזה. זו גם ההזדמנות שלך לכוון את המשך השיחה.",
      },
      {
        heading: "הווה, עבר, עתיד",
        body: "הווה: מה אתה עושה היום, ובמה אתה טוב.\nעבר: שניים או שלושה דברים מהדרך שהביאו אותך לכאן, עם הישג אחד.\nעתיד: למה התפקיד הזה הוא הצעד הבא שלך.",
        example:
          "היום אני מנהל תפעול בחברת לוגיסטיקה, ואחראי על צוות של שישה אנשים. לפני כן עבדתי שלוש שנים כאנליסט, ושם בניתי דוח שקיצר את זמני המשלוח ב־15%. עכשיו אני מחפש תפקיד שבו אוכל לשלב את הניסיון בנתונים עם ניהול, ולכן התפקיד אצלכם מעניין אותי.",
      },
      {
        heading: "מה להשאיר בחוץ",
        body: "פרטים אישיים שלא קשורים לעבודה, רשימה של כל התפקידים שהיו לך, וקריאה של קורות החיים בקול. המראיין כבר קרא אותם.",
      },
    ],
    exercise: {
      question: "ספר לי על עצמך.",
      goal: "The answer is a focused professional introduction: present, a relevant past achievement, and why this next step, in about 90 seconds of speech (150-250 words).",
      hint: "שלוש פסקאות: מה אתה עושה היום, מה הביא אותך לכאן, ולמה התפקיד הבא.",
    },
  },
  {
    slug: "specifics",
    title: "פרטים ומספרים שמשכנעים",
    summary: "איך להפוך תשובה כללית לתשובה שזוכרים.",
    minutes: 4,
    focus: "content",
    sections: [
      {
        heading: "כללי לא משכנע",
        body: '"אני עובד טוב בצוות" זה משפט שכל מועמד אומר. מה שמבדיל אותך הוא דוגמה אמיתית: מה קרה, מה עשית, ומה השתנה בזכותך.',
      },
      {
        heading: "שלוש דרכים להיות ספציפי",
        body: "מספר: כמה, כמה זמן, כמה אחוזים, כמה אנשים.\nשם: איזה פרויקט, איזה כלי, איזה לקוח (בלי לחשוף סודות).\nלפני ואחרי: איך זה היה לפני שהתערבת, ואיך זה היה אחר כך.",
        example:
          "במקום: שיפרתי את השירות ללקוחות.\nעדיף: בניתי מאגר תשובות לשאלות הנפוצות, וזמן ההמתנה הממוצע ירד מ־12 דקות ל־4.",
      },
      {
        heading: "אין לך מספרים?",
        body: 'זה בסדר. אפשר להעריך ("בערך פי שניים"), לתאר תגובה של מישהו ("המנהלת ביקשה שאדריך את כל הצוות"), או לספר מה השתנה בפועל.',
      },
    ],
    exercise: {
      question: "מה ההישג המקצועי שאתה הכי גאה בו?",
      goal: "The answer names one specific achievement with concrete details: numbers or estimates, names of projects or tools, and a clear before and after.",
      hint: "בחר הישג אחד, והוסף לפחות מספר אחד או תיאור של לפני ואחרי.",
    },
  },
  {
    slug: "concise",
    title: "לענות קצר וברור",
    summary: "איך לא לאבד את המראיין באמצע התשובה.",
    minutes: 4,
    focus: "clarity",
    sections: [
      {
        heading: "התשובה קודם",
        body: "פתח במשפט שעונה על השאלה, ורק אחר כך הסבר. כך המראיין יודע מההתחלה לאן אתה הולך, וגם אם תקצר, העיקר כבר נאמר.",
        example:
          "שאלה: למה אתה עוזב את העבודה הנוכחית?\nפתיחה טובה: אני מחפש תפקיד עם יותר אחריות על מוצר, ובמקום הנוכחי אין לזה מקום.",
      },
      {
        heading: "אורך נכון",
        body: "רוב התשובות צריכות לקחת דקה עד שתיים, כלומר 100 עד 250 מילים בכתב. אם המראיין רוצה יותר, הוא ישאל.",
      },
      {
        heading: "מילים שמחלישות",
        body: '"אני חושב ש...", "בערך", "כאילו", "די" ו"סוג של" גורמים לך להישמע לא בטוח. כשאתה יודע משהו, אמור אותו ישירות.',
      },
    ],
    exercise: {
      question: "למה אתה מתעניין בתפקיד הזה?",
      goal: "The answer opens with a direct one-sentence answer, stays under about 200 words, and avoids filler and hedging words.",
      hint: "התחל במשפט אחד שעונה על השאלה, והוסף שתיים או שלוש סיבות.",
    },
  },
  {
    slug: "failures",
    title: "חולשות וכישלונות בלי לפחד",
    summary: "השאלות הלא נעימות, והדרך להפוך אותן לנקודת חוזק.",
    minutes: 5,
    focus: "content",
    sections: [
      {
        heading: "מה המראיין בודק",
        body: 'אף אחד לא מצפה שלא נכשלת אף פעם. בודקים אם אתה מכיר את עצמך, לוקח אחריות ולומד. תשובה כמו "אני פרפקציוניסט" נשמעת כמו התחמקות.',
      },
      {
        heading: "המבנה",
        body: "מה קרה, בכנות ובקצרה.\nמה היה החלק שלך בזה, בלי להאשים אחרים.\nמה למדת, ומה אתה עושה אחרת מאז. זה החלק החשוב.",
        example:
          "בפרויקט הראשון שניהלתי לא עדכנתי את המנהלת בעיכוב עד שהיה מאוחר מדי. מאז אני שולח עדכון קצר כל שבוע, גם כשהכל בסדר, ובפרויקט הבא סיימנו בזמן.",
      },
      {
        heading: "איזו חולשה לבחור",
        body: "חולשה אמיתית שלא פוגעת בליבת התפקיד, ושאתה כבר עובד עליה. למשל, מתכנת שמשתפר בהצגה מול קהל.",
      },
    ],
    exercise: {
      question: "ספר על פעם שנכשלת. מה למדת מזה?",
      goal: "The answer describes a real failure honestly, takes ownership without blaming others, and spends most of its length on what was learned and changed since.",
      hint: "מה קרה, מה היה החלק שלך, ומה אתה עושה אחרת מאז.",
    },
  },
  {
    slug: "thinking-out-loud",
    title: "שאלות מקצועיות: לחשוב בקול",
    summary: "איך לענות על שאלה שאין לה תשובה אחת נכונה.",
    minutes: 5,
    focus: "structure",
    sections: [
      {
        heading: "הדרך חשובה מהתשובה",
        body: 'בשאלות כמו "איך היית מתעדף" או "מה היית עושה אם", המראיין רוצה לראות איך אתה חושב. תשובה מסודרת עם שיקולים ברורים עדיפה על תשובה "נכונה" בלי הסבר.',
      },
      {
        heading: "ארבעה צעדים",
        body: "וודא שהבנת: חזור על השאלה במילים שלך, או שאל שאלה מבהירה.\nפרק: אמור באילו שיקולים תתחשב.\nהחלט: בחר כיוון, ואמור למה.\nסכם: משפט אחד שעונה על השאלה.",
        example:
          "שאלה: יש לך שלוש משימות דחופות. מה תעשה קודם?\nתשובה: קודם הייתי בודק מה ההשפעה של כל משימה ומה הדדליין שלה. אחר כך הייתי מתחיל במה שחוסם אנשים אחרים, ומעדכן את מי שיחכה. כלומר, השפעה ותלות קובעות את הסדר.",
      },
      {
        heading: "כשאתה לא יודע",
        body: 'אמור מה כן ידוע לך, ואיך היית בודק את השאר. "אני לא בטוח, אבל הייתי מתחיל מ..." עדיף בהרבה על ניחוש בביטחון מזויף.',
      },
    ],
    exercise: {
      question:
        "קיבלת שלוש משימות דחופות מאותו מנהל ואין זמן לכולן. איך תחליט מה לעשות קודם?",
      goal: "The answer clarifies the situation, names the factors weighed, makes a clear decision with reasons, and ends with a one-sentence summary.",
      hint: "פרק לשיקולים, בחר כיוון ואמור למה, וסכם במשפט אחד.",
    },
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}

type Scores = Record<RubricKey, number>;

/**
 * Picks the lesson that helps most: the first unfinished lesson on the
 * user's weakest rubric criterion, judged by their recent answers. With no
 * scores yet, it starts with the first unfinished lesson.
 */
export function recommendLesson(
  recentScores: Scores[],
  completed: Iterable<string>,
): Lesson | undefined {
  const done = new Set(completed);
  const open = lessons.filter((lesson) => !done.has(lesson.slug));
  if (open.length === 0) return undefined;
  if (recentScores.length === 0) return open[0];

  const keys: RubricKey[] = ["content", "structure", "clarity"];
  const average = (key: RubricKey) =>
    recentScores.reduce((sum, s) => sum + s[key], 0) / recentScores.length;
  const byWeakness = [...keys].sort((a, b) => average(a) - average(b));
  for (const key of byWeakness) {
    const lesson = open.find((l) => l.focus === key);
    if (lesson) return lesson;
  }
  return open[0];
}
