import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { addressInstruction, type Address } from "@/lib/address";
import { AiError, createAiClient, toAiError } from "@/lib/ai/client";
import {
  readReview,
  reviewEvaluationSchema,
  reviewRubric,
  type ResumeReview,
} from "./review-schema";
import type { ResumeData } from "./schema";

/** Rates the resume against the rubric, for a role when one is given. */
export async function reviewResume(
  resume: ResumeData,
  role: string | null,
  address: Address | null = null,
): Promise<ResumeReview> {
  let response;
  try {
    response = await createAiClient().messages.parse({
      // Rewriting resume lines well needs judgment, so this uses the
      // mid-tier model (about a cent per rating).
      model: "claude-sonnet-5-5",
      max_tokens: 8000,
      output_config: {
        effort: "low",
        format: zodOutputFormat(reviewEvaluationSchema),
      },
      messages: [
        {
          role: "user",
          content: `You are an experienced recruiter. Rate the resume below
${role ? `for the role "${role}"` : "for the kind of role it points to"}, from
1 to 5 on each criterion:

${reviewRubric.map((r) => `- ${r.prompt}`).join("\n")}

Scale: 1 = missing, 2 = weak, 3 = acceptable but generic, 4 = strong,
5 = stands out to a recruiter. Be honest and consistent.

The resume is given as the details extracted from it, so judge the content,
not the visual layout. For each fix, quote the current line when there is
one and write a better line built only from facts in the resume; where a
number is unknown, use a placeholder like [X%] for the candidate to fill in.
Never invent experience. Speak to the candidate directly, and write all
feedback in Hebrew. Keep quoted and rewritten resume lines in the language
the resume is written in. ${addressInstruction(address)}

<resume>
${JSON.stringify(resume, null, 2)}
</resume>`,
        },
      ],
    });
  } catch (error) {
    throw toAiError(error);
  }
  const review = readReview(response.parsed_output);
  if (response.stop_reason === "refusal" || !review) {
    throw new AiError(
      `Incomplete resume review (stop_reason: ${response.stop_reason})`,
      "service",
      "no-review",
    );
  }
  return review;
}
