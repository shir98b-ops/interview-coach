import type { Metadata } from "next";
import { formatDate, localizeSeniority } from "@/lib/format";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import {
  ButtonLink,
  Card,
  Chip,
  PageHeading,
  tileTones,
} from "@/components/ui";
import {
  readReview,
  reviewRubric,
  type ResumeReview,
} from "@/lib/resume/review-schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { RateResumeForm } from "./form";

export const metadata: Metadata = {
  title: "דירוג קורות חיים · Interview Coach",
};

export default function ResumeReviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Link href="/profile" className="text-blue w-fit font-medium">
        → לפרופיל
      </Link>
      <PageHeading
        title="דירוג קורות החיים"
        subtitle="ציון מתוך 100 לפי התפקיד שלך, מה כבר עובד, ואילו שורות כדאי לשכתב כדי לבלוט אצל מגייסים."
      />
      <Suspense fallback={<Loading />}>
        <Reviews />
      </Suspense>
    </div>
  );
}

async function Reviews() {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login?next=/profile/review");

  const [{ data: profile }, { data: roles }, { data: reviews }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("resume_data")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("target_roles").select("id, title").order("created_at"),
      supabase
        .from("resume_reviews")
        .select("id, role_title, score, feedback, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  if (!profile?.resume_data) {
    return (
      <Card tone="blue" className="gap-4 p-8">
        <h2 className="text-2xl font-extrabold">קודם מעלים קורות חיים</h2>
        <p className="text-muted text-lg">
          הדירוג נעשה על הפרטים שאישרת בפרופיל.
        </p>
        <ButtonLink href="/profile" variant="primary" className="w-fit">
          להעלות קורות חיים
        </ButtonLink>
      </Card>
    );
  }

  const latest = reviews?.[0];
  const review = latest ? readReview(latest.feedback) : null;
  const previous = reviews?.[1]?.score;

  return (
    <>
      <Card className="gap-4 p-6 sm:p-8">
        <RateResumeForm roles={roles ?? []} rated={Boolean(latest)} />
        <p className="text-muted text-sm">
          הדירוג נעשה על התוכן שאישרת בפרופיל, לא על העיצוב של הקובץ. אחרי עדכון
          של קורות החיים, מעלים אותם מחדש ומדרגים שוב כדי לראות את השיפור.
        </p>
      </Card>

      {latest && review && (
        <ReviewDetails
          review={review}
          score={latest.score}
          role={latest.role_title}
          change={previous !== undefined ? latest.score - previous : null}
        />
      )}

      {reviews && reviews.length > 1 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-extrabold">דירוגים קודמים</h2>
          <ul className="flex flex-col gap-2">
            {reviews.slice(1).map((r) => (
              <li
                key={r.id}
                className="bg-sky-light [&_.text-muted]:text-ink-soft flex items-center justify-between gap-4 rounded-2xl px-5 py-3"
              >
                <span className="flex flex-col">
                  <span dir="auto" className="font-bold">
                    {r.role_title
                      ? localizeSeniority(r.role_title)
                      : "דירוג כללי"}
                  </span>
                  <span className="text-muted text-sm">
                    {formatDate(r.created_at)}
                  </span>
                </span>
                <span className="text-blue text-2xl font-extrabold">
                  {r.score}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function ReviewDetails({
  review,
  score,
  role,
  change,
}: {
  review: ResumeReview;
  score: number;
  role: string | null;
  change: number | null;
}) {
  return (
    <section className="flex flex-col gap-5">
      <Card tone="blue" className="gap-3 p-7">
        <p dir="auto" className="opacity-90">
          {role ? localizeSeniority(role) : "דירוג כללי"}
        </p>
        <p
          dir="ltr"
          className="text-right text-6xl leading-none font-extrabold"
        >
          {score}
          <span className="text-2xl opacity-80"> / 100</span>
        </p>
        {change !== null && change !== 0 && (
          <p className="text-blue font-bold">
            {change > 0
              ? `עלית ${change} נקודות מהדירוג הקודם`
              : `ירדת ${-change} נקודות מהדירוג הקודם`}
          </p>
        )}
        <p dir="auto" className="text-lg">
          {review.verdict}
        </p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {reviewRubric.map((r, i) => (
          <Card
            key={r.key}
            tone={tileTones[i % tileTones.length]}
            className="gap-1 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold">{r.label}</p>
              <p className="text-blue text-2xl font-extrabold">
                {review[r.key]}/5
              </p>
            </div>
            <p className="text-muted text-sm">{r.description}</p>
          </Card>
        ))}
      </div>

      {review.strengths.length > 0 && (
        <div className="bg-mint rounded-2xl p-5">
          <p className="text-success-ink font-bold">מה כבר עובד</p>
          <ul className="mt-1 flex list-disc flex-col gap-1 ps-5">
            {review.strengths.map((s, i) => (
              <li key={i} dir="auto">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {review.fixes.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-extrabold">מה לשנות</h2>
          <ol className="flex flex-col gap-3">
            {review.fixes.map((fix, i) => (
              <li key={i}>
                <Card
                  tone={tileTones[(i + 1) % tileTones.length]}
                  className="gap-3 p-5"
                >
                  <p className="flex gap-3 font-bold">
                    <span className="text-ink flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/60">
                      {i + 1}
                    </span>
                    <span dir="auto">{fix.issue}</span>
                  </p>
                  {fix.before && (
                    <div className="rounded-2xl bg-white/60 p-4">
                      <p className="text-sm font-bold">היום</p>
                      <p dir="auto">{fix.before}</p>
                    </div>
                  )}
                  <div className="rounded-2xl bg-white/60 p-4">
                    <p className="text-success-ink text-sm font-bold">
                      {fix.before ? "עדיף" : "להוסיף"}
                    </p>
                    <p dir="auto">{fix.after}</p>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
          <p className="text-muted text-sm">
            איפה שמופיע סימון כמו [X%], משלימים את המספר האמיתי.
          </p>
        </section>
      )}

      {review.keywords.length > 0 && (
        <Card tone="sky" className="gap-3">
          <p className="text-blue font-bold">מילים שמגייסים מחפשים ואין אצלך</p>
          <div className="flex flex-wrap gap-2">
            {review.keywords.map((k) => (
              <Chip key={k} tone="blue">
                <span dir="auto">{k}</span>
              </Chip>
            ))}
          </div>
          <p className="text-muted text-sm">
            כדאי להוסיף רק את מה שבאמת יש לך ניסיון בו.
          </p>
        </Card>
      )}
    </section>
  );
}
