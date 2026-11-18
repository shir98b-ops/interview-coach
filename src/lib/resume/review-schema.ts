import { z } from "zod";
import { clampScore } from "@/lib/interview/feedback";

/** Each rating costs about a cent, so cap them daily. */
export const DAILY_REVIEW_LIMIT = 5;

/** The rubric a resume is rated against, from 1 to 5. */
export const reviewRubric = [
  {
    key: "impact",
    label: "הישגים ותוצאות",
    description:
      "כל תפקיד מראה מה השגת, עם מספרים ותוצאות, לא רק תחומי אחריות.",
    prompt:
      "Impact: each role shows achievements with numbers and results, not only duties.",
  },
  {
    key: "relevance",
    label: "התאמה לתפקיד",
    description: "הניסיון, הכישורים והמילים מתאימים לתפקיד שאליו אתה מכוון.",
    prompt:
      "Relevance: experience, skills and keywords match the target role (or a clear direction when no role is given).",
  },
  {
    key: "clarity",
    label: "בהירות וניסוח",
    description: "תיאור קצר וחד, משפטים שמתחילים בפעולה, בלי מילים מיותרות.",
    prompt:
      "Clarity: a sharp headline and summary, concise bullets that start with an action verb, no filler.",
  },
  {
    key: "completeness",
    label: "שלמות",
    description: "יש תקציר, תאריכים, השכלה וכישורים, בלי חורים לא מוסברים.",
    prompt:
      "Completeness: summary, dates, education and skills are present, with no unexplained gaps.",
  },
] as const;

export type ReviewKey = (typeof reviewRubric)[number]["key"];

export const reviewEvaluationSchema = z.object({
  impact: z.number().describe("Score from 1 to 5"),
  relevance: z.number().describe("Score from 1 to 5"),
  clarity: z.number().describe("Score from 1 to 5"),
  completeness: z.number().describe("Score from 1 to 5"),
  verdict: z
    .string()
    .describe("One or two sentences: the overall impression for this role"),
  strengths: z.array(z.string()).describe("2-3 things the resume does well"),
  fixes: z
    .array(
      z.object({
        issue: z.string().describe("What to change and why, one sentence"),
        before: z
          .string()
          .describe("The current line from the resume, or empty if missing"),
        after: z.string().describe("A rewritten or new line to use instead"),
      }),
    )
    .describe("The 3-5 changes that would raise the rating most, best first"),
  keywords: z
    .array(z.string())
    .describe(
      "Up to 8 skills or terms recruiters for this role look for that are missing",
    ),
});

export type ResumeReview = z.infer<typeof reviewEvaluationSchema>;

export function readReview(value: unknown): ResumeReview | null {
  const parsed = reviewEvaluationSchema.safeParse(value);
  if (!parsed.success) return null;
  const r = parsed.data;
  return {
    ...r,
    impact: clampScore(r.impact),
    relevance: clampScore(r.relevance),
    clarity: clampScore(r.clarity),
    completeness: clampScore(r.completeness),
  };
}

/** The rating out of 100: the average rubric score as a percentage. */
export function reviewScore(review: Record<ReviewKey, number>): number {
  const total = reviewRubric.reduce((sum, r) => sum + review[r.key], 0);
  return Math.round((total / reviewRubric.length / 5) * 100);
}
