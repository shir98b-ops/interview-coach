import Link from "next/link";

/** Shown for pages that don't exist, or an interview that isn't yours. */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        This page doesn&apos;t exist, or it belongs to another account.
      </p>
      <Link href="/dashboard" className="w-fit font-medium underline">
        Go to your dashboard
      </Link>
    </main>
  );
}
