import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/app-shell";
import { Card, ErrorText } from "@/components/ui";
import { safeNextPath } from "@/lib/auth/redirect";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "כניסה · Interview Coach" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-16">
      <Logo />
      <Card className="gap-5 p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold">כניסה</h1>
          <p className="text-muted text-lg">
            נכנסים עם חשבון גוגל. אין סיסמה חדשה לזכור.
          </p>
        </div>
        <Suspense fallback={<SignInForm next="/dashboard" />}>
          <SignInSection searchParams={searchParams} />
        </Suspense>
      </Card>
      <p className="text-muted text-center text-sm">
        כניסה לאתר היא הסכמה ל
        <Link href="/privacy" className="text-violet font-bold">
          מדיניות הפרטיות
        </Link>
        .
      </p>
    </main>
  );
}

async function SignInSection({
  searchParams,
}: Pick<PageProps<"/login">, "searchParams">) {
  const params = await searchParams;
  const next = safeNextPath(
    typeof params.next === "string" ? params.next : null,
  );
  const failed = params.error === "link" || params.error === "google";
  const notConfigured = params.error === "config";
  const deleted = params.deleted === "1";

  return (
    <>
      {deleted && (
        <p
          role="status"
          className="bg-success-soft text-success-ink rounded-2xl p-4 font-bold"
        >
          החשבון וכל המידע שלו נמחקו.
        </p>
      )}
      {notConfigured && <ErrorText>הכניסה עדיין לא מוגדרת באתר הזה.</ErrorText>}
      {failed && <ErrorText>הכניסה לא הצליחה. אפשר לנסות שוב.</ErrorText>}
      <SignInForm next={next} />
    </>
  );
}
