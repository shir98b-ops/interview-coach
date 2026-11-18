import { Logo } from "@/components/app-shell";
import { ButtonLink, Card, Chip } from "@/components/ui";

const steps = [
  {
    title: "מעלים קורות חיים",
    body: "המערכת קוראת אותם ומבינה מי אתה, ואתה בוחר לאיזה תפקיד אתה מתכונן.",
  },
  {
    title: "מתאמנים על ראיון",
    body: "חמש שאלות כמו בראיון אמיתי, מותאמות לתפקיד ולניסיון שלך. בעברית או באנגלית.",
  },
  {
    title: "מקבלים ציון ומשוב",
    body: "ציון לכל תשובה, מה עבד, מה לשפר ודוגמה לתשובה חזקה יותר.",
  },
  {
    title: "לומדים ומשתפרים",
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
            <Chip tone="violet">מאמן ראיונות אישי</Chip>
            <h1 className="text-4xl leading-tight font-extrabold sm:text-6xl">
              הראיון הבא שלך
              <br />
              <span className="text-violet">יתחיל בביטחון</span>
            </h1>
            <p className="text-muted text-xl leading-relaxed">
              מתאמנים על שאלות אמיתיות, מקבלים משוב אישי על כל תשובה, ולומדים
              בדיוק את מה שחסר לך. בלי לקבוע ראיון דמה עם אף אחד.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/dashboard" variant="lime">
                להתחיל להתאמן
              </ButtonLink>
            </div>
          </div>
          <Card tone="violet" className="gap-4 p-8">
            <p className="text-base opacity-90">הציון שלך בתרגול האחרון</p>
            <p
              dir="ltr"
              className="text-right text-7xl leading-none font-extrabold"
            >
              72<span className="text-2xl opacity-80"> / 100</span>
            </p>
            <p className="text-lime font-bold">עלית 12 נקודות מהפעם הקודמת</p>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm opacity-90">הטיפ שלך</p>
              <p className="font-medium">
                הוסף מספר אחד לסיפור, והתשובה תישמע הרבה יותר משכנעת.
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
                <Card className="h-full">
                  <span className="bg-lime flex h-11 w-11 items-center justify-center rounded-2xl text-xl font-extrabold">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <Card tone="orange" className="items-start gap-4 p-8">
          <h2 className="text-2xl font-extrabold">מוכן לסיבוב הראשון?</h2>
          <p className="text-muted text-lg">
            נכנסים עם חשבון גוגל, ותוך שתי דקות אתה כבר עונה על השאלה הראשונה.
          </p>
          <ButtonLink href="/dashboard">להתחיל עכשיו</ButtonLink>
        </Card>
      </main>
    </>
  );
}
