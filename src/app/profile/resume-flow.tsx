"use client";

import { useActionState, useState, useTransition } from "react";
import { Button, ErrorText, inputStyles } from "@/components/ui";
import { splitList, type ResumeData } from "@/lib/resume/schema";
import { extractResumeAction, saveProfile, type ExtractState } from "./actions";

const input = inputStyles;
const linkButton = "text-sm font-bold text-violet hover:text-violet-dark";

/** Upload a resume, then review and save the extracted details. */
export function ResumeFlow({ hasProfile }: { hasProfile: boolean }) {
  const [state, action, pending] = useActionState<ExtractState, FormData>(
    extractResumeAction,
    { status: "idle" },
  );
  const [cancelled, setCancelled] = useState<ResumeData | null>(null);

  if (state.status === "review" && state.data !== cancelled) {
    return (
      <ReviewForm
        initial={state.data}
        onCancel={() => setCancelled(state.data)}
      />
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="resume" className="font-bold">
        {hasProfile ? "להעלות קורות חיים חדשים" : "להעלות את קורות החיים שלך"}
      </label>
      <input
        id="resume"
        name="resume"
        type="file"
        accept="application/pdf,.pdf"
        required
        className={`${input} file:bg-violet-soft file:text-violet-dark file:me-4 file:rounded-xl file:border-0 file:px-4 file:py-2 file:font-bold`}
      />
      <p className="text-muted text-sm">
        קובץ PDF עד 4 מגה. הקובץ נקרא פעם אחת ולא נשמר. נשמרים רק הפרטים מאשר.
      </p>
      {state.status === "error" && <ErrorText>{state.error}</ErrorText>}
      <Button type="submit" disabled={pending} className="w-full sm:w-fit">
        {pending
          ? "קורא את קורות החיים, זה לוקח כמה שניות..."
          : "לקרוא את הקובץ"}
      </Button>
    </form>
  );
}

function ReviewForm({
  initial,
  onCancel,
}: {
  initial: ResumeData;
  onCancel: () => void;
}) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  // Stable keys so a removed job doesn't shift the highlights text boxes.
  const [jobKeys, setJobKeys] = useState(() =>
    initial.experience.map((_, i) => i),
  );
  const set = (patch: Partial<ResumeData>) =>
    setData((current) => ({ ...current, ...patch }));

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startSaving(async () => {
          const result = await saveProfile(data);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <p className="text-muted">
        כדאי לעבור על הפרטים שמצאנו ולתקן מה שלא מדויק. שום דבר לא נשמר לפני
        האישור.
      </p>

      <Field label="שם מלא">
        <input
          dir="auto"
          className={input}
          value={data.fullName}
          onChange={(e) => set({ fullName: e.target.value })}
        />
      </Field>
      <Field label="תיאור קצר">
        <input
          dir="auto"
          className={input}
          value={data.headline}
          onChange={(e) => set({ headline: e.target.value })}
        />
      </Field>
      <Field label="תקציר">
        <textarea
          dir="auto"
          className={input}
          rows={3}
          value={data.summary}
          onChange={(e) => set({ summary: e.target.value })}
        />
      </Field>
      <Field label="כישורים (מופרדים בפסיקים)">
        <textarea
          dir="auto"
          className={input}
          rows={2}
          defaultValue={data.skills.join(", ")}
          onChange={(e) => set({ skills: splitList(e.target.value) })}
        />
      </Field>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-extrabold">ניסיון</h2>
        {data.experience.map((job, i) => (
          <fieldset
            key={jobKeys[i]}
            className="bg-canvas flex flex-col gap-2 rounded-2xl p-4"
          >
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                aria-label="תפקיד"
                placeholder="תפקיד"
                dir="auto"
                className={input}
                value={job.title}
                onChange={(e) =>
                  updateAt("experience", i, { title: e.target.value })
                }
              />
              <input
                aria-label="חברה"
                placeholder="חברה"
                dir="auto"
                className={input}
                value={job.company}
                onChange={(e) =>
                  updateAt("experience", i, { company: e.target.value })
                }
              />
              <input
                aria-label="תקופה"
                placeholder="תקופה"
                dir="auto"
                className={input}
                value={job.period}
                onChange={(e) =>
                  updateAt("experience", i, { period: e.target.value })
                }
              />
            </div>
            <textarea
              aria-label="הישגים, אחד בכל שורה"
              placeholder="הישגים, אחד בכל שורה"
              rows={3}
              dir="auto"
              className={input}
              defaultValue={job.highlights.join("\n")}
              onChange={(e) =>
                updateAt("experience", i, {
                  highlights: e.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                })
              }
            />
            <button
              type="button"
              className={`${linkButton} self-start`}
              onClick={() => removeAt("experience", i)}
            >
              הסרה
            </button>
          </fieldset>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-extrabold">השכלה</h2>
        {data.education.map((item, i) => (
          <fieldset
            key={i}
            className="grid gap-2 sm:grid-cols-[1fr_1fr_8rem_auto]"
          >
            <input
              aria-label="תואר"
              placeholder="תואר"
              dir="auto"
              className={input}
              value={item.degree}
              onChange={(e) =>
                updateAt("education", i, { degree: e.target.value })
              }
            />
            <input
              aria-label="מוסד"
              placeholder="מוסד"
              dir="auto"
              className={input}
              value={item.institution}
              onChange={(e) =>
                updateAt("education", i, { institution: e.target.value })
              }
            />
            <input
              aria-label="שנה"
              placeholder="שנה"
              dir="auto"
              className={input}
              value={item.year}
              onChange={(e) =>
                updateAt("education", i, { year: e.target.value })
              }
            />
            <button
              type="button"
              className={linkButton}
              onClick={() => removeAt("education", i)}
            >
              הסרה
            </button>
          </fieldset>
        ))}
      </section>

      {error && <ErrorText>{error}</ErrorText>}
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="lime" disabled={saving}>
          {saving ? "שומר..." : "לשמור פרופיל"}
        </Button>
        <Button type="button" variant="quiet" onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </form>
  );

  function updateAt<K extends "experience" | "education">(
    key: K,
    index: number,
    patch: Partial<ResumeData[K][number]>,
  ) {
    setData((current) => ({
      ...current,
      [key]: current[key].map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  function removeAt(key: "experience" | "education", index: number) {
    if (key === "experience") {
      setJobKeys((keys) => keys.filter((_, i) => i !== index));
    }
    setData((current) => ({
      ...current,
      [key]: current[key].filter((_, i) => i !== index),
    }));
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-bold">{label}</span>
      {children}
    </label>
  );
}
