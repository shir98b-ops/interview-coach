import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { addressInstruction, type Address } from "@/lib/address";
import { AiError, createAiClient, toAiError } from "@/lib/ai/client";
import {
  interviewLanguages,
  type InterviewLanguage,
} from "@/lib/interview/schema";
import { codeLanguages, isHdl, type CodeLanguage } from "@/lib/code/languages";
import { companyContext } from "@/lib/jobs/company-context";
import { parseSeniority } from "@/lib/format";
import {
  levelDefinitions,
  levelLine,
  levelScoring,
} from "@/lib/interview/levels";
import {
  briefSchema,
  codeBriefSchema,
  difficulties,
  rubricFor,
  readTakeHomeFeedback,
  takeHomeEvaluationSchema,
  taskTypeFor,
  type Difficulty,
  type TakeHomeFormat,
  type TakeHomeBrief,
  type TakeHomeFeedback,
} from "./schema";

export interface TakeHomeTarget {
  title: string;
  seniority: string | null;
  /** The job posting, when practicing for a specific job's take-home. */
  job?: { company: string; description: string } | null;
}

/** The role and the level the take-home is for. */
function roleLines(target: TakeHomeTarget): string {
  return `<role>${target.title}</role>
${levelLine(parseSeniority(target.seniority))}`;
}

/** How a code take-home is written, in place of a written task. */
function codeTask(codeLanguage: CodeLanguage): string {
  if (isHdl(codeLanguage)) {
    return `- Kind of task: a small, realistic RTL project in
  ${codeLanguages[codeLanguage]}, the kind chip design, verification and FPGA
  teams send: for example a FIFO, an arbiter, a UART, a small DMA or a
  protocol bridge, or a verification environment for a block described in the
  brief. Base it on the work of this role.
- Give the block's ports with widths, clock and reset, the protocol or timing
  rules, and an example as a short cycle-by-cycle table.
- Ask for synthesizable code, a self-checking testbench, and a short README on
  the micro-architecture, the assumptions and how to run the simulation.
  Keep the scope small enough to fit in a few files pasted as text.
- Put any starter code, module headers or interface definitions in
  starterCode, in English. Never include a solution.`;
  }
  if (codeLanguage === "r" || codeLanguage === "sas") {
    return `- Kind of task: a small, realistic analysis in
  ${codeLanguages[codeLanguage]}, the kind statisticians and analysts are
  sent: for example summary tables by group from a small trial or study data
  set, a derived analysis data set, or a statistical test with its report.
  Base it on the work of this role.
- Give the data as a few rows per table, the variables and their meaning, and
  what the output tables or results must show.
- Ask for the code, the output tables, checks of the data, and a short README
  on the methods, the assumptions and how to run it.
- Put the data rows and any starter code in starterCode, in English. Never
  include a solution.`;
  }
  return `- Kind of task: a small, realistic coding project in
  ${codeLanguages[codeLanguage]}, the kind companies send to developers: for
  example a service endpoint with its logic, a data processing script, a
  small library, or a UI component's logic. Base it on the work of this role.
- Give clear functional requirements, the inputs and outputs with an example,
  and the constraints (scale, invalid input, errors).
- Ask for automated tests and a short README on how to run it and the choices
  made. Keep the scope small enough that the code fits in a few files and can
  be pasted as text.
- Put any starter code, function signatures, sample input or table rows in
  starterCode, in English. Never include a solution.`;
}

/** Writes an original take-home assignment for the role. */
export async function generateTakeHome(
  target: TakeHomeTarget,
  difficulty: Difficulty,
  language: InterviewLanguage,
  address: Address | null = null,
  format: TakeHomeFormat = "document",
  codeLanguage: CodeLanguage = "python",
): Promise<TakeHomeBrief> {
  const code = format === "code";
  let response;
  try {
    response = await createAiClient("take_home.write").messages.parse({
      model: "claude-sonnet-5-5",
      max_tokens: 8000,
      output_config: {
        effort: "low",
        format: zodOutputFormat(code ? codeBriefSchema : briefSchema),
      },
      messages: [
        {
          role: "user",
          content: `You are a hiring manager writing a take-home assignment for
candidates. Write an ORIGINAL assignment in the style companies really send${
            target.job
              ? ", as the hiring company below would send it (never copy a real company's actual test)"
              : ", for a fictional company (never copy a real company's test)"
          }.

${
  code
    ? codeTask(codeLanguage)
    : `- Kind of task: ${taskTypeFor(target.title)}.
- Make it self-contained: everything the candidate needs is in the brief, and
  the answer can be written as text (no files, no code to run).`
}
- Difficulty: ${difficulties[difficulty].prompt}.
- Match the level given below, as companies do for that level:
${levelDefinitions}
  An Entry level take-home checks the fundamentals on a clear, scoped task
  with all the data given and explicit deliverables; a Senior one leaves
  scope, trade-offs and open questions to the candidate. The time limit comes
  from the difficulty; the depth expected comes from the level.
- Give realistic, specific details and numbers so the candidate has something
  to work with, and leave room for judgment.
- Write it in ${interviewLanguages[language]}, the way a native-speaking
  hiring manager would. Keep professional terms as commonly used.
  ${addressInstruction(address)}

${roleLines(target)}${
            target.job
              ? `

The candidate expects a take-home from this company. Write it as this
company's own assignment: put the company's real name in "company", build the
task around its own product, customers and the work this posting describes,
the kind of task this company would likely send for this role. Invent the
data, numbers and internal details, and say in the context that they are
illustrative.

${companyContext}

<job_posting company="${target.job.company.replace(/"/g, "'")}">
${target.job.description}
</job_posting>`
              : ""
          }`,
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
  return code
    ? { ...brief, format: "code", codeLanguage }
    : { ...brief, format: "document" };
}

/** Scores a submission against the take-home rubric. */
export async function evaluateTakeHome(
  target: TakeHomeTarget | null,
  brief: TakeHomeBrief,
  submission: string,
  address: Address | null = null,
  language: InterviewLanguage | null = null,
): Promise<TakeHomeFeedback> {
  const code = brief.format === "code";
  let response;
  try {
    response = await createAiClient("take_home.score").messages.parse({
      model: "claude-sonnet-5-5",
      max_tokens: 8000,
      output_config: {
        effort: "medium",
        format: zodOutputFormat(takeHomeEvaluationSchema),
      },
      messages: [
        {
          role: "user",
          content: `You are an experienced ${code ? "senior engineer" : "hiring manager"} reviewing a take-home
submission. Score it from 1 to 5 on each criterion:

${rubricFor(brief.format)
  .map((r) => `- ${r.prompt}`)
  .join("\n")}
${
  code
    ? `
This is a code submission. Review it as a careful code review: you cannot run
it, so trace the main paths and the edge cases by hand against the
requirements. Name concrete bugs, missing requirements, missing tests and
design problems, pointing to the function or file. Code that does not work for
the main requirement cannot score above 2 on solution, and a submission
without tests cannot score above 2 on tests and docs. Keep code, names and
file names in English inside the feedback.
`
    : ""
}

Scale: 1 = missing, 2 = weak, 3 = acceptable but generic, 4 = strong,
5 = would move the candidate forward. Be honest and consistent: a submission
that skips tasks cannot score above 2 on solution.

${levelScoring.replaceAll("answer", "submission")}

Then say what worked, the most useful specific improvements, and the
questions an interviewer would likely ask about it in the follow-up
interview. Speak to the candidate directly. Write all the feedback in ${
            language
              ? interviewLanguages[language]
              : "the language of the brief's text"
          }, even when the code and the submission are in English; keep code,
names and technical terms as they are. ${addressInstruction(address)}

${target ? roleLines(target) : "<role>Not given</role>"}

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
