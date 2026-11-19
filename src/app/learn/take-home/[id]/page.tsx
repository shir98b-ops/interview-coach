import type { Metadata } from "next";
import { durationLabel } from "@/lib/format";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { ButtonLink, Card, Chip } from "@/components/ui";
import {
  difficulties,
  parseDifficulty,
  readBrief,
  readTakeHomeFeedback,
  takeHomeRubric,
  type TakeHomeFeedback,
} from "@/lib/take-home/schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { SubmitTakeHomeForm } from "../forms";

export const metadata: Metadata = { title: "מבחן בית · Interview Coach" };

export default function TakeHomePage({
  params,
}: PageProps<"/learn/take-home/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Link href="/learn/take-home" className="text-violet w-fit font-medium">
        → לכל מבחני הבית
      </Link>
      <Suspense fallback={<Loading />}>
        <TakeHome params={params} />
      </Suspense>
    </div>
  );
}

async function TakeHome({
  params,
}: Pick<PageProps<"/learn/take-home/[id]">, "params">) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect(`/login?next=/learn/take-home/${id}`);

  // Row level security returns nothing for another user's take-home.
  const { data: takeHome } = await supabase
    .from("take_homes")
    .select("id, difficulty, brief, submission, feedback, score")
    .eq("id", id)
    .maybeSingle();
  const brief = readBrief(takeHome?.brief);
  if (!takeHome || !brief) notFound();

  const difficulty = difficulties[parseDifficulty(takeHome.difficulty)];
  const feedback = readTakeHomeFeedback(takeHome.feedback);

  return (
    <>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Chip tone="violet">מבחן בית · {difficulty.label}</Chip>
          <Chip>זמן מומלץ: {durationLabel(difficulty.minutes)}</Chip>
        </div>
        <h1 dir="auto" className="text-3xl font-extrabold sm:text-4xl">
          {brief.title}
        </h1>
        <p dir="auto" className="text-muted text-lg font-bold">
          {brief.company}
        </p>
      </header>

      <Card className="gap-5 p-6 sm:p-8">
        <p dir="auto" className="text-lg leading-relaxed whitespace-pre-line">
          {brief.context}
        </p>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-extrabold">מה צריך לעשות</h2>
          <ol className="flex flex-col gap-3">
            {brief.tasks.map((task, i) => (
              <li key={i} className="flex gap-3">
                <span className="bg-violet-soft text-violet-dark flex size-8 shrink-0 items-center justify-center rounded-xl font-extrabold">
                  {i + 1}
                </span>
                <span dir="auto" className="text-lg whitespace-pre-line">
                  {task}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-orange-soft rounded-2xl p-4">
          <p className="text-orange-ink font-bold">מה מגישים</p>
          <p dir="auto">{brief.deliverable}</p>
        </div>
      </Card>

      {feedback && takeHome.score !== null ? (
        <>
          <Feedback feedback={feedback} score={takeHome.score} />
          <details className="rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(77,40,200,0.08)]">
            <summary className="cursor-pointer font-bold">ההגשה שלך</summary>
            <p dir="auto" className="mt-3 whitespace-pre-wrap">
              {takeHome.submission}
            </p>
          </details>
          <ButtonLink
            href="/learn/take-home"
            variant="lime"
            className="w-full sm:w-fit"
          >
            למבחן בית נוסף
          </ButtonLink>
        </>
      ) : (
        <Card tone="lilac" className="gap-4 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold">
            {takeHome.submission ? "ההגשה התקבלה" : "ההגשה שלך"}
          </h2>
          <SubmitTakeHomeForm
            id={takeHome.id}
            submitted={Boolean(takeHome.submission)}
          />
        </Card>
      )}
    </>
  );
}

function Feedback({
  feedback,
  score,
}: {
  feedback: TakeHomeFeedback;
  score: number;
}) {
  return (
    <section className="flex flex-col gap-5">
      <Card tone="violet" className="gap-3 p-7">
        <h2 className="text-xl font-bold">הציון שלך</h2>
        <p
          dir="ltr"
          className="text-right text-6xl leading-none font-extrabold"
        >
          {score}
          <span className="text-2xl opacity-80"> / 100</span>
        </p>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {takeHomeRubric.map((r) => (
          <Card key={r.key} className="gap-1 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold">{r.label}</p>
              <p className="text-violet text-2xl font-extrabold">
                {feedback[r.key]}/5
              </p>
            </div>
            <p className="text-muted text-sm">{r.description}</p>
          </Card>
        ))}
      </div>
      {feedback.strengths && (
        <div className="bg-success-soft rounded-2xl p-5">
          <p className="text-success-ink font-bold">מה עבד</p>
          <p dir="auto">{feedback.strengths}</p>
        </div>
      )}
      {feedback.improvements.length > 0 && (
        <div className="bg-orange-soft rounded-2xl p-5">
          <p className="text-orange-ink font-bold">מה לשפר</p>
          <ul className="mt-1 flex list-disc flex-col gap-1 ps-5">
            {feedback.improvements.map((item, i) => (
              <li key={i} dir="auto">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {feedback.interviewQuestions.length > 0 && (
        <div className="bg-violet-soft rounded-2xl p-5">
          <p className="text-violet-dark font-bold">
            שאלות שכדאי להתכונן אליהן בראיון
          </p>
          <ul className="mt-1 flex list-disc flex-col gap-1 ps-5">
            {feedback.interviewQuestions.map((item, i) => (
              <li key={i} dir="auto">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
