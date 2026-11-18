"use client";

import { useActionState, useRef } from "react";
import { Button, ErrorText, inputStyles } from "@/components/ui";
import { durations, interviewKinds, jobStatuses } from "@/lib/jobs/schema";
import { addInterview, addJob, type JobFormState } from "./actions";

const initial: JobFormState = { error: null };

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
      <Button type="submit" disabled={pending} className="sm:w-fit">
        {pending ? "שומר..." : "להוסיף משרה"}
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
