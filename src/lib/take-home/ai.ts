import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { AiError, createAiClient, toAiError } from "@/lib/ai/client";
import {
  interviewLanguages,
  type InterviewLanguage,
} from "@/lib/interview/schema";
import {
  briefSchema,
  difficulties,
  readTakeHomeFeedback,
  takeHomeEvaluationSchema,
  takeHomeRubric,
  taskTypeFor,
  type Difficulty,
  type TakeHomeBrief,
  type TakeHomeFeedback,
} from "./schema";

export interface TakeHomeTarget {
  title: string;
  seniority: string | null;
}

function roleName(target: TakeHomeTarget): string {
  return target.seniority
    ? `${target.title} (${target.seniority})`
    : target.title;
}

/** Writes an original take-home assignment for the role. */
export async function generateTakeHome(
  target: TakeHomeTarget,
  difficulty: Difficulty,
  language: InterviewLanguage,
): Promise<TakeHomeBrief> {
  let response;
  try {
    response = await createAiClient().messages.parse({
      model: "claude-sonnet-5-5",
      max_tokens: 8000,
      output_config: { effort: "low", format: zodOutputFormat(briefSchema) },
      messages: [
        {
          role: "user",
          content: `You are a hiring manager writing a take-home assignment for
candidates. Write an ORIGINAL assignment in the style companies really send,
for a fictional company (never copy a real company's test).

- Kind of task: ${taskTypeFor(target.title)}.
- Difficulty: ${difficulties[difficulty].prompt}.
- Make it self-contained: everything the candidate needs is in the brief, and
  the answer can be written as text (no files, no code to run).
- Give realistic, specific details and numbers so the candidate has something
  to analyze, and leave room for judgment.
- Write it in ${interviewLanguages[language]}, the way a native-speaking
  hiring manager would. Keep professional terms as commonly used.

<role>${roleName(target)}</role>`,
        },
      ],
    });
  } catch (error) {
    throw toAiError(error);
  }
  const brief = response.parsed_output;
  if (response.stop_reason === "refusal" || !brief || !brief.tasks.length) {
    throw new AiError(
      `No take-home returned (stop_reason: ${response.stop_reason})`,
      "service",
      "no-take-home",
    );
  }
  return brief;
}

/** Scores a submission against the take-home rubric. */
export async function evaluateTakeHome(
  target: TakeHomeTarget | null,
  brief: TakeHomeBrief,
  submission: string,
): Promise<TakeHomeFeedback> {
  let response;
  try {
    response = await createAiClient().messages.parse({
      model: "claude-sonnet-5-5",
      max_tokens: 8000,
      output_config: {
        effort: "medium",
        format: zodOutputFormat(takeHomeEvaluationSchema),
      },
      messages: [
        {
          role: "user",
          content: `You are an experienced hiring manager reviewing a take-home
submission. Score it from 1 to 5 on each criterion:

${takeHomeRubric.map((r) => `- ${r.prompt}`).join("\n")}

Scale: 1 = missing, 2 = weak, 3 = acceptable but generic, 4 = strong,
5 = would move the candidate forward. Be honest and consistent: a submission
that skips tasks cannot score above 2 on solution.

Then say what worked, the most useful specific improvements, and the
questions an interviewer would likely ask about it in the follow-up
interview. Speak to the candidate directly. Write the feedback in the
language of the brief.

<role>${target ? roleName(target) : "Not given"}</role>

<brief>
${JSON.stringify(brief, null, 2)}
</brief>

<submission>
${submission}
</submission>`,
        },
      ],
    });
  } catch (error) {
    throw toAiError(error);
  }
  const feedback = readTakeHomeFeedback(response.parsed_output);
  if (response.stop_reason === "refusal" || !feedback) {
    throw new AiError(
      `Incomplete take-home feedback (stop_reason: ${response.stop_reason})`,
      "service",
      "no-feedback",
    );
  }
  return feedback;
}
