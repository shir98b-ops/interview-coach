import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard · Interview Coach" };

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Your dashboard</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-zinc-600 underline dark:text-zinc-400"
          >
            Sign out
          </button>
        </form>
      </header>
      <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
        <AccountSummary />
      </Suspense>
    </main>
  );
}

async function AccountSummary() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <p className="text-zinc-600 dark:text-zinc-400">
      Signed in as {user.email}. Resume upload and interview practice arrive in
      the next stages.
    </p>
  );
}
