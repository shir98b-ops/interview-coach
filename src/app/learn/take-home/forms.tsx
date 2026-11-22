"use client";

import { durationLabel } from "@/lib/format";
import { useActionState, useState } from "react";
import { CodeEditor, CodeLanguageSelect } from "@/components/code-editor";
import { defaultCodeLanguage, type CodeLanguage } from "@/lib/code/languages";
import { isCodingRole } from "@/lib/interview/question-bank";
import { Button, ErrorText, inputStyles } from "@/components/ui";
import { interviewLanguages } from "@/lib/interview/schema";
import {
  MAX_CODE_SUBMISSION_LENGTH,
  MAX_SUBMISSION_LENGTH,
  difficulties,
  type TakeHomeFormat,
} from "@/lib/take-home/schema";
import { startTakeHome, submitTakeHome, type TakeHomeState } from "./actions";

const optionStyles =
  "flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-white px-4 py-3 font-medium transition hover:border-blue has-[:checked]:border-blue has-[:checked]:bg-sky-light";

const languageNames: Record<string, string> = { en: "English", he: "עברית" };

/** Choose a role, difficulty and language, and get a new take-home. */
export function StartTakeHomeForm({
  roles,
}: {
  roles: { id: string; title: string; seniority: string | null }[];
}) {
  const [state, action, pending] = useActionState<TakeHomeState, FormData>(
    startTakeHome,
    { error: null },
  );
  const [roleId, setRoleId] = useState(roles[0]?.id);
  const selected = roles.find((role) => role.id === roleId);
  const coding = selected ? isCodingRole(selected.title) : false;

  return (
    <form action={action} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3" disabled={pending}>
        <legend className="mb-3 text-xl font-extrabold">לאיזה תפקיד?</legend>
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
            <span dir="auto">{role.title}</span>
          </label>
        ))}
      </fieldset>
      {coding && (
        <TakeHomeFormatChoice
          key={roleId}
          disabled={pending}
          codeLanguage={defaultCodeLanguage(selected?.title ?? "")}
        />
      )}
      <fieldset className="flex flex-col gap-3" disabled={pending}>
        <legend className="mb-3 text-xl font-extrabold">רמת קושי</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(difficulties).map(([key, d]) => (
            <label key={key} className={optionStyles}>
              <input
                type="radio"
                name="difficulty"
                value={key}
                defaultChecked={key === "medium"}
                className="accent-blue size-5 shrink-0"
              />
              <span className="flex flex-col">
                <span className="font-bold">{d.label}</span>
                <span className="text-muted text-sm">
                  {durationLabel(d.minutes)}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
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
      </fieldset>
      {state.error && <ErrorText>{state.error}</ErrorText>}
      <Button
        type="submit"
        variant="primary"
        disabled={pending}
        className="w-full sm:w-fit"
      >
        {pending ? "כותב לך מבחן בית, זה לוקח כמה שניות..." : "לקבל מבחן בית"}
      </Button>
    </form>
  );
}

/**
 * For roles that write code: a written take-home, or a coding project in a
 * chosen programming language.
 */
export function TakeHomeFormatChoice({
  disabled,
  codeLanguage,
}: {
  disabled?: boolean;
  codeLanguage: CodeLanguage;
}) {
  const [format, setFormat] = useState<TakeHomeFormat>("code");
  const options: { value: TakeHomeFormat; label: string; hint: string }[] = [
    {
      value: "code",
      label: "פרויקט קוד",
      hint: "דרישות, קוד התחלתי, ובדיקות. מגישים קוד ומקבלים סקירת קוד.",
    },
    {
      value: "document",
      label: "מסמך כתוב",
      hint: "תכנון, ארכיטקטורה ושיקולים, בלי לכתוב קוד מלא.",
    },
  ];
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="mb-3 text-xl font-extrabold">סוג המבחן</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className={`${optionStyles} items-start`}>
            <input
              type="radio"
              name="format"
              value={option.value}
              checked={format === option.value}
              onChange={() => setFormat(option.value)}
              className="accent-blue mt-1 size-5 shrink-0"
            />
            <span className="flex flex-col">
              <span className="font-bold">{option.label}</span>
              <span className="text-muted text-sm font-normal">
                {option.hint}
              </span>
            </span>
          </label>
        ))}
      </div>
      {format === "code" && <CodeLanguageSelect defaultValue={codeLanguage} />}
    </fieldset>
  );
}

/** Write and hand in the submission, or retry scoring a saved one. */
export function SubmitTakeHomeForm({
  id,
  submitted,
  code = false,
}: {
  id: string;
  submitted: boolean;
  /** A coding project, handed in as code. */
  code?: boolean;
}) {
  const [state, action, pending] = useActionState<TakeHomeState, FormData>(
    submitTakeHome,
    { error: null },
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      {submitted ? (
        <p>ההגשה שלך נשמרה, אבל עוד לא הצלחנו לתת לה ציון.</p>
      ) : code ? (
        <>
          <label htmlFor="submission" className="text-muted font-medium">
            הקוד שלך
          </label>
          <CodeEditor
            id="submission"
            name="submission"
            rows={24}
            required
            maxLength={MAX_CODE_SUBMISSION_LENGTH}
            placeholder={
              "// file: main.py\n...\n\n// file: test_main.py\n...\n\n// file: README.md\n..."
            }
          />
          <p className="text-muted text-sm">
            מדביקים את כל הקבצים אחד אחרי השני, עם שורה שמציינת את שם הקובץ לפני
            כל אחד. כדאי לכתוב קודם בעורך הקוד שלך ולהדביק כאן. המקש Tab מזיח
            שורה, ו־Esc ואז Tab יוצאים מהתיבה.
          </p>
        </>
      ) : (
        <>
          <label htmlFor="submission" className="text-muted font-medium">
            ההגשה שלך
          </label>
          <textarea
            dir="auto"
            id="submission"
            name="submission"
            required
            rows={18}
            maxLength={MAX_SUBMISSION_LENGTH}
            placeholder={
              "תקציר:\n\nהנחות:\n\nניתוח:\n\nהמלצות:\n\nאיך נמדוד הצלחה:"
            }
            className={`${inputStyles} min-h-96`}
          />
          <p className="text-muted text-sm">
            טיפ: כדאי לפתוח בתקציר קצר ולכתוב את ההנחות שלך. אפשר לכתוב קודם
            במסמך אחר ולהדביק כאן.
          </p>
        </>
      )}
      {state.error && <ErrorText>{state.error}</ErrorText>}
      <Button
        type="submit"
        variant="primary"
        disabled={pending}
        className="w-full sm:w-fit"
      >
        {pending
          ? "בודק את ההגשה, זה יכול לקחת עד דקה..."
          : submitted
            ? "לקבל משוב"
            : "להגיש ולקבל משוב"}
      </Button>
    </form>
  );
}
