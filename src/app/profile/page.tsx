import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { ResumeData } from "@/lib/resume/schema";
import { createClient } from "@/lib/supabase/server";
import { addTargetRole, removeTargetRole } from "./actions";
import { ResumeFlow } from "./resume-flow";

export const metadata: Metadata = { title: "Your profile · Interview Coach" };

export default function ProfilePage({ searchParams }: PageProps<"/profile">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          Back to dashboard
        </Link>
      </header>
      <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
        <ProfileContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ProfileContent({
  searchParams,
}: Pick<PageProps<"/profile">, "searchParams">) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("resume_data, updated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("target_roles")
      .select("id, title, seniority")
      .order("created_at"),
  ]);
  const resume = (profile?.resume_data ?? null) as ResumeData | null;

  return (
    <>
      {saved && (
        <p role="status" className="rounded-md bg-green-50 p-3 text-green-800">
          Your profile was saved.
        </p>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Resume</h2>
        {resume && <ResumeSummary resume={resume} />}
        <ResumeFlow hasProfile={Boolean(resume)} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Target roles</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          The roles you are preparing for. Interview questions will be tailored
          to them.
        </p>
        {roles && roles.length > 0 && (
          <ul className="flex flex-col gap-2">
            {roles.map((role) => (
              <li
                key={role.id}
                className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-2 dark:border-zinc-800"
              >
                <span>
                  {role.title}
                  {role.seniority && (
                    <span className="text-zinc-500"> · {role.seniority}</span>
                  )}
                </span>
                <form action={removeTargetRole}>
                  <input type="hidden" name="id" value={role.id} />
                  <button
                    type="submit"
                    className="text-sm text-zinc-600 underline dark:text-zinc-400"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <form
          action={addTargetRole}
          className="grid gap-2 sm:grid-cols-[1fr_10rem_auto]"
        >
          <input
            name="title"
            required
            maxLength={120}
            placeholder="e.g. Product Manager"
            aria-label="Role title"
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
          />
          <select
            name="seniority"
            aria-label="Seniority"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">Any level</option>
            <option>Entry level</option>
            <option>Mid level</option>
            <option>Senior</option>
            <option>Manager</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Add role
          </button>
        </form>
      </section>
    </>
  );
}

function ResumeSummary({ resume }: { resume: ResumeData }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="font-medium">
        {resume.fullName || "Unnamed"}
        {resume.headline && (
          <span className="text-zinc-500"> · {resume.headline}</span>
        )}
      </p>
      {resume.summary && (
        <p className="text-zinc-600 dark:text-zinc-400">{resume.summary}</p>
      )}
      <p className="text-sm text-zinc-500">
        {resume.experience.length} roles · {resume.education.length} degrees ·{" "}
        {resume.skills.length} skills
      </p>
    </div>
  );
}
