import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { limitMessage } from "@/lib/interview/limits";
import { getUsage } from "@/lib/interview/usage";
import { StartPracticeForm } from "./forms";

export const metadata: Metadata = { title: "Practice · Interview Coach" };

export default function PracticePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Practice interview</h1>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          Back to dashboard
        </Link>
      </header>
      <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
        <PracticeContent />
      </Suspense>
    </main>
  );
}

async function PracticeContent() {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login?next=/practice");

  const [{ data: profile }, { data: roles }, { data: sessions }, usage] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("target_roles")
        .select("id, title, seniority")
        .order("created_at"),
      supabase
        .from("sessions")
        .select(
          "id, created_at, completed_at, overall_score, target_roles(title)",
        )
        .order("created_at", { ascending: false })
        .limit(20),
      getUsage(supabase),
    ]);

  if (!profile || !roles?.length) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">First, tell us about you</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Questions are tailored to your resume and the role you want, so add
          {profile
            ? " at least one target role"
            : " your resume and a target role"}{" "}
          first.
        </p>
        <Link href="/profile" className="font-medium underline">
          Go to your profile
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="flex flex-col gap-4">
        <p className="text-zinc-600 dark:text-zinc-400">
          You will get five questions, one at a time, tailored to the role and
          your resume. Answer each in writing, as you would in the interview.
          Then you get a score and tips for every answer.
        </p>
        {usage.remaining > 0 ? (
          <>
            <StartPracticeForm roles={roles} />
            <p className="text-sm text-zinc-500">
              {usage.remaining} of {usage.limit} practice interviews left in the
              next 24 hours.
            </p>
          </>
        ) : (
          <p
            role="status"
            className="rounded-md bg-amber-50 p-3 text-amber-900"
          >
            {limitMessage(usage)}
          </p>
        )}
      </section>

      {sessions && sessions.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Your practice interviews</h2>
          <ProgressChart
            scores={sessions
              .filter((s) => s.overall_score !== null)
              .map((s) => s.overall_score as number)
              .reverse()}
          />
          <ul className="flex flex-col gap-2">
            {sessions.map((session) => {
              const role = session.target_roles as unknown as {
                title: string;
              } | null;
              return (
                <li key={session.id}>
                  <Link
                    href={`/practice/${session.id}`}
                    className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-2 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <span>{role?.title ?? "Removed role"}</span>
                    <span className="text-sm text-zinc-500">
                      {new Date(session.created_at).toLocaleDateString("en-GB")}{" "}
                      ·{" "}
                      {session.overall_score !== null
                        ? `${session.overall_score} / 100`
                        : session.completed_at
                          ? "Completed"
                          : "In progress"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}

/** Scores of scored interviews, oldest first, as a simple bar chart. */
function ProgressChart({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null;
  const change = scores[scores.length - 1] - scores[0];
  return (
    <figure className="flex flex-col gap-2 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <figcaption className="text-sm text-zinc-600 dark:text-zinc-400">
        Your scores over time:{" "}
        {change > 0
          ? `up ${change} points since your first interview.`
          : change < 0
            ? `down ${-change} points since your first interview.`
            : "the same as your first interview."}
      </figcaption>
      <div
        className="flex h-24 items-end gap-1"
        role="img"
        aria-label={`Scores: ${scores.join(", ")}`}
      >
        {scores.map((score, index) => (
          <div
            key={index}
            title={`${score} / 100`}
            className="flex-1 rounded-t bg-zinc-900 dark:bg-zinc-100"
            style={{ height: `${Math.max(score, 4)}%` }}
          />
        ))}
      </div>
    </figure>
  );
}
