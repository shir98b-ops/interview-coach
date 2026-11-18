import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { ButtonLink, Card, Chip, PageHeading } from "@/components/ui";
import { rubric } from "@/lib/interview/feedback";
import { lessons } from "@/lib/learn/lessons";
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

  const { completed, recommended } = await getLearningState(supabase);

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="font-bold">
          סיימת {completed.size} מתוך {lessons.length} שיעורים
        </p>
        <div className="bg-line h-3 rounded-full" aria-hidden>
          <div
            className="bg-lime h-3 rounded-full"
            style={{ width: `${(completed.size / lessons.length) * 100}%` }}
          />
        </div>
      </div>

      {recommended && (
        <Card tone="violet" className="gap-3 p-7">
          <span className="bg-lime text-ink inline-flex w-fit rounded-full px-3 py-1 text-sm font-bold">
            מומלץ בשבילך
          </span>
          <h2 className="text-2xl font-extrabold">{recommended.title}</h2>
          <p className="opacity-90">
            {recommended.minutes} דקות · {recommended.summary}
          </p>
          <ButtonLink
            href={`/learn/${recommended.slug}`}
            variant="lime"
            className="mt-1 w-full sm:w-fit"
          >
            להתחיל שיעור
          </ButtonLink>
        </Card>
      )}

      <ul className="grid gap-5 md:grid-cols-2">
        {lessons.map((lesson, index) => {
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
                      done
                        ? "bg-lime text-ink"
                        : "bg-violet-soft text-violet-dark"
                    }`}
                  >
                    {done ? "✓" : index + 1}
                  </span>
                  <Chip tone={done ? "lime" : "orange"}>
                    {done ? "סיימת" : focusLabel(lesson.focus)}
                  </Chip>
                </div>
                <h2 className="text-xl font-bold">{lesson.title}</h2>
                <p className="text-muted">{lesson.summary}</p>
                <p className="text-violet mt-auto text-sm font-bold">
                  {lesson.minutes} דקות ←
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
