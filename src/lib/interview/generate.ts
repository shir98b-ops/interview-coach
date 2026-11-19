import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { addressInstruction, type Address } from "@/lib/address";
import { AiError, createAiClient, toAiError } from "@/lib/ai/client";
import type { ResumeData } from "@/lib/resume/schema";
import { bankFor, behavioralThemes, sampleBank } from "./question-bank";
import {
  QUESTION_COUNT,
  interviewLanguages,
  normalizeQuestions,
  questionSetSchema,
  type InterviewLanguage,
  type InterviewMode,
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
  /** A general, technical or system design interview. */
  mode?: InterviewMode;
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

const technicalInstructions = `You are a senior engineer running the technical
round of an interview. Write ${QUESTION_COUNT} technical questions for the
candidate below.

- Cover different ground: core concepts of the role's stack, solving a
  concrete problem, debugging or troubleshooting a realistic failure, and the
  trade-offs between two approaches. Use kind "technical" for these.
- Include exactly one question about a technical decision or project on the
  candidate's resume (kind "resume").
- When a job posting is given, use the technologies and problems it names.
  Otherwise use the stack the role and resume suggest.
- Match the seniority level: fundamentals and clear reasoning for juniors,
  architecture, scale and ownership for seniors.
- Every question must be answerable out loud in a few minutes, without a
  computer: the candidate explains an approach, an algorithm or pseudo-code in
  words, not a full program.
- Ask the kind of questions real technical interviewers ask; no trivia or
  trick questions.`;

const designInstructions = `You are a senior engineer running a system design
interview. Choose ONE realistic design problem that fits the role, the job
posting if given, and the seniority level (smaller in scope for juniors,
larger and more ambiguous for seniors). Then write it as ${QUESTION_COUNT}
questions, asked in this order, each of kind "design":

1. State the problem and ask the candidate to clarify the requirements,
   users and expected scale before designing.
2. Ask for the high-level architecture: the main parts and how they talk.
3. Ask about the data: what is stored, how, and why that storage fits.
4. Ask how the design handles growth, bottlenecks and failures.
5. Ask for the main trade-offs made and what they would do differently with
   more time or a different constraint.

Each question after the first must make sense on its own while building on
the same problem, the way an interviewer moves the discussion forward.`;

const instructionsFor: Record<InterviewMode, string> = {
  general: instructions,
  technical: technicalInstructions,
  "system-design": designInstructions,
};
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
          content: `${instructionsFor[mode]}

Write the questions in ${interviewLanguages[language]}, phrased the way a
native-speaking interviewer would ask them (translate the listed questions
naturally, not word for word). Keep the role title and professional terms as
they are commonly used in that language. ${addressInstruction(address)}

<role>${role}</role>
${
  target.job
    ? `
This interview is for a specific job. Base at least three questions on the
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
${
  mode === "general"
    ? `This time, build the behavioral questions around these themes:
${sampleBank(behavioralThemes, 2)
  .map((theme) => `- ${theme}`)
  .join("\n")}

<commonly_asked_questions>
${sampleBank(bankFor(target.title, target.seniority), BANK_SAMPLE_SIZE)
  .map((q) => `- ${q}`)
  .join("\n")}
</commonly_asked_questions>
`
    : ""
}${
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

<resume>
${JSON.stringify(resume, null, 2)}
</resume>`,
        },
      ],
    });
  } catch (error) {
    throw toAiError(error);
  }

  const questions = response.parsed_output
    ? normalizeQuestions(response.parsed_output)
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
