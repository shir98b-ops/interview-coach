import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { AiError, createAiClient, toAiError } from "@/lib/ai/client";
import {
  extractedJobSchema,
  firstLink,
  readExtractedJob,
  type JobFromPaste,
} from "./extract-schema";

/** Reads company, title and the posting itself out of a pasted job page. */
export async function extractJob(pasted: string): Promise<JobFromPaste> {
  let response;
  try {
    response = await createAiClient().messages.parse({
      // Copying details out of a page is simple, so the fastest and cheapest
      // model is enough (a fraction of a cent per job).
      model: "claude-haiku-5-5",
      max_tokens: 8000,
      output_config: {
        effort: "low",
        format: zodOutputFormat(extractedJobSchema),
      },
      messages: [
        {
          role: "user",
          content: `The text below was copied from a web page, such as a
LinkedIn job page or a company careers page. It may include menus, ads, other
job suggestions and other page clutter.

Set isJobPosting to false if it is not a job posting. Otherwise extract:
- company: the hiring company's name, as written.
- title: the job title, as written.
- link: the job's web address if it appears in the text, otherwise "".
- description: the full posting text only (about the role, responsibilities,
  requirements, what the company offers, and what it says about itself),
  copied as written in its original language. Drop page clutter and other
  jobs. Do not summarize or invent anything.

<page>
${pasted}
</page>`,
        },
      ],
    });
  } catch (error) {
    throw toAiError(error);
  }
  const job = readExtractedJob(response.parsed_output);
  if (response.stop_reason === "refusal" || !job) {
    throw new AiError(
      `No job found in pasted text (stop_reason: ${response.stop_reason})`,
      "unreadable",
      "no-job",
    );
  }
  return { ...job, link: job.link ?? firstLink(pasted) };
}
