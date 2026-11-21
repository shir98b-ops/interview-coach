import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AddressPicker } from "@/components/address-picker";
import { Loading } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { WelcomeTour } from "@/app/welcome/tour";
import { nextStep, type HomeFacts } from "@/lib/home/next-step";
import { thisWeek } from "@/lib/home/week";
import { roundKind, scoreChange } from "@/lib/interview/progress";
import { isCodingRole, isTechnicalRole } from "@/lib/interview/question-bank";
import { practiceStreak } from "@/lib/interview/streak";
import { upcomingInterviews } from "@/lib/jobs/queries";
import { interviewKinds } from "@/lib/jobs/schema";
import { daysUntil } from "@/lib/jobs/time";
import { getLearningState } from "@/lib/learn/progress";
import { forAddress } from "@/lib/learn/lessons";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import {
  Greeting,
  InterviewTile,
  LaterRow,
  LessonTile,
  NextStepCard,
  ScoreTile,
  WeekCard,
} from "./home-parts";

export const metadata: Metadata = { title: "בית · Interview Coach" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}

/** Upcoming interviews further away than this do not take over the home. */
const INTERVIEW_WINDOW_DAYS = 14;

type Finished = {
  completed_at: string;
  overall_score: number | null;
  target_role_id: string | null;
  job_id: string | null;
  stage: string | null;
  questions: { kind: string }[] | null;
  target_roles: { title: string } | { title: string }[] | null;
};

const roundLabels: Record<string, string> = {
  general: "ראיון כללי",
  technical: "ראיון מקצועי",
  design: "ניתוח מקרה",
  coding: "תרגילי קוד",
};

async function Dashboard() {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login");
  const now = new Date();

  // Row level security limits every read to the user's own rows.
  const [
    { data: profile },
    { data: roles },
    { data: finishedRows },
    { data: reviews },
    { data: takeHomes },
    learning,
    interviews,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("target_roles").select("title").order("created_at").limit(1),
    supabase
      .from("sessions")
      .select(
        "completed_at, overall_score, target_role_id, job_id, stage, questions(kind), target_roles(title)",
      )
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(100),
    supabase
      .from("resume_reviews")
      .select("score")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("take_homes")
      .select("id")
      .is("submitted_at", null)
      .order("created_at", { ascending: false })
      .limit(1),
    getLearningState(supabase),
    upcomingInterviews(supabase, now, 5),
  ]);

  const finished = (finishedRows ?? []) as unknown as Finished[];
  const finishedAt = finished.map((s) => new Date(s.completed_at));
  const scored = finished.filter((s) => s.overall_score !== null);
  const roleTitle = (roles?.[0]?.title as string | undefined) ?? null;
  const lesson =
    learning.recommended && forAddress(learning.recommended, user.address);

  const interview = interviews.find(
    (i) =>
      i.startsAt.getTime() + i.minutes * 60000 >= now.getTime() &&
      daysUntil(i.startsAt, now) <= INTERVIEW_WINDOW_DAYS,
  );
  const upcoming = interview
    ? {
        jobId: interview.jobId,
        company: interview.company,
        kindLabel: interviewKinds[interview.kind],
        days: daysUntil(interview.startsAt, now),
        whenText: shortWhen(interview.startsAt),
        practicesForJob: finished.filter((s) => s.job_id === interview.jobId)
          .length,
      }
    : null;

  const facts: HomeFacts = {
    hasResume: Boolean(profile),
    roleTitle,
    roundsDone: new Set(finished.map((s) => roundKind(s.questions))),
    technicalRole: roleTitle ? isTechnicalRole(roleTitle) : false,
    codingRole: roleTitle ? isCodingRole(roleTitle) : false,
    resumeScore: (reviews?.[0]?.score as number | null | undefined) ?? null,
    openTakeHome: takeHomes?.[0] ? { id: takeHomes[0].id as string } : null,
    upcoming,
    lesson: lesson
      ? { slug: lesson.slug, title: lesson.title, minutes: lesson.minutes }
      : null,
  };
  const step = nextStep(facts);
  const newUser = Boolean(step.setup);

  const firstName = displayName(profile?.full_name?.trim().split(/\s+/)[0]);
  const streak = practiceStreak(finishedAt, now);
  const week = thisWeek(now, finishedAt);
  const latest = scored[0];

  return (
    <>
      {!user.tourDone && <WelcomeTour />}
      <Greeting
        name={firstName}
        subtitle={newUser ? "טוב שבאת" : longDate(now)}
        streakDays={streak.days}
      />

      {newUser ? (
        <>
          <div className="flex flex-col gap-3">
            <NextStepCard step={step} />
            {step.key === "resume" && (
              <p className="text-muted text-center text-sm">
                קובץ PDF. הקובץ נקרא פעם אחת ולא נשמר.
              </p>
            )}
          </div>
          <section aria-labelledby="meanwhile" className="flex flex-col gap-3">
            <h2 id="meanwhile" className="text-2xl font-black">
              בינתיים
            </h2>
            <ul className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-5">
              {lesson && (
                <LaterRow
                  href={`/learn/${lesson.slug}`}
                  icon="book"
                  tone="mint"
                  title={
                    step.key === "resume"
                      ? "אין קורות חיים? מתחילים מ־STAR"
                      : lesson.title
                  }
                  subtitle={`שיעור קצר · ${lesson.minutes} דקות`}
                />
              )}
              {step.key === "resume" && (
                <LaterRow
                  href="/profile"
                  icon="target"
                  tone="sky"
                  title="לבחור תפקיד שמתכוננים אליו"
                  subtitle="2 דקות"
                />
              )}
            </ul>
          </section>
        </>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr] lg:gap-5">
            <NextStepCard step={step} />
            <WeekCard days={week.days} practices={week.practices} />
          </div>

          <section aria-labelledby="activity" className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="activity" className="text-2xl font-black">
                הפעילות שלך
              </h2>
              <Link
                href="/practice"
                className="text-muted text-sm underline underline-offset-4"
              >
                הכל
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
              {interview && step.key !== "interview" && upcoming && (
                <InterviewTile
                  href={`/jobs/${interview.jobId}`}
                  company={interview.company}
                  when={`${upcoming.whenText} · ${upcoming.kindLabel}`}
                  days={upcoming.days}
                  prepDone={Math.min(upcoming.practicesForJob, 3)}
                />
              )}
              {latest && (
                <ScoreTile
                  score={latest.overall_score as number}
                  change={scoreChange(scored)}
                  label={[
                    roundLabels[roundKind(latest.questions)],
                    roleOf(latest),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              )}
              {lesson && step.key !== "lesson" && (
                <LessonTile
                  href={`/learn/${lesson.slug}`}
                  title={lesson.title}
                  minutes={lesson.minutes}
                  summary={lesson.summary}
                />
              )}
            </div>
          </section>
        </>
      )}

      {!user.address && (
        <Card className="gap-4">
          <h2 className="text-xl font-extrabold">איך לפנות אליך?</h2>
          <p>כדי שהשאלות, המשובים והשיעורים ידברו אליך נכון.</p>
          <AddressPicker current={null} next="/dashboard" />
        </Card>
      )}
    </>
  );
}

function roleOf(session: Finished): string {
  const role = Array.isArray(session.target_roles)
    ? session.target_roles[0]
    : session.target_roles;
  return role?.title ?? "";
}

/** "שבת, 21 בנובמבר" */
function longDate(date: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(date)
    .replace(/^יום /, "");
}

/** "שלישי · 24.11 · 10:00" */
function shortWhen(date: Date): string {
  const zone = { timeZone: "Asia/Jerusalem" } as const;
  const weekday = new Intl.DateTimeFormat("he-IL", { ...zone, weekday: "long" })
    .format(date)
    .replace(/^יום /, "");
  const day = new Intl.DateTimeFormat("he-IL", {
    ...zone,
    day: "numeric",
    month: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("he-IL", {
    ...zone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${weekday} · ${day} · ${time}`;
}

/** "SHIR" becomes "Shir"; other names stay as written. */
function displayName(name: string | undefined): string | undefined {
  if (!name || !/^[A-Z][A-Z'-]+$/.test(name)) return name;
  return name[0] + name.slice(1).toLowerCase();
}
