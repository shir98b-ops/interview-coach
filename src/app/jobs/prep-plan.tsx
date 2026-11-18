import { Chip } from "@/components/ui";
import { matchLevels, type PrepPlan } from "@/lib/jobs/prep-schema";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xl font-extrabold">{title}</h3>
      {children}
    </section>
  );
}

/** Shows a saved prep plan, section by section. */
export function PrepPlanView({ plan }: { plan: PrepPlan }) {
  const totalMinutes = plan.schedule.reduce((sum, s) => sum + s.minutes, 0);
  return (
    <div className="flex flex-col gap-7">
      <p className="text-lg">{plan.summary}</p>

      <Section title="מה הם מחפשים, ומה יש לך">
        <ul className="flex flex-col gap-2">
          {plan.requirements.map((r) => (
            <li
              key={r.requirement}
              className="bg-canvas flex flex-col gap-1 rounded-2xl p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone={matchLevels[r.match].tone}>
                  {matchLevels[r.match].label}
                </Chip>
                <span dir="auto" className="font-bold">
                  {r.requirement}
                </span>
              </div>
              <p className="text-muted">{r.note}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="שאלות שכנראה ישאלו">
        <ol className="flex flex-col gap-2">
          {plan.likelyQuestions.map((q, i) => (
            <li
              key={q.question}
              className="bg-canvas flex flex-col gap-1 rounded-2xl p-4"
            >
              <p className="font-bold">
                {i + 1}. <bdi>{q.question}</bdi>
              </p>
              <p className="text-muted text-sm">למה שואלים: {q.why}</p>
              <p>טיפ: {q.tip}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="סיפורים להכין מראש">
        <ul className="flex flex-col gap-2">
          {plan.stories.map((s) => (
            <li
              key={s.title}
              className="bg-canvas flex flex-col gap-1 rounded-2xl p-4"
            >
              <p className="font-bold">{s.title}</p>
              <p className="text-muted text-sm">מתוך: {s.fromResume}</p>
              <p>מראה: {s.shows}</p>
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid gap-7 sm:grid-cols-2">
        <Section title="שאלות לשאול בסוף">
          <ul className="flex list-disc flex-col gap-2 ps-5">
            {plan.questionsToAsk.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </Section>
        <Section title="לבדוק על החברה">
          <ul className="flex list-disc flex-col gap-2 ps-5">
            {plan.research.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title={`לוח זמנים להכנה · כ־${totalMinutes} דקות`}>
        <ol className="flex flex-col gap-2">
          {plan.schedule.map((s, i) => (
            <li
              key={`${s.when}-${i}`}
              className="border-line flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl border-2 p-4"
            >
              <span className="text-violet font-extrabold">{s.when}</span>
              <span className="flex-1">{s.task}</span>
              <span className="text-muted text-sm">{s.minutes} דקות</span>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
