import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AddressPicker } from "@/components/address-picker";
import { Loading } from "@/components/app-shell";
import { ButtonLink, Card, Chip } from "@/components/ui";
import { getLearningState } from "@/lib/learn/progress";
import { forAddress, lessons } from "@/lib/learn/lessons";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

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

  const [
    { data: profile },
    { count: roleCount },
    { data: sessions },
    learning,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("target_roles").select("id", { count: "exact", head: true }),
    supabase
      .from("sessions")
      .select("overall_score")
      .not("overall_score", "is", null)
      .order("created_at", { ascending: false })
      .limit(50),
    getLearningState(supabase),
  ]);

  const firstName = profile?.full_name?.trim().split(/\s+/)[0];
  const scores = (sessions ?? []).map((s) => s.overall_score as number);
  const latest = scores[0];
  const change = scores.length > 1 ? scores[0] - scores[1] : null;
  const ready = Boolean(profile) && (roleCount ?? 0) > 0;
  const lesson =
    learning.recommended && forAddress(learning.recommended, user.address);

  return (
    <>
      <h1 className="text-3xl font-extrabold sm:text-4xl">
        {firstName ? `היי ${firstName}!` : "היי!"}
      </h1>

      {!user.address && (
        <Card tone="lilac" className="gap-4">
          <h2 className="text-xl font-extrabold">איך לפנות אליך?</h2>
          <p>כדי שהשאלות, המשובים והשיעורים ידברו אליך נכון.</p>
          <AddressPicker current={null} next="/dashboard" />
        </Card>
      )}

      {!ready ? (
        <Card className="gap-5 p-8">
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
          <ButtonLink href="/profile" variant="lime" className="w-fit">
            {profile ? "להוסיף תפקיד" : "להעלות קורות חיים"}
          </ButtonLink>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          <Card tone="violet" className="gap-3 p-7">
            {latest !== undefined ? (
              <>
                <p className="opacity-90">הציון האחרון שלך</p>
                <p
                  dir="ltr"
                  className="text-right text-6xl leading-none font-extrabold"
                >
                  {latest}
                  <span className="text-2xl opacity-80"> / 100</span>
                </p>
                {change !== null && (
                  <p className="text-lime font-bold">
                    {change > 0
                      ? `עלית ${change} נקודות מהפעם הקודמת`
                      : change < 0
                        ? `ירדת ${-change} נקודות. זה חלק מהדרך.`
                        : "בדיוק כמו בפעם הקודמת"}
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
            <ButtonLink href="/practice" variant="lime" className="mt-2">
              להתחיל תרגול
            </ButtonLink>
          </Card>

          <div className="flex flex-col gap-5">
            {lesson ? (
              <Card tone="orange">
                <Chip>השיעור הבא בשבילך</Chip>
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
              <Card tone="lime">
                <h2 className="text-xl font-bold">סיימת את כל השיעורים!</h2>
                <p className="text-muted">אפשר לחזור לכל שיעור ולתרגל שוב.</p>
              </Card>
            )}
            <div className="grid grid-cols-2 gap-5">
              <Stat value={scores.length} label="תרגולים" />
              <Stat
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
          done ? "bg-lime" : "bg-violet-soft text-violet-dark"
        }`}
      >
        {done ? "✓" : number}
      </span>
      <span className={done ? "text-muted line-through" : ""}>{children}</span>
    </li>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <Card className="gap-1">
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-muted">{label}</p>
    </Card>
  );
}
