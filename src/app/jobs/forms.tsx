"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Button, ErrorText, inputStyles } from "@/components/ui";
import { startPractice } from "@/app/practice/actions";
import { interviewLanguages } from "@/lib/interview/schema";
import { MAX_PASTE_LENGTH } from "@/lib/jobs/extract-schema";
import { MAX_IMPORT_BYTES, importFileText } from "@/lib/jobs/linkedin-import";
import { MAX_DESCRIPTION_LENGTH } from "@/lib/jobs/prep-schema";
import { durations, interviewKinds, jobStatuses } from "@/lib/jobs/schema";
import {
  addInterview,
  addJob,
  createPrepPlan,
  importLinkedInJobs,
  type ImportState,
  saveDescription,
  type JobFormState,
} from "./actions";

const initial: JobFormState = { error: null };

/** One paste of the job page, read by the AI. */
export function PasteJobForm() {
  const [state, action, pending] = useActionState(addJob, initial);
  return (
    <form action={action} className="flex flex-col gap-3">
      <textarea
        name="posting"
        rows={6}
        required
        maxLength={MAX_PASTE_LENGTH}
        dir="rtl"
        aria-label="עמוד המשרה"
        placeholder="מלינקדאין: פותחים את המשרה, מסמנים הכל, מעתיקים ומדביקים כאן. מאתר של חברה: מספיק להדביק את הקישור."
        className={inputStyles}
      />
      {state.error && <ErrorText>{state.error}</ErrorText>}
      <Button
        type="submit"
        variant="lime"
        disabled={pending}
        className="w-full sm:w-fit"
      >
        {pending ? "קורא את המשרה..." : "להוסיף משרה"}
      </Button>
    </form>
  );
}

export function AddJobForm() {
  const [state, action, pending] = useActionState(addJob, initial);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 font-bold">
        חברה
        <input
          name="company"
          required
          maxLength={120}
          dir="auto"
          placeholder="למשל: Monday"
          className={inputStyles}
        />
      </label>
      <label className="flex flex-col gap-1 font-bold">
        תפקיד
        <input
          name="title"
          required
          maxLength={120}
          dir="auto"
          placeholder="למשל: מנהל מוצר"
          className={inputStyles}
        />
      </label>
      <label className="flex flex-col gap-1 font-bold">
        קישור למשרה (לא חובה)
        <input
          name="link"
          type="text"
          inputMode="url"
          dir="ltr"
          placeholder="https://"
          className={inputStyles}
        />
      </label>
      <label className="flex flex-col gap-1 font-bold">
        סטטוס
        <select name="status" defaultValue="applied" className={inputStyles}>
          {Object.entries(jobStatuses).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      {state.error && (
        <div className="sm:col-span-2">
          <ErrorText>{state.error}</ErrorText>
        </div>
      )}
      <Button
        type="submit"
        variant="quiet"
        disabled={pending}
        className="sm:w-fit"
      >
        {pending ? "שומר..." : "להוסיף ידנית"}
      </Button>
    </form>
  );
}

export function AddInterviewForm({ jobId }: { jobId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    async (prev: JobFormState, data: FormData) => {
      const result = await addInterview(prev, data);
      if (!result.error) formRef.current?.reset();
      return result;
    },
    initial,
  );
  return (
    <form ref={formRef} action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="jobId" value={jobId} />
      <label className="flex flex-col gap-1 font-bold">
        סוג הראיון
        <select name="kind" defaultValue="hr" className={inputStyles}>
          {Object.entries(interviewKinds).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 font-bold">
        מתי (שעון ישראל)
        <input
          name="startsAt"
          type="datetime-local"
          required
          className={inputStyles}
        />
      </label>
      <label className="flex flex-col gap-1 font-bold">
        משך
        <select name="duration" defaultValue="60" className={inputStyles}>
          {durations.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes < 60
                ? `${minutes} דקות`
                : minutes === 60
                  ? "שעה"
                  : minutes === 90
                    ? "שעה וחצי"
                    : "שעתיים"}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 font-bold">
        מקום או קישור (לא חובה)
        <input
          name="location"
          maxLength={500}
          dir="auto"
          placeholder="כתובת, או קישור לזום"
          className={inputStyles}
        />
      </label>
      <label className="flex flex-col gap-1 font-bold sm:col-span-2">
        הערות (לא חובה)
        <textarea
          name="notes"
          rows={2}
          maxLength={2000}
          dir="auto"
          placeholder="עם מי נפגשים, מה ביקשו להכין"
          className={inputStyles}
        />
      </label>
      {state.error && (
        <div className="sm:col-span-2">
          <ErrorText>{state.error}</ErrorText>
        </div>
      )}
      <Button type="submit" disabled={pending} className="sm:w-fit">
        {pending ? "שומר..." : "להוסיף ראיון"}
      </Button>
    </form>
  );
}

export function DescriptionForm({
  jobId,
  current,
}: {
  jobId: string;
  current: string | null;
}) {
  const [state, action, pending] = useActionState(saveDescription, initial);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={jobId} />
      <textarea
        name="description"
        rows={current ? 6 : 8}
        maxLength={MAX_DESCRIPTION_LENGTH}
        dir="auto"
        defaultValue={current ?? ""}
        aria-label="תיאור המשרה"
        placeholder="מעתיקים מהמודעה בלינקדאין או באתר החברה את כל הטקסט: תיאור התפקיד, דרישות ומה מציעים."
        className={inputStyles}
      />
      {state.error && <ErrorText>{state.error}</ErrorText>}
      <Button
        type="submit"
        variant="quiet"
        disabled={pending}
        className="sm:w-fit"
      >
        {pending ? "שומר..." : current ? "לשמור שינויים" : "לשמור את התיאור"}
      </Button>
    </form>
  );
}

export function PrepPlanForm({
  jobId,
  hasPlan,
}: {
  jobId: string;
  hasPlan: boolean;
}) {
  const [state, action, pending] = useActionState(createPrepPlan, initial);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={jobId} />
      {state.error && <ErrorText>{state.error}</ErrorText>}
      <Button
        type="submit"
        variant={hasPlan ? "quiet" : "lime"}
        disabled={pending}
        className="w-full sm:w-fit"
      >
        {pending
          ? "בונה תוכנית, זה לוקח כחצי דקה..."
          : hasPlan
            ? "לבנות תוכנית חדשה"
            : "לבנות לי תוכנית הכנה"}
      </Button>
    </form>
  );
}

const languageNames: Record<string, string> = { en: "English", he: "עברית" };

/** Starts a practice interview built from this job's posting. */
export function JobPracticeForm({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState(startPractice, initial);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="jobId" value={jobId} />
      <label className="flex flex-col gap-1 font-bold sm:w-60">
        שפת הראיון
        <select name="language" defaultValue="en" className={inputStyles}>
          {Object.keys(interviewLanguages).map((code) => (
            <option key={code} value={code}>
              {languageNames[code] ?? code}
            </option>
          ))}
        </select>
      </label>
      {state.error && <ErrorText>{state.error}</ErrorText>}
      <Button type="submit" disabled={pending} className="w-full sm:w-fit">
        {pending
          ? "מכין שאלות, זה לוקח כמה שניות..."
          : "להתחיל תרגול למשרה הזו"}
      </Button>
    </form>
  );
}

/**
 * Imports the jobs from LinkedIn's data export. The archive is opened here in
 * the browser, and only the job applications file is sent to the server.
 */
export function ImportLinkedInForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(
    importLinkedInJobs,
    { error: null },
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [reading, startReading] = useTransition();

  function onFile(file: File | undefined) {
    setFileError(null);
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setFileError("הקובץ גדול מדי.");
      return;
    }
    startReading(async () => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const csv = importFileText(file.name, bytes);
      if (!csv) {
        setFileError(
          "לא מצאנו בקובץ את רשימת המשרות. צריך את הקובץ שלינקדאין שלחה, או את קובץ המשרות שבתוכו.",
        );
        return;
      }
      const data = new FormData();
      data.set("csv", csv);
      action(data);
    });
  }

  const busy = pending || reading;
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-2 font-bold">
        הקובץ מלינקדאין
        <input
          type="file"
          accept=".zip,.csv,application/zip,text/csv"
          disabled={busy}
          onChange={(e) => onFile(e.target.files?.[0])}
          className="file:bg-violet text-sm file:me-3 file:min-h-11 file:rounded-full file:border-0 file:px-4 file:font-bold file:text-white"
        />
      </label>
      {busy && <p className="text-muted">מייבא...</p>}
      {(fileError || state.error) && (
        <ErrorText>{fileError ?? state.error}</ErrorText>
      )}
      {!busy && state.added !== undefined && (
        <p role="status" className="text-success-ink font-bold">
          {state.added > 0
            ? `נוספו ${state.added} משרות.`
            : "כל המשרות מהקובץ כבר נמצאות כאן."}
          {state.added > 0 && state.skipped
            ? ` ${state.skipped} כבר היו כאן.`
            : ""}
        </p>
      )}
    </div>
  );
}
