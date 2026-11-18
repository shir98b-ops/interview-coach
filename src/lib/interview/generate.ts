import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { AiError, createAiClient, toAiError } from "@/lib/ai/client";
import type { ResumeData } from "@/lib/resume/schema";
import {
  QUESTION_COUNT,
  normalizeQuestions,
  questionSetSchema,
  type QuestionKind,
} from "./schema";

export interface PracticeTarget {
  title: string;
  seniority: string | null;
}

const instructions = `You are an experienced hiring manager preparing a first-round
interview. Write ${QUESTION_COUNT} questions for the candidate below.

- Mix the kinds: at least two behavioral questions, at least one question on
  the skills and judgment the role needs, and at least one that digs into a
  specific item on the candidate's resume.
- Match the seniority level. If none is given, aim for the level the resume
  suggests.
- Ask one thing per question, the way a real interviewer would say it.
- Write the questions in English.`;

/** Asks Claude for interview questions tailored to the role and resume. */
export async function generateQuestions(
  target: PracticeTarget,
  resume: ResumeData,
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

<role>${role}</role>

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
