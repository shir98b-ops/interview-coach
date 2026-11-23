import { defaultCodeLanguageForJob } from "@/lib/code/languages";
import { hasDesignRound, isCodingRole } from "@/lib/interview/question-bank";
import type { Metadata } from "next";
import { formatDate } from "@/lib/format";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { Card, Chip, inputStyles } from "@/components/ui";
import { ConfirmDeleteButton } from "@/components/confirm-delete";
import { SaveButton } from "@/components/save-button";
import { readPrepPlan, type PrepPlan } from "@/lib/jobs/prep-schema";
import { interviewsForJob } from "@/lib/jobs/queries";
import {
  interviewKinds,
  jobStatuses,
  parseKind,
  parseStatus,
} from "@/lib/jobs/schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import {
  deleteInterview,
  deleteJob,
  saveReflection,
  updateJob,
} from "../actions";
import {
  AddInterviewForm,
  DescriptionForm,
  JobPracticeForm,
  JobTakeHomeForm,
  PrepPlanForm,
} from "../forms";
import { InterviewCard } from "../interview-card";
import { PrepPlanView } from "../prep-plan";

export const metadata: Metadata = { title: "משרה · Interview Coach" };

export default function JobPage({ params }: PageProps<"/jobs/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Link href="/jobs" className="text-blue w-fit font-medium">
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
  const [
    { data: job },
    interviews,
    { data: preps },
    { data: practices },
    { count: reviewedTakeHomes },
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, company, title, link, description, status, notes")
      .eq("id", id)
      .maybeSingle(),
    interviewsForJob(supabase, id),
    supabase
      .from("job_preps")
      .select("interview_id, plan, created_at")
      .eq("job_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("sessions")
      .select("id, created_at, overall_score, stage")
      .eq("job_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("take_homes")
      .select("id", { count: "exact", head: true })
      .eq("job_id", id)
      .not("feedback", "is", null),
  ]);
  if (!job) notFound();
  const technical = hasDesignRound(job.title);
  const coding = isCodingRole(job.title);
  const codeLanguage = defaultCodeLanguageForJob(job.title, job.description);
  const status = parseStatus(job.status);
  const now = new Date();
  // The newest plan for the job as a whole, and for each stage.
  const prep = preps?.find((p) => !p.interview_id);
  const plan = readPrepPlan(prep?.plan);
  const stagePlans = new Map<string, { plan: PrepPlan; createdAt: string }>();
  for (const p of preps ?? []) {
    const stagePlan = p.interview_id && readPrepPlan(p.plan);
    if (stagePlan && !stagePlans.has(p.interview_id!)) {
      stagePlans.set(p.interview_id!, {
        plan: stagePlan,
        createdAt: p.created_at,
      });
    }
  }
  const isPast = (i: { startsAt: Date; minutes: number }) =>
    i.startsAt.getTime() + i.minutes * 60000 < now.getTime();
  const nextStage = interviews.find((i) => !isPast(i));

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
            className="text-blue w-fit font-bold"
          >
            למודעת המשרה ←
          </a>
        )}
      </header>

      <Card tone="mint" className="gap-4 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold">שלבי התהליך</h2>
          <p className="text-muted">
            כל ראיון או מבחן בית הוא שלב. לכל שלב יש הכנה ותרגול משלו, ואחריו
            כותבים איך היה, כדי שההכנה לשלב הבא תתחשב בזה.
          </p>
        </div>
        {interviews.length > 0 && (
          <ol
            aria-label="מסלול התהליך"
            className="flex flex-wrap items-center gap-2"
          >
            {interviews.map((interview, index) => {
              const done = isPast(interview);
              const current = interview.id === nextStage?.id;
              return (
                <li key={interview.id} className="flex items-center gap-2">
                  {index > 0 && (
                    <span aria-hidden className="text-muted">
                      ←
                    </span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      current
                        ? "bg-blue text-white"
                        : done
                          ? "text-success-ink bg-white/60"
                          : "bg-canvas text-muted"
                    }`}
                  >
                    {done ? "✓ " : ""}
                    {interviewKinds[interview.kind]}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
        {interviews.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {interviews.map((interview) => {
              const stagePlan = stagePlans.get(interview.id);
              return (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  now={now}
                  showJob={false}
                  footer={
                    isPast(interview) ? (
                      <form
                        action={saveReflection}
                        className="flex flex-col gap-2"
                      >
                        <input type="hidden" name="id" value={interview.id} />
                        <label
                          htmlFor={`reflection-${interview.id}`}
                          className="font-bold"
                        >
                          איך היה?
                        </label>
                        <textarea
                          id={`reflection-${interview.id}`}
                          name="reflection"
                          rows={3}
                          maxLength={2000}
                          dir="auto"
                          defaultValue={interview.reflection ?? ""}
                          placeholder="מה שאלו, מה הלך טוב ומה היה קשה. ההכנה לשלב הבא תתחשב בזה."
                          className={inputStyles}
                        />
                        <SaveButton variant="quiet" className="sm:w-fit" />
                      </form>
                    ) : !job.description ? (
                      <p className="text-muted text-sm">
                        כדי להתכונן לשלב הזה, קודם מוסיפים את תיאור המשרה.
                      </p>
                    ) : (
                      <details
                        className="rounded-2xl bg-white/60 p-4"
                        open={interview.id === nextStage?.id}
                      >
                        <summary className="cursor-pointer text-lg font-extrabold">
                          הכנה לשלב הזה
                        </summary>
                        <div className="mt-4 flex flex-col gap-6">
                          {stagePlan && <PrepPlanView plan={stagePlan.plan} />}
                          <PrepPlanForm
                            jobId={job.id}
                            interviewId={interview.id}
                            hasPlan={Boolean(stagePlan)}
                          />
                          <div className="border-line flex flex-col gap-3 border-t-2 pt-5">
                            {interview.kind === "take-home" ? (
                              <>
                                <p className="font-bold">
                                  מבחן תרגול בסגנון של המשרה הזו, עם ציון ומשוב.
                                </p>
                                <JobTakeHomeForm
                                  jobId={job.id}
                                  coding={coding}
                                  codeLanguage={codeLanguage}
                                />
                              </>
                            ) : (
                              <>
                                <p className="font-bold">
                                  חמש שאלות כמו שישאלו בשלב הזה, עם ציון ומשוב.
                                </p>
                                <JobPracticeForm
                                  jobId={job.id}
                                  stage={interview.kind}
                                  modes={interview.kind === "professional"}
                                  technical={technical}
                                  coding={coding}
                                  codeLanguage={codeLanguage}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </details>
                    )
                  }
                >
                  <form action={deleteInterview}>
                    <input type="hidden" name="id" value={interview.id} />
                    <ConfirmDeleteButton
                      label="למחוק"
                      confirmLabel="למחוק את השלב"
                      className="px-2"
                    />
                  </form>
                </InterviewCard>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted">
            עוד לא נקבע שלב. כשמזמינים אותך לראיון או למבחן בית, מוסיפים אותו
            כאן.
          </p>
        )}
        <details
          className="border-line rounded-2xl border-2 p-4"
          open={interviews.length === 0}
        >
          <summary className="cursor-pointer text-lg font-extrabold">
            להוסיף שלב
          </summary>
          <div className="mt-4">
            <AddInterviewForm jobId={job.id} />
          </div>
        </details>
      </Card>

      {!job.description ? (
        <Card tone="pink" className="gap-4 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold">מתחילים בתיאור המשרה</h2>
          <p className="text-lg">
            מדביקים כאן את הטקסט של המודעה, ומקבלים תוכנית הכנה ותרגול ראיון
            שבנויים בדיוק למשרה הזו.
          </p>
          <DescriptionForm jobId={job.id} current={null} />
        </Card>
      ) : (
        <Card tone="sky" className="gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-extrabold">
              {interviews.length
                ? "תוכנית הכנה כללית למשרה"
                : "תוכנית הכנה למשרה"}
            </h2>
            <p className="text-muted">
              {plan
                ? `נבנתה ${formatDate(prep!.created_at)} לפי המודעה וקורות החיים שלך.`
                : "מה הם מחפשים, מה כבר יש לך, אילו שאלות צפויות ואיך להתכונן בזמן שנשאר."}
            </p>
          </div>
          {plan && <PrepPlanView plan={plan} />}
          <PrepPlanForm jobId={job.id} hasPlan={Boolean(plan)} />
        </Card>
      )}

      {job.description && (
        <Card tone="mint" className="gap-4 p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-extrabold">תרגול ראיון למשרה</h2>
            <p>חמש שאלות שנבנות מתוך המודעה, ואחריהן ציון ומשוב על כל תשובה.</p>
            {(reviewedTakeHomes ?? 0) > 0 && (
              <p className="font-bold">
                הגשת מבחן בית למשרה הזו, אז התרגול יתחיל ממנו: שאלות על ההחלטות
                שלך, על הנקודות שהמשוב מצא ועל מה שישתנה בהיקף גדול יותר, כמו
                בראיון ההמשך האמיתי.
              </p>
            )}
          </div>
          <JobPracticeForm
            jobId={job.id}
            modes
            technical={technical}
            coding={coding}
            codeLanguage={codeLanguage}
          />
          {practices && practices.length > 0 && (
            <ul className="flex flex-col gap-2">
              {practices.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/practice/${p.id}`}
                    className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 transition hover:bg-white"
                  >
                    <span>
                      {p.stage
                        ? interviewKinds[parseKind(p.stage)]
                        : "תרגול כללי"}{" "}
                      · {formatDate(p.created_at)}
                    </span>
                    <span className="text-blue font-extrabold">
                      {p.overall_score ?? "בתהליך"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

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
          <SaveButton className="sm:w-fit" />
        </form>
      </Card>

      {job.description && (
        <details className="group">
          <summary className="text-muted cursor-pointer font-bold">
            תיאור המשרה ששמרת
          </summary>
          <div className="mt-4">
            <DescriptionForm jobId={job.id} current={job.description} />
          </div>
        </details>
      )}

      <form action={deleteJob}>
        <input type="hidden" name="id" value={job.id} />
        <ConfirmDeleteButton
          label="למחוק את המשרה ואת הראיונות שלה"
          confirmLabel="כן, למחוק לצמיתות"
        />
      </form>
    </>
  );
}
