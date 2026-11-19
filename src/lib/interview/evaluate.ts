import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { addressInstruction, type Address } from "@/lib/address";
import { AiError, createAiClient, toAiError } from "@/lib/ai/client";
import { dictationNote } from "@/lib/voice/prompt";
import {
  evaluationSchema,
  feedbackByPosition,
  rubric,
  type AnswerFeedback,
} from "./feedback";
import { splitKind } from "./schema";

export interface AnsweredQuestion {
  position: number;
  kind: string;
  question: string;
  answer: string;
}

const instructions = `You are an experienced interview coach. Score each
answer below against this rubric, from 1 to 5 per criterion:

${rubric.map((r) => `- ${r.prompt}`).join("\n")}

Scale: 1 = missing or off topic, 2 = weak, 3 = acceptable but generic,
4 = strong, 5 = excellent, ready for a real interview. Be honest and
consistent: a short or vague answer cannot score above 2 on content.
${dictationNote}

Answers to professional knowledge and case questions (kind "technical" or
"design") are judged as an experienced practitioner in that field would judge
them: content is professional accuracy, depth and judgment (the right
methods, rules, tools and trade-offs for this profession); structure is a
logical approach (understand, analyze, act, check), not a STAR story. Point
out any professional mistake plainly, and make the stronger answer outline
professionally correct. Score these like a demanding interviewer: do not
inflate, and a vague, shallow or partly wrong answer scores 2 or lower on
content.

Answers to coding problems (kind "coding") are judged as a senior engineer
would judge them in a coding interview. You cannot run the code, so trace it
by hand on the problem's examples and on edge cases (empty input, one item,
duplicates, large input). Score content as correctness: does the code solve
the problem as stated, including edge cases? Score structure as the approach
and efficiency: a fitting algorithm and data structure, with time and space
complexity close to what this level is expected to reach. Score clarity as
code quality: readable names, simple flow, idiomatic use of the language, and
a clear explanation when one is given. Code that does not solve the problem
cannot score above 2 on content. In the improvements, name the exact bug or
missing case and the complexity of the candidate's solution. The stronger
answer for a coding problem is a correct, clean solution in the same
programming language, in a fenced code block, followed by one or two lines on
the approach and its complexity.

For each answer, also give what worked, the most useful improvements, and a
short outline of a stronger answer built from the candidate's own experience.
Speak to the candidate directly ("you"). Write the feedback in the language
the interview was held in, the language of the questions.`;

/** Scores every answer in an interview with one call. */
export async function evaluateInterview(
  role: string,
  items: AnsweredQuestion[],
  address: Address | null = null,
): Promise<Map<number, AnswerFeedback>> {
  const transcript = items
    .map(
      (
        item,
      ) => `<answer position="${item.position}" kind="${splitKind(item.kind).kind}"${
        splitKind(item.kind).codeLanguage
          ? ` programming_language="${splitKind(item.kind).codeLanguage}"`
          : ""
      }>
<question>${item.question}</question>
<candidate_answer>
${item.answer}
</candidate_answer>
</answer>`,
    )
    .join("\n\n");

  let response;
  try {
    response = await createAiClient().messages.parse({
      // Feedback is what the user learns from, so it uses the same mid-tier
      // model as the questions (a few cents per interview).
      model: "claude-sonnet-5-5",
      max_tokens: 16000,
      output_config: {
        effort: "medium",
        format: zodOutputFormat(evaluationSchema),
      },
      messages: [
        {
          role: "user",
          content: `${instructions}
${addressInstruction(address)}

<role>${role}</role>

${transcript}`,
        },
      ],
    });
  } catch (error) {
    throw toAiError(error);
  }

  const feedback =
    response.parsed_output &&
    feedbackByPosition(
      response.parsed_output,
      items.map((item) => item.position),
    );
  if (response.stop_reason === "refusal" || !feedback) {
    throw new AiError(
      `Incomplete feedback (stop_reason: ${response.stop_reason})`,
      "service",
      "no-feedback",
    );
  }
  return feedback;
}
