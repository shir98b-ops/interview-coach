import type { Metadata } from "next";
import { formatDate } from "@/lib/format";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { ButtonLink, Card, Chip, PageHeading } from "@/components/ui";
import {
  difficulties,
  parseDifficulty,
  readBrief,
} from "@/lib/take-home/schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { StartTakeHomeForm } from "./forms";

export const metadata: Metadata = { title: "מבחני בית · Interview Coach" };

export default function TakeHomesPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Link href="/learn" className="text-violet w-fit font-medium">
        → ללמידה
      </Link>
      <PageHeading
        title="מבחן בית לתרגול"
        subtitle="משימה מקורית בסגנון של מבחני בית אמיתיים, לפי התפקיד שלך. מגישים בכתב ומקבלים ציון, טיפים ושאלות שכדאי להתכונן אליהן."
      />
      <Suspense fallback={<Loading />}>
        <TakeHomes />
      </Suspense>
    </div>
  );
}

async function TakeHomes() {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login?next=/learn/take-home");

  const [{ data: roles }, { data: takeHomes }] = await Promise.all([
    supabase
      .from("target_roles")
      .select("id, title, seniority")
      .order("created_at"),
    supabase
      .from("take_homes")
      .select("id, difficulty, brief, submission, score, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <>
      {roles?.length ? (
        <Card className="gap-5 p-6 sm:p-8">
          <StartTakeHomeForm roles={roles} />
        </Card>
      ) : (
        <Card className="gap-4 p-8">
          <h2 className="text-2xl font-extrabold">קודם בוחרים תפקיד</h2>
          <p className="text-muted text-lg">
            מבחן הבית נכתב לפי התפקיד שאליו מתכוננים.
          </p>
          <ButtonLink href="/profile" variant="lime" className="w-fit">
            להוסיף תפקיד
          </ButtonLink>
        </Card>
      )}

      {takeHomes && takeHomes.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-extrabold">מבחני הבית שלך</h2>
          <ul className="flex flex-col gap-3">
            {takeHomes.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/learn/take-home/${t.id}`}
                  className="hover:bg-violet-soft flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-[0_6px_20px_rgba(77,40,200,0.06)] transition"
                >
                  <span className="flex flex-col">
                    <span dir="auto" className="font-bold">
                      {readBrief(t.brief)?.title ?? "מבחן בית"}
                    </span>
                    <span className="text-muted text-sm">
                      {difficulties[parseDifficulty(t.difficulty)].label} ·{" "}
                      {formatDate(t.created_at)}
                    </span>
                  </span>
                  {t.score !== null ? (
                    <span className="text-violet text-2xl font-extrabold">
                      {t.score}
                    </span>
                  ) : (
                    <Chip tone={t.submission ? "violet" : "orange"}>
                      {t.submission ? "הוגש" : "בעבודה"}
                    </Chip>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
