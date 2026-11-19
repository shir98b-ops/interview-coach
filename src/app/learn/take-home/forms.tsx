"use client";

import { durationLabel } from "@/lib/format";
import { useActionState } from "react";
import { Button, ErrorText, inputStyles } from "@/components/ui";
import { interviewLanguages } from "@/lib/interview/schema";
import { MAX_SUBMISSION_LENGTH, difficulties } from "@/lib/take-home/schema";
import { startTakeHome, submitTakeHome, type TakeHomeState } from "./actions";

const optionStyles =
  "flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-white px-4 py-3 font-medium transition hover:border-violet has-[:checked]:border-violet has-[:checked]:bg-violet-soft";

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
              required
              className="accent-violet size-5 shrink-0"
            />
            <span dir="auto">{role.title}</span>
          </label>
        ))}
      </fieldset>
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
                className="accent-violet size-5 shrink-0"
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
                className="accent-violet size-5 shrink-0"
              />
              <span lang={code}>{languageNames[code] ?? code}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {state.error && <ErrorText>{state.error}</ErrorText>}
      <Button
        type="submit"
        variant="lime"
        disabled={pending}
        className="w-full sm:w-fit"
      >
        {pending ? "כותב לך מבחן בית, זה לוקח כמה שניות..." : "לקבל מבחן בית"}
      </Button>
    </form>
  );
}

/** Write and hand in the submission, or retry scoring a saved one. */
export function SubmitTakeHomeForm({
  id,
  submitted,
}: {
  id: string;
  submitted: boolean;
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
        variant="lime"
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
