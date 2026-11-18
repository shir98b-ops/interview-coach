import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { Card, Chip } from "@/components/ui";
import { rubric } from "@/lib/interview/feedback";
import { readExerciseFeedback } from "@/lib/learn/exercise-feedback";
import { getLesson, lessons } from "@/lib/learn/lessons";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { ExerciseForm } from "../exercise-form";
import { ExerciseFeedbackView } from "../feedback-view";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const lesson = getLesson((await params).slug);
  return { title: `${lesson?.title ?? "שיעור"} · Interview Coach` };
}

export default async function LessonPage({
  params,
}: PageProps<"/learn/[slug]">) {
  const lesson = getLesson((await params).slug);
  if (!lesson) notFound();
  const index = lessons.indexOf(lesson);
  const next = lessons[index + 1];

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Link href="/learn" className="text-violet w-fit font-medium">
        → לכל השיעורים
      </Link>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Chip tone="violet">
            שיעור {index + 1} מתוך {lessons.length}
          </Chip>
          <Chip>
            {lesson.minutes} דקות ·{" "}
            {rubric.find((r) => r.key === lesson.focus)?.label}
          </Chip>
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{lesson.title}</h1>
        <p className="text-muted text-lg">{lesson.summary}</p>
      </header>

      {lesson.sections.map((section, i) => (
        <section key={section.heading} className="flex flex-col gap-3">
          <h2 className="flex items-center gap-3 text-2xl font-extrabold">
            <span className="bg-violet-soft text-violet-dark flex size-9 shrink-0 items-center justify-center rounded-xl text-lg">
              {i + 1}
            </span>
            {section.heading}
          </h2>
          <p className="text-lg leading-relaxed whitespace-pre-line">
            {section.body}
          </p>
          {section.example && (
            <div className="border-orange bg-orange-soft rounded-2xl border-s-4 p-5 text-lg leading-relaxed whitespace-pre-line">
              {section.example}
            </div>
          )}
        </section>
      ))}

      <Card tone="lilac" className="gap-4 p-6 sm:p-8">
        <Chip tone="violet">תרגיל</Chip>
        <h2 className="text-2xl leading-snug font-extrabold">
          {lesson.exercise.question}
        </h2>
        <ExerciseForm lesson={lesson.slug} hint={lesson.exercise.hint} />
      </Card>

      <Suspense fallback={<Loading />}>
        <PastAttempts slug={lesson.slug} />
      </Suspense>

      {next && (
        <Link
          href={`/learn/${next.slug}`}
          className="hover:bg-violet-soft flex flex-col gap-1 rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(77,40,200,0.08)] transition"
        >
          <span className="text-violet text-sm font-bold">השיעור הבא ←</span>
          <span className="text-xl font-bold">{next.title}</span>
        </Link>
      )}
    </article>
  );
}

async function PastAttempts({ slug }: { slug: string }) {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect(`/login?next=/learn/${slug}`);

  const { data: attempts } = await supabase
    .from("lesson_attempts")
    .select("id, answer, feedback, created_at")
    .eq("lesson_slug", slug)
    .order("created_at", { ascending: false })
    .limit(10);
  if (!attempts?.length) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-extrabold">התשובות הקודמות שלך</h2>
      <ul className="flex flex-col gap-3">
        {attempts.map((attempt) => {
          const feedback = readExerciseFeedback(attempt.feedback);
          return (
            <li key={attempt.id}>
              <details className="rounded-[28px] bg-white p-5 shadow-[0_6px_20px_rgba(77,40,200,0.06)]">
                <summary className="flex cursor-pointer items-center justify-between gap-3 font-bold">
                  <span>
                    {new Date(attempt.created_at).toLocaleDateString("he-IL")}
                  </span>
                  {feedback && (
                    <span className="text-violet">{feedback.score}/5</span>
                  )}
                </summary>
                <div className="mt-4 flex flex-col gap-4">
                  <p
                    dir="auto"
                    className="bg-canvas rounded-2xl p-4 whitespace-pre-wrap"
                  >
                    {attempt.answer}
                  </p>
                  {feedback && <ExerciseFeedbackView feedback={feedback} />}
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
