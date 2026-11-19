import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { ButtonLink, Card, Chip, StepBar } from "@/components/ui";
import {
  answerAverage,
  readFeedback,
  rubric,
  type AnswerFeedback,
} from "@/lib/interview/feedback";
import { kindLabels, type QuestionKind } from "@/lib/interview/schema";
import { forAddress, recommendLesson } from "@/lib/learn/lessons";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { languageFor } from "@/lib/voice/transcript";
import { AnswerForm, RetryFeedbackForm } from "../forms";

export const metadata: Metadata = { title: "תרגול · Interview Coach" };

export default function SessionPage({ params }: PageProps<"/practice/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Link href="/practice" className="text-violet w-fit font-medium">
        → לכל התרגולים
      </Link>
      <Suspense fallback={<Loading />}>
        <SessionContent params={params} />
      </Suspense>
    </div>
  );
}

interface Question {
  id: string;
  position: number;
  kind: string;
  text: string;
  answers: SavedAnswer[] | SavedAnswer | null;
}

interface SavedAnswer {
  text: string;
  scores: unknown;
}

function savedAnswer(question: Question): SavedAnswer | null {
  const answers = question.answers;
  if (Array.isArray(answers)) return answers[0] ?? null;
  return answers;
}

function answerText(question: Question): string | null {
  return savedAnswer(question)?.text ?? null;
}

function kindLabel(kind: string): string {
  return kindLabels[kind as QuestionKind] ?? kind;
}

async function SessionContent({
  params,
}: Pick<PageProps<"/practice/[id]">, "params">) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect(`/login?next=/practice/${id}`);

  // Row level security returns nothing for another user's interview.
  const [{ data: session }, { data: rows }, { data: attempts }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select(
          "id, overall_score, target_roles(title, seniority), jobs(title, company)",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("questions")
        .select("id, position, kind, text, answers(text, scores)")
        .eq("session_id", id)
        .order("position"),
      supabase.from("lesson_attempts").select("lesson_slug"),
    ]);
  if (!session || !rows?.length) notFound();

  const questions = rows as Question[];
  const role = session.target_roles as unknown as {
    title: string;
    seniority: string | null;
  } | null;
  const job = session.jobs as unknown as {
    title: string;
    company: string;
  } | null;
  const roleName = job
    ? `${job.title} · ${job.company}`
    : role
      ? `${role.title}${role.seniority ? ` · ${role.seniority}` : ""}`
      : "תפקיד שנמחק";
  const current = questions.find((q) => answerText(q) === null);

  if (current) {
    const number = questions.indexOf(current) + 1;
    return (
      <section className="flex flex-col gap-5">
        <StepBar total={questions.length} done={number - 1} />
        <div className="flex flex-wrap items-center gap-2">
          <Chip>
            שאלה {number} מתוך {questions.length} · {kindLabel(current.kind)}
          </Chip>
          <span dir="auto" className="text-muted text-sm">
            {roleName}
          </span>
        </div>
        <h1 dir="auto" className="text-2xl leading-snug font-bold sm:text-3xl">
          {current.text}
        </h1>
        <AnswerForm
          key={current.id}
          sessionId={session.id}
          questionId={current.id}
          isLast={number === questions.length}
          language={languageFor(current.text)}
        />
      </section>
    );
  }

  const feedback = questions.map((q) => readFeedback(savedAnswer(q)?.scores));
  const scored = feedback.every(Boolean);
  const recommended = scored
    ? recommendLesson(
        feedback.filter((f) => f !== null),
        (attempts ?? []).map((a) => a.lesson_slug as string),
      )
    : undefined;
  const lesson = recommended && forAddress(recommended, user.address);

  return (
    <section className="flex flex-col gap-8">
      {scored && session.overall_score !== null ? (
        <Card tone="violet" className="gap-3 p-7">
          <p dir="auto" className="opacity-90">
            {roleName}
          </p>
          <h1 className="text-xl font-bold">הציון שלך בתרגול</h1>
          <p
            dir="ltr"
            className="text-right text-6xl leading-none font-extrabold"
          >
            {session.overall_score}
            <span className="text-2xl opacity-80"> / 100</span>
          </p>
          <p className="opacity-90">
            כל תשובה מקבלת ציון מ־1 עד 5 על תוכן, מבנה ובהירות. הטיפים למטה,
            ותרגול נוסף יראה את ההתקדמות.
          </p>
        </Card>
      ) : (
        <Card>
          <h1 className="text-2xl font-extrabold">התרגול הסתיים</h1>
          <RetryFeedbackForm sessionId={session.id} />
        </Card>
      )}

      {lesson && (
        <Card tone="orange">
          <Chip>כדאי ללמוד עכשיו</Chip>
          <h2 className="text-xl font-bold">{lesson.title}</h2>
          <p className="text-muted">
            {lesson.minutes} דקות · {lesson.summary}
          </p>
          <ButtonLink
            href={`/learn/${lesson.slug}`}
            variant="quiet"
            className="w-fit"
          >
            לשיעור
          </ButtonLink>
        </Card>
      )}

      <details className="rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(77,40,200,0.08)]">
        <summary className="cursor-pointer font-bold">
          איך נותנים ציון לתשובות?
        </summary>
        <ul className="text-muted mt-3 flex flex-col gap-2">
          {rubric.map((r) => (
            <li key={r.key}>
              <span className="text-ink font-bold">{r.label}:</span>{" "}
              {r.description}
            </li>
          ))}
          <li>1 = חסר, 3 = סביר אבל כללי, 5 = מוכן לראיון אמיתי.</li>
        </ul>
      </details>

      <ol className="flex flex-col gap-6">
        {questions.map((q, index) => (
          <li key={q.id}>
            <Card className="gap-4">
              <Chip tone="violet">
                שאלה {index + 1} · {kindLabel(q.kind)}
              </Chip>
              <h2 dir="auto" className="text-lg font-bold">
                {q.text}
              </h2>
              <p
                dir="auto"
                className="bg-canvas rounded-2xl p-4 whitespace-pre-wrap"
              >
                {answerText(q)}
              </p>
              {feedback[index] && (
                <FeedbackDetails feedback={feedback[index]} />
              )}
            </Card>
          </li>
        ))}
      </ol>
      <ButtonLink href="/practice" variant="lime" className="w-full sm:w-fit">
        לתרגול נוסף
      </ButtonLink>
    </section>
  );
}

function FeedbackDetails({ feedback }: { feedback: AnswerFeedback }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {rubric.map((r) => (
          <Chip key={r.key} tone="violet">
            {r.label} {feedback[r.key]}/5
          </Chip>
        ))}
        <Chip tone="lime">ממוצע {answerAverage(feedback).toFixed(1)}</Chip>
      </div>
      {feedback.strengths && (
        <div className="bg-success-soft rounded-2xl p-4">
          <p className="text-success-ink font-bold">מה עבד</p>
          <p dir="auto">{feedback.strengths}</p>
        </div>
      )}
      {feedback.improvements && (
        <div className="bg-orange-soft rounded-2xl p-4">
          <p className="text-orange-ink font-bold">מה לשפר</p>
          <p dir="auto">{feedback.improvements}</p>
        </div>
      )}
      {feedback.betterAnswer && (
        <details className="bg-violet-soft rounded-2xl p-4">
          <summary className="text-violet-dark cursor-pointer font-bold">
            ככה יכולה להישמע תשובה חזקה יותר
          </summary>
          <p dir="auto" className="mt-2 whitespace-pre-wrap">
            {feedback.betterAnswer}
          </p>
        </details>
      )}
    </div>
  );
}
