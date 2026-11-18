import { z } from "zod";
import { clampScore } from "@/lib/interview/feedback";

/** How many lesson exercises a user can check in any 24 hours. */
export const DAILY_EXERCISE_LIMIT = 20;

export const exerciseEvaluationSchema = z.object({
  score: z.number().describe("1 to 5, how well the answer meets the goal"),
  strengths: z.string().describe("What worked, one or two sentences"),
  improvements: z
    .string()
    .describe("The one or two changes that would help most"),
  betterAnswer: z
    .string()
    .describe("A short stronger version, built from the candidate's answer"),
});

export interface ExerciseFeedback {
  score: number;
  strengths: string;
  improvements: string;
  betterAnswer: string;
}

/** Reads stored exercise feedback, or null when it is missing or malformed. */
export function readExerciseFeedback(value: unknown): ExerciseFeedback | null {
  const parsed = exerciseEvaluationSchema.safeParse(value);
  if (!parsed.success) return null;
  return { ...parsed.data, score: clampScore(parsed.data.score) };
}

/** A short word of encouragement for a 1 to 5 score. */
export function scoreLabel(score: number): string {
  if (score >= 5) return "מצוין! מוכן לראיון אמיתי";
  if (score >= 4) return "חזק מאוד";
  if (score >= 3) return "בכיוון הנכון";
  if (score >= 2) return "יש על מה לעבוד";
  return "בוא ננסה שוב";
}
