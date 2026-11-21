import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { ButtonLink, Card, Chip, PageHeading } from "@/components/ui";
import { rubric } from "@/lib/interview/feedback";
import { forAddress, lessons, type Lesson } from "@/lib/learn/lessons";
import { getLearningState } from "@/lib/learn/progress";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

export const metadata: Metadata = { title: "למידה · Interview Coach" };

function focusLabel(key: string): string {
  return rubric.find((r) => r.key === key)?.label ?? key;
}

export default function LearnPage() {
  return (
    <>
      <PageHeading
        title="למידה"
        subtitle="שיעורים קצרים של חמש דקות. כל שיעור נגמר בשאלת תרגול עם משוב מיידי."
      />
      <Suspense fallback={<Loading />}>
        <LessonList />
      </Suspense>
    </>
  );
}

async function LessonList() {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login?next=/learn");

  const learning = await getLearningState(supabase);
  const completed = learning.completed;
  const recommended =
    learning.recommended && forAddress(learning.recommended, user.address);
  const all = lessons.map((l) => forAddress(l, user.address));

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="font-bold">
          סיימת {completed.size} מתוך {lessons.length} שיעורים
        </p>
        <div className="bg-line h-3 rounded-full" aria-hidden>
          <div
            className="bg-mint h-3 rounded-full"
            style={{ width: `${(completed.size / lessons.length) * 100}%` }}
          />
        </div>
      </div>

      {recommended && (
        <Card tone="blue" className="gap-3 p-7">
          <span className="bg-mint text-ink inline-flex w-fit rounded-full px-3 py-1 text-sm font-bold">
            מומלץ בשבילך
          </span>
          <h2 className="text-2xl font-extrabold">{recommended.title}</h2>
          <p className="opacity-90">
            {recommended.minutes} דקות · {recommended.summary}
          </p>
          <ButtonLink
            href={`/learn/${recommended.slug}`}
            variant="primary"
            className="mt-1 w-full sm:w-fit"
          >
            להתחיל שיעור
          </ButtonLink>
        </Card>
      )}

      <Card tone="pink" className="gap-3 p-7">
        <h2 className="text-2xl font-extrabold">מבחן בית לתרגול</h2>
        <p className="text-lg">
          מקבלים משימה בסגנון של מבחני בית אמיתיים לפי התפקיד שלך, מגישים בכתב
          ומקבלים ציון ומשוב.
        </p>
        <ButtonLink
          href="/learn/take-home"
          variant="primary"
          className="w-full sm:w-fit"
        >
          לקבל מבחן בית
        </ButtonLink>
      </Card>

      <LessonGrid
        title="שיעורים על מבחני בית"
        items={all.filter((l) => l.track === "take-home")}
        completed={completed}
      />
      <LessonGrid
        title="שיעורים על הראיון"
        items={all.filter((l) => l.track === "interview")}
        completed={completed}
      />
    </>
  );
}

function LessonGrid({
  title,
  items,
  completed,
}: {
  title: string;
  items: Lesson[];
  completed: Set<string>;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <ul className="grid gap-5 md:grid-cols-2">
        {items.map((lesson, index) => {
          const done = completed.has(lesson.slug);
          return (
            <li key={lesson.slug}>
              <Link
                href={`/learn/${lesson.slug}`}
                className="flex h-full flex-col gap-3 rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(77,40,200,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(77,40,200,0.14)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`flex size-10 items-center justify-center rounded-2xl font-extrabold ${
                      done ? "bg-mint text-ink" : "bg-sky-soft text-blue-dark"
                    }`}
                  >
                    {done ? "✓" : index + 1}
                  </span>
                  <Chip tone={done ? "mint" : "pink"}>
                    {done
                      ? "סיימת"
                      : lesson.track === "take-home"
                        ? "מבחן בית"
                        : focusLabel(lesson.focus)}
                  </Chip>
                </div>
                <h2 className="text-xl font-bold">{lesson.title}</h2>
                <p className="text-muted">{lesson.summary}</p>
                <p className="text-blue mt-auto text-sm font-bold">
                  {lesson.minutes} דקות ←
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
