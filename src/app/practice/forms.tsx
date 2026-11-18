"use client";

import { useActionState } from "react";
import { MAX_ANSWER_LENGTH, interviewLanguages } from "@/lib/interview/schema";
import {
  retryFeedback,
  startPractice,
  submitAnswer,
  type FormState,
} from "./actions";

const button =
  "rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900";

/** Choose a target role and start a practice interview for it. */
export function StartPracticeForm({
  roles,
}: {
  roles: { id: string; title: string; seniority: string | null }[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    startPractice,
    { error: null },
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      <fieldset className="flex flex-col gap-2" disabled={pending}>
        <legend className="mb-2 font-medium">
          Which role are you practicing for?
        </legend>
        {roles.map((role, index) => (
          <label
            key={role.id}
            className="flex items-center gap-3 rounded-md border border-zinc-200 px-4 py-2 dark:border-zinc-800"
          >
            <input
              type="radio"
              name="roleId"
              value={role.id}
              defaultChecked={index === 0}
              required
            />
            <span>
              {role.title}
              {role.seniority && (
                <span className="text-zinc-500"> · {role.seniority}</span>
              )}
            </span>
          </label>
        ))}
      </fieldset>
      <fieldset className="flex flex-col gap-2" disabled={pending}>
        <legend className="mb-2 font-medium">Interview language</legend>
        <div className="flex gap-3">
          {Object.entries(interviewLanguages).map(([code, name], index) => (
            <label
              key={code}
              className="flex items-center gap-2 rounded-md border border-zinc-200 px-4 py-2 dark:border-zinc-800"
            >
              <input
                type="radio"
                name="language"
                value={code}
                defaultChecked={index === 0}
              />
              <span lang={code}>{code === "he" ? "עברית" : name}</span>
            </label>
          ))}
        </div>
        <p className="text-sm text-zinc-500">
          Questions and feedback will be in this language.
        </p>
      </fieldset>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div>
        <button type="submit" disabled={pending} className={button}>
          {pending
            ? "Preparing your questions, this takes a few seconds..."
            : "Start practice interview"}
        </button>
      </div>
    </form>
  );
}

/** Answer one question in writing. */
export function AnswerForm({
  sessionId,
  questionId,
  isLast,
}: {
  sessionId: string;
  questionId: string;
  isLast: boolean;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    submitAnswer,
    { error: null },
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="questionId" value={questionId} />
      <label htmlFor="answer" className="sr-only">
        Your answer
      </label>
      <textarea
        dir="auto"
        id="answer"
        name="answer"
        required
        rows={10}
        maxLength={MAX_ANSWER_LENGTH}
        placeholder="Write your answer as you would say it in the interview."
        className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div>
        <button type="submit" disabled={pending} className={button}>
          {pending
            ? "Saving..."
            : isLast
              ? "Finish interview"
              : "Next question"}
        </button>
      </div>
    </form>
  );
}

/** Shown when an interview is finished but has no feedback yet. */
export function RetryFeedbackForm({ sessionId }: { sessionId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    retryFeedback,
    { error: null },
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="sessionId" value={sessionId} />
      <p className="text-zinc-600 dark:text-zinc-400">
        Your answers are saved, but we couldn&apos;t score them yet.
      </p>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div>
        <button type="submit" disabled={pending} className={button}>
          {pending
            ? "Scoring your answers, this can take up to a minute..."
            : "Get my feedback"}
        </button>
      </div>
    </form>
  );
}
