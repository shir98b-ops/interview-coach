import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { addressInstruction, type Address } from "@/lib/address";
import { AiError, createAiClient, toAiError } from "@/lib/ai/client";
import type { ResumeData } from "@/lib/resume/schema";
import { bankFor } from "./question-bank";
import {
  QUESTION_COUNT,
  interviewLanguages,
  normalizeQuestions,
  questionSetSchema,
  type InterviewLanguage,
  type QuestionKind,
} from "./schema";

export interface PracticeTarget {
  title: string;
  seniority: string | null;
  /** The job posting, when practicing for a specific job. */
  job?: { company: string; description: string } | null;
  /** The stage practiced for, with what it checks and earlier stages. */
  stage?: { name: string; focus: string; history: string } | null;
}

const instructions = `You are an experienced hiring manager preparing a first-round
interview. Write ${QUESTION_COUNT} questions for the candidate below.

- Mix the kinds: at least two behavioral questions, at least one question on
  the skills and judgment the role needs, and at least one that digs into a
  specific item on the candidate's resume.
- Match the seniority level. If none is given, aim for the level the resume
  suggests.
- Stay close to what real interviewers ask. Base at least three questions on
  the commonly asked questions listed below, adapting them to the role and the
  candidate's background; do not invent unusual or trick questions.
- Ask one thing per question, the way a real interviewer would say it.`;

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
          content: `${instructions}

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
<commonly_asked_questions>
${bankFor(target.title, target.seniority)
  .map((q) => `- ${q}`)
  .join("\n")}
</commonly_asked_questions>

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
