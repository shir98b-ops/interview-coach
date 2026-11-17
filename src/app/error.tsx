"use client";

/** Shown when a page fails to load, instead of the default error screen. */
export default function AppError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        This page couldn&apos;t load. Please try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Try again
      </button>
    </main>
  );
}
