import { z } from "zod";

/** How many questions one practice interview has. */
export const QUESTION_COUNT = 5;
export const MAX_ANSWER_LENGTH = 5000;

export const questionKinds = [
  "behavioral",
  "role",
  "resume",
  "technical",
  "design",
] as const;
export type QuestionKind = (typeof questionKinds)[number];

export const kindLabels: Record<QuestionKind, string> = {
  behavioral: "התנהגותית",
  role: "מקצועית",
  resume: "על הניסיון שלך",
  technical: "ידע מקצועי",
  design: "ניתוח מקרה",
};

/**
 * The kind of interview to practice, for every profession: a general
 * interview, a professional knowledge round, or one realistic work case
 * worked through step by step (system design, for software roles).
 */
export const interviewModes = {
  general: {
    label: "ראיון כללי",
    description: "שאלות התנהגותיות, מקצועיות ועל הניסיון שלך.",
  },
  professional: {
    label: "ראיון מקצועי",
    description: "ידע מקצועי, תרחישים מהעבודה ושיקול דעת, ברמה של התפקיד.",
  },
  case: {
    label: "ניתוח מקרה",
    description: "מקרה אחד מהעבודה, שלב אחרי שלב, כמו בראיון אמיתי.",
  },
} as const;

export type InterviewMode = keyof typeof interviewModes;

/** Software roles call the case round by its usual name. */
export function modeLabel(mode: InterviewMode, technical: boolean): string {
  return mode === "case" && technical
    ? "תכנון מערכות"
    : interviewModes[mode].label;
}

export function parseMode(value: unknown): InterviewMode {
  if (value === "professional" || value === "technical") return "professional";
  if (value === "case" || value === "system-design") return "case";
  return "general";
}

/** The kind of organization the candidate is interviewing at. */
export const organizationTypes = {
  any: { label: "לא משנה", prompt: "" },
  tech: {
    label: "הייטק וסטארטאפים",
    prompt: "a technology company or startup",
  },
  corporate: {
    label: "חברה גדולה או תאגיד",
    prompt: "a large established company",
  },
  public: {
    label: "מגזר ציבורי וממשלתי",
    prompt: "a public-sector or government organization",
  },
  nonprofit: {
    label: "עמותות ורווחה",
    prompt: "a nonprofit or social-welfare organization",
  },
  small: {
    label: "עסק קטן או בינוני",
    prompt: "a small or medium-sized business",
  },
} as const;

export type OrganizationType = keyof typeof organizationTypes;

export function parseOrganizationType(value: unknown): OrganizationType {
  return typeof value === "string" && Object.hasOwn(organizationTypes, value)
    ? (value as OrganizationType)
    : "any";
}

/** What the AI returns: the questions for one practice interview. */
export const questionSetSchema = z.object({
  questions: z
    .array(
      z.object({
        kind: z
          .enum(questionKinds)
          .describe(
            "behavioral: past behavior (a time when...); role: skills and judgment the role needs; resume: digs into a specific item on the candidate's resume; technical: professional or technical knowledge, scenarios and problem solving; design: one step of a case or system design discussion.",
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
  if (!text) return { ok: false, error: "צריך לכתוב תשובה לפני שממשיכים." };
  if (text.length > MAX_ANSWER_LENGTH) {
    return {
      ok: false,
      error: `תשובה יכולה להיות עד ${MAX_ANSWER_LENGTH} תווים.`,
    };
  }
  return { ok: true, text };
}

/** Languages a practice interview can be held in. */
export const interviewLanguages = {
  en: "English",
  he: "Hebrew",
} as const;

export type InterviewLanguage = keyof typeof interviewLanguages;

export function parseLanguage(value: unknown): InterviewLanguage {
  return value === "he" ? "he" : "en";
}
