import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { ButtonLink, Card, Chip, PageHeading } from "@/components/ui";
import { limitMessage } from "@/lib/interview/limits";
import { getUsage } from "@/lib/interview/usage";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
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
          "id, created_at, completed_at, overall_score, target_roles(title)",
        )
        .order("created_at", { ascending: false })
        .limit(20),
      getUsage(supabase),
    ]);

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
        <ButtonLink href="/profile" variant="lime" className="w-fit">
          לפרופיל שלי
        </ButtonLink>
      </Card>
    );
  }

  const scores = (sessions ?? [])
    .filter((s) => s.overall_score !== null)
    .map((s) => s.overall_score as number)
    .reverse();

  return (
    <>
      <Card className="gap-5 p-6 sm:p-8">
        {usage.remaining > 0 ? (
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
            className="bg-orange-soft text-orange-ink rounded-2xl p-4"
          >
            {limitMessage(usage)}
          </p>
        )}
      </Card>

      {sessions && sessions.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-extrabold">התרגולים שלך</h2>
          <ProgressChart scores={scores} />
          <ul className="flex flex-col gap-3">
            {sessions.map((session) => {
              const role = session.target_roles as unknown as {
                title: string;
              } | null;
              return (
                <li key={session.id}>
                  <Link
                    href={`/practice/${session.id}`}
                    className="hover:bg-violet-soft flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-[0_6px_20px_rgba(77,40,200,0.06)] transition"
                  >
                    <span className="flex flex-col">
                      <span dir="auto" className="font-bold">
                        {role?.title ?? "תפקיד שנמחק"}
                      </span>
                      <span className="text-muted text-sm">
                        {new Date(session.created_at).toLocaleDateString(
                          "he-IL",
                        )}
                      </span>
                    </span>
                    {session.overall_score !== null ? (
                      <span className="text-violet text-2xl font-extrabold">
                        {session.overall_score}
                      </span>
                    ) : (
                      <Chip tone={session.completed_at ? "violet" : "orange"}>
                        {session.completed_at ? "הסתיים" : "בתהליך"}
                      </Chip>
                    )}
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

/** Scores of scored interviews, oldest first, as a simple bar chart. */
function ProgressChart({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null;
  const change = scores[scores.length - 1] - scores[0];
  return (
    <Card tone="lilac" className="gap-4">
      <p className="font-bold">
        {change > 0
          ? `עלית ${change} נקודות מאז התרגול הראשון. כל הכבוד!`
          : change < 0
            ? `ירדת ${-change} נקודות מאז התרגול הראשון. שיעור קצר יכול לעזור.`
            : "אותו ציון כמו בתרגול הראשון."}
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
            className="bg-violet flex-1 rounded-t-lg"
            style={{ height: `${Math.max(score, 4)}%` }}
          />
        ))}
      </div>
    </Card>
  );
}
