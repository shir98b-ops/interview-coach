import type { Metadata } from "next";
import { formatDate } from "@/lib/format";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { ButtonLink, Card, Chip, PageHeading } from "@/components/ui";
import { limitMessage } from "@/lib/interview/limits";
import { getUsage } from "@/lib/interview/usage";
import { createClient } from "@/lib/supabase/server";
import { hasNoLimits } from "@/lib/auth/no-limits";
import { getSignedInUser } from "@/lib/supabase/user";
import { JobName } from "@/app/jobs/interview-card";
import { scoreChange } from "@/lib/interview/progress";
import { StartPracticeForm } from "./forms";

export const metadata: Metadata = { title: "תרגול · Interview Coach" };

export default function PracticePage() {
  return (
    <>
      <PageHeading
        title="תרגול ראיון"
        subtitle="חמש שאלות, אחת בכל פעם, לפי התפקיד וקורות החיים שלך. בסוף מקבלים ציון וטיפים לכל תשובה."
      />
      <Suspense fallback={<Loading />}>
        <PracticeContent />
      </Suspense>
    </>
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
          "id, created_at, completed_at, overall_score, target_role_id, job_id, stage, questions(kind), target_roles(title), jobs(title, company)",
        )
        .order("created_at", { ascending: false })
        .limit(40),
      getUsage(supabase),
    ]);

  const noLimits = hasNoLimits(user.email);

  if (!profile || !roles?.length) {
    return (
      <Card className="gap-4 p-8">
        <h2 className="text-2xl font-extrabold">קודם כל, כמה פרטים עליך</h2>
        <p className="text-muted text-lg">
          השאלות מותאמות לקורות החיים ולתפקיד המבוקש, אז צריך קודם
          {profile
            ? " להוסיף לפחות תפקיד אחד."
            : " להעלות קורות חיים ולבחור תפקיד."}
        </p>
        <ButtonLink href="/profile" variant="primary" className="w-fit">
          לפרופיל שלי
        </ButtonLink>
      </Card>
    );
  }

  const scores = (sessions ?? [])
    .filter((s) => s.overall_score !== null)
    .map((s) => s.overall_score as number)
    .reverse();
  const change = scoreChange(sessions ?? []);
  // Practices left in the middle are kept out of the way, so the list shows
  // the ones that were scored.
  const finished = (sessions ?? []).filter((s) => s.completed_at).slice(0, 20);
  const unfinished = (sessions ?? []).filter((s) => !s.completed_at);

  return (
    <>
      <Card className="gap-5 p-6 sm:p-8">
        {noLimits ? (
          <>
            <StartPracticeForm roles={roles} />
            <p className="text-muted text-sm">לחשבון שלך אין מגבלה יומית.</p>
          </>
        ) : usage.remaining > 0 ? (
          <>
            <StartPracticeForm roles={roles} />
            <p className="text-muted text-sm">
              נשארו לך {usage.remaining} מתוך {usage.limit} תרגולים ב־24 השעות
              הקרובות.
            </p>
          </>
        ) : (
          <p
            role="status"
            className="bg-pink-soft text-pink-ink rounded-2xl p-4"
          >
            {limitMessage(usage)}
          </p>
        )}
      </Card>

      {sessions && sessions.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-extrabold">התרגולים שלך</h2>
          <ProgressChart scores={scores} change={change} />
          <ul className="flex flex-col gap-3">
            {finished.map((session) => (
              <PracticeItem key={session.id} session={session} />
            ))}
          </ul>
          {unfinished.length > 0 && (
            <details className="flex flex-col gap-3">
              <summary className="text-muted cursor-pointer font-bold">
                תרגולים שלא הסתיימו ({unfinished.length})
              </summary>
              <ul className="mt-3 flex flex-col gap-3">
                {unfinished.map((session) => (
                  <PracticeItem key={session.id} session={session} />
                ))}
              </ul>
            </details>
          )}
        </section>
      )}
    </>
  );
}

interface PracticeRow {
  id: string;
  created_at: string;
  completed_at: string | null;
  overall_score: number | null;
  target_roles: unknown;
  jobs: unknown;
}

function PracticeItem({ session }: { session: PracticeRow }) {
  const role = session.target_roles as unknown as {
    title: string;
  } | null;
  const job = session.jobs as unknown as {
    title: string;
    company: string;
  } | null;
  return (
    <li>
      <Link
        href={`/practice/${session.id}`}
        className="hover:bg-sky-soft flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-[0_6px_20px_rgba(77,40,200,0.06)] transition"
      >
        <span className="flex flex-col">
          <span className="font-bold">
            {job ? (
              <JobName company={job.company} title={job.title} />
            ) : (
              <bdi>{role?.title ?? "תפקיד שנמחק"}</bdi>
            )}
          </span>
          <span className="text-muted text-sm">
            {formatDate(session.created_at)}
          </span>
        </span>
        {session.overall_score !== null ? (
          <span className="text-blue text-2xl font-extrabold">
            {session.overall_score}
          </span>
        ) : (
          <Chip tone={session.completed_at ? "blue" : "pink"}>
            {session.completed_at ? "הסתיים" : "בתהליך"}
          </Chip>
        )}
      </Link>
    </li>
  );
}

/** Scores of scored interviews, oldest first, as a simple bar chart. */
function ProgressChart({
  scores,
  change,
}: {
  scores: number[];
  change: number | null;
}) {
  if (scores.length < 2) return null;
  return (
    <Card tone="lavender" className="gap-4">
      <p className="font-bold">
        {change === null
          ? "כל עמודה היא תרגול אחד. ההשוואה היא רק בין תרגולים מאותו סוג ולאותו תפקיד."
          : change > 0
            ? `עלית ${change} נקודות מהתרגול הקודם מאותו סוג. כל הכבוד!`
            : change < 0
              ? `ירדת ${-change} נקודות מהתרגול הקודם מאותו סוג. שיעור קצר יכול לעזור.`
              : "אותו ציון כמו בתרגול הקודם מאותו סוג."}
      </p>
      <div
        dir="ltr"
        className="flex h-28 items-end gap-1.5"
        role="img"
        aria-label={`הציונים שלך: ${scores.join(", ")}`}
      >
        {scores.map((score, index) => (
          <div
            key={index}
            title={`${score} / 100`}
            className="bg-blue flex-1 rounded-t-lg"
            style={{ height: `${Math.max(score, 4)}%` }}
          />
        ))}
      </div>
    </Card>
  );
}
