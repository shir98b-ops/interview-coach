/** Where a job application stands. Stored in English, shown in Hebrew. */
export const jobStatuses = {
  saved: { label: "שמרתי לעצמי", tone: "blue" },
  applied: { label: "הגשתי", tone: "blue" },
  interviewing: { label: "בתהליך ראיונות", tone: "pink" },
  offer: { label: "קיבלתי הצעה", tone: "mint" },
  rejected: { label: "לא התקדם", tone: "blue" },
  withdrawn: { label: "ויתרתי", tone: "blue" },
} as const;

export type JobStatus = keyof typeof jobStatuses;

/** Statuses of jobs that are still open, shown first. */
export const activeStatuses: JobStatus[] = [
  "interviewing",
  "applied",
  "saved",
  "offer",
];

export function parseStatus(value: unknown): JobStatus {
  return typeof value === "string" && Object.hasOwn(jobStatuses, value)
    ? (value as JobStatus)
    : "applied";
}

/** The kinds of interview a hiring process usually has. */
export const interviewKinds = {
  screen: "שיחת סינון",
  hr: "ראיון משאבי אנוש",
  professional: "ראיון מקצועי",
  manager: "ראיון עם המנהל",
  "take-home": "מבחן בית",
  final: "ראיון אחרון",
  other: "אחר",
} as const;

export type InterviewKind = keyof typeof interviewKinds;

export function parseKind(value: unknown): InterviewKind {
  return typeof value === "string" && Object.hasOwn(interviewKinds, value)
    ? (value as InterviewKind)
    : "other";
}

export const durations = [30, 45, 60, 90, 120] as const;

export function parseDuration(value: unknown): number {
  const n = Number(value);
  return (durations as readonly number[]).includes(n) ? n : 60;
}

type Check<T> = { ok: true; value: T } | { ok: false; error: string };

export interface JobInput {
  company: string;
  title: string;
  link: string | null;
  status: JobStatus;
}

/** Checks the fields of the "add a job" form. */
export function validateJob(form: FormData): Check<JobInput> {
  const company = String(form.get("company") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const rawLink = String(form.get("link") ?? "").trim();
  if (!company || company.length > 120) {
    return { ok: false, error: "צריך לכתוב את שם החברה." };
  }
  if (!title || title.length > 120) {
    return { ok: false, error: "צריך לכתוב את שם התפקיד." };
  }
  const link = rawLink ? safeLink(rawLink) : null;
  if (rawLink && !link) {
    return { ok: false, error: "הקישור למשרה לא תקין." };
  }
  return {
    ok: true,
    value: { company, title, link, status: parseStatus(form.get("status")) },
  };
}

/** Accepts only http and https links, adding https when it is missing. */
export function safeLink(value: string): string | null {
  const withScheme = /^[a-z]+:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString().slice(0, 500);
  } catch {
    return null;
  }
}

/** What each stage of a hiring process usually checks, for the AI. */
export const stageFocus: Record<InterviewKind, string> = {
  screen:
    "A short phone screen with a recruiter: motivation, why this company, a quick walk through the background, availability and salary expectations.",
  hr: "An HR interview: motivation, values and culture fit, teamwork, handling conflict and pressure, career goals and salary expectations.",
  professional:
    "A professional interview with the team: the core skills and tools in the posting, real cases from the candidate's experience, and how they would solve problems typical of this role.",
  manager:
    "An interview with the hiring manager: ownership, decision making, prioritizing, working with stakeholders, and how the candidate would approach the first months.",
  "take-home":
    "A take-home assignment and its review: understanding the task, structuring the answer, presenting it clearly and defending choices.",
  final:
    "A final interview, often with a senior leader: big-picture motivation, culture fit, long-term goals, and smart questions before an offer.",
  other:
    "An interview stage of unknown type: cover motivation, the key requirements of the posting and the strongest stories from the resume.",
};

export interface StageHistory {
  kind: InterviewKind;
  date: string;
  reflection: string | null;
}

/** Earlier stages of the process and the candidate's notes on them. */
export function historyText(history: StageHistory[]): string {
  if (history.length === 0) return "This is the first stage of the process.";
  return [
    "Earlier stages of this process, with the candidate's own notes:",
    ...history.map(
      (h) => `- ${h.date}, ${h.kind}: ${h.reflection?.trim() || "(no notes)"}`,
    ),
    "Use these notes: do not repeat what was already covered, and strengthen what the candidate found hard.",
  ].join("\n");
}
