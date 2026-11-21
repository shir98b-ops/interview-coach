"use client";

import { useActionState, useState } from "react";
import { Button, ErrorText, inputStyles } from "@/components/ui";
import { VoiceAnswerField } from "@/components/voice-answer";
import { seniorityLabel } from "@/lib/format";
import { CodeEditor, CodeLanguageSelect } from "@/components/code-editor";
import {
  codeLanguages,
  defaultCodeLanguage,
  parseCodeLanguage,
  type CodeLanguage,
} from "@/lib/code/languages";
import { isCodingRole, isTechnicalRole } from "@/lib/interview/question-bank";
import {
  MAX_ANSWER_LENGTH,
  MAX_CODE_ANSWER_LENGTH,
  splitKind,
  interviewLanguages,
  interviewModes,
  modeLabel,
  organizationTypes,
  type InterviewMode,
  type OrganizationType,
} from "@/lib/interview/schema";
import type { SpeechLanguage } from "@/lib/voice/transcript";
import {
  retryFeedback,
  startPractice,
  submitAnswer,
  type FormState,
} from "./actions";

const optionStyles =
  "flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-white px-4 py-3 font-medium transition hover:border-blue has-[:checked]:border-blue has-[:checked]:bg-sky-soft";

const languageNames: Record<string, string> = { en: "English", he: "עברית" };

/** Choose a target role and start a practice interview for it. */
export function StartPracticeForm({
  roles,
  defaultMode = "general",
}: {
  roles: { id: string; title: string; seniority: string | null }[];
  /** The kind of interview to preselect, from the home's next step. */
  defaultMode?: InterviewMode;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    startPractice,
    { error: null },
  );
  const [roleId, setRoleId] = useState(roles[0]?.id);
  const selected = roles.find((role) => role.id === roleId);
  const technical = selected ? isTechnicalRole(selected.title) : false;
  const coding = selected ? isCodingRole(selected.title) : false;

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
              className="accent-blue size-5 shrink-0"
            />
            <span dir="auto">
              {role.title}
              {role.seniority && (
                <span className="text-muted">
                  {" "}
                  · {seniorityLabel(role.seniority)}
                </span>
              )}
            </span>
          </label>
        ))}
      </fieldset>
      <ModeChoice
        disabled={pending}
        technical={technical}
        coding={coding}
        codeLanguage={defaultCodeLanguage(selected?.title ?? "")}
        defaultMode={defaultMode}
      />
      <label className="flex flex-col gap-2">
        <span className="text-xl font-extrabold">באיזה סוג ארגון?</span>
        <select
          name="organization"
          defaultValue="any"
          disabled={pending}
          className={`${inputStyles} sm:w-80`}
        >
          {(Object.keys(organizationTypes) as OrganizationType[]).map(
            (type) => (
              <option key={type} value={type}>
                {organizationTypes[type].label}
              </option>
            ),
          )}
        </select>
        <span className="text-muted text-sm">
          השאלות והתרחישים יתאימו לסוג הארגון. רמת הקושי נקבעת לפי הבכירות של
          התפקיד.
        </span>
      </label>
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
                className="accent-blue size-5 shrink-0"
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
        variant="primary"
        disabled={pending}
        className="w-full sm:w-fit"
      >
        {pending ? "מכין לך שאלות, זה לוקח כמה שניות..." : "להתחיל תרגול"}
      </Button>
    </form>
  );
}

/**
 * A general, professional or case interview, for every profession, and a
 * coding round for roles that write code.
 */
export function ModeChoice({
  disabled,
  technical,
  coding,
  codeLanguage,
  defaultMode = "general",
}: {
  disabled?: boolean;
  technical: boolean;
  coding: boolean;
  codeLanguage: CodeLanguage;
  defaultMode?: InterviewMode;
}) {
  const [chosen, setChosen] = useState<InterviewMode>(defaultMode);
  const modes = (Object.keys(interviewModes) as InterviewMode[]).filter(
    (mode) => mode !== "coding" || coding,
  );
  const mode = modes.includes(chosen) ? chosen : "general";
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="mb-3 text-xl font-extrabold">איזה סוג ראיון?</legend>
      {modes.map((option) => (
        <label key={option} className={`${optionStyles} items-start`}>
          <input
            type="radio"
            name="mode"
            value={option}
            checked={mode === option}
            onChange={() => setChosen(option)}
            className="accent-blue mt-1 size-5 shrink-0"
          />
          <span className="flex flex-col">
            <span>{modeLabel(option, technical)}</span>
            <span className="text-muted text-sm font-normal">
              {option === "case" && technical
                ? "בעיית תכנון אחת, שלב אחרי שלב, כמו בראיון אמיתי."
                : interviewModes[option].description}
            </span>
          </span>
        </label>
      ))}
      {mode === "coding" && (
        <CodeLanguageSelect key={codeLanguage} defaultValue={codeLanguage} />
      )}
    </fieldset>
  );
}

/** A short tip under the answer box, matching the kind of question. */

/** Answer one question, by typing or by speaking. */
export function AnswerForm({
  sessionId,
  questionId,
  isLast,
  language,
  kind,
}: {
  sessionId: string;
  questionId: string;
  isLast: boolean;
  language: SpeechLanguage;
  /** The question's kind: coding questions get a code box. */
  kind: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    submitAnswer,
    { error: null },
  );
  const { kind: base, codeLanguage } = splitKind(kind);
  const coding = base === "coding" ? { codeLanguage } : null;
  const submit = (
    <Button type="submit" disabled={pending} className="w-full sm:w-fit">
      {pending
        ? isLast
          ? "בודק את התשובות שלך, זה יכול לקחת עד דקה..."
          : "שומר..."
        : isLast
          ? "לסיים ולקבל ציון"
          : "לשאלה הבאה"}
    </Button>
  );

  return (
    <form action={action} className="flex flex-1 flex-col gap-3">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="questionId" value={questionId} />
      {coding ? (
        <CodeAnswerFields
          language={parseCodeLanguage(coding.codeLanguage)}
          speech={language}
          disabled={pending}
        />
      ) : (
        <>
          <label htmlFor="answer" className="sr-only">
            התשובה שלך
          </label>
          <VoiceAnswerField
            id="answer"
            name="answer"
            rows={8}
            maxLength={MAX_ANSWER_LENGTH}
            placeholder="התשובה, כמו שהיית עונה בראיון."
            className="min-h-48"
            language={language}
            disabled={pending}
            variant="hero"
            footer={
              <>
                {state.error && <ErrorText>{state.error}</ErrorText>}
                {submit}
              </>
            }
          />
        </>
      )}
      {coding && (
        <>
          {state.error && <ErrorText>{state.error}</ErrorText>}
          {submit}
        </>
      )}
    </form>
  );
}

/**
 * The answer to a coding problem: the code, in a code box, and an optional
 * short explanation of the approach, typed or spoken.
 */
function CodeAnswerFields({
  language,
  speech,
  disabled,
}: {
  language: CodeLanguage;
  speech: SpeechLanguage;
  disabled: boolean;
}) {
  return (
    <>
      <CodeLanguageSelect defaultValue={language} disabled={disabled} />
      <label htmlFor="code" className="text-muted font-medium">
        הקוד שלך
      </label>
      <CodeEditor
        id="code"
        name="code"
        rows={16}
        required
        maxLength={MAX_CODE_ANSWER_LENGTH - 2000}
        placeholder={`// ${codeLanguages[language]}`}
      />
      <p className="text-muted text-sm">
        המקש Tab מזיח שורה פנימה. כדי לצאת מהתיבה עם Tab, לוחצים קודם על Esc.
      </p>
      <label htmlFor="explanation" className="text-muted font-medium">
        הסבר קצר על הגישה (לא חובה)
      </label>
      <VoiceAnswerField
        id="explanation"
        name="explanation"
        rows={4}
        maxLength={2000}
        placeholder="איך חשבת על הפתרון, ומה הסיבוכיות שלו."
        language={speech}
        disabled={disabled}
        required={false}
      />
      <p className="text-muted text-sm">
        טיפ: כמו בראיון אמיתי, כדאי לבדוק את הקוד על הדוגמאות ועל מקרי קצה לפני
        ששולחים.
      </p>
    </>
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
      <Button
        type="submit"
        variant="primary"
        disabled={pending}
        className="w-fit"
      >
        {pending ? "בודק את התשובות שלך, זה יכול לקחת עד דקה..." : "לקבל משוב"}
      </Button>
    </form>
  );
}
