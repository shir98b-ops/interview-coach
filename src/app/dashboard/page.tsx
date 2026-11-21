import type { Metadata } from "next";
import { scoreChange } from "@/lib/interview/progress";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AddressPicker } from "@/components/address-picker";
import { Loading } from "@/components/app-shell";
import { ButtonLink, Card, Chip, ScoreTrend } from "@/components/ui";
import { InterviewCard } from "@/app/jobs/interview-card";
import { upcomingInterviews } from "@/lib/jobs/queries";
import { getLearningState } from "@/lib/learn/progress";
import { forAddress, lessons } from "@/lib/learn/lessons";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { WelcomeTour } from "@/app/welcome/tour";

export const metadata: Metadata = { title: "בית · Interview Coach" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login");
  const now = new Date();

  const [
    { data: profile },
    { count: roleCount },
    { data: sessions },
    { count: practiceCount },
    learning,
    interviews,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("target_roles").select("id", { count: "exact", head: true }),
    supabase
      .from("sessions")
      .select("overall_score, target_role_id, job_id, stage, questions(kind)")
      .not("overall_score", "is", null)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .not("overall_score", "is", null),
    getLearningState(supabase),
    upcomingInterviews(supabase, now, 5),
  ]);
  const nextInterviews = interviews
    .filter((i) => i.startsAt.getTime() + i.minutes * 60000 >= now.getTime())
    .slice(0, 2);

  const firstName = displayName(profile?.full_name?.trim().split(/\s+/)[0]);
  const latest = sessions?.[0]?.overall_score ?? undefined;
  const change = scoreChange(sessions ?? []);
  const ready = Boolean(profile) && (roleCount ?? 0) > 0;
  const lesson =
    learning.recommended && forAddress(learning.recommended, user.address);

  return (
    <>
      {!user.tourDone && <WelcomeTour />}
      <h1 className="text-3xl font-extrabold sm:text-4xl">
        {firstName ? `היי ${firstName}!` : "היי!"}
      </h1>

      {!user.address && (
        <Card tone="lavender" className="gap-4">
          <h2 className="text-xl font-extrabold">איך לפנות אליך?</h2>
          <p>כדי שהשאלות, המשובים והשיעורים ידברו אליך נכון.</p>
          <AddressPicker current={null} next="/dashboard" />
        </Card>
      )}

      {nextInterviews.length > 0 && (
        <Card tone="lavender" className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-extrabold">ראיונות קרובים</h2>
            <ButtonLink
              href="/jobs"
              variant="quiet"
              className="min-h-11 py-2 text-base"
            >
              לכל המשרות
            </ButtonLink>
          </div>
          <ul className="flex flex-col gap-3">
            {nextInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                now={now}
              />
            ))}
          </ul>
        </Card>
      )}

      {!ready ? (
        <Card tone="blue" className="gap-5 p-8">
          <h2 className="text-2xl font-extrabold">מתכוננים לתרגול הראשון</h2>
          <ol className="flex flex-col gap-3 text-lg">
            <Step done={Boolean(profile)} number={1}>
              מעלים קורות חיים ומאשרים את הפרטים
            </Step>
            <Step done={(roleCount ?? 0) > 0} number={2}>
              בוחרים לאיזה תפקיד מתכוננים
            </Step>
            <Step done={false} number={3}>
              מתחילים תרגול ראיון ראשון
            </Step>
          </ol>
          <ButtonLink href="/profile" variant="primary" className="w-fit">
            {profile ? "להוסיף תפקיד" : "להעלות קורות חיים"}
          </ButtonLink>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          <Card tone="blue" className="gap-3 p-7">
            {latest !== undefined ? (
              <>
                <p className="text-lg font-bold">הציון האחרון שלך</p>
                <ScoreTrend score={latest} change={change} />
                {change !== null && change < 0 && (
                  <p className="font-medium">
                    ירידה קטנה היא חלק מהדרך. התרגול הבא יראה את ההתקדמות.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-2xl font-extrabold">
                  הכל מוכן לתרגול הראשון
                </p>
                <p className="opacity-90">
                  חמש שאלות, ואחריהן ציון ומשוב על כל תשובה.
                </p>
              </>
            )}
            <ButtonLink href="/practice" variant="primary" className="mt-2">
              להתחיל תרגול
            </ButtonLink>
          </Card>

          <div className="flex flex-col gap-5">
            {lesson ? (
              <Card tone="pink">
                <Chip tone="glass">השיעור הבא בשבילך</Chip>
                <h2 className="text-xl font-bold">{lesson.title}</h2>
                <p className="text-muted">
                  {lesson.minutes} דקות · {lesson.summary}
                </p>
                <ButtonLink
                  href={`/learn/${lesson.slug}`}
                  variant="quiet"
                  className="w-fit"
                >
                  לשיעור
                </ButtonLink>
              </Card>
            ) : (
              <Card tone="mint">
                <h2 className="text-xl font-bold">סיימת את כל השיעורים!</h2>
                <p className="text-muted">אפשר לחזור לכל שיעור ולתרגל שוב.</p>
              </Card>
            )}
            <div className="grid grid-cols-2 gap-5">
              <Stat
                tone="sky"
                value={practiceCount ?? sessions?.length ?? 0}
                label="תרגולים"
              />
              <Stat
                tone="lavender"
                value={`${learning.completed.size}/${lessons.length}`}
                label="שיעורים"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Step({
  done,
  number,
  children,
}: {
  done: boolean;
  number: number;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-extrabold ${
          done ? "bg-mint" : "bg-sky-soft text-blue-dark"
        }`}
      >
        {done ? "✓" : number}
      </span>
      <span className={done ? "text-muted line-through" : ""}>{children}</span>
    </li>
  );
}

function Stat({
  tone,
  value,
  label,
}: {
  tone: "sky" | "lavender";
  value: number | string;
  label: string;
}) {
  return (
    <Card tone={tone} className="gap-1">
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-muted">{label}</p>
    </Card>
  );
}

/** Resumes often spell names in capitals; "SHIR" reads better as "Shir". */
function displayName(name: string | undefined): string | undefined {
  if (!name || !/^[A-Z][A-Z'-]+$/.test(name)) return name;
  return name[0] + name.slice(1).toLowerCase();
}
