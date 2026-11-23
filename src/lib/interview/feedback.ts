import { z } from "zod";

/** The fixed rubric every answer is scored against, from 1 to 5. */
export const rubric = [
  {
    key: "content",
    label: "תוכן",
    description: "עונה על השאלה, עם דוגמה ספציפית ורלוונטית ותוצאה ברורה.",
    prompt:
      "Content: answers the question asked, with a specific, relevant example and a clear result.",
  },
  {
    key: "structure",
    label: "מבנה",
    description:
      "קל לעקוב מההתחלה ועד הסוף. בסיפורים: המצב, מה עשית ומה יצא (שיטת STAR).",
    prompt:
      "Structure: easy to follow from start to end. For stories: the situation, what you did and what happened (the STAR method).",
  },
  {
    key: "clarity",
    label: "בהירות",
    description: "קצר וברור, בלי להתפזר ובלי ניסוחים מעורפלים.",
    prompt: "Clarity: concise and clear, without rambling or vague wording.",
  },
] as const;

export type RubricKey = (typeof rubric)[number]["key"];

/** What the AI returns for one interview. */
export const evaluationSchema = z.object({
  answers: z.array(
    z.object({
      position: z
        .number()
        .describe("The question number this feedback is for."),
      content: z.number().describe("Score from 1 to 5."),
      structure: z.number().describe("Score from 1 to 5."),
      clarity: z.number().describe("Score from 1 to 5."),
      seriousError: z
        .boolean()
        .describe(
          "True when the answer contains a serious professional mistake: one that would harm a patient, client or user, lose data or money, break the law or a safety rule, or shows a core concept misunderstood.",
        ),
      strengths: z
        .string()
        .describe("One or two sentences on what worked in the answer."),
      improvements: z
        .string()
        .describe(
          "The one or two most useful changes, specific to this answer.",
        ),
      betterAnswer: z
        .string()
        .describe(
          "A short outline of a stronger answer that uses the candidate's own experience.",
        ),
    }),
  ),
});

export type Evaluation = z.infer<typeof evaluationSchema>;

/** The feedback saved with each answer. */
export interface AnswerFeedback {
  content: number;
  structure: number;
  clarity: number;
  strengths: string;
  improvements: string;
  betterAnswer: string;
}

/**
 * In a real interview a serious professional mistake ends the answer, however
 * well it is told, so it caps the scores: content at 2, the others at 3.
 */
export const SERIOUS_ERROR_CAP = { content: 2, structure: 3, clarity: 3 };

/** Rounds a score and keeps it on the 1-5 scale. */
export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(5, Math.max(1, Math.round(value)));
}

/**
 * Matches the AI's feedback to the questions by number. Returns null if any
 * question is missing feedback, so a partial result is never saved.
 */
export function feedbackByPosition(
  evaluation: Evaluation,
  positions: number[],
): Map<number, AnswerFeedback> | null {
  const result = new Map<number, AnswerFeedback>();
  for (const item of evaluation.answers) {
    if (!positions.includes(item.position) || result.has(item.position))
      continue;
    const cap = (key: RubricKey, value: number) =>
      item.seriousError
        ? Math.min(clampScore(value), SERIOUS_ERROR_CAP[key])
        : clampScore(value);
    result.set(item.position, {
      content: cap("content", item.content),
      structure: cap("structure", item.structure),
      clarity: cap("clarity", item.clarity),
      strengths: item.strengths.trim(),
      improvements: item.improvements.trim(),
      betterAnswer: item.betterAnswer.trim(),
    });
  }
  return result.size === positions.length ? result : null;
}

/** The average of one answer's rubric scores, from 1 to 5. */
export function answerAverage(
  feedback: Pick<AnswerFeedback, RubricKey>,
): number {
  return (feedback.content + feedback.structure + feedback.clarity) / 3;
}

/** The interview's overall score out of 100: the average rubric score as a percentage. */
export function overallScore(
  feedback: Pick<AnswerFeedback, RubricKey>[],
): number {
  if (feedback.length === 0) return 0;
  const average =
    feedback.reduce((sum, item) => sum + answerAverage(item), 0) /
    feedback.length;
  return Math.round((average / 5) * 100);
}

/** Reads saved feedback back from the database, ignoring anything malformed. */
export function readFeedback(value: unknown): AnswerFeedback | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const scores = [v.content, v.structure, v.clarity];
  if (!scores.every((s) => typeof s === "number")) return null;
  const text = (key: string) =>
    typeof v[key] === "string" ? (v[key] as string) : "";
  return {
    content: v.content as number,
    structure: v.structure as number,
    clarity: v.clarity as number,
    strengths: text("strengths"),
    improvements: text("improvements"),
    betterAnswer: text("betterAnswer"),
  };
}
