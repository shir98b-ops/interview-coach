import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { kindLabels, type QuestionKind } from "@/lib/interview/schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { AnswerForm } from "../forms";

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
  answers: { text: string }[] | { text: string } | null;
}

function answerText(question: Question): string | null {
  const answers = question.answers;
  if (!answers) return null;
  if (Array.isArray(answers)) return answers[0]?.text ?? null;
  return answers.text;
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
      .select("id, target_roles(title, seniority)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("questions")
      .select("id, position, kind, text, answers(text)")
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
        <h2 className="text-xl font-medium">{current.text}</h2>
        <AnswerForm
          key={current.id}
          sessionId={session.id}
          questionId={current.id}
          isLast={number === questions.length}
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 rounded-md bg-green-50 p-4 text-green-800">
        <p className="font-medium">Interview complete. Well done!</p>
        <p>
          Here are your answers for {roleName}. Scores and improvement tips
          arrive in the next stage.
        </p>
      </div>
      <ol className="flex flex-col gap-6">
        {questions.map((q) => (
          <li key={q.id} className="flex flex-col gap-2">
            <p className="text-sm text-zinc-500">{kindLabel(q.kind)}</p>
            <p className="font-medium">{q.text}</p>
            <p className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
              {answerText(q)}
            </p>
          </li>
        ))}
      </ol>
      <Link href="/practice" className="font-medium underline">
        Start another practice interview
      </Link>
    </section>
  );
}
