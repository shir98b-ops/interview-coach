import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AddressPicker } from "@/components/address-picker";
import { AccountLinks, Loading } from "@/components/app-shell";
import {
  Button,
  ButtonLink,
  Card,
  PageHeading,
  inputStyles,
} from "@/components/ui";
import { seniorityLabel, seniorityLevels } from "@/lib/format";
import type { ResumeData } from "@/lib/resume/schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { addTargetRole, removeTargetRole } from "./actions";
import { DeleteAccount } from "./delete-account";
import { ResumeFlow } from "./resume-flow";

export const metadata: Metadata = { title: "פרופיל · Interview Coach" };

export default function ProfilePage({ searchParams }: PageProps<"/profile">) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeading
        title="הפרופיל שלי"
        subtitle="קורות החיים והתפקידים שלך. מהם נבנות השאלות בתרגול."
      />
      <Suspense fallback={<Loading />}>
        <ProfileContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ProfileContent({
  searchParams,
}: Pick<PageProps<"/profile">, "searchParams">) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login?next=/profile");

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("resume_data, updated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("target_roles")
      .select("id, title, seniority")
      .order("created_at"),
  ]);
  const resume = (profile?.resume_data ?? null) as ResumeData | null;

  return (
    <>
      {saved && (
        <p role="status" className="bg-mint text-ink rounded-2xl p-4 font-bold">
          הפרופיל נשמר.
        </p>
      )}

      <Card className="gap-4 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold">איך לפנות אליך?</h2>
          <p className="text-muted">
            בעברית, שאלות, משובים ושיעורים משתנים לפי לשון הפנייה. אפשר לשנות
            בכל רגע.
          </p>
        </div>
        <AddressPicker current={user.address} next="/profile" />
      </Card>

      <Card tone="sky" className="gap-5 p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold">קורות חיים</h2>
        {resume && <ResumeSummary resume={resume} />}
        <ResumeFlow hasProfile={Boolean(resume)} />
      </Card>

      {resume && (
        <Card tone="pink" className="gap-3 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold">
            כמה חזקים קורות החיים שלך?
          </h2>
          <p className="text-lg">
            מקבלים ציון מתוך 100 לפי התפקיד, ושורות מוכנות לשכתוב.
          </p>
          <ButtonLink href="/profile/review" className="w-full sm:w-fit">
            לדרג את קורות החיים
          </ButtonLink>
        </Card>
      )}

      <Card tone="mint" className="gap-5 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold">התפקידים שלי</h2>
          <p className="text-muted">
            התפקידים שאליהם מתכוננים. השאלות בתרגול יותאמו אליהם.
          </p>
        </div>
        {roles && roles.length > 0 && (
          <ul className="flex flex-col gap-2">
            {roles.map((role) => (
              <li
                key={role.id}
                className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
              >
                <span className="font-bold">
                  <span dir="auto">{role.title}</span>
                  {role.seniority && (
                    <span className="text-muted font-normal">
                      {" "}
                      · {seniorityLabel(role.seniority)}
                    </span>
                  )}
                </span>
                <form action={removeTargetRole}>
                  <input type="hidden" name="id" value={role.id} />
                  <button
                    type="submit"
                    className="text-blue hover:text-ink text-sm font-bold"
                  >
                    הסרה
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <form
          action={addTargetRole}
          className="grid gap-3 sm:grid-cols-[1fr_10rem_auto]"
        >
          <input
            name="title"
            required
            maxLength={120}
            dir="auto"
            placeholder="למשל: מנהל מוצר"
            aria-label="שם התפקיד"
            className={inputStyles}
          />
          <select name="seniority" aria-label="דרגה" className={inputStyles}>
            <option value="">כל דרגה</option>
            {seniorityLevels.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} ({s.years})
              </option>
            ))}
          </select>
          <Button type="submit">להוסיף</Button>
        </form>
      </Card>

      <Card className="ring-danger/30 gap-4 p-6 ring-2 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold">מחיקת החשבון</h2>
          <p className="text-muted">
            נמחקים לצמיתות קורות החיים, התפקידים, המשרות והראיונות, התרגולים,
            התשובות והציונים. אי אפשר לשחזר אותם אחר כך.
          </p>
        </div>
        <DeleteAccount />
      </Card>

      <section aria-label="חשבון" className="lg:hidden">
        <AccountLinks />
      </section>
    </>
  );
}

function ResumeSummary({ resume }: { resume: ResumeData }) {
  return (
    <div className="bg-canvas flex flex-col gap-2 rounded-2xl p-4">
      <p dir="auto" className="font-bold">
        {resume.fullName || "ללא שם"}
        {resume.headline && (
          <span className="text-muted font-normal"> · {resume.headline}</span>
        )}
      </p>
      {resume.summary && (
        <p dir="auto" className="text-muted">
          {resume.summary}
        </p>
      )}
      <p className="text-muted text-sm">
        {resume.experience.length} תפקידים · {resume.education.length} תארים ·{" "}
        {resume.skills.length} כישורים
      </p>
    </div>
  );
}
