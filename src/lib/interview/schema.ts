import { z } from "zod";

/** How many questions one practice interview has. */
export const QUESTION_COUNT = 5;
export const MAX_ANSWER_LENGTH = 5000;

export const questionKinds = ["behavioral", "role", "resume"] as const;
export type QuestionKind = (typeof questionKinds)[number];

export const kindLabels: Record<QuestionKind, string> = {
  behavioral: "Behavioral",
  role: "Role skills",
  resume: "Your experience",
};

/** What the AI returns: the questions for one practice interview. */
export const questionSetSchema = z.object({
  questions: z
    .array(
      z.object({
        kind: z
          .enum(questionKinds)
          .describe(
            "behavioral: past behavior (a time when...); role: skills and judgment the role needs; resume: digs into a specific item on the candidate's resume.",
          ),
        text: z
          .string()
          .describe("The question, as the interviewer would ask it."),
      }),
    )
    .describe(`Exactly ${QUESTION_COUNT} questions, in the order to ask them.`),
});

export type QuestionSet = z.infer<typeof questionSetSchema>;

/**
 * Keeps the first QUESTION_COUNT usable questions. The model is asked for
 * exactly that many, but the app should not break if it returns more.
 */
export function normalizeQuestions(
  set: QuestionSet,
): { kind: QuestionKind; text: string }[] {
  return set.questions
    .map((q) => ({ kind: q.kind, text: q.text.trim() }))
    .filter((q) => q.text.length > 0)
    .slice(0, QUESTION_COUNT);
}

/** Validates an answer typed by the user. */
export function validateAnswer(
  value: unknown,
): { ok: true; text: string } | { ok: false; error: string } {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return { ok: false, error: "Write an answer before moving on." };
  if (text.length > MAX_ANSWER_LENGTH) {
    return {
      ok: false,
      error: `Answers can be up to ${MAX_ANSWER_LENGTH} characters.`,
    };
  }
  return { ok: true, text };
}
