"use client";

import { useActionState, useState, useTransition } from "react";
import { splitList, type ResumeData } from "@/lib/resume/schema";
import { extractResumeAction, saveProfile, type ExtractState } from "./actions";

const input =
  "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";
const button =
  "rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900";
const linkButton = "text-sm text-zinc-600 underline dark:text-zinc-400";

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
      <label htmlFor="resume" className="font-medium">
        {hasProfile ? "Upload a new resume" : "Upload your resume"}
      </label>
      <input
        id="resume"
        name="resume"
        type="file"
        accept="application/pdf,.pdf"
        required
        className={input}
      />
      <p className="text-sm text-zinc-500">
        PDF, up to 4 MB. The file is read once and not stored. Only the details
        you approve are saved.
      </p>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div>
        <button type="submit" disabled={pending} className={button}>
          {pending
            ? "Reading your resume, this takes a few seconds..."
            : "Read resume"}
        </button>
      </div>
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
      <p className="text-zinc-600 dark:text-zinc-400">
        Check the details we found and fix anything that is wrong. Nothing is
        saved until you confirm.
      </p>

      <Field label="Full name">
        <input
          className={input}
          value={data.fullName}
          onChange={(e) => set({ fullName: e.target.value })}
        />
      </Field>
      <Field label="Headline">
        <input
          className={input}
          value={data.headline}
          onChange={(e) => set({ headline: e.target.value })}
        />
      </Field>
      <Field label="Summary">
        <textarea
          className={input}
          rows={3}
          value={data.summary}
          onChange={(e) => set({ summary: e.target.value })}
        />
      </Field>
      <Field label="Skills (comma separated)">
        <textarea
          className={input}
          rows={2}
          defaultValue={data.skills.join(", ")}
          onChange={(e) => set({ skills: splitList(e.target.value) })}
        />
      </Field>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Experience</h2>
        {data.experience.map((job, i) => (
          <fieldset
            key={jobKeys[i]}
            className="flex flex-col gap-2 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                aria-label="Title"
                placeholder="Title"
                className={input}
                value={job.title}
                onChange={(e) =>
                  updateAt("experience", i, { title: e.target.value })
                }
              />
              <input
                aria-label="Company"
                placeholder="Company"
                className={input}
                value={job.company}
                onChange={(e) =>
                  updateAt("experience", i, { company: e.target.value })
                }
              />
              <input
                aria-label="Period"
                placeholder="Period"
                className={input}
                value={job.period}
                onChange={(e) =>
                  updateAt("experience", i, { period: e.target.value })
                }
              />
            </div>
            <textarea
              aria-label="Highlights, one per line"
              placeholder="Highlights, one per line"
              rows={3}
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
              Remove
            </button>
          </fieldset>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Education</h2>
        {data.education.map((item, i) => (
          <fieldset
            key={i}
            className="grid gap-2 sm:grid-cols-[1fr_1fr_8rem_auto]"
          >
            <input
              aria-label="Degree"
              placeholder="Degree"
              className={input}
              value={item.degree}
              onChange={(e) =>
                updateAt("education", i, { degree: e.target.value })
              }
            />
            <input
              aria-label="Institution"
              placeholder="Institution"
              className={input}
              value={item.institution}
              onChange={(e) =>
                updateAt("education", i, { institution: e.target.value })
              }
            />
            <input
              aria-label="Year"
              placeholder="Year"
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
              Remove
            </button>
          </fieldset>
        ))}
      </section>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className={button}>
          {saving ? "Saving..." : "Save profile"}
        </button>
        <button type="button" className={linkButton} onClick={onCancel}>
          Cancel
        </button>
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
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
