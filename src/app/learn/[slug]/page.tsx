import type { Metadata } from "next";
import { formatDate } from "@/lib/format";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { Card, Chip } from "@/components/ui";
import { rubric } from "@/lib/interview/feedback";
import { readExerciseFeedback } from "@/lib/learn/exercise-feedback";
import { g } from "@/lib/address";
import { forAddress, getLesson, lessons } from "@/lib/learn/lessons";
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
  return {
    title: `${lesson ? g(lesson.title, null) : "שיעור"} · Interview Coach`,
  };
}

export default async function LessonPage({
  params,
}: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  if (!getLesson(slug)) notFound();

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Link href="/learn" className="text-blue w-fit font-medium">
        → לכל השיעורים
      </Link>
      <Suspense fallback={<Loading />}>
        <LessonContent slug={slug} />
      </Suspense>
    </article>
  );
}

/** The lesson, worded for the signed-in user, with their past answers. */
async function LessonContent({ slug }: { slug: string }) {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect(`/login?next=/learn/${slug}`);

  const original = getLesson(slug)!;
  const lesson = forAddress(original, user.address);
  const track = lessons.filter((l) => l.track === original.track);
  const position = track.indexOf(original);
  const next =
    track[position + 1] && forAddress(track[position + 1], user.address);

  const { data: attempts } = await supabase
    .from("lesson_attempts")
    .select("id, answer, feedback, created_at")
    .eq("lesson_slug", slug)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Chip tone="blue">
            שיעור {position + 1} מתוך {track.length}
          </Chip>
          <Chip>
            {lesson.minutes} דקות ·{" "}
            {lesson.track === "take-home"
              ? "מבחן בית"
              : rubric.find((r) => r.key === lesson.focus)?.label}
          </Chip>
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{lesson.title}</h1>
        <p className="text-muted text-lg">{lesson.summary}</p>
      </header>

      {lesson.sections.map((section, i) => (
        <section key={section.heading} className="flex flex-col gap-3">
          <h2 className="flex items-center gap-3 text-2xl font-extrabold">
            <span className="bg-sky-soft text-blue-dark flex size-9 shrink-0 items-center justify-center rounded-xl text-lg">
              {i + 1}
            </span>
            {section.heading}
          </h2>
          <p className="text-lg leading-relaxed whitespace-pre-line">
            {section.body}
          </p>
          {section.example && (
            <div className="border-pink bg-pink-soft rounded-2xl border-s-4 p-5 text-lg leading-relaxed whitespace-pre-line">
              {section.example}
            </div>
          )}
        </section>
      ))}

      <Card tone="lavender" className="gap-4 p-6 sm:p-8">
        <Chip tone="blue">תרגיל</Chip>
        <h2 className="text-2xl leading-snug font-extrabold">
          {lesson.exercise.question}
        </h2>
        <ExerciseForm lesson={lesson.slug} hint={lesson.exercise.hint} />
      </Card>

      <PastAttempts attempts={attempts ?? []} />

      {next && (
        <Link
          href={`/learn/${next.slug}`}
          className="hover:bg-sky-soft flex flex-col gap-1 rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(77,40,200,0.08)] transition"
        >
          <span className="text-blue text-sm font-bold">השיעור הבא ←</span>
          <span className="text-xl font-bold">{next.title}</span>
        </Link>
      )}
    </>
  );
}

function PastAttempts({
  attempts,
}: {
  attempts: {
    id: string;
    answer: string;
    feedback: unknown;
    created_at: string;
  }[];
}) {
  if (!attempts.length) return null;

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
                  <span>{formatDate(attempt.created_at)}</span>
                  {feedback && (
                    <span className="text-blue">{feedback.score}/5</span>
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
