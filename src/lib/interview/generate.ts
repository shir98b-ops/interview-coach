import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { addressInstruction, type Address } from "@/lib/address";
import { AiError, createAiClient, toAiError } from "@/lib/ai/client";
import { codeLanguages, isHdl, type CodeLanguage } from "@/lib/code/languages";
import { companyContext } from "@/lib/jobs/company-context";
import { parseSeniority } from "@/lib/format";
import { levelDefinitions, levelLine } from "./levels";
import type { ResumeData } from "@/lib/resume/schema";
import type { SubmittedTakeHome } from "@/lib/take-home/for-interview";
import {
  bankFor,
  behavioralThemes,
  codingTopics,
  engineeringDesignProblemFor,
  engineeringSpecialtyFor,
  engineeringTopicsFor,
  focusAreasFor,
  hdlTopicsFor,
  isTechnicalRole,
  designProblemFor,
  sampleBank,
  sqlTopics,
  technicalTopicsFor,
} from "./question-bank";
import {
  CODING_QUESTION_COUNT,
  QUESTION_COUNT,
  interviewLanguages,
  normalizeQuestions,
  questionSetSchema,
  type InterviewLanguage,
  organizationTypes,
  type InterviewMode,
  type OrganizationType,
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
  /** A general, professional or case interview. */
  mode?: InterviewMode;
  /** The kind of organization, when practicing without a job posting. */
  organization?: OrganizationType;
  /** The programming language of a coding round. */
  codeLanguage?: CodeLanguage;
  /** The take-home the candidate already submitted for this job. */
  takeHome?: SubmittedTakeHome | null;
}

/** Long submissions are cut so the prompt stays within budget. */
const TAKE_HOME_PROMPT_LIMIT = 12000;

/**
 * Real hiring processes follow a take-home with an interview that digs into
 * it, so a practice after one starts from the candidate's own submission.
 */
function takeHomeLine(target: PracticeTarget, mode: InterviewMode): string {
  const takeHome = target.takeHome;
  if (!takeHome || mode === "coding") return "";
  const submission =
    takeHome.submission.length > TAKE_HOME_PROMPT_LIMIT
      ? `${takeHome.submission.slice(0, TAKE_HOME_PROMPT_LIMIT)}\n[cut for length]`
      : takeHome.submission;
  return `
The candidate already submitted a take-home assignment for this job. In real
hiring processes the next professional interview opens with a review of it,
so this practice does too. Base at least ${mode === "general" ? "two" : "three"} of the questions on THIS
submission, the way the reviewer who read it would ask:
- ask them to walk through a specific decision they made, naming the part of
  their submission it is in;
- challenge a weak spot the review found, without revealing the answer;
- change a constraint (more scale, a new requirement, less time or budget)
  and ask what in their solution would change;
- ask about a trade-off or an alternative they did not choose.
Refer to the submission by its real content (names, numbers, functions,
sections), never generically. The other questions cover the rest of what this
interview checks.

<take_home title="${takeHome.title.replace(/"/g, "'")}">
<assignment>
${takeHome.brief}
</assignment>
<candidate_submission>
${submission}
</candidate_submission>
<review_weak_spots>
${takeHome.weaknesses.map((w) => `- ${w}`).join("\n")}
</review_weak_spots>
<reviewer_follow_up_questions>
${takeHome.interviewQuestions.map((q) => `- ${q}`).join("\n")}
</reviewer_follow_up_questions>
</take_home>
`;
}

/** Makes the questions fit the kind of organization the user applies to. */
function organizationLine(target: PracticeTarget): string {
  const prompt = target.organization
    ? organizationTypes[target.organization].prompt
    : "";
  if (target.job || !prompt) return "";
  return `
The candidate is interviewing at ${prompt}. Make the questions, scenarios and
expectations realistic for that kind of organization.
`;
}

/** How many examples from the question bank each interview starts from. */
const BANK_SAMPLE_SIZE = 12;

const instructions = `You are an experienced hiring manager preparing a first-round
interview. Write ${QUESTION_COUNT} questions for the candidate below.

- Mix the kinds: at least two behavioral questions, at least one question on
  the skills and judgment the role needs, and at least one that digs into a
  specific item on the candidate's resume.
- Match the level given below.
- Stay close to what real interviewers ask. Base about two questions on the
  commonly asked questions listed below, adapting them to the role and the
  candidate's background; do not invent unusual or trick questions.
- Questions the candidate was already asked (listed at the end, when there
  are any) always win: never repeat or reword one of them, even if it is in
  the commonly asked list.
- Ask one thing per question, the way a real interviewer would say it.
- Tie the behavioral questions to situations typical of this role (for
  example a difficult customer for customer success, a production incident
  for an engineer, a missed launch date for a product manager).`;

/**
 * How real interviewers ask, in every kind of interview: one question at a
 * time, and the candidate has to come up with what the answer should cover.
 */
const askLikeAnInterviewer = `Ask the way a real interviewer speaks:
- Each question asks ONE thing: one concept, one scenario or one problem. At
  most one short follow-up clause, never a list of sub-questions.
- Never list the concepts, methods, terms or steps the answer should cover
  (no "cover X, Y and Z", no "for example A, B or C"). Recalling them is what
  the interview checks; the feedback names what was missing.
- Keep each question short enough to say out loud in about 20 seconds, with
  only the details needed to answer it.`;

/** Difficulty follows the seniority, in every kind of interview. */
const levelGuide = `Set the difficulty by the level given below, and make it a real
interview for that level, the way interviewers really talk to candidates at
it:
${levelDefinitions}
In a case or design round, size the problem to the level too: an Entry level
candidate gets a small, well-defined problem with the numbers given (one
feature, one service, one block, one client), and each step asks for the
basics done right; a Senior one gets an open problem at real scale.`;

/** Shared by the professional and case rounds: hold the real-world bar. */
const professionalBar = `Hold the bar of a real interview in this profession
for this seniority. Do NOT adapt the topics, scenarios or difficulty to the
candidate's past jobs or industry, and do not soften anything because of
their background: the goal is to prepare them for the real thing.`;

const professionalInstructions = `You are an experienced senior practitioner
in this profession, running the professional round of an interview. Write
${QUESTION_COUNT} questions (kind "technical") that test the knowledge,
methods, tools, regulations and judgment this role really requires, whatever
the field: a social worker, a business manager, an electrical engineer or a
software developer each get the questions of their own profession.

- Mix the question types: explain a core concept or method in depth, handle
  a realistic work scenario, solve a concrete professional problem, and
  compare two approaches with their trade-offs.
- Every question covers a different topic: no two questions on the same
  area, law or skill.
- When a job posting is given, cover first the duties, tools and domains it
  names, then the core knowledge every candidate in this field is asked.
- When focus areas are listed below, build each question on a different one.
  They are written for a whole field: adapt each to this exact profession and
  skip one that does not fit it.
- Every question must be answerable out loud in a few minutes, without a
  computer (an approach, calculation or pseudo-code explained in words).
- Ask what real interviewers in this field ask; no trivia or trick questions.

${askLikeAnInterviewer}

${levelGuide}

${professionalBar}`;

const caseInstructions = `You are an experienced senior practitioner in this
profession, running a case interview. Use the case given below: one
realistic situation from the daily work of this role. Then write it as
${QUESTION_COUNT} questions, asked in this order, each of kind "design":

1. Present the case and ask what the candidate needs to understand or ask
   first, before acting.
2. Ask for their analysis and overall approach.
3. Ask for the concrete plan: the steps, tools or methods, and who is involved.
4. Ask how they handle a complication, a risk or something going wrong.
5. Ask about priorities and trade-offs, and how they would measure success.

Each question after the first must make sense on its own while building on
the same case, the way an interviewer moves the discussion forward. Present
the case details in the first question; later questions add only the new
fact or twist they need.

${askLikeAnInterviewer}

${levelGuide}

${professionalBar}`;

const designInstructions = `You are a senior engineer running a system design
interview. Use the design problem given below. Then write it as
${QUESTION_COUNT} questions, asked in this order, each of kind "design":

1. State the problem and ask the candidate to clarify the requirements,
   users and expected scale before designing.
2. Ask for the high-level architecture: the main parts and how they talk.
3. Ask about the data: what is stored, how, and why that storage fits.
4. Ask how the design handles growth, bottlenecks and failures.
5. Ask for the main trade-offs made and what they would do differently with
   more time or a different constraint.

Each question after the first must make sense on its own while building on
the same problem, the way an interviewer moves the discussion forward.

${askLikeAnInterviewer}

${levelGuide}

${professionalBar}`;

const engineeringDesignInstructions = `You are a senior engineer in the
candidate's field running a design interview. Use the design problem given below. Then write it
as ${QUESTION_COUNT} questions, asked in this order, each of kind "design":

1. State the problem with its key numbers (inputs, loads, environment, cost
   or size limits) and ask the candidate which requirements and specs they
   would pin down before designing.
2. Ask for the architecture: a block diagram described in words, the main
   blocks and the interfaces between them.
3. Ask for one key calculation done out loud, the one this kind of design
   lives or dies on (a power, timing, noise, link, error or thermal budget, a
   load, a failure rate or a short-circuit level), with the numbers from the problem.
4. Change one constraint (a key part goes out of stock, the budget is cut, the
   temperature range grows) and ask how their choice of components or
   implementation changes.
5. Ask what in this design is most likely to fail in testing, certification
   or the field, and so what they would verify first.

Each question after the first must make sense on its own while building on
the same problem, the way an interviewer moves the discussion forward.

${askLikeAnInterviewer}

${levelGuide}

${professionalBar}`;

const codingInstructions = `You are a senior engineer running the coding round
of an interview. Write ${CODING_QUESTION_COUNT} coding problems (kind "coding")
in the programming language given below: the first a focused warm-up, the
second the main problem of the round.

Each problem must be a complete statement the candidate can solve without
asking anything:
- A short, realistic story from the work of this role (a product, a system or
  a data set), not an abstract puzzle, and never a famous problem copied word
  for word.
- What to write: the function, class or query, with its inputs and output.
- One or two examples, each on its own lines as "Input:" and "Output:", with a
  short reason when it is not obvious.
- The constraints that matter (sizes, ranges, empty input, ordering).
For SQL, describe the tables with their columns and a few sample rows inside a
fenced code block, and ask for one query.

Put code, signatures and table rows in fenced code blocks (\`\`\`), and keep
code, names and values in English even when the statement is in another
language. Do not include a solution or hints.

Set the difficulty by the level given below, as in a real coding interview:
- Entry level: the problems companies give juniors and graduates: one clear
  idea with basic data structures (arrays, strings, maps), solvable in about
  20 minutes, with the edge cases stated.
- Mid level: needs the right data structure and handling of edge cases.
- Senior and above: a harder main problem where efficiency and clean design
  both matter, with a follow-up constraint stated in the problem.

${professionalBar}`;

function instructionsFor(
  mode: InterviewMode,
  technical: boolean,
  electrical: boolean,
): string {
  if (mode === "coding") return codingInstructions;
  if (mode === "professional") return professionalInstructions;
  if (mode === "case") {
    if (technical) return designInstructions;
    return electrical ? engineeringDesignInstructions : caseInstructions;
  }
  return `${instructions}

${askLikeAnInterviewer}

${levelGuide}`;
}

/** Shrinks a design problem to the size juniors are really asked. */
function entryScale(target: PracticeTarget): string {
  return target.seniority === "Entry level"
    ? "\nThe candidate is Entry level: set it as a small first version with the numbers given, the size a junior would really be asked, and keep each step to the basics done right."
    : "";
}

/** The material each kind of interview starts from. */
function startingPoint(
  target: PracticeTarget,
  mode: InterviewMode,
  technical: boolean,
): string {
  const electrical = technical ? null : engineeringSpecialtyFor(target.title);
  if (mode === "general") {
    return `This time, build the behavioral questions around these themes:
${sampleBank(behavioralThemes, 2)
  .map((theme) => `- ${theme}`)
  .join("\n")}

<commonly_asked_questions>
${sampleBank(bankFor(target.title, target.seniority), BANK_SAMPLE_SIZE)
  .map((q) => `- ${q}`)
  .join("\n")}
</commonly_asked_questions>
`;
  }
  if (mode === "coding") {
    const language = target.codeLanguage ?? "python";
    const hdl = isHdl(language);
    const topics = sampleBank(
      language === "sql"
        ? sqlTopics
        : hdl
          ? hdlTopicsFor(target.title)
          : codingTopics,
      CODING_QUESTION_COUNT,
    );
    return `<programming_language>${codeLanguages[language]}</programming_language>
${
  hdl
    ? `
These are RTL problems, as in a chip design, verification or FPGA interview.
Ask for a synthesizable module (or a testbench, when the kind says so), and
state its ports with their widths, the clock and reset (synchronous or not,
active level), the timing of the outputs, and one example as a short
cycle-by-cycle table in place of "Input:" and "Output:".
`
    : ""
}
Build the problems around these kinds of problem, one each, and pick a
different story each time:
${topics.map((topic) => `- ${topic}`).join("\n")}
${
  target.job
    ? "\nSet both problems in this company's product and data, as its engineers would meet them (its domain, its entities, its scale), not in a generic story.\n"
    : ""
}`;
  }
  const focus = focusAreasFor(target.title);
  if (mode === "professional") {
    const topics = technical
      ? technicalTopicsFor(target.title, QUESTION_COUNT)
      : electrical
        ? engineeringTopicsFor(target.title, QUESTION_COUNT)
        : sampleBank(focus, QUESTION_COUNT);
    return topics.length
      ? `<focus_areas>
${topics.map((topic) => `- ${topic}`).join("\n")}
</focus_areas>
`
      : "";
  }
  if (target.job) {
    return technical
      ? `<design_problem>
A system this company would really build, taken from the product, scale and
stack in the job posting${
          target.takeHome
            ? ", or the system the candidate's take-home started, grown to production scale"
            : ""
        }.
</design_problem>
`
      : electrical
        ? `<design_problem>
A hardware or engineering design this company would really build, taken
from its product and the work in the job posting, in the field of
${electrical.label}${
            target.takeHome
              ? ", or the design the candidate's take-home started, taken further"
              : ""
          }.
</design_problem>
`
        : `<case>
A real situation from the work of this role at the company in the job
posting, at that company's real scale and context.
</case>
`;
  }
  return technical
    ? `<design_problem>
Design ${designProblemFor(target.title, Math.random, target.seniority)}.${entryScale(target)}
</design_problem>
`
    : electrical
      ? `<design_problem>
Design ${engineeringDesignProblemFor(target.title)}.${entryScale(target)}
</design_problem>
`
      : `<case>
Choose a realistic situation that people in this role face at the level given,
as demanding as a real case interview for that level, typical
of the organization type below if one is given. Pick a different case each time.${
          focus.length
            ? `
Set it in this area of the profession: ${sampleBank(focus, 1)[0]}.`
            : ""
        }
</case>
`;
}

/** Asks Claude for interview questions tailored to the role and resume. */
export async function generateQuestions(
  target: PracticeTarget,
  resume: ResumeData,
  language: InterviewLanguage = "en",
  address: Address | null = null,
): Promise<{ kind: QuestionKind; text: string }[]> {
  const role = target.title;
  const mode = target.mode ?? "general";
  const technical = isTechnicalRole(target.title);
  const electrical =
    !technical && engineeringSpecialtyFor(target.title) !== null;

  let response;
  try {
    response = await createAiClient("interview.questions").messages.parse({
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
          content: `${instructionsFor(mode, technical, electrical)}

Write the questions in ${interviewLanguages[language]}, phrased the way a
native-speaking interviewer would ask them (translate the listed questions
naturally, not word for word). Keep the role title and professional terms as
they are commonly used in that language. ${addressInstruction(address)}

<role>${role}</role>
${levelLine(parseSeniority(target.seniority))}
${
  target.job
    ? `
This interview is for a specific job. Base most of the questions on the
requirements and responsibilities in this posting, the way this company's
interviewer would ask them.

${companyContext}

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
${startingPoint(target, mode, technical)}${organizationLine(target)}${takeHomeLine(target, mode)}${
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

${
  // Professional and case rounds hold the real-world bar, so the resume is
  // left out and cannot pull them toward the candidate's past jobs.
  mode === "general"
    ? `<resume>
${JSON.stringify(resume, null, 2)}
</resume>`
    : ""
}`,
        },
      ],
    });
  } catch (error) {
    throw toAiError(error);
  }

  const questions = response.parsed_output
    ? normalizeQuestions(
        response.parsed_output,
        mode === "coding" ? CODING_QUESTION_COUNT : QUESTION_COUNT,
      )
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
