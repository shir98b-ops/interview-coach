import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { Card, Chip, PageHeading } from "@/components/ui";
import { parsePeriod, reportPeriods } from "@/lib/analytics/report";
import {
  byPriority,
  feedbackKinds,
  priorities,
  ratingStats,
  readDigest,
  type FeedbackItem,
  type Priority,
  type SavedDigest,
} from "@/lib/feedback/schema";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { SummarizeButton } from "./summarize-button";

export const metadata: Metadata = { title: "משוב משתמשים · Interview Coach" };

const priorityTone: Record<Priority, "pink" | "blue" | "mint"> = {
  high: "pink",
  medium: "blue",
  low: "mint",
};

/**
 * The owner's feedback inbox: every message, the ratings, and an AI summary
 * that groups the messages into themes and ranks them. Admins only.
 */
export default function FeedbackInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <PageHeading
        title="משוב משתמשים"
        subtitle="כל ההודעות מכפתור המשוב, עם דירוג וסיכום. המשתמשים מוצגים בקוד אנונימי."
      />
      <Suspense fallback={<Loading />}>
        <Inbox searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`דירוג ${rating} מתוך 5`} className="font-bold" dir="ltr">
      {"★".repeat(rating)}
      <span className="text-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

async function Inbox({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const days = parsePeriod((await searchParams).days);
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login?next=/admin/feedback");

  const [list, latest] = await Promise.all([
    supabase.rpc("admin_feedback", { period_days: days }),
    supabase.rpc("latest_feedback_digest"),
  ]);
  if (list.error) notFound();
  const all = (list.data ?? []) as FeedbackItem[];
  const users = all.filter((item) => !item.is_internal);
  const saved = (latest.data ?? null) as SavedDigest | null;
  const digest = saved ? readDigest(saved.digest) : null;
  const classified = new Map((digest?.items ?? []).map((i) => [i.id, i]));
  const stats = ratingStats(users);
  const newSinceDigest = saved
    ? all.filter((item) => item.created_at > saved.created_at).length
    : all.length;

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex gap-2" aria-label="תקופה">
        {reportPeriods.map((period) => (
          <Link
            key={period}
            href={`/admin/feedback?days=${period}`}
            aria-current={period === days ? "page" : undefined}
            className={`rounded-full px-4 py-1 font-bold ${
              period === days ? "bg-blue text-white" : "bg-sky-light"
            }`}
          >
            {period} ימים
          </Link>
        ))}
      </nav>

      <Card className="gap-4">
        <h2 className="text-xl font-extrabold">דירוג האפליקציה</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="הודעות ממשתמשים" value={users.length} />
          <Stat label="עם דירוג" value={stats.rated} />
          <Stat
            label="דירוג ממוצע"
            value={stats.average === null ? "אין" : `${stats.average} / 5`}
          />
          <Stat label="הבדיקות שלך" value={all.length - users.length} />
        </div>
        {stats.rated > 0 && (
          <ul className="flex flex-col gap-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const n = stats.spread[star - 1];
              return (
                <li key={star} className="flex items-center gap-3">
                  <span className="w-8 font-bold">{star}★</span>
                  <span className="bg-line h-3 flex-1 overflow-hidden rounded-full">
                    <span
                      className="bg-blue block h-full rounded-full"
                      style={{ width: `${(n / stats.rated) * 100}%` }}
                    />
                  </span>
                  <span className="w-6 text-end font-bold">{n}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card tone="sky" className="gap-4">
        <h2 className="text-xl font-extrabold">סיכום</h2>
        {digest && saved ? (
          <>
            <p className="text-muted">
              סוכמו {saved.feedback_count} הודעות מ־{saved.period_days} ימים, ב־
              {formatDate(saved.created_at)}.
              {newSinceDigest > 0 &&
                ` מאז הגיעו ${newSinceDigest} הודעות חדשות.`}
            </p>
            <p className="text-lg">{digest.summary}</p>
            <ol className="flex flex-col gap-3">
              {digest.themes.map((theme) => (
                <li
                  key={theme.title}
                  className="flex flex-col gap-1 rounded-2xl bg-white p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold">{theme.title}</span>
                    <Chip tone={priorityTone[theme.priority]}>
                      {priorities[theme.priority]}
                    </Chip>
                    <span className="text-muted text-sm">
                      {feedbackKinds[theme.kind]} · {theme.count} הודעות
                    </span>
                  </div>
                  <p>{theme.suggestion}</p>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p>
            עדיין אין סיכום. הסיכום מקבץ את ההודעות לנושאים, מדרג אותן לפי
            דחיפות ומציע מה לשנות.
          </p>
        )}
        {all.length > 0 && (
          <SummarizeButton days={days} hasDigest={Boolean(digest)} />
        )}
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-extrabold">
          כל ההודעות{digest ? ", לפי דחיפות" : ""}
        </h2>
        {all.length === 0 && (
          <p className="text-muted">אין עדיין משוב בתקופה הזו.</p>
        )}
        {byPriority(all, digest).map((item) => {
          const tag = classified.get(item.id);
          return (
            <Card key={item.id} className="gap-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {tag && (
                  <Chip tone={priorityTone[tag.priority]}>
                    {priorities[tag.priority]} · {feedbackKinds[tag.kind]}
                  </Chip>
                )}
                {item.is_internal && <Chip tone="blue">הבדיקה שלך</Chip>}
                {item.rating && <Stars rating={item.rating} />}
                <span className="text-muted">
                  {formatDate(item.created_at)} · משתמש {item.user_label}
                  {item.page ? ` · ${item.page}` : ""}
                </span>
              </div>
              <p dir="auto" className="text-lg whitespace-pre-line">
                {item.message}
              </p>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white/60 p-4">
      <span className="text-muted text-sm">{label}</span>
      <span className="text-2xl font-extrabold">{value}</span>
    </div>
  );
}
