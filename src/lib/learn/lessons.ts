import { g, type Address } from "@/lib/address";
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
  /** Interview lessons are recommended from interview scores. */
  track: "interview" | "take-home";
  /** The interview rubric criterion this lesson improves most. */
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
    summary: 'המבנה שהופך כל שאלת "{ספר|ספרי} על פעם ש..." לתשובה ברורה.',
    minutes: 5,
    track: "interview",
    focus: "structure",
    sections: [
      {
        heading: "למה צריך מבנה",
        body: "בשאלות התנהגותיות המראיין רוצה לשמוע מה עשית בפועל, כי זה מנבא מה {תעשה|תעשי} אצלו. בלי מבנה, קל ללכת לאיבוד בפרטים ולשכוח את החלק החשוב: מה {אתה|את} עשית ומה יצא מזה.",
      },
      {
        heading: "ארבעת החלקים",
        body: "מצב: איפה זה קרה, במשפט או שניים.\nמשימה: מה היה צריך להשיג, ולמה זה היה קשה.\nפעולה: מה {אתה|את} עשית, צעד אחרי צעד. זה החלק הארוך.\nתוצאה: מה יצא, עדיף עם מספר, ומה למדת.",
      },
      {
        heading: "דוגמה",
        body: "השאלה: {ספר|ספרי} על פעם שעמדת בדדליין צפוף.",
        example:
          "מצב: בעבודה הקודמת שלי, לקוח גדול הקדים השקה בשבועיים.\nמשימה: הייתי אחראי להכין את כל חומרי ההדרכה בזמן, בלי לוותר על איכות.\nפעולה: חילקתי את העבודה לחלקים, ויתרתי על מה שלא היה הכרחי להשקה וגייסתי עמית לבדיקה.\nתוצאה: סיימנו יומיים לפני הזמן, והלקוח אימץ את החומרים לכל הצוותים שלו.",
      },
      {
        heading: "הטעות הנפוצה",
        body: 'לדבר על "אנחנו" במקום על "אני". המראיין מעסיק אותך, לא את הצוות. כדאי לספר מה הצוות עשה במשפט, ומה {אתה|את} עשית בכל השאר.',
      },
    ],
    exercise: {
      question: "{ספר|ספרי} על פעם שפתרת בעיה בעבודה, בלימודים או בצבא.",
      goal: "The answer follows the STAR structure: a short situation, the task, the candidate's own actions in detail, and a clear result.",
      hint: "{כתוב|כתבי} ארבע פסקאות קצרות: מצב, משימה, פעולה ותוצאה.",
    },
  },
  {
    slug: "tell-me-about-yourself",
    title: '"{ספר|ספרי} לי על עצמך" בדקה וחצי',
    summary: "השאלה שפותחת כמעט כל ראיון, והדרך לענות עליה בביטחון.",
    minutes: 5,
    track: "interview",
    focus: "content",
    sections: [
      {
        heading: "מה באמת שואלים",
        body: "זו לא בקשה לסיפור חיים. המראיין רוצה לדעת מי {אתה|את} מקצועית, ולמה {אתה מתאים|את מתאימה} דווקא לתפקיד הזה. זו גם ההזדמנות שלך לכוון את המשך השיחה.",
      },
      {
        heading: "הווה, עבר, עתיד",
        body: "הווה: מה {אתה|את} עושה היום, ובמה {אתה טוב|את טובה}.\nעבר: שניים או שלושה דברים מהדרך שהביאו אותך לכאן, עם הישג אחד.\nעתיד: למה התפקיד הזה הוא הצעד הבא שלך.",
        example:
          "היום אני מנהל תפעול בחברת לוגיסטיקה, ואחראי על צוות של שישה אנשים. לפני כן עבדתי שלוש שנים כאנליסט, ושם בניתי דוח שקיצר את זמני המשלוח ב־15%. עכשיו אני מחפש תפקיד שבו אוכל לשלב את הניסיון בנתונים עם ניהול, ולכן התפקיד אצלכם מעניין אותי.",
      },
      {
        heading: "מה להשאיר בחוץ",
        body: "פרטים אישיים שלא קשורים לעבודה, רשימה של כל התפקידים שהיו לך, וקריאה של קורות החיים בקול. המראיין כבר קרא אותם.",
      },
    ],
    exercise: {
      question: "{ספר|ספרי} לי על עצמך.",
      goal: "The answer is a focused professional introduction: present, a relevant past achievement, and why this next step, in about 90 seconds of speech (150-250 words).",
      hint: "שלוש פסקאות: מה {אתה|את} עושה היום, מה הביא אותך לכאן, ולמה התפקיד הבא.",
    },
  },
  {
    slug: "specifics",
    title: "פרטים ומספרים שמשכנעים",
    summary: "איך להפוך תשובה כללית לתשובה שזוכרים.",
    minutes: 4,
    track: "interview",
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
      question: "מה ההישג המקצועי {שאתה הכי גאה|שאת הכי גאה} בו?",
      goal: "The answer names one specific achievement with concrete details: numbers or estimates, names of projects or tools, and a clear before and after.",
      hint: "{בחר|בחרי} הישג אחד, {והוסף|והוסיפי} לפחות מספר אחד או תיאור של לפני ואחרי.",
    },
  },
  {
    slug: "concise",
    title: "לענות קצר וברור",
    summary: "איך לא לאבד את המראיין באמצע התשובה.",
    minutes: 4,
    track: "interview",
    focus: "clarity",
    sections: [
      {
        heading: "התשובה קודם",
        body: "{פתח|פתחי} במשפט שעונה על השאלה, ורק אחר כך {הסבר|הסבירי}. כך המראיין יודע מההתחלה לאן {אתה הולך|את הולכת}, וגם אם {תקצר|תקצרי}, העיקר כבר נאמר.",
        example:
          "שאלה: למה {אתה עוזב|את עוזבת} את העבודה הנוכחית?\nפתיחה טובה: אני מחפש תפקיד עם יותר אחריות על מוצר, ובמקום הנוכחי אין לזה מקום.",
      },
      {
        heading: "אורך נכון",
        body: "רוב התשובות צריכות לקחת דקה עד שתיים, כלומר 100 עד 250 מילים בכתב. אם המראיין רוצה יותר, הוא ישאל.",
      },
      {
        heading: "מילים שמחלישות",
        body: '"אני חושב ש...", "בערך", "כאילו", "די" ו"סוג של" גורמים לך להישמע {לא בטוח|לא בטוחה}. {כשאתה יודע|כשאת יודעת} משהו, {אמור|אמרי} אותו ישירות.',
      },
    ],
    exercise: {
      question: "למה {אתה מתעניין|את מתעניינת} בתפקיד הזה?",
      goal: "The answer opens with a direct one-sentence answer, stays under about 200 words, and avoids filler and hedging words.",
      hint: "{התחל|התחילי} במשפט אחד שעונה על השאלה, {והוסף|והוסיפי} שתיים או שלוש סיבות.",
    },
  },
  {
    slug: "failures",
    title: "חולשות וכישלונות בלי לפחד",
    summary: "השאלות הלא נעימות, והדרך להפוך אותן לנקודת חוזק.",
    minutes: 5,
    track: "interview",
    focus: "content",
    sections: [
      {
        heading: "מה המראיין בודק",
        body: 'אף אחד לא מצפה שלא נכשלת אף פעם. בודקים אם {אתה מכיר|את מכירה} את עצמך, {לוקח|לוקחת} אחריות {ולומד|ולומדת}. תשובה כמו "{אני פרפקציוניסט|אני פרפקציוניסטית}" נשמעת כמו התחמקות.',
      },
      {
        heading: "המבנה",
        body: "מה קרה, בכנות ובקצרה.\nמה היה החלק שלך בזה, בלי להאשים אחרים.\nמה למדת, ומה {אתה|את} עושה אחרת מאז. זה החלק החשוב.",
        example:
          "בפרויקט הראשון שניהלתי לא עדכנתי את המנהלת בעיכוב עד שהיה מאוחר מדי. מאז אני שולח עדכון קצר כל שבוע, גם כשהכל בסדר, ובפרויקט הבא סיימנו בזמן.",
      },
      {
        heading: "איזו חולשה לבחור",
        body: "חולשה אמיתית שלא פוגעת בליבת התפקיד, {ושאתה כבר עובד|ושאת כבר עובדת} עליה. למשל, מתכנת שמשתפר בהצגה מול קהל.",
      },
    ],
    exercise: {
      question: "{ספר|ספרי} על פעם שנכשלת. מה למדת מזה?",
      goal: "The answer describes a real failure honestly, takes ownership without blaming others, and spends most of its length on what was learned and changed since.",
      hint: "מה קרה, מה היה החלק שלך, ומה {אתה|את} עושה אחרת מאז.",
    },
  },
  {
    slug: "thinking-out-loud",
    title: "שאלות מקצועיות: לחשוב בקול",
    summary: "איך לענות על שאלה שאין לה תשובה אחת נכונה.",
    minutes: 5,
    track: "interview",
    focus: "structure",
    sections: [
      {
        heading: "הדרך חשובה מהתשובה",
        body: 'בשאלות כמו "איך היית מתעדף" או "מה היית עושה אם", המראיין רוצה לראות איך {אתה חושב|את חושבת}. תשובה מסודרת עם שיקולים ברורים עדיפה על תשובה "נכונה" בלי הסבר.',
      },
      {
        heading: "ארבעה צעדים",
        body: "{וודא|וודאי} שהבנת: {חזור|חזרי} על השאלה במילים שלך, או {שאל|שאלי} שאלה מבהירה.\n{פרק|פרקי}: {אמור|אמרי} באילו שיקולים {תתחשב|תתחשבי}.\n{החלט|החליטי}: {בחר|בחרי} כיוון, {ואמור|ואמרי} למה.\n{סכם|סכמי}: משפט אחד שעונה על השאלה.",
        example:
          "שאלה: יש לך שלוש משימות דחופות. מה {תעשה|תעשי} קודם?\nתשובה: קודם הייתי בודק מה ההשפעה של כל משימה ומה הדדליין שלה. אחר כך הייתי מתחיל במה שחוסם אנשים אחרים, ומעדכן את מי שיחכה. כלומר, השפעה ותלות קובעות את הסדר.",
      },
      {
        heading: "{כשאתה לא יודע|כשאת לא יודעת}",
        body: '{אמור|אמרי} מה כן ידוע לך, ואיך היית {בודק|בודקת} את השאר. "{אני לא בטוח, אבל הייתי מתחיל מ...|אני לא בטוחה, אבל הייתי מתחילה מ...}" עדיף בהרבה על ניחוש בביטחון מזויף.',
      },
    ],
    exercise: {
      question:
        "קיבלת שלוש משימות דחופות מאותו מנהל ואין זמן לכולן. איך {תחליט|תחליטי} מה לעשות קודם?",
      goal: "The answer clarifies the situation, names the factors weighed, makes a clear decision with reasons, and ends with a one-sentence summary.",
      hint: "{פרק|פרקי} לשיקולים, {בחר|בחרי} כיוון {ואמור|ואמרי} למה, {וסכם|וסכמי} במשפט אחד.",
    },
  },
  {
    slug: "take-home-brief",
    track: "take-home",
    title: "לפרק את המשימה לפני שמתחילים",
    summary: "איך לקרוא מבחן בית ולהבין מה באמת מצפים לקבל.",
    minutes: 5,
    focus: "content",
    sections: [
      {
        heading: "מה בודקים במבחן בית",
        body: 'מבחן בית הוא לא מבחן ידע. החברה רוצה לראות איך {אתה חושב|את חושבת}: איך {אתה מבין|את מבינה} בעיה עמומה, מה {אתה בוחר|את בוחרת} לעשות קודם, ואיך {אתה מסביר|את מסבירה} את ההחלטות שלך. התשובה ה"נכונה" פחות חשובה מהדרך.',
      },
      {
        heading: "שלוש שאלות לפני שכותבים מילה",
        body: "מה המטרה העסקית? מאחורי כל משימה יש בעיה של החברה, כמו לקוחות שעוזבים או מכירות שנתקעו.\nמה בדיוק צריך להגיש? כמה עמודים, באיזה פורמט, ולמי.\nמה חסר? {רשום|רשמי} את מה שלא כתוב במשימה, {והחלט|והחליטי} איזו הנחה {תניח|תניחי}.",
      },
      {
        heading: "לכתוב את ההנחות",
        body: "כשמשהו לא ברור, אל {תיתקע|תיתקעי} ואל {תנחש|תנחשי} בשקט. {כתוב|כתבי} בתחילת ההגשה את ההנחות שלך. זה מראה בגרות מקצועית, וגם מגן עליך אם המראיין חשב על משהו אחר.",
        example:
          'הנחות:\n1. התקציב לרבעון הוא 50 אלף ש"ח, כפי שמופיע בטבלה.\n2. היעד הוא לקוחות קיימים, לא לקוחות חדשים.\n3. אין צורך בפיתוח טכני חדש בשלב הראשון.',
      },
    ],
    exercise: {
      question:
        'קיבלת מבחן בית: "אפליקציית משלוחי אוכל רואה ירידה של 20% בהזמנות חוזרות. הצע תוכנית לשיפור." {כתוב|כתבי} מה לדעתך המטרה העסקית, שלוש שאלות שהיית רוצה לשאול, ושלוש הנחות {שתניח|שתניחי}.',
      goal: "The answer identifies the business goal (bringing back repeat customers and the revenue behind it), asks sharp clarifying questions about the data and scope, and states reasonable explicit assumptions.",
      hint: "שלושה חלקים קצרים: המטרה, שאלות, הנחות.",
    },
  },
  {
    slug: "take-home-time",
    track: "take-home",
    title: "לנהל את הזמן במבחן בית",
    summary: "איך לא לשקוע בפרטים ולהגיש בזמן משהו שלם.",
    minutes: 4,
    focus: "structure",
    sections: [
      {
        heading: "יותר זמן זה לא יותר טוב",
        body: 'אם כתוב "עד שלוש שעות", החברה לא מצפה לעבודה של שבוע. הגשה ענקית אומרת שקשה לך לתעדף. עדיף פתרון שלם וממוקד מאשר פתרון מושלם בחצי מהמשימות.',
      },
      {
        heading: "חלוקה פשוטה",
        body: "עשרה אחוזים מהזמן: לקרוא, לפרק ולכתוב הנחות.\nשישים אחוזים: לעבוד על הפתרון, מהחלק החשוב ביותר.\nעשרים אחוזים: לכתוב את ההגשה בצורה מסודרת.\nעשרה אחוזים: לקרוא הכל שוב ולתקן.",
      },
      {
        heading: "מה עושים כשאין זמן",
        body: "{כתוב|כתבי} בסוף מה היית עושה עם עוד זמן. זה הופך חוסר זמן להזדמנות להראות {שאתה רואה|שאת רואה} את התמונה המלאה.",
        example:
          "עם עוד זמן הייתי:\n- בודק את הנתונים לפי עיר, כדי לראות אם הירידה מקומית.\n- מראיין חמישה לקוחות שהפסיקו להזמין.",
      },
    ],
    exercise: {
      question:
        "יש לך שעתיים למבחן בית: לנתח טבלה של מכירות ולהמליץ על שלושה צעדים לרבעון הבא. {כתוב|כתבי} איך {תחלק|תחלקי} את הזמן ומה {תעשה|תעשי} בכל שלב.",
      goal: "The answer gives a realistic time plan that fits two hours, starts with understanding the task, puts most time on the analysis that matters most, and keeps time for writing and review.",
      hint: "{כתוב|כתבי} שלבים עם דקות לכל שלב, וסכום שמגיע לשעתיים.",
    },
  },
  {
    slug: "take-home-writeup",
    track: "take-home",
    title: "הגשה שקל לקרוא",
    summary: "איך לכתוב מסמך שהמראיין מבין בדקה הראשונה.",
    minutes: 5,
    focus: "clarity",
    sections: [
      {
        heading: "התקציר קודם",
        body: "המראיין קורא הרבה הגשות. {פתח|פתחי} בתקציר של שלוש עד חמש שורות: מה הבעיה, מה ההמלצה שלך, ומה התוצאה הצפויה. אם הוא יקרא רק את זה, הוא כבר יבין את העיקר.",
        example:
          "תקציר: הירידה בהזמנות החוזרות מגיעה בעיקר מלקוחות שחוו איחור במשלוח הראשון. אני ממליץ על פיצוי אוטומטי אחרי איחור ועל שיפור הזמנים בשעות העומס. הצפי: החזרה של חצי מהירידה תוך רבעון.",
      },
      {
        heading: "מבנה קבוע",
        body: "תקציר, הנחות, ניתוח, המלצות, איך נמדוד הצלחה, ומה הייתי עושה עם עוד זמן. כותרות ברורות ורשימות קצרות עוזרות לסרוק את המסמך.",
      },
      {
        heading: "להסביר את הבחירות",
        body: "בכל המלצה, {כתוב|כתבי} משפט על למה דווקא היא ומה ויתרת עליו. ההסבר הזה הוא בדיוק מה שבודקים.",
      },
    ],
    exercise: {
      question:
        '{כתוב|כתבי} תקציר של עד חמש שורות להגשה על הנושא: "איך להגדיל את מספר המשתמשים הפעילים באפליקציית כושר ב־15% בחצי שנה". אפשר להמציא את הממצאים.',
      goal: "The answer is an executive summary of at most five lines that states the problem, the main recommendation and the expected result with a number, clear enough to understand without the rest of the document.",
      hint: "שלושה משפטים: הבעיה, ההמלצה, והתוצאה הצפויה.",
    },
  },
  {
    slug: "take-home-present",
    track: "take-home",
    title: "להציג את מבחן הבית בראיון",
    summary: "איך להגן על ההחלטות שלך כשהמראיין מקשה.",
    minutes: 4,
    focus: "content",
    sections: [
      {
        heading: "הראיון שאחרי",
        body: "ברוב החברות, מבחן הבית ממשיך לשיחה שבה מציגים אותו. שם בודקים אם {אתה מבין|את מבינה} לעומק את מה שכתבת, ואיך {אתה מגיב|את מגיבה} לביקורת.",
      },
      {
        heading: "להתכונן לשאלות קשות",
        body: "לפני הראיון, {כתוב|כתבי} לעצמך את שלוש השאלות הכי קשות על ההגשה. למשל: למה לא בחרת בחלופה אחרת? מה אם ההנחה שלך לא נכונה? מה הסיכון הגדול בהמלצה?",
      },
      {
        heading: "לקבל ביקורת בלי להתגונן",
        body: "אם המראיין מעיר על משהו, אל {תתווכח|תתווכחי} ואל {תוותר|תוותרי} מיד. {הקשב|הקשיבי}, {הסבר|הסבירי} את השיקול שלך, ואם הוא צודק {אמור|אמרי} איך היית משנה. זה מה שעושים בעבודה אמיתית.",
        example:
          '"זו נקודה טובה. בחרתי להתחיל מלקוחות קיימים כי הנתונים הראו שם את הירידה הגדולה, אבל אם יש לכם מידע שהבעיה דווקא אצל לקוחות חדשים, הייתי מתחיל מבדיקה קטנה שם."',
      },
    ],
    exercise: {
      question:
        'המראיין אומר לך: "ההמלצה שלך יקרה מדי, ואין לנו תקציב לזה." איך {תגיב|תגיבי}?',
      goal: "The answer acknowledges the concern without getting defensive, explains the reasoning behind the original recommendation, and offers a cheaper alternative or a small first step to test it.",
      hint: "הקשבה, הסבר קצר, וחלופה זולה יותר.",
    },
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}

/**
 * The lesson's text in the user's form of address. Lesson text marks
 * gendered words as {masculine|feminine}; see g().
 */
export function forAddress(lesson: Lesson, address: Address | null): Lesson {
  const t = (text: string) => g(text, address);
  return {
    ...lesson,
    title: t(lesson.title),
    summary: t(lesson.summary),
    sections: lesson.sections.map((section) => ({
      heading: t(section.heading),
      body: t(section.body),
      example: section.example && t(section.example),
    })),
    exercise: {
      ...lesson.exercise,
      question: t(lesson.exercise.question),
      hint: t(lesson.exercise.hint),
    },
  };
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
  const open = lessons.filter(
    (lesson) => lesson.track === "interview" && !done.has(lesson.slug),
  );
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
