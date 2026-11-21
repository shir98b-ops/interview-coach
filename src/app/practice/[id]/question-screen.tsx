import Link from "next/link";
import { Chip, Icon } from "@/components/ui";
import { RichText } from "@/components/rich-text";
import { codeLanguages, parseCodeLanguage } from "@/lib/code/languages";
import { roundKind } from "@/lib/interview/progress";
import {
  isCodingKind,
  kindLabels,
  splitKind,
  type QuestionKind,
} from "@/lib/interview/schema";
import { answerTip } from "@/lib/interview/tips";
import { languageFor } from "@/lib/voice/transcript";
import { AnswerForm } from "../forms";

/** The question card's label, such as "שאלה מקצועית". */
const questionLabels: Record<QuestionKind, string> = {
  behavioral: "שאלה התנהגותית",
  role: "שאלה מקצועית",
  resume: "שאלה על הניסיון שלך",
  technical: "שאלת ידע מקצועי",
  design: "ניתוח מקרה",
  coding: "תרגיל קוד",
};

const roundLabels: Record<string, string> = {
  general: "ראיון כללי",
  technical: "ראיון מקצועי",
  design: "ניתוח מקרה",
  coding: "תרגילי קוד",
};

/**
 * One question at a time, filling the screen: a way out, the progress, the
 * question on a deep lavender card, a tip, and the answer.
 */
export function QuestionScreen({
  sessionId,
  questions,
  current,
  number,
  roleTitle,
}: {
  sessionId: string;
  questions: { id: string; kind: string }[];
  current: { id: string; kind: string; text: string };
  number: number;
  roleTitle: string;
}) {
  const { kind: base, codeLanguage } = splitKind(current.kind);
  const coding = isCodingKind(current.kind);
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-5 px-[18px] py-5 sm:px-6 lg:gap-8 lg:px-10 lg:py-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex items-center justify-between gap-3 lg:contents">
          <Link
            href="/practice"
            aria-label="לצאת מהתרגול"
            className="border-line text-ink-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-white transition hover:bg-[#eef1f6]"
          >
            <svg
              aria-hidden
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </Link>
          <p className="text-lg font-black whitespace-nowrap">
            שאלה {number} מתוך {questions.length}
          </p>
          {roleTitle && (
            <span className="border-line max-w-40 truncate rounded-full border-[1.5px] bg-white px-4 py-1.5 text-sm font-black lg:order-last lg:max-w-none">
              <bdi>{roleTitle}</bdi>
              <span className="hidden lg:inline">
                {" "}
                · {roundLabels[roundKind(questions)]}
              </span>
            </span>
          )}
        </div>
        <div className="flex gap-1.5 lg:flex-1" aria-hidden>
          {questions.map((q, i) => (
            <span
              key={q.id}
              className={`h-[7px] flex-1 rounded-full ${i < number ? "bg-ink" : "bg-line"}`}
            />
          ))}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 lg:gap-5">
        <section className="bg-lavender-deep flex flex-col items-start gap-4 rounded-[30px] p-6 lg:px-9 lg:py-8">
          <Chip tone="glass">
            {questionLabels[base as QuestionKind] ??
              kindLabels[base as QuestionKind] ??
              base}
            {coding && codeLanguage
              ? ` · ${codeLanguages[parseCodeLanguage(codeLanguage)]}`
              : ""}
          </Chip>
          {coding ? (
            <>
              <h1 className="sr-only">תרגיל קוד</h1>
              <RichText
                text={current.text}
                className="w-full text-lg leading-relaxed"
              />
            </>
          ) : (
            <h1
              dir="auto"
              className="w-full text-[26px] leading-[1.2] font-black text-[#0b2a5c] lg:text-[36px]"
            >
              {current.text}
            </h1>
          )}
        </section>
        {!coding && (
          <aside className="bg-mint flex items-center gap-4 rounded-[26px] px-5 py-4 lg:px-7">
            <Icon name="bulb" size={44} className="hidden -rotate-8 lg:block" />
            <p className="flex flex-col">
              <b className="font-black">טיפ קטן</b>
              <span className="text-ink-soft">{answerTip(current.kind)}</span>
            </p>
          </aside>
        )}
        <AnswerForm
          key={current.id}
          sessionId={sessionId}
          questionId={current.id}
          isLast={number === questions.length}
          language={languageFor(current.text)}
          kind={current.kind}
        />
      </div>
    </main>
  );
}
