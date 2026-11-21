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
import { AddJobForm, ImportLinkedInForm, PasteJobForm } from "./forms";
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
      {all.length === 0 && <AddJobCard first />}

      {upcoming.length > 0 && (
        <Card tone="lavender" className="gap-4 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold">ראיונות קרובים</h2>
          <ul className="flex flex-col gap-3">
            {upcoming.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                now={now}
              />
            ))}
          </ul>
        </Card>
      )}

      {active.length > 0 && (
        <Card className="gap-4 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold">משרות פעילות</h2>
          <JobList jobs={active} />
          {upcoming.length === 0 && (
            <p className="text-muted text-sm">
              קיבלת ראיון? מוסיפים אותו בעמוד של המשרה, והוא יופיע כאן למעלה.
            </p>
          )}
        </Card>
      )}

      {all.length > 0 && <AddJobCard />}

      <ImportCard />

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
            className="bg-canvas hover:bg-sky-soft flex flex-wrap items-center justify-between gap-2 rounded-2xl p-4"
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

function AddJobCard({ first = false }: { first?: boolean }) {
  return (
    <Card tone={first ? "pink" : "white"} className="gap-4 p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold">
          {first ? "מוסיפים את המשרה הראשונה" : "להוסיף משרה"}
        </h2>
        <p className={first ? "text-lg" : "text-muted"}>
          הדבקה אחת של עמוד המשרה, ואנחנו מוציאים ממנו את החברה, התפקיד
          והדרישות.
        </p>
      </div>
      <PasteJobForm />
      <details>
        <summary className="text-muted cursor-pointer font-bold">
          או להוסיף ידנית
        </summary>
        <div className="mt-4">
          <AddJobForm />
        </div>
      </details>
    </Card>
  );
}

function ImportCard() {
  return (
    <Card tone="lavender" className="gap-4 p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold">
          כל המשרות שהגשת בלינקדאין, בבת אחת
        </h2>
        <p>
          לינקדאין מאפשרת להוריד קובץ עם המשרות שהגשת אליהן. מעלים אותו כאן,
          וכולן נכנסות לרשימה.
        </p>
      </div>
      <details>
        <summary className="cursor-pointer font-bold">
          איך מורידים את הקובץ
        </summary>
        <ol className="mt-3 flex list-decimal flex-col gap-2 ps-5">
          <li>
            בלינקדאין במחשב, לוחצים לפי הסדר:
            <span
              dir="ltr"
              className="mt-1 flex flex-col items-end font-mono text-sm"
            >
              <span>Me</span>
              <span>Settings &amp; Privacy</span>
              <span>Data privacy</span>
              <span>Get a copy of your data</span>
            </span>
          </li>
          <li>
            בוחרים את האפשרות שמאפשרת לבחור מידע מסוים, ומסמנים את המשרות שהגשת
            אליהן.
          </li>
          <li>
            לינקדאין שולחת מייל כשהקובץ מוכן, בדרך כלל תוך כמה דקות עד יום.
          </li>
          <li>מעלים כאן את הקובץ כמו שהוא, בלי לפתוח אותו.</li>
        </ol>
      </details>
      <ImportLinkedInForm />
      <p className="text-muted text-sm">
        הקובץ נפתח אצלך בדפדפן, ורק רשימת המשרות נשלחת אלינו.
      </p>
    </Card>
  );
}
