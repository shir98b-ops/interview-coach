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
          We&apos;ll email you a link. No password needed.
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
  const failed = params.error === "link";

  return (
    <>
      {failed && (
        <p role="alert" className="text-sm text-red-600">
          That link has expired or was already used. Request a new one.
        </p>
      )}
      <SignInForm next={next} />
    </>
  );
}
