import type { Metadata } from "next";
import Link from "next/link";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <p className="text-zinc-600 dark:text-zinc-400">
        Signed in as {user.email}.
      </p>
      <div className="flex flex-col gap-2 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">
          {profile ? "Your profile is ready" : "Start with your resume"}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          {profile
            ? "Update your resume details or the roles you are preparing for."
            : "Upload your resume and choose the roles you are preparing for. Interview practice arrives in the next stage."}
        </p>
        <Link href="/profile" className="font-medium underline">
          {profile ? "Edit profile" : "Set up your profile"}
        </Link>
      </div>
    </div>
  );
}
