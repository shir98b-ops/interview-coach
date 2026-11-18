import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { Button, Card, Chip, inputStyles } from "@/components/ui";
import { interviewsForJob } from "@/lib/jobs/queries";
import { jobStatuses, parseStatus } from "@/lib/jobs/schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { deleteInterview, deleteJob, updateJob } from "../actions";
import { AddInterviewForm } from "../forms";
import { InterviewCard } from "../interview-card";

export const metadata: Metadata = { title: "משרה · Interview Coach" };

export default function JobPage({ params }: PageProps<"/jobs/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Link href="/jobs" className="text-violet w-fit font-medium">
        → לכל המשרות
      </Link>
      <Suspense fallback={<Loading />}>
        <JobContent params={params} />
      </Suspense>
    </div>
  );
}

async function JobContent({ params }: Pick<PageProps<"/jobs/[id]">, "params">) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect(`/login?next=/jobs/${id}`);

  // Row level security returns nothing for another user's job.
  const [{ data: job }, interviews] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, company, title, link, status, notes")
      .eq("id", id)
      .maybeSingle(),
    interviewsForJob(supabase, id),
  ]);
  if (!job) notFound();
  const status = parseStatus(job.status);
  const now = new Date();

  return (
    <>
      <header className="flex flex-col gap-3">
        <Chip tone={jobStatuses[status].tone}>{jobStatuses[status].label}</Chip>
        <h1
          dir="auto"
          className="text-right text-3xl font-extrabold sm:text-4xl"
        >
          {job.title}
        </h1>
        <p dir="auto" className="text-muted text-right text-xl font-bold">
          {job.company}
        </p>
        {job.link && (
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet w-fit font-bold"
          >
            למודעת המשרה ←
          </a>
        )}
      </header>

      <Card className="gap-4 p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold">ראיונות</h2>
        {interviews.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {interviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                now={now}
                showJob={false}
              >
                <form action={deleteInterview}>
                  <input type="hidden" name="id" value={interview.id} />
                  <button
                    type="submit"
                    className="text-muted hover:text-danger min-h-11 px-2 text-sm font-medium"
                  >
                    למחוק
                  </button>
                </form>
              </InterviewCard>
            ))}
          </ul>
        ) : (
          <p className="text-muted">עוד לא נקבע ראיון למשרה הזו.</p>
        )}
        <details
          className="border-line rounded-2xl border-2 p-4"
          open={interviews.length === 0}
        >
          <summary className="cursor-pointer text-lg font-extrabold">
            להוסיף ראיון
          </summary>
          <div className="mt-4">
            <AddInterviewForm jobId={job.id} />
          </div>
        </details>
      </Card>

      <Card className="gap-4 p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold">סטטוס והערות</h2>
        <form action={updateJob} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={job.id} />
          <label className="flex flex-col gap-1 font-bold">
            איפה זה עומד
            <select name="status" defaultValue={status} className={inputStyles}>
              {Object.entries(jobStatuses).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 font-bold">
            הערות
            <textarea
              name="notes"
              rows={4}
              maxLength={4000}
              dir="auto"
              defaultValue={job.notes ?? ""}
              placeholder="איש קשר, מה למדת על החברה, שכר שדובר עליו"
              className={inputStyles}
            />
          </label>
          <Button type="submit" className="sm:w-fit">
            לשמור
          </Button>
        </form>
      </Card>

      <form action={deleteJob}>
        <input type="hidden" name="id" value={job.id} />
        <button
          type="submit"
          className="text-muted hover:text-danger min-h-11 text-sm font-medium"
        >
          למחוק את המשרה ואת הראיונות שלה
        </button>
      </form>
    </>
  );
}
