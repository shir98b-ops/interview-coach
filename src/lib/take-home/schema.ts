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
/** Code take-homes hold several files, so they may be longer. */
export const MAX_CODE_SUBMISSION_LENGTH = 40000;

/** A written take-home, or one solved by writing code. */
export type TakeHomeFormat = "document" | "code";

export function parseFormat(value: unknown): TakeHomeFormat {
  return value === "code" ? "code" : "document";
}

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
  return typeof value === "string" && Object.hasOwn(difficulties, value)
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
  hardware:
    "an engineering design review with a small table of requirements, specs or loads in the brief: propose a design, check it against the constraints and standards, and list the risks and tests",
  social:
    "a case file: a short referral and background on a client or family, asking for an assessment, a risk evaluation and a treatment plan with goals",
  education:
    "a teaching plan: a lesson or unit plan for a described class with mixed levels, including activities, differentiation and how learning is assessed",
  health:
    "a clinical case: a patient's history, vital signs and results in the brief, asking for priorities, a care plan, what to monitor and when to escalate",
  legal:
    "a legal memo: a short set of facts and a contract clause in the brief, asking for the issues, the risks, the relevant Israeli law and a recommendation to a non-lawyer client",
  service:
    "a service improvement plan: a described branch with complaints and numbers, asking for the causes, a plan for the team and how success is measured",
  public:
    "a policy or tender brief: a public problem with data in the brief, asking for options, costs, who is affected and a recommendation to a decision maker",
  security:
    "an incident report: logs and a timeline in the brief, asking for what happened, the impact, containment steps and how to prevent it",
  admin:
    "an office organization task: a week of requests, meetings and an event to plan, asking for a prioritized plan and the messages to send",
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
    .describe(
      "The company name (the hiring company when a job posting is given, else a fictional one) and one line on what it does",
    ),
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

/** A code take-home also gives starter code or sample data. */
export const codeBriefSchema = briefSchema.extend({
  starterCode: z
    .string()
    .describe(
      "Starter code, function signatures, sample input or table rows the candidate works from, as plain code without fences. Empty if none is needed.",
    ),
});

/** What is saved: the brief, plus its format and programming language. */
const savedBriefSchema = briefSchema.extend({
  format: z.enum(["document", "code"]).optional(),
  codeLanguage: z.string().optional(),
  starterCode: z.string().optional(),
});

export type TakeHomeBrief = z.infer<typeof savedBriefSchema>;

export function readBrief(value: unknown): TakeHomeBrief | null {
  const parsed = savedBriefSchema.safeParse(value);
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

/** The same four scores, judged the way a code review judges them. */
export const codeTakeHomeRubric: {
  key: TakeHomeKey;
  label: string;
  description: string;
  prompt: string;
}[] = [
  {
    key: "understanding",
    label: "הבנת הדרישות",
    description: "עונה על כל הדרישות, ומציין הנחות במקומות שלא היו ברורים.",
    prompt:
      "Understanding: covers every requirement in the brief, and states assumptions where the brief was open.",
  },
  {
    key: "solution",
    label: "נכונות ופתרון",
    description: "הקוד עובד, מטפל במקרי קצה ובשגיאות, ויעיל במידה הנדרשת.",
    prompt:
      "Solution: the code is correct, handles edge cases and errors, and is efficient enough for the stated scale.",
  },
  {
    key: "structure",
    label: "איכות קוד ומבנה",
    description: "חלוקה הגיונית לקבצים ופונקציות, שמות ברורים וקוד קריא.",
    prompt:
      "Structure: sensible split into files, modules and functions, clear names, readable and idiomatic code.",
  },
  {
    key: "actionability",
    label: "בדיקות ותיעוד",
    description: "יש בדיקות אוטומטיות, והסבר קצר איך מריצים ולמה נבחר הפתרון.",
    prompt:
      "Tests and docs: automated tests for the main paths and edge cases, and a short README on how to run it and the choices made.",
  },
];

export function rubricFor(format: TakeHomeFormat | undefined) {
  return format === "code" ? codeTakeHomeRubric : takeHomeRubric;
}

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
  format: TakeHomeFormat = "document",
): { ok: true; text: string } | { ok: false; error: string } {
  const text = typeof value === "string" ? value.trim() : "";
  const max =
    format === "code" ? MAX_CODE_SUBMISSION_LENGTH : MAX_SUBMISSION_LENGTH;
  if (text.length < 50) {
    return {
      ok: false,
      error:
        format === "code"
          ? "ההגשה קצרה מדי. צריך להדביק את הקוד."
          : "ההגשה קצרה מדי. צריך לפחות כמה פסקאות.",
    };
  }
  if (text.length > max) {
    return {
      ok: false,
      error: `ההגשה יכולה להיות עד ${max.toLocaleString("he-IL")} תווים.`,
    };
  }
  return { ok: true, text };
}
