/** Where a job application stands. Stored in English, shown in Hebrew. */
export const jobStatuses = {
  saved: { label: "שמרתי לעצמי", tone: "violet" },
  applied: { label: "הגשתי", tone: "violet" },
  interviewing: { label: "בתהליך ראיונות", tone: "orange" },
  offer: { label: "קיבלתי הצעה", tone: "lime" },
  rejected: { label: "לא התקדם", tone: "violet" },
  withdrawn: { label: "ויתרתי", tone: "violet" },
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
  return typeof value === "string" && value in jobStatuses
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
  return typeof value === "string" && value in interviewKinds
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
