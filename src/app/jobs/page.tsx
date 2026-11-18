import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { Card, Chip, PageHeading } from "@/components/ui";
import { upcomingInterviews } from "@/lib/jobs/queries";
import { activeStatuses, jobStatuses, parseStatus } from "@/lib/jobs/schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { AddJobForm } from "./forms";
import { InterviewCard, JobName } from "./interview-card";

export const metadata: Metadata = { title: "משרות · Interview Coach" };

export default function JobsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeading
        title="המשרות שלי"
        subtitle="כל המשרות שהגשת אליהן והראיונות הקרובים, במקום אחד."
      />
      <Suspense fallback={<Loading />}>
        <JobsContent />
      </Suspense>
    </div>
  );
}

async function JobsContent() {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login?next=/jobs");

  const now = new Date();
  const [{ data: jobs }, interviews] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, company, title, status, updated_at")
      .order("updated_at", { ascending: false }),
    upcomingInterviews(supabase, now),
  ]);
  const upcoming = interviews.filter(
    (i) => i.startsAt.getTime() + i.minutes * 60000 >= now.getTime(),
  );
  const all = (jobs ?? []).map((j) => ({
    ...j,
    status: parseStatus(j.status),
  }));
  const active = all
    .filter((j) => activeStatuses.includes(j.status))
    .sort(
      (a, b) =>
        activeStatuses.indexOf(a.status) - activeStatuses.indexOf(b.status),
    );
  const closed = all.filter((j) => !activeStatuses.includes(j.status));

  return (
    <>
      <Card
        tone={upcoming.length ? "lilac" : "white"}
        className="gap-4 p-6 sm:p-8"
      >
        <h2 className="text-2xl font-extrabold">ראיונות קרובים</h2>
        {upcoming.length ? (
          <ul className="flex flex-col gap-3">
            {upcoming.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                now={now}
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted">
            אין ראיונות בלוח. כשנקבע ראיון, מוסיפים אותו בעמוד של המשרה.
          </p>
        )}
      </Card>

      <Card className="gap-4 p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold">משרות פעילות</h2>
        {active.length ? (
          <JobList jobs={active} />
        ) : (
          <p className="text-muted">
            עוד אין משרות. מוסיפים את הראשונה כאן למטה.
          </p>
        )}
      </Card>

      <Card className="gap-4 p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold">להוסיף משרה</h2>
        <AddJobForm />
      </Card>

      {closed.length > 0 && (
        <details className="group">
          <summary className="text-muted cursor-pointer font-bold">
            משרות שנסגרו ({closed.length})
          </summary>
          <div className="mt-4">
            <JobList jobs={closed} />
          </div>
        </details>
      )}
    </>
  );
}

function JobList({
  jobs,
}: {
  jobs: {
    id: string;
    company: string;
    title: string;
    status: keyof typeof jobStatuses;
  }[];
}) {
  return (
    <ul className="flex flex-col gap-2">
      {jobs.map((job) => (
        <li key={job.id}>
          <Link
            href={`/jobs/${job.id}`}
            className="bg-canvas hover:bg-violet-soft flex flex-wrap items-center justify-between gap-2 rounded-2xl p-4"
          >
            <span className="font-bold">
              <JobName company={job.company} title={job.title} />
            </span>
            <Chip tone={jobStatuses[job.status].tone}>
              {jobStatuses[job.status].label}
            </Chip>
          </Link>
        </li>
      ))}
    </ul>
  );
}
