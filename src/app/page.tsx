import { currentStage, roadmap, type Stage } from "@/lib/roadmap";

const statusLabel: Record<Stage["status"], string> = {
  done: "Done",
  "in-progress": "In progress",
  planned: "Planned",
};

export default function Home() {
  const current = currentStage();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          Interview Coach
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Practice job interviews on your own: upload your resume, pick a target
          role, answer realistic questions and get scored feedback.
        </p>
        {current && (
          <p className="text-sm text-zinc-500">
            Now building stage {current.number}: {current.title}
          </p>
        )}
      </header>

      <section
        aria-labelledby="roadmap-heading"
        className="flex flex-col gap-4"
      >
        <h2 id="roadmap-heading" className="text-xl font-semibold">
          Roadmap
        </h2>
        <ol className="flex flex-col gap-3">
          {roadmap.map((stage) => (
            <li
              key={stage.number}
              className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">
                  {stage.number}. {stage.title}
                  {stage.mvp && (
                    <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      MVP
                    </span>
                  )}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {stage.summary}
                </span>
              </div>
              <span className="shrink-0 text-sm text-zinc-500">
                {statusLabel[stage.status]}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
