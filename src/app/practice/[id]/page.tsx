import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import {
  answerAverage,
  readFeedback,
  rubric,
  type AnswerFeedback,
} from "@/lib/interview/feedback";
import { kindLabels, type QuestionKind } from "@/lib/interview/schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { AnswerForm, RetryFeedbackForm } from "../forms";

export const metadata: Metadata = { title: "Practice · Interview Coach" };

export default function SessionPage({ params }: PageProps<"/practice/[id]">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Practice interview</h1>
        <Link
          href="/practice"
          className="text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          All practice interviews
        </Link>
      </header>
      <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
        <SessionContent params={params} />
      </Suspense>
    </main>
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
  const [{ data: session }, { data: rows }] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, overall_score, target_roles(title, seniority)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("questions")
      .select("id, position, kind, text, answers(text, scores)")
      .eq("session_id", id)
      .order("position"),
  ]);
  if (!session || !rows?.length) notFound();

  const questions = rows as Question[];
  const role = session.target_roles as unknown as {
    title: string;
    seniority: string | null;
  } | null;
  const roleName = role
    ? `${role.title}${role.seniority ? ` · ${role.seniority}` : ""}`
    : "Removed role";
  const current = questions.find((q) => answerText(q) === null);

  if (current) {
    const number = questions.indexOf(current) + 1;
    return (
      <section className="flex flex-col gap-4">
        <p className="text-sm text-zinc-500">
          {roleName} · Question {number} of {questions.length} ·{" "}
          {kindLabel(current.kind)}
        </p>
        <div
          className="h-1 w-full rounded bg-zinc-200 dark:bg-zinc-800"
          aria-hidden
        >
          <div
            className="h-1 rounded bg-zinc-900 dark:bg-zinc-100"
            style={{ width: `${((number - 1) / questions.length) * 100}%` }}
          />
        </div>
        <h2 dir="auto" className="text-xl font-medium">
          {current.text}
        </h2>
        <AnswerForm
          key={current.id}
          sessionId={session.id}
          questionId={current.id}
          isLast={number === questions.length}
        />
      </section>
    );
  }

  const feedback = questions.map((q) => readFeedback(savedAnswer(q)?.scores));
  const scored = feedback.every(Boolean);

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">{roleName}</p>
        {scored && session.overall_score !== null ? (
          <>
            <p className="text-3xl font-semibold">
              {session.overall_score}
              <span className="text-lg text-zinc-500"> / 100</span>
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              Each answer is scored from 1 to 5 on content, structure and
              clarity. Read the tips below, then try another interview to see
              your progress.
            </p>
          </>
        ) : (
          <RetryFeedbackForm sessionId={session.id} />
        )}
      </div>

      <details className="rounded-md border border-zinc-200 p-4 text-sm dark:border-zinc-800">
        <summary className="cursor-pointer font-medium">
          How answers are scored
        </summary>
        <ul className="mt-2 flex flex-col gap-1 text-zinc-600 dark:text-zinc-400">
          {rubric.map((r) => (
            <li key={r.key}>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {r.label}:
              </span>{" "}
              {r.description}
            </li>
          ))}
          <li>
            1 = missing, 3 = acceptable but generic, 5 = ready for a real
            interview.
          </li>
        </ul>
      </details>

      <ol className="flex flex-col gap-8">
        {questions.map((q, index) => (
          <li key={q.id} className="flex flex-col gap-3">
            <p className="text-sm text-zinc-500">
              Question {index + 1} · {kindLabel(q.kind)}
            </p>
            <p dir="auto" className="font-medium">
              {q.text}
            </p>
            <p
              dir="auto"
              className="rounded-md bg-zinc-50 p-3 whitespace-pre-wrap text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {answerText(q)}
            </p>
            {feedback[index] && <FeedbackCard feedback={feedback[index]} />}
          </li>
        ))}
      </ol>
      <Link href="/practice" className="font-medium underline">
        Start another practice interview
      </Link>
    </section>
  );
}

function FeedbackCard({ feedback }: { feedback: AnswerFeedback }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap gap-2 text-sm">
        {rubric.map((r) => (
          <span
            key={r.key}
            className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800"
          >
            {r.label} {feedback[r.key]}/5
          </span>
        ))}
        <span className="rounded-full bg-zinc-900 px-3 py-1 text-white dark:bg-zinc-100 dark:text-zinc-900">
          Average {answerAverage(feedback).toFixed(1)}
        </span>
      </div>
      {feedback.strengths && (
        <p dir="auto">
          <span className="font-medium">What worked: </span>
          {feedback.strengths}
        </p>
      )}
      {feedback.improvements && (
        <p dir="auto">
          <span className="font-medium">To improve: </span>
          {feedback.improvements}
        </p>
      )}
      {feedback.betterAnswer && (
        <div>
          <p className="font-medium">A stronger answer could go like this:</p>
          <p
            dir="auto"
            className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400"
          >
            {feedback.betterAnswer}
          </p>
        </div>
      )}
    </div>
  );
}
