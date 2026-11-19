import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { addressInstruction, type Address } from "@/lib/address";
import { AiError, createAiClient, toAiError } from "@/lib/ai/client";
import {
  exerciseEvaluationSchema,
  readExerciseFeedback,
  type ExerciseFeedback,
} from "./exercise-feedback";
import { dictationNote } from "@/lib/voice/prompt";
import type { Lesson } from "./lessons";

/** Scores one lesson exercise answer against what the lesson taught. */
export async function evaluateExercise(
  lesson: Lesson,
  answer: string,
  address: Address | null = null,
): Promise<ExerciseFeedback> {
  let response;
  try {
    response = await createAiClient("lesson.score").messages.parse({
      model: "claude-sonnet-5-5",
      max_tokens: 4000,
      output_config: {
        effort: "low",
        format: zodOutputFormat(exerciseEvaluationSchema),
      },
      messages: [
        {
          role: "user",
          content: `You are a friendly, honest interview coach. The candidate just
finished a short lesson called "${lesson.title}" and answered a practice
question. Judge the answer only against the lesson's goal:

<goal>${lesson.exercise.goal}</goal>

Score from 1 to 5: 1 = ignores the goal, 3 = partly meets it, 5 = fully meets
it and would work in a real interview. A very short or off-topic answer
scores 1 or 2. ${dictationNote}
Then say what worked, the one or two changes that would help
most, and a short stronger version built from the candidate's own story.
Speak to the candidate directly. Write everything in the language of the
candidate's answer. ${addressInstruction(address)}

<question>${lesson.exercise.question}</question>
<candidate_answer>
${answer}
</candidate_answer>`,
        },
      ],
    });
  } catch (error) {
    throw toAiError(error);
  }

  const feedback = readExerciseFeedback(response.parsed_output);
  if (response.stop_reason === "refusal" || !feedback) {
    throw new AiError(
      `Incomplete exercise feedback (stop_reason: ${response.stop_reason})`,
      "service",
      "no-feedback",
    );
  }
  return feedback;
}
