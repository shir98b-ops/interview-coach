import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { Card, PageHeading } from "@/components/ui";
import {
  actionLabels,
  eventLabels,
  parsePeriod,
  reportPeriods,
  usd,
  type AnalyticsReport,
} from "@/lib/analytics/report";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { CopyReport } from "./copy-button";

export const metadata: Metadata = { title: "נתוני שימוש · Interview Coach" };

/**
 * The owner's view of usage and AI cost. Only accounts listed in
 * analytics_admins get an answer from the database; everyone else sees 404.
 */
export default function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <PageHeading
        title="נתוני שימוש ועלויות"
        subtitle="סיכומים בלבד, בלי תוכן של משתמשים. הבדיקות שלך לא נספרות."
      />
      <Suspense fallback={<Loading />}>
        <Report searchParams={searchParams} />
      </Suspense>
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

function Counts({
  rows,
}: {
  rows: { label: string; value: string | number }[];
}) {
  if (!rows.length) return <p className="text-muted">אין עדיין נתונים.</p>;
  return (
    <ul className="flex flex-col gap-1 text-lg">
      {rows.map((row) => (
        <li key={row.label} className="flex justify-between gap-4">
          <span>{row.label}</span>
          <span className="font-bold">{row.value}</span>
        </li>
      ))}
    </ul>
  );
}

async function Report({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const days = parsePeriod((await searchParams).days);
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login?next=/admin/insights");

  const { data, error } = await supabase.rpc("analytics_report", {
    period_days: days,
  });
  if (error || !data) notFound();
  const report = data as AnalyticsReport;
  const devices: Record<string, string> = {
    phone: "טלפון",
    tablet: "טאבלט",
    desktop: "מחשב",
    unknown: "לא ידוע",
  };
  const methods: Record<string, string> = {
    voice: "בדיבור",
    text: "בהקלדה",
    code: "בקוד",
  };

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex gap-2" aria-label="תקופה">
        {reportPeriods.map((period) => (
          <Link
            key={period}
            href={`/admin/insights?days=${period}`}
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
        <h2 className="text-xl font-extrabold">משתמשים</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="פעילים בתקופה" value={report.users.active_in_period} />
          <Stat label="חדשים בתקופה" value={report.users.new_in_period} />
          <Stat
            label="חזרו אחרי שבוע"
            value={report.users.came_back_after_7_days}
          />
          <Stat
            label="פעילים ב־3 ימים ומעלה"
            value={report.users.active_on_3_or_more_days}
          />
        </div>
      </Card>

      <Card className="gap-4">
        <h2 className="text-xl font-extrabold">עלות הבינה המלאכותית</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="סך הכול" value={usd(report.ai_cost.total_usd)} />
          <Stat label="קריאות" value={report.ai_cost.calls} />
          <Stat
            label="חציון למשתמש"
            value={usd(report.ai_cost.median_user_usd)}
          />
          <Stat
            label="המשתמש הכבד ביותר"
            value={usd(report.ai_cost.heaviest_user_usd)}
          />
        </div>
        <Counts
          rows={report.ai_cost_by_action.map((row) => ({
            label: `${actionLabels[row.action] ?? row.action} (${row.calls} פעמים, ${usd(row.avg_cost_usd)} בממוצע)`,
            value: usd(row.total_usd),
          }))}
        />
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card tone="sky">
          <h2 className="text-xl font-extrabold">פעולות</h2>
          <Counts
            rows={Object.entries(report.events)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([name, e]) => ({
                label: `${eventLabels[name] ?? name} (${e.users} משתמשים)`,
                value: e.count,
              }))}
          />
        </Card>
        <div className="flex flex-col gap-6">
          <Card tone="sky">
            <h2 className="text-xl font-extrabold">איך עונים</h2>
            <Counts
              rows={Object.entries(report.answer_methods).map(([m, n]) => ({
                label: methods[m] ?? m,
                value: n,
              }))}
            />
          </Card>
          <Card tone="mint">
            <h2 className="text-xl font-extrabold">משתמשים לפי מכשיר</h2>
            <Counts
              rows={Object.entries(report.users_by_device).map(([d, n]) => ({
                label: devices[d] ?? d,
                value: n,
              }))}
            />
          </Card>
          <Card tone="pink">
            <h2 className="text-xl font-extrabold">הגעה למגבלה היומית</h2>
            <Counts
              rows={Object.entries(report.daily_limit_hits).map(([f, l]) => ({
                label: `${f} (${l.users} משתמשים)`,
                value: l.count,
              }))}
            />
          </Card>
        </div>
      </div>

      <Card tone="sky" className="gap-4">
        <p className="text-lg">
          הבדיקות שלך בתקופה: {report.owner_tests.events} פעולות,{" "}
          {report.owner_tests.ai_calls} קריאות, בעלות של{" "}
          {usd(report.owner_tests.ai_cost_usd)}. הן לא נכללות במספרים למעלה.
        </p>
        <p className="text-muted">
          לסיכום מעמיק: להעתיק את הנתונים ולהדביק אותם בשיחה עם Claude.
        </p>
        <CopyReport text={JSON.stringify(report, null, 2)} />
      </Card>
    </div>
  );
}
