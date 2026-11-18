import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
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

  const [{ data: profile }, { data: roles }, { data: sessions }] =
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
        .select("id, created_at, completed_at, target_roles(title)")
        .order("created_at", { ascending: false })
        .limit(10),
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
        </p>
        <StartPracticeForm roles={roles} />
      </section>

      {sessions && sessions.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Your practice interviews</h2>
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
                      · {session.completed_at ? "Completed" : "In progress"}
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
