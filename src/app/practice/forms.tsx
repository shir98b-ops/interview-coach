"use client";

import { useActionState, useState } from "react";
import { Button, ErrorText } from "@/components/ui";
import { VoiceAnswerField } from "@/components/voice-answer";
import { isTechnicalRole } from "@/lib/interview/question-bank";
import {
  MAX_ANSWER_LENGTH,
  interviewLanguages,
  interviewModes,
  type InterviewMode,
} from "@/lib/interview/schema";
import type { SpeechLanguage } from "@/lib/voice/transcript";
import {
  retryFeedback,
  startPractice,
  submitAnswer,
  type FormState,
} from "./actions";

const optionStyles =
  "flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-white px-4 py-3 font-medium transition hover:border-violet has-[:checked]:border-violet has-[:checked]:bg-violet-soft";

const languageNames: Record<string, string> = { en: "English", he: "עברית" };

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
  const [roleId, setRoleId] = useState(roles[0]?.id);
  const selected = roles.find((role) => role.id === roleId);
  const technical = selected ? isTechnicalRole(selected.title) : false;

  return (
    <form action={action} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3" disabled={pending}>
        <legend className="mb-3 text-xl font-extrabold">
          לאיזה תפקיד מתאמנים?
        </legend>
        {roles.map((role, index) => (
          <label key={role.id} className={optionStyles}>
            <input
              type="radio"
              name="roleId"
              value={role.id}
              defaultChecked={index === 0}
              onChange={() => setRoleId(role.id)}
              required
              className="accent-violet size-5"
            />
            <span dir="auto">
              {role.title}
              {role.seniority && (
                <span className="text-muted"> · {role.seniority}</span>
              )}
            </span>
          </label>
        ))}
      </fieldset>
      {technical && <ModeChoice disabled={pending} />}
      <fieldset className="flex flex-col gap-3" disabled={pending}>
        <legend className="mb-3 text-xl font-extrabold">באיזו שפה?</legend>
        <div className="flex flex-wrap gap-3">
          {Object.keys(interviewLanguages).map((code, index) => (
            <label key={code} className={optionStyles}>
              <input
                type="radio"
                name="language"
                value={code}
                defaultChecked={index === 0}
                className="accent-violet size-5"
              />
              <span lang={code}>{languageNames[code] ?? code}</span>
            </label>
          ))}
        </div>
        <p className="text-muted text-sm">השאלות והמשוב יהיו בשפה הזאת.</p>
      </fieldset>
      {state.error && <ErrorText>{state.error}</ErrorText>}
      <Button
        type="submit"
        variant="lime"
        disabled={pending}
        className="w-full sm:w-fit"
      >
        {pending ? "מכין לך שאלות, זה לוקח כמה שניות..." : "להתחיל תרגול"}
      </Button>
    </form>
  );
}

/** For technical roles: a general, technical or system design interview. */
export function ModeChoice({ disabled }: { disabled?: boolean }) {
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="mb-3 text-xl font-extrabold">איזה סוג ראיון?</legend>
      {(Object.keys(interviewModes) as InterviewMode[]).map((mode, index) => (
        <label key={mode} className={`${optionStyles} items-start`}>
          <input
            type="radio"
            name="mode"
            value={mode}
            defaultChecked={index === 0}
            className="accent-violet mt-1 size-5"
          />
          <span className="flex flex-col">
            <span>{interviewModes[mode].label}</span>
            <span className="text-muted text-sm font-normal">
              {interviewModes[mode].description}
            </span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

/** Answer one question, by typing or by speaking. */
export function AnswerForm({
  sessionId,
  questionId,
  isLast,
  language,
}: {
  sessionId: string;
  questionId: string;
  isLast: boolean;
  language: SpeechLanguage;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    submitAnswer,
    { error: null },
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="questionId" value={questionId} />
      <label htmlFor="answer" className="text-muted font-medium">
        התשובה שלך
      </label>
      <VoiceAnswerField
        id="answer"
        name="answer"
        rows={10}
        maxLength={MAX_ANSWER_LENGTH}
        placeholder="התשובה, כמו שהיית עונה בראיון."
        className="min-h-56"
        language={language}
        disabled={pending}
      />
      <p className="text-muted text-sm">
        טיפ: מצב, משימה, פעולה ותוצאה. ככה קל לעקוב אחרי הסיפור שלך.
      </p>
      {state.error && <ErrorText>{state.error}</ErrorText>}
      <Button type="submit" disabled={pending} className="w-full sm:w-fit">
        {pending
          ? isLast
            ? "בודק את התשובות שלך, זה יכול לקחת עד דקה..."
            : "שומר..."
          : isLast
            ? "לסיים ולקבל ציון"
            : "לשאלה הבאה"}
      </Button>
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
      <p>התשובות שלך נשמרו, אבל עוד לא הצלחנו לתת להן ציון.</p>
      {state.error && <ErrorText>{state.error}</ErrorText>}
      <Button type="submit" variant="lime" disabled={pending} className="w-fit">
        {pending ? "בודק את התשובות שלך, זה יכול לקחת עד דקה..." : "לקבל משוב"}
      </Button>
    </form>
  );
}
