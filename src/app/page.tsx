import { Logo } from "@/components/app-shell";
import {
  ButtonLink,
  Card,
  Chip,
  Icon,
  ScoreTrend,
  tileTones,
  type IconName,
} from "@/components/ui";
import { SiteFooter } from "@/components/site-footer";

const steps: { title: string; body: string; icon: IconName }[] = [
  {
    title: "מעלים קורות חיים ומשרות",
    icon: "page",
    body: "המערכת קוראת את קורות החיים, נותנת להם ציון והצעות לשיפור, ומכינה תוכנית הכנה לכל משרה שהגשת אליה.",
  },
  {
    title: "מתאמנים על ראיון",
    icon: "microphone",
    body: "ראיון כללי, מקצועי או ניתוח מקרה, ברמה של התפקיד. עונים בדיבור או בכתב, בעברית או באנגלית.",
  },
  {
    title: "מקבלים ציון ומשוב",
    icon: "chart",
    body: "ציון לכל תשובה, מה עבד, מה לשפר ודוגמה לתשובה חזקה יותר.",
  },
  {
    title: "לומדים ומשתפרים",
    icon: "book",
    body: "שיעורים קצרים ומבחני בית לתרגול, לפי מה שהכי יעזור לך, וגרף שמראה את ההתקדמות.",
  },
];

export default function Home() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <ButtonLink
          href="/login"
          variant="quiet"
          className="min-h-11 text-base"
        >
          כניסה
        </ButtonLink>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-10 sm:px-6 sm:py-16">
        <section className="grid items-center gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Chip tone="blue">מאמן ראיונות אישי</Chip>
            <h1 className="text-4xl leading-tight font-extrabold sm:text-6xl">
              הראיון הבא שלך
              <br />
              <span className="text-blue">יתחיל בביטחון</span>
            </h1>
            <p className="text-muted text-xl leading-relaxed">
              מתאמנים על שאלות אמיתיות, מקבלים משוב אישי על כל תשובה, ולומדים
              בדיוק את מה שחסר לך. בלי לקבוע ראיון דמה עם אף אחד.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/dashboard" variant="primary">
                להתחיל להתאמן
              </ButtonLink>
            </div>
          </div>
          <Card tone="blue" className="gap-4 p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-lg font-bold">הציון שלך בתרגול האחרון</p>
              <Icon name="trophy" size={72} />
            </div>
            <ScoreTrend score={72} change={12} />
            <div className="rounded-2xl bg-white/50 p-4">
              <p className="text-muted text-sm font-bold">הטיפ שלך</p>
              <p className="font-medium">
                עם מספר אחד בסיפור, התשובה תישמע הרבה יותר משכנעת.
              </p>
            </div>
          </Card>
        </section>

        <section aria-labelledby="how" className="flex flex-col gap-6">
          <h2 id="how" className="text-3xl font-extrabold">
            איך זה עובד
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Card tone={tileTones[index % 4]} className="h-full">
                  <div className="flex items-center gap-3">
                    <Icon name={step.icon} size={48} />
                    <h3 className="text-xl font-bold">
                      <span className="text-muted">{index + 1}. </span>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-muted">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <Card tone="blue" className="items-start gap-4 p-8">
          <h2 className="text-2xl font-extrabold">יוצאים לסיבוב הראשון?</h2>
          <p className="text-muted text-lg">
            נכנסים עם חשבון גוגל, ותוך שתי דקות כבר עונים על השאלה הראשונה.
          </p>
          <ButtonLink href="/dashboard" variant="quiet">
            להתחיל עכשיו
          </ButtonLink>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
