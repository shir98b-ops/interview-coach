import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { addressInstruction, type Address } from "@/lib/address";
import { AiError, createAiClient, toAiError } from "@/lib/ai/client";
import type { ResumeData } from "@/lib/resume/schema";
import {
  prepPlanSchema,
  readPrepPlan,
  timeframe,
  type PrepPlan,
} from "./prep-schema";
import {
  historyText,
  interviewKinds,
  stageFocus,
  type InterviewKind,
  type StageHistory,
} from "./schema";

export interface JobForPrep {
  company: string;
  title: string;
  description: string;
}

/** The stage a plan is for, and the stages before it. */
export interface StageForPrep {
  kind: InterviewKind;
  history: StageHistory[];
}

function stageInstructions(stage: StageForPrep | null): string {
  if (!stage) {
    return "The plan is for the process as a whole, before a specific interview is scheduled.";
  }
  return `The plan is for ONE stage of the hiring process: ${interviewKinds[stage.kind]} (${stage.kind}).
${stageFocus[stage.kind]}
Focus every section on what this stage checks; leave out what belongs to other stages.
${historyText(stage.history)}`;
}

/** Writes a prep plan for one job, from its posting and the resume. */
export async function writePrepPlan(
  job: JobForPrep,
  resume: ResumeData,
  daysUntilInterview: number | null,
  address: Address | null = null,
  stage: StageForPrep | null = null,
): Promise<PrepPlan> {
  let response;
  try {
    response = await createAiClient().messages.parse({
      // Matching a posting to a resume needs judgment, so this uses the
      // mid-tier model (about two cents per plan).
      model: "claude-sonnet-5-5",
      max_tokens: 16000,
      output_config: {
        effort: "low",
        format: zodOutputFormat(prepPlanSchema),
      },
      messages: [
        {
          role: "user",
          content: `You are an experienced interview coach. The candidate
applied to the job below. Build a focused prep plan for its interviews.

${stageInstructions(stage)}

- summary: two or three sentences on what this role really needs, read from
  the posting, in plain words.
- requirements: the 4 to 8 requirements that matter most in the posting. For
  each, rate how the resume matches (strong, partial or gap) and add a short
  note: the resume evidence to mention, or how to handle the gap honestly.
- likelyQuestions: 5 to 8 questions this interviewer is likely to ask, tied
  to the posting. For each, why they ask it and a one-line tip for answering.
- stories: 3 to 5 stories from the resume worth preparing in STAR form, each
  with the resume item it comes from and which requirement it shows.
- questionsToAsk: 3 to 5 smart questions the candidate can ask at the end.
- research: 3 to 5 specific things to check about the company before the
  interview. Use only what the posting says about the company; do not state
  facts about the company you are not sure of.
- schedule: 3 to 6 prep steps with a time label and minutes each.
  ${timeframe(daysUntilInterview)}

Never invent experience. Speak to the candidate directly, and write
everything in Hebrew. Keep job titles, tools and professional terms as they
appear in the posting. ${addressInstruction(address)}

<job company="${job.company.replace(/"/g, "'")}" title="${job.title.replace(/"/g, "'")}">
${job.description}
</job>

<resume>
${JSON.stringify(resume, null, 2)}
</resume>`,
        },
      ],
    });
  } catch (error) {
    throw toAiError(error);
  }
  const plan = readPrepPlan(response.parsed_output);
  if (response.stop_reason === "refusal" || !plan) {
    throw new AiError(
      `Incomplete prep plan (stop_reason: ${response.stop_reason})`,
      "service",
      "no-plan",
    );
  }
  return plan;
}
