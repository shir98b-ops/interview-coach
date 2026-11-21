import { z } from "zod";

/** Each plan costs about two cents, so cap them daily. */
export const DAILY_PREP_LIMIT = 10;

export const MIN_DESCRIPTION_LENGTH = 80;
export const MAX_DESCRIPTION_LENGTH = 15000;

export type DescriptionCheck =
  { ok: true; text: string | null } | { ok: false; error: string };

/** Checks a pasted job posting. Empty clears it. */
export function validateDescription(value: unknown): DescriptionCheck {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return { ok: true, text: null };
  if (text.length < MIN_DESCRIPTION_LENGTH) {
    return {
      ok: false,
      error: "התיאור קצר מדי. כדאי להדביק את כל הטקסט של המודעה.",
    };
  }
  if (text.length > MAX_DESCRIPTION_LENGTH) {
    return {
      ok: false,
      error: `התיאור ארוך מדי. עד ${MAX_DESCRIPTION_LENGTH.toLocaleString("he-IL")} תווים.`,
    };
  }
  return { ok: true, text };
}

export const matchLevels = {
  strong: { label: "מתאים", tone: "mint" },
  partial: { label: "חלקי", tone: "pink" },
  gap: { label: "פער", tone: "blue" },
} as const;

/** The plan the AI writes for one job. */
export const prepPlanSchema = z.object({
  summary: z.string(),
  requirements: z.array(
    z.object({
      requirement: z.string(),
      match: z.enum(["strong", "partial", "gap"]),
      note: z.string(),
    }),
  ),
  likelyQuestions: z.array(
    z.object({ question: z.string(), why: z.string(), tip: z.string() }),
  ),
  stories: z.array(
    z.object({ title: z.string(), fromResume: z.string(), shows: z.string() }),
  ),
  questionsToAsk: z.array(z.string()),
  research: z.array(z.string()),
  schedule: z.array(
    z.object({ when: z.string(), task: z.string(), minutes: z.number() }),
  ),
});

export type PrepPlan = z.infer<typeof prepPlanSchema>;

/** Reads a stored plan, or null when it is missing or malformed. */
export function readPrepPlan(value: unknown): PrepPlan | null {
  const parsed = prepPlanSchema.safeParse(value);
  if (!parsed.success) return null;
  const plan = parsed.data;
  if (!plan.summary.trim() || plan.likelyQuestions.length === 0) return null;
  return {
    ...plan,
    requirements: plan.requirements.slice(0, 8),
    likelyQuestions: plan.likelyQuestions.slice(0, 8),
    stories: plan.stories.slice(0, 5),
    questionsToAsk: plan.questionsToAsk.slice(0, 5),
    research: plan.research.slice(0, 5),
    schedule: plan.schedule.slice(0, 6).map((s) => ({
      ...s,
      minutes: Math.min(240, Math.max(5, Math.round(s.minutes))),
    })),
  };
}

/** Tells the AI how much time is left, so the schedule fits it. */
export function timeframe(daysUntilInterview: number | null): string {
  if (daysUntilInterview === null) {
    return "No interview is scheduled yet. Plan a relaxed week of preparation, so the candidate is ready when a call comes.";
  }
  if (daysUntilInterview <= 0) {
    return "The interview is today. Plan only what fits in the hours before it.";
  }
  if (daysUntilInterview === 1) {
    return "The interview is tomorrow. Plan for this evening and tomorrow morning.";
  }
  return `The interview is in ${daysUntilInterview} days. Spread the preparation over those days.`;
}
