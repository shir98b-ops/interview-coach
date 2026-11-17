import type { Metadata } from "next";
import { Suspense } from "react";
import { safeNextPath } from "@/lib/auth/redirect";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in · Interview Coach" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Use your Google account. No new password to create.
        </p>
      </div>
      <Suspense fallback={<SignInForm next="/dashboard" />}>
        <SignInSection searchParams={searchParams} />
      </Suspense>
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

  return (
    <>
      {failed && (
        <p role="alert" className="text-sm text-red-600">
          Sign-in didn&apos;t complete. Please try again.
        </p>
      )}
      <SignInForm next={next} />
    </>
  );
}
