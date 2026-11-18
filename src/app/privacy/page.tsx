import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/app-shell";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "פרטיות · Interview Coach" };

const sections = [
  {
    heading: "מה נשמר",
    items: [
      "השם וכתובת האימייל מחשבון Google שאיתו נכנסים.",
      "הפרטים מקורות החיים שאישרת: תפקידים, השכלה, כישורים ותקציר. הקובץ עצמו נקרא פעם אחת ולא נשמר.",
      "התפקידים שאליהם מתכוננים.",
      "השאלות, התשובות, הציונים והמשובים מהתרגולים, מהשיעורים וממבחני הבית.",
      "דירוגי קורות החיים, לשון הפנייה שבחרת, ומשוב ששלחת לנו.",
    ],
  },
  {
    heading: "מי רואה את המידע",
    items: [
      "רק לך יש גישה למידע שלך. מסד הנתונים עצמו מאפשר לכל משתמש לקרוא ולשנות רק את הנתונים שלו.",
      "המידע לא נמכר, לא משמש לפרסומות ולא מועבר לאף אחד אחר, מלבד השירותים שמפעילים את האתר.",
    ],
  },
  {
    heading: "השירותים שמפעילים את האתר",
    items: [
      "Supabase: מסד הנתונים והכניסה עם Google. השרתים בפרנקפורט שבגרמניה.",
      "Vercel: האחסון של האתר, גם הוא בפרנקפורט.",
      "Anthropic: הבינה המלאכותית שקוראת קורות חיים, כותבת שאלות ונותנת משוב. היא מקבלת רק את מה שנדרש לכל פעולה. לפי התנאים המסחריים שלה, המידע לא משמש לאימון המודלים.",
    ],
  },
  {
    heading: "מחיקה",
    items: [
      "אפשר למחוק את החשבון בכל רגע בעמוד הפרופיל. המחיקה מוחקת מיד את כל הנתונים שלך, ואי אפשר לשחזר אותם.",
      "אפשר גם להעלות קורות חיים חדשים או להסיר תפקידים בכל רגע.",
    ],
  },
  {
    heading: "שאלות",
    items: [
      'יש שאלה או בקשה? אפשר לכתוב לנו דרך כפתור "משוב" שמופיע בכל עמוד אחרי הכניסה.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center px-4 py-4 sm:px-6">
        <Logo />
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold sm:text-4xl">פרטיות</h1>
          <p className="text-muted text-lg">
            מה נשמר, למה, ואיך מוחקים. בקצרה ובלי אותיות קטנות.
          </p>
        </div>
        {sections.map((section) => (
          <Card key={section.heading} className="gap-3">
            <h2 className="text-xl font-extrabold">{section.heading}</h2>
            <ul className="flex list-disc flex-col gap-2 ps-5 text-lg">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        ))}
        <p className="text-muted text-sm">עודכן לאחרונה: נובמבר 2026.</p>
        <Link href="/" className="text-violet w-fit font-bold">
          → חזרה לדף הבית
        </Link>
      </main>
    </div>
  );
}
