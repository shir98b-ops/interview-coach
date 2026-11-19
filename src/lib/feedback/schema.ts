import { z } from "zod";

export const MAX_FEEDBACK_LENGTH = 2000;

export type FeedbackCheck =
  { ok: true; text: string } | { ok: false; error: string };

/** Checks a feedback message before it is saved. */
export function validateFeedback(value: unknown): FeedbackCheck {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length < 3) return { ok: false, error: "צריך לכתוב כמה מילים." };
  if (text.length > MAX_FEEDBACK_LENGTH) {
    return {
      ok: false,
      error: `המשוב ארוך מדי. עד ${MAX_FEEDBACK_LENGTH} תווים.`,
    };
  }
  return { ok: true, text };
}

/** Keeps only the path of the page the feedback came from. */
export function feedbackPage(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).pathname.slice(0, 200);
  } catch {
    return null;
  }
}

/** The optional 1 to 5 rating sent with feedback; anything else is no rating. */
export function parseRating(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

/** One feedback message as the owner's inbox reads it. */
export interface FeedbackItem {
  id: string;
  message: string;
  page: string | null;
  rating: number | null;
  created_at: string;
  user_label: string;
  is_internal: boolean;
}

export const feedbackKinds = {
  bug: "תקלה",
  confusion: "בלבול",
  idea: "רעיון",
  content: "תוכן ושאלות",
  praise: "מחמאה",
  other: "אחר",
} as const;
export type FeedbackKind = keyof typeof feedbackKinds;

export const priorities = {
  high: "דחוף",
  medium: "בינוני",
  low: "נמוך",
} as const;
export type Priority = keyof typeof priorities;

/** What the AI writes when it summarizes the feedback. */
export const digestSchema = z.object({
  summary: z
    .string()
    .describe("2-4 sentences in Hebrew: the overall picture and its mood"),
  themes: z
    .array(
      z.object({
        title: z.string().describe("A short Hebrew name for the theme"),
        kind: z.enum(
          Object.keys(feedbackKinds) as [FeedbackKind, ...FeedbackKind[]],
        ),
        count: z.number().describe("How many messages raise it"),
        priority: z.enum(["high", "medium", "low"]),
        suggestion: z
          .string()
          .describe("One Hebrew sentence on what to change, or what to keep"),
      }),
    )
    .describe("The recurring themes, most important first"),
  items: z
    .array(
      z.object({
        id: z.string().describe("The id of the message, exactly as given"),
        kind: z.enum(
          Object.keys(feedbackKinds) as [FeedbackKind, ...FeedbackKind[]],
        ),
        priority: z.enum(["high", "medium", "low"]),
      }),
    )
    .describe("Every message, classified"),
});
export type FeedbackDigest = z.infer<typeof digestSchema>;

/** A saved digest, as the database returns it. */
export interface SavedDigest {
  period_days: number;
  feedback_count: number;
  digest: FeedbackDigest;
  created_at: string;
}

export function readDigest(value: unknown): FeedbackDigest | null {
  const parsed = digestSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** Counts, average and spread of the ratings in a list of feedback. */
export function ratingStats(items: { rating: number | null }[]) {
  const rated = items
    .map((item) => item.rating)
    .filter((r): r is number => r !== null);
  const spread = [1, 2, 3, 4, 5].map(
    (star) => rated.filter((r) => r === star).length,
  );
  const average = rated.length
    ? Math.round((rated.reduce((a, b) => a + b, 0) / rated.length) * 10) / 10
    : null;
  return { rated: rated.length, average, spread };
}

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** Sorts messages by the digest's priority, newest first within each level. */
export function byPriority<T extends { id: string; created_at: string }>(
  items: T[],
  digest: FeedbackDigest | null,
): T[] {
  const levels = new Map(
    (digest?.items ?? []).map((i) => [i.id, priorityOrder[i.priority]]),
  );
  return [...items].sort(
    (a, b) =>
      (levels.get(a.id) ?? 3) - (levels.get(b.id) ?? 3) ||
      b.created_at.localeCompare(a.created_at),
  );
}
