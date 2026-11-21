import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { Avatar, Icon } from "@/components/ui";
import { PREP_GOAL } from "@/lib/home/next-step";
import { jobNextAction } from "@/lib/jobs/next-action";
import { upcomingInterviews } from "@/lib/jobs/queries";
import { activeStatuses, interviewKinds, parseStatus } from "@/lib/jobs/schema";
import { daysUntil } from "@/lib/jobs/time";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { AddJobDialog } from "./add-job-dialog";
import { JobRow, NextInterview, Tab, type Job } from "./jobs-parts";

export const metadata: Metadata = { title: "משרות · Interview Coach" };

export default function JobsPage({ searchParams }: PageProps<"/jobs">) {
  return (
    <Suspense fallback={<Loading />}>
      <JobsContent searchParams={searchParams} />
    </Suspense>
  );
}

/** Job rows take turns in these colors, so neighbors never match. */
const rowColors = ["bg-sky-light", "bg-lavender", "bg-mint"];

async function JobsContent({
  searchParams,
}: {
  searchParams: PageProps<"/jobs">["searchParams"];
}) {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login?next=/jobs");
  const { tab } = await searchParams;
  const showClosed = tab === "closed";

  const now = new Date();
  // Row level security limits every read to the user's own rows.
  const [{ data: jobs }, interviews, { data: profile }, { data: practices }] =
    await Promise.all([
      supabase
        .from("jobs")
        .select("id, company, title, status, updated_at")
        .order("updated_at", { ascending: false }),
      upcomingInterviews(supabase, now),
      supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("sessions")
        .select("job_id")
        .not("job_id", "is", null)
        .not("completed_at", "is", null),
    ]);
  const upcoming = interviews.filter(
    (i) => i.startsAt.getTime() + i.minutes * 60000 >= now.getTime(),
  );
  const all: Job[] = (jobs ?? []).map((j) => ({
    id: j.id as string,
    company: j.company as string,
    title: j.title as string,
    status: parseStatus(j.status),
  }));
  const active = all
    .filter((j) => activeStatuses.includes(j.status))
    .sort(
      (a, b) =>
        activeStatuses.indexOf(a.status) - activeStatuses.indexOf(b.status),
    );
  const closed = all.filter((j) => !activeStatuses.includes(j.status));
  const nextOf = (jobId: string) => upcoming.find((i) => i.jobId === jobId);
  const next = upcoming[0];
  const prepDone = next
    ? Math.min(
        (practices ?? []).filter((p) => p.job_id === next.jobId).length,
        PREP_GOAL,
      )
    : 0;
  const shown = showClosed ? closed : active;
  const firstName = profile?.full_name?.trim().split(/\s+/)[0];

  return (
    <>
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black lg:text-4xl">המשרות שלי</h1>
          {active.length > 0 && (
            <p className="text-muted hidden lg:block">
              {active.length === 1
                ? "משרה פעילה אחת"
                : `${active.length} משרות פעילות`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {all.length > 0 && (
            <>
              <span className="lg:hidden">
                <AddJobDialog variant="round" />
              </span>
              <span className="hidden lg:block">
                <AddJobDialog variant="pill" />
              </span>
            </>
          )}
          <Avatar name={firstName} className="hidden lg:flex" />
        </div>
      </header>

      {all.length === 0 ? (
        <section className="bg-sky flex items-center gap-4 rounded-[30px] p-6 lg:p-8">
          <div className="flex flex-1 flex-col gap-3">
            <h2 className="text-[28px] leading-tight font-black">
              מוסיפים את המשרה הראשונה
            </h2>
            <p className="text-[#1f3f6e]">
              הדבקה אחת של המודעה, ואנחנו מוציאים ממנה את החברה, התפקיד
              והדרישות, ומכינים תוכנית הכנה.
            </p>
            <AddJobDialog variant="card" />
          </div>
          <Icon
            name="briefcase"
            size={110}
            className="h-20 w-20 -rotate-10 lg:h-[110px] lg:w-[110px]"
          />
        </section>
      ) : (
        <div className="flex flex-col gap-4 lg:gap-6">
          {next && (
            <NextInterview interview={next} now={now} prepDone={prepDone} />
          )}

          <nav aria-label="סינון משרות" className="flex gap-2.5">
            <Tab href="/jobs" current={!showClosed}>
              פעילות · {active.length}
            </Tab>
            <Tab href="/jobs?tab=closed" current={showClosed}>
              נסגרו · {closed.length}
            </Tab>
          </nav>

          {shown.length === 0 ? (
            <p className="text-muted">
              {showClosed
                ? "עוד אין משרות שנסגרו."
                : "אין כרגע משרות פעילות. אפשר להוסיף משרה חדשה."}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {shown.map((job, i) => {
                const interview = nextOf(job.id);
                return (
                  <JobRow
                    key={job.id}
                    job={job}
                    color={rowColors[i % rowColors.length]}
                    nextAction={jobNextAction(
                      job.status,
                      interview
                        ? {
                            kindLabel: interviewKinds[interview.kind],
                            days: daysUntil(interview.startsAt, now),
                          }
                        : null,
                    )}
                  />
                );
              })}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
