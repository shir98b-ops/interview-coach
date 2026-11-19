import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { addressInstruction, type Address } from "@/lib/address";
import { AiError, createAiClient, toAiError } from "@/lib/ai/client";
import { codeLanguages, type CodeLanguage } from "@/lib/code/languages";
import type { ResumeData } from "@/lib/resume/schema";
import {
  bankFor,
  behavioralThemes,
  codingTopics,
  focusAreasFor,
  isTechnicalRole,
  sampleBank,
  sqlTopics,
  systemDesignProblems,
  technicalTopics,
} from "./question-bank";
import {
  CODING_QUESTION_COUNT,
  QUESTION_COUNT,
  interviewLanguages,
  normalizeQuestions,
  questionSetSchema,
  type InterviewLanguage,
  organizationTypes,
  type InterviewMode,
  type OrganizationType,
  type QuestionKind,
} from "./schema";

export interface PracticeTarget {
  title: string;
  seniority: string | null;
  /** The job posting, when practicing for a specific job. */
  job?: { company: string; description: string } | null;
  /** The stage practiced for, with what it checks and earlier stages. */
  stage?: { name: string; focus: string; history: string } | null;
  /** Questions already asked in earlier practice for this role or job. */
  previousQuestions?: string[];
  /** A general, professional or case interview. */
  mode?: InterviewMode;
  /** The kind of organization, when practicing without a job posting. */
  organization?: OrganizationType;
  /** The programming language of a coding round. */
  codeLanguage?: CodeLanguage;
}

/** Makes the questions fit the kind of organization the user applies to. */
function organizationLine(target: PracticeTarget): string {
  const prompt = target.organization
    ? organizationTypes[target.organization].prompt
    : "";
  if (target.job || !prompt) return "";
  return `
The candidate is interviewing at ${prompt}. Make the questions, scenarios and
expectations realistic for that kind of organization.
`;
}

/** How many examples from the question bank each interview starts from. */
const BANK_SAMPLE_SIZE = 12;

const instructions = `You are an experienced hiring manager preparing a first-round
interview. Write ${QUESTION_COUNT} questions for the candidate below.

- Mix the kinds: at least two behavioral questions, at least one question on
  the skills and judgment the role needs, and at least one that digs into a
  specific item on the candidate's resume.
- Match the seniority level. If none is given, aim for the level the resume
  suggests.
- Stay close to what real interviewers ask. Base about two questions on the
  commonly asked questions listed below, adapting them to the role and the
  candidate's background; do not invent unusual or trick questions.
- Questions the candidate was already asked (listed at the end, when there
  are any) always win: never repeat or reword one of them, even if it is in
  the commonly asked list.
- Ask one thing per question, the way a real interviewer would say it.`;

/** Difficulty follows the seniority, in every kind of interview. */
const levelGuide = `Set the difficulty by the seniority level:
- Entry level: fundamentals, and how they would handle common situations.
- Mid level: independent work, real depth and trade-offs.
- Senior: complex and ambiguous situations, leading others, strategic judgment.
- Manager: leading teams, priorities, budgets and people decisions.
If no seniority is given, infer it from the job posting, else aim for mid level.`;

/** Shared by the professional and case rounds: hold the real-world bar. */
const professionalBar = `Hold the bar of a real interview in this profession
for this seniority. Do NOT adapt the topics, scenarios or difficulty to the
candidate's past jobs or industry, and do not soften anything because of
their background: the goal is to prepare them for the real thing.`;

const professionalInstructions = `You are an experienced senior practitioner
in this profession, running the professional round of an interview. Write
${QUESTION_COUNT} questions (kind "technical") that test the knowledge,
methods, tools, regulations and judgment this role really requires, whatever
the field: a social worker, a business manager, an electrical engineer or a
software developer each get the questions of their own profession.

- Mix the question types: explain a core concept or method in depth, handle
  a realistic work scenario, solve a concrete professional problem, and
  compare two approaches with their trade-offs.
- When a job posting is given, use the tools, domains and problems it names.
- When focus areas are listed below, cover them.
- Every question must be answerable out loud in a few minutes, without a
  computer (an approach, calculation or pseudo-code explained in words).
- Ask what real interviewers in this field ask; no trivia or trick questions.

${levelGuide}

${professionalBar}`;

const caseInstructions = `You are an experienced senior practitioner in this
profession, running a case interview. Use the case given below: one
realistic situation from the daily work of this role. Then write it as
${QUESTION_COUNT} questions, asked in this order, each of kind "design":

1. Present the case and ask what the candidate needs to understand or ask
   first, before acting.
2. Ask for their analysis and overall approach.
3. Ask for the concrete plan: the steps, tools or methods, and who is involved.
4. Ask how they handle a complication, a risk or something going wrong.
5. Ask about priorities and trade-offs, and how they would measure success.

Each question after the first must make sense on its own while building on
the same case, the way an interviewer moves the discussion forward.

${levelGuide}

${professionalBar}`;

const designInstructions = `You are a senior engineer running a system design
interview. Use the design problem given below. Then write it as
${QUESTION_COUNT} questions, asked in this order, each of kind "design":

1. State the problem and ask the candidate to clarify the requirements,
   users and expected scale before designing.
2. Ask for the high-level architecture: the main parts and how they talk.
3. Ask about the data: what is stored, how, and why that storage fits.
4. Ask how the design handles growth, bottlenecks and failures.
5. Ask for the main trade-offs made and what they would do differently with
   more time or a different constraint.

Each question after the first must make sense on its own while building on
the same problem, the way an interviewer moves the discussion forward.

${levelGuide}

${professionalBar}`;

const codingInstructions = `You are a senior engineer running the coding round
of an interview. Write ${CODING_QUESTION_COUNT} coding problems (kind "coding")
in the programming language given below: the first a focused warm-up, the
second the main problem of the round.

Each problem must be a complete statement the candidate can solve without
asking anything:
- A short, realistic story from the work of this role (a product, a system or
  a data set), not an abstract puzzle, and never a famous problem copied word
  for word.
- What to write: the function, class or query, with its inputs and output.
- One or two examples, each on its own lines as "Input:" and "Output:", with a
  short reason when it is not obvious.
- The constraints that matter (sizes, ranges, empty input, ordering).
For SQL, describe the tables with their columns and a few sample rows inside a
fenced code block, and ask for one query.

Put code, signatures and table rows in fenced code blocks (\`\`\`), and keep
code, names and values in English even when the statement is in another
language. Do not include a solution or hints.

Set the difficulty by the seniority level, as in a real coding interview:
- Entry level: one clear idea, solvable in about 20 minutes.
- Mid level: needs the right data structure and handling of edge cases.
- Senior and above: a harder main problem where efficiency and clean design
  both matter, with a follow-up constraint stated in the problem.
If no seniority is given, infer it from the job posting, else aim for mid level.

${professionalBar}`;

function instructionsFor(mode: InterviewMode, technical: boolean): string {
  if (mode === "coding") return codingInstructions;
  if (mode === "professional") return professionalInstructions;
  if (mode === "case") return technical ? designInstructions : caseInstructions;
  return `${instructions}

${levelGuide}`;
}

/** The material each kind of interview starts from. */
function startingPoint(
  target: PracticeTarget,
  mode: InterviewMode,
  technical: boolean,
): string {
  if (mode === "general") {
    return `This time, build the behavioral questions around these themes:
${sampleBank(behavioralThemes, 2)
  .map((theme) => `- ${theme}`)
  .join("\n")}

<commonly_asked_questions>
${sampleBank(bankFor(target.title, target.seniority), BANK_SAMPLE_SIZE)
  .map((q) => `- ${q}`)
  .join("\n")}
</commonly_asked_questions>
`;
  }
  if (mode === "coding") {
    const language = target.codeLanguage ?? "python";
    const topics = sampleBank(
      language === "sql" ? sqlTopics : codingTopics,
      CODING_QUESTION_COUNT,
    );
    return `<programming_language>${codeLanguages[language]}</programming_language>

Build the problems around these kinds of problem, one each, and pick a
different story each time:
${topics.map((topic) => `- ${topic}`).join("\n")}
${
  target.job
    ? "\nWhen the job posting names a domain or data, set the problems in it.\n"
    : ""
}`;
  }
  const focus = focusAreasFor(target.title);
  if (mode === "professional") {
    const topics = technical ? technicalTopics : focus;
    return topics.length
      ? `<focus_areas>
${sampleBank(topics, 4)
  .map((topic) => `- ${topic}`)
  .join("\n")}
</focus_areas>
`
      : "";
  }
  if (target.job) {
    return `<case>
A real situation from the work of this role at the company in the job
posting, at that company's real scale and context.
</case>
`;
  }
  return technical
    ? `<design_problem>
Design ${sampleBank(systemDesignProblems, 1)[0]}.
</design_problem>
`
    : `<case>
Choose a realistic, demanding situation that people in this role face, typical
of the organization type below if one is given. Pick a different case each time.${
        focus.length
          ? `
Set it in this area of the profession: ${sampleBank(focus, 1)[0]}.`
          : ""
      }
</case>
`;
}

/** Asks Claude for interview questions tailored to the role and resume. */
export async function generateQuestions(
  target: PracticeTarget,
  resume: ResumeData,
  language: InterviewLanguage = "en",
  address: Address | null = null,
): Promise<{ kind: QuestionKind; text: string }[]> {
  const role = target.seniority
    ? `${target.title} (${target.seniority})`
    : target.title;
  const mode = target.mode ?? "general";
  const technical = isTechnicalRole(target.title);

  let response;
  try {
    response = await createAiClient().messages.parse({
      // Good questions are the heart of the product, so this uses the
      // mid-tier model (about two cents per practice interview).
      model: "claude-sonnet-5-5",
      max_tokens: 16000,
      output_config: {
        effort: "low",
        format: zodOutputFormat(questionSetSchema),
      },
      messages: [
        {
          role: "user",
          content: `${instructionsFor(mode, technical)}

Write the questions in ${interviewLanguages[language]}, phrased the way a
native-speaking interviewer would ask them (translate the listed questions
naturally, not word for word). Keep the role title and professional terms as
they are commonly used in that language. ${addressInstruction(address)}

<role>${role}</role>
${
  target.job
    ? `
This interview is for a specific job. Base most of the questions on the
requirements and responsibilities in this posting, the way this company's
interviewer would ask them:

<job_posting company="${target.job.company.replace(/"/g, "'")}">
${target.job.description}
</job_posting>
`
    : ""
}${
            target.stage
              ? `
Practice ONE stage of the hiring process: ${target.stage.name}.
${target.stage.focus}
Ask only what an interviewer at this stage would ask. The mix of question
kinds above can bend to fit the stage.
${target.stage.history}
`
              : ""
          }
${startingPoint(target, mode, technical)}${organizationLine(target)}${
            target.previousQuestions?.length
              ? `
The candidate has already practiced for this role and was asked the questions
below. Do not ask any of them again, not even reworded or with the same
intent. Dig into resume items, projects and skills that were not asked about
yet, and vary how the questions open and are phrased, so every practice
interview feels new.

<already_asked>
${target.previousQuestions.map((q) => `- ${q}`).join("\n")}
</already_asked>
`
              : ""
          }

${
  // Professional and case rounds hold the real-world bar, so the resume is
  // left out and cannot pull them toward the candidate's past jobs.
  mode === "general"
    ? `<resume>
${JSON.stringify(resume, null, 2)}
</resume>`
    : ""
}`,
        },
      ],
    });
  } catch (error) {
    throw toAiError(error);
  }

  const questions = response.parsed_output
    ? normalizeQuestions(
        response.parsed_output,
        mode === "coding" ? CODING_QUESTION_COUNT : QUESTION_COUNT,
      )
    : [];
  if (response.stop_reason === "refusal" || questions.length === 0) {
    throw new AiError(
      `No questions returned (stop_reason: ${response.stop_reason})`,
      "service",
      "no-questions",
    );
  }
  return questions;
}
