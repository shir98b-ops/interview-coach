import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/app-shell";
import { ButtonLink, Card, Chip, StepBar, tileTones } from "@/components/ui";
import {
  answerAverage,
  readFeedback,
  rubric,
  type AnswerFeedback,
  type RubricKey,
} from "@/lib/interview/feedback";
import { RichText } from "@/components/rich-text";
import { codeLanguages, parseCodeLanguage } from "@/lib/code/languages";
import {
  isCodingKind,
  kindLabels,
  splitKind,
  type QuestionKind,
} from "@/lib/interview/schema";
import { seniorityLabel } from "@/lib/format";
import { forAddress, recommendLesson } from "@/lib/learn/lessons";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { languageFor } from "@/lib/voice/transcript";
import { AnswerForm, RetryFeedbackForm } from "../forms";

export const metadata: Metadata = { title: "תרגול · Interview Coach" };

export default function SessionPage({ params }: PageProps<"/practice/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Link href="/practice" className="text-blue w-fit font-medium">
        → לכל התרגולים
      </Link>
      <Suspense fallback={<Loading />}>
        <SessionContent params={params} />
      </Suspense>
    </div>
  );
}

interface Question {
  id: string;
  position: number;
  kind: string;
  text: string;
  answers: SavedAnswer[] | SavedAnswer | null;
}

interface SavedAnswer {
  text: string;
  scores: unknown;
}

function savedAnswer(question: Question): SavedAnswer | null {
  const answers = question.answers;
  if (Array.isArray(answers)) return answers[0] ?? null;
  return answers;
}

function answerText(question: Question): string | null {
  return savedAnswer(question)?.text ?? null;
}

function kindLabel(kind: string): string {
  const { kind: base, codeLanguage } = splitKind(kind);
  const label = kindLabels[base as QuestionKind] ?? base;
  return codeLanguage
    ? `${label} · ${codeLanguages[parseCodeLanguage(codeLanguage)]}`
    : label;
}

/** For coding answers, the rubric scores correctness, efficiency and code. */
const codingLabels: Record<RubricKey, string> = {
  content: "נכונות",
  structure: "יעילות",
  clarity: "איכות קוד",
};

const codingDescriptions: Record<RubricKey, string> = {
  content: "הקוד פותר את הבעיה כמו שהיא מנוסחת, כולל מקרי קצה.",
  structure: "גישה ומבנה נתונים מתאימים, וסיבוכיות שמתאימה לרמת התפקיד.",
  clarity: "שמות ברורים, קוד פשוט לקריאה, ושימוש נכון בשפה.",
};

async function SessionContent({
  params,
}: Pick<PageProps<"/practice/[id]">, "params">) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect(`/login?next=/practice/${id}`);

  // Row level security returns nothing for another user's interview.
  const [{ data: session }, { data: rows }, { data: attempts }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select(
          "id, overall_score, target_roles(title, seniority), jobs(title, company)",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("questions")
        .select("id, position, kind, text, answers(text, scores)")
        .eq("session_id", id)
        .order("position"),
      supabase.from("lesson_attempts").select("lesson_slug"),
    ]);
  if (!session || !rows?.length) notFound();

  const questions = rows as Question[];
  const role = session.target_roles as unknown as {
    title: string;
    seniority: string | null;
  } | null;
  const job = session.jobs as unknown as {
    title: string;
    company: string;
  } | null;
  const roleName = job
    ? `${job.title} · ${job.company}`
    : role
      ? `${role.title}${role.seniority ? ` · ${seniorityLabel(role.seniority)}` : ""}`
      : "תפקיד שנמחק";
  const current = questions.find((q) => answerText(q) === null);

  if (current) {
    const number = questions.indexOf(current) + 1;
    return (
      <section className="flex flex-col gap-5">
        <StepBar total={questions.length} done={number - 1} />
        <div className="flex flex-wrap items-center gap-2">
          <Chip>
            שאלה {number} מתוך {questions.length} · {kindLabel(current.kind)}
          </Chip>
          <span dir="auto" className="text-muted text-sm">
            {roleName}
          </span>
        </div>
        {isCodingKind(current.kind) ? (
          <>
            <h1 className="sr-only">תרגיל קוד</h1>
            <Card tone="question" className="text-lg leading-relaxed">
              <RichText text={current.text} />
            </Card>
          </>
        ) : (
          <h1
            dir="auto"
            className="text-2xl leading-snug font-bold sm:text-3xl"
          >
            {current.text}
          </h1>
        )}
        <AnswerForm
          key={current.id}
          sessionId={session.id}
          questionId={current.id}
          isLast={number === questions.length}
          language={languageFor(current.text)}
          kind={current.kind}
        />
      </section>
    );
  }

  const feedback = questions.map((q) => readFeedback(savedAnswer(q)?.scores));
  const hasCoding = questions.some((q) => isCodingKind(q.kind));
  const hasSpoken = questions.some((q) => !isCodingKind(q.kind));
  const scored = feedback.every(Boolean);
  const recommended = scored
    ? recommendLesson(
        feedback.filter(
          (f, i) => f !== null && !isCodingKind(questions[i].kind),
        ) as AnswerFeedback[],
        (attempts ?? []).map((a) => a.lesson_slug as string),
        {
          professional: questions.some(
            (q) => q.kind === "technical" || q.kind === "design",
          ),
        },
      )
    : undefined;
  const lesson = recommended && forAddress(recommended, user.address);

  return (
    <section className="flex flex-col gap-8">
      {scored && session.overall_score !== null ? (
        <Card tone="blue" className="gap-3 p-7">
          <p dir="auto" className="opacity-90">
            {roleName}
          </p>
          <h1 className="text-xl font-bold">הציון שלך בתרגול</h1>
          <p
            dir="ltr"
            className="text-right text-6xl leading-none font-extrabold"
          >
            {session.overall_score}
            <span className="text-2xl opacity-80"> / 100</span>
          </p>
          <p className="opacity-90">
            כל תשובה מקבלת ציון מ־1 עד 5 על שלושה מדדים. הטיפים למטה, ותרגול
            נוסף יראה את ההתקדמות.
          </p>
        </Card>
      ) : (
        <Card tone="blue">
          <h1 className="text-2xl font-extrabold">התרגול הסתיים</h1>
          <RetryFeedbackForm sessionId={session.id} />
        </Card>
      )}

      {lesson && (
        <Card tone="pink">
          <Chip>כדאי ללמוד עכשיו</Chip>
          <h2 className="text-xl font-bold">{lesson.title}</h2>
          <p className="text-muted">
            {lesson.minutes} דקות · {lesson.summary}
          </p>
          <ButtonLink
            href={`/learn/${lesson.slug}`}
            variant="quiet"
            className="w-fit"
          >
            לשיעור
          </ButtonLink>
        </Card>
      )}

      <details className="rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(77,40,200,0.08)]">
        <summary className="cursor-pointer font-bold">
          איך נותנים ציון לתשובות?
        </summary>
        <ul className="text-muted mt-3 flex flex-col gap-2">
          {hasSpoken &&
            rubric.map((r) => (
              <li key={r.key}>
                <span className="text-ink font-bold">{r.label}:</span>{" "}
                {r.description}
              </li>
            ))}
          {hasCoding &&
            rubric.map((r) => (
              <li key={`code-${r.key}`}>
                <span className="text-ink font-bold">
                  {codingLabels[r.key]}
                  {hasSpoken ? " (בתרגילי קוד)" : ""}:
                </span>{" "}
                {codingDescriptions[r.key]}
              </li>
            ))}
          <li>1 = חסר, 3 = סביר אבל כללי, 5 = מוכן לראיון אמיתי.</li>
        </ul>
      </details>

      <ol className="flex flex-col gap-6">
        {questions.map((q, index) => (
          <li key={q.id}>
            <Card tone={tileTones[index % 4]} className="gap-4">
              <Chip tone="glass">
                שאלה {index + 1} · {kindLabel(q.kind)}
              </Chip>
              {isCodingKind(q.kind) ? (
                <>
                  <details>
                    <summary className="cursor-pointer text-lg font-bold">
                      הבעיה
                    </summary>
                    <RichText text={q.text} className="mt-3" />
                  </details>
                  <RichText
                    text={answerText(q) ?? ""}
                    className="bg-canvas rounded-2xl p-4"
                  />
                </>
              ) : (
                <>
                  <h2 dir="auto" className="text-lg font-bold">
                    {q.text}
                  </h2>
                  <p
                    dir="auto"
                    className="bg-canvas rounded-2xl p-4 whitespace-pre-wrap"
                  >
                    {answerText(q)}
                  </p>
                </>
              )}
              {feedback[index] && (
                <FeedbackDetails
                  feedback={feedback[index]}
                  coding={isCodingKind(q.kind)}
                />
              )}
            </Card>
          </li>
        ))}
      </ol>
      <ButtonLink
        href="/practice"
        variant="primary"
        className="w-full sm:w-fit"
      >
        לתרגול נוסף
      </ButtonLink>
    </section>
  );
}

function FeedbackDetails({
  feedback,
  coding,
}: {
  feedback: AnswerFeedback;
  coding: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {rubric.map((r) => (
          <Chip key={r.key} tone="blue">
            {coding ? codingLabels[r.key] : r.label} {feedback[r.key]}/5
          </Chip>
        ))}
        <Chip tone="mint">ממוצע {answerAverage(feedback).toFixed(1)}</Chip>
      </div>
      {feedback.strengths && (
        <div className="bg-success-soft rounded-2xl p-4">
          <p className="text-success-ink font-bold">מה עבד</p>
          <p dir="auto">{feedback.strengths}</p>
        </div>
      )}
      {feedback.improvements && (
        <div className="bg-pink-soft rounded-2xl p-4">
          <p className="text-pink-ink font-bold">מה לשפר</p>
          {coding ? (
            <RichText text={feedback.improvements} />
          ) : (
            <p dir="auto">{feedback.improvements}</p>
          )}
        </div>
      )}
      {feedback.betterAnswer && (
        <details className="bg-sky-soft rounded-2xl p-4">
          <summary className="text-blue-dark cursor-pointer font-bold">
            {coding ? "פתרון לדוגמה" : "ככה יכולה להישמע תשובה חזקה יותר"}
          </summary>
          {coding ? (
            <RichText text={feedback.betterAnswer} className="mt-2" />
          ) : (
            <p dir="auto" className="mt-2 whitespace-pre-wrap">
              {feedback.betterAnswer}
            </p>
          )}
        </details>
      )}
    </div>
  );
}
