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

Answers to technical and design questions (kind "technical" or "design") are
judged differently: content is technical accuracy, depth and the trade-offs
considered; structure is a logical approach (clarify, propose, justify), not
a STAR story. Point out any technical mistake plainly, and make the stronger
answer outline technically correct.

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
      (item) => `<answer position="${item.position}" kind="${item.kind}">
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
