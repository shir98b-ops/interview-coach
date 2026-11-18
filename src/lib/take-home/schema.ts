import { z } from "zod";
import { clampScore } from "@/lib/interview/feedback";
import { matchRoleFamilies } from "@/lib/interview/question-bank";

/**
 * Practice take-home assignments: original tasks in the style of the ones
 * companies send candidates, written for the user's target role.
 */

/** Each take-home costs a few cents to write and score, so cap them daily. */
export const DAILY_TAKE_HOME_LIMIT = 3;
export const MAX_SUBMISSION_LENGTH = 15000;

export const difficulties = {
  easy: {
    label: "קל",
    minutes: 45,
    prompt: "easy: a focused task for about 45 minutes",
  },
  medium: {
    label: "בינוני",
    minutes: 90,
    prompt: "medium: a realistic task for about 90 minutes",
  },
  hard: {
    label: "מאתגר",
    minutes: 180,
    prompt:
      "hard: an open-ended task for about 3 hours, with trade-offs to weigh",
  },
} as const;

export type Difficulty = keyof typeof difficulties;

export function parseDifficulty(value: unknown): Difficulty {
  return typeof value === "string" && value in difficulties
    ? (value as Difficulty)
    : "medium";
}

/**
 * The kinds of take-home a role commonly gets, so the AI writes the task a
 * candidate is likely to meet. Unknown roles get a general analysis task.
 */
const taskTypes: Record<string, string> = {
  product:
    "a feature spec or prioritization case: define the problem, users, solution, success metrics and what to build first",
  project:
    "a project plan: scope, milestones, risks, stakeholders and how progress is tracked",
  data: "an analysis task with a small data table included in the brief: find insights, explain the method and recommend actions",
  marketing:
    "a campaign or go-to-market plan: audience, message, channels, budget split and how success is measured",
  sales:
    "an account plan or outreach case: research a prospect, plan the approach and write the first message",
  people:
    "a people case: a hiring plan, an onboarding program or handling an employee situation",
  design:
    "a design critique or flow task: analyze an existing experience, propose improvements and explain the reasoning in words",
  finance:
    "a financial analysis with a small table of numbers in the brief: assess the situation and recommend a decision",
  engineering:
    "a written technical design: approach, architecture, trade-offs and a test plan, without writing full code",
  management:
    "a leadership case: plan the first 90 days of a team, or handle a team conflict and a missed goal",
};

export function taskTypeFor(title: string): string {
  const families = matchRoleFamilies(title);
  const types = families.map((f) => taskTypes[f.id]).filter(Boolean);
  return (
    types[0] ??
    "a business case: analyze a realistic problem for the role and recommend a plan"
  );
}

/** What the AI writes for one take-home. */
export const briefSchema = z.object({
  title: z.string().describe("A short title for the assignment"),
  company: z
    .string()
    .describe("A fictional company name and one line on what it does"),
  context: z
    .string()
    .describe(
      "The background the candidate needs, 2-4 short paragraphs. Include any data table here as plain text rows.",
    ),
  tasks: z
    .array(z.string())
    .describe("2-4 numbered things the candidate must do"),
  deliverable: z
    .string()
    .describe("What to hand in and in what form, e.g. a 1-2 page document"),
});

export type TakeHomeBrief = z.infer<typeof briefSchema>;

export function readBrief(value: unknown): TakeHomeBrief | null {
  const parsed = briefSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** The rubric every take-home submission is scored against, from 1 to 5. */
export const takeHomeRubric = [
  {
    key: "understanding",
    label: "הבנת הבעיה",
    description: "מזהה מה באמת מבקשים, מה המטרה העסקית, ואילו הנחות נדרשות.",
    prompt:
      "Understanding: identifies the real goal behind the brief, states assumptions and clarifies scope.",
  },
  {
    key: "solution",
    label: "איכות הפתרון",
    description: "פתרון מנומק, מבוסס על הנתונים, ששוקל חלופות ופשרות.",
    prompt:
      "Solution: a reasoned answer grounded in the brief's data, weighing options and trade-offs.",
  },
  {
    key: "structure",
    label: "מבנה והגשה",
    description: "מתחיל בתקציר, מסודר בכותרות, וקל לקריאה גם בדקה אחת.",
    prompt:
      "Structure: opens with a summary, is organized with clear sections and is easy to skim.",
  },
  {
    key: "actionability",
    label: "ישימות",
    description: "המלצות ברורות, צעדים הבאים ודרך למדוד הצלחה.",
    prompt:
      "Actionability: clear recommendations, next steps and how success would be measured.",
  },
] as const;

export type TakeHomeKey = (typeof takeHomeRubric)[number]["key"];

export const takeHomeEvaluationSchema = z.object({
  understanding: z.number().describe("Score from 1 to 5"),
  solution: z.number().describe("Score from 1 to 5"),
  structure: z.number().describe("Score from 1 to 5"),
  actionability: z.number().describe("Score from 1 to 5"),
  strengths: z.string().describe("Two or three sentences on what worked"),
  improvements: z
    .array(z.string())
    .describe("The 2-4 most useful changes, each one specific"),
  interviewQuestions: z
    .array(z.string())
    .describe(
      "2-3 questions an interviewer would likely ask about this submission",
    ),
});

export type TakeHomeFeedback = Record<TakeHomeKey, number> & {
  strengths: string;
  improvements: string[];
  interviewQuestions: string[];
};

export function readTakeHomeFeedback(value: unknown): TakeHomeFeedback | null {
  const parsed = takeHomeEvaluationSchema.safeParse(value);
  if (!parsed.success) return null;
  const f = parsed.data;
  return {
    ...f,
    understanding: clampScore(f.understanding),
    solution: clampScore(f.solution),
    structure: clampScore(f.structure),
    actionability: clampScore(f.actionability),
  };
}

/** The submission's score out of 100: the average rubric score as a percentage. */
export function takeHomeScore(feedback: Record<TakeHomeKey, number>): number {
  const total = takeHomeRubric.reduce((sum, r) => sum + feedback[r.key], 0);
  return Math.round((total / takeHomeRubric.length / 5) * 100);
}

export function validateSubmission(
  value: unknown,
): { ok: true; text: string } | { ok: false; error: string } {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length < 50) {
    return { ok: false, error: "ההגשה קצרה מדי. צריך לפחות כמה פסקאות." };
  }
  if (text.length > MAX_SUBMISSION_LENGTH) {
    return {
      ok: false,
      error: `ההגשה יכולה להיות עד ${MAX_SUBMISSION_LENGTH} תווים.`,
    };
  }
  return { ok: true, text };
}
