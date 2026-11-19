import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { AiError, createAiClient, toAiError } from "@/lib/ai/client";
import { resumeSchema, type ResumeData } from "./schema";

export { AiError as ExtractionError, describeKey } from "@/lib/ai/client";

const instructions = `Read the attached resume and extract the candidate's details.
Copy facts as written; do not invent anything. Leave a field empty when the
resume does not state it. Keep the resume's original language.`;

/** Sends a PDF resume to Claude and returns the structured details. */
export async function extractResume(pdf: ArrayBuffer): Promise<ResumeData> {
  let response;
  try {
    response = await createAiClient("resume.extract").messages.parse({
      // Copying facts from a resume is a simple task, so the fastest and
      // cheapest model is enough (about a tenth of a cent per resume).
      model: "claude-haiku-5-5",
      max_tokens: 16000,
      output_config: {
        effort: "low",
        format: zodOutputFormat(resumeSchema),
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: Buffer.from(pdf).toString("base64"),
              },
            },
            { type: "text", text: instructions },
          ],
        },
      ],
    });
  } catch (error) {
    throw toAiError(error);
  }

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new AiError(
      `No parsed output (stop_reason: ${response.stop_reason})`,
      "unreadable",
    );
  }
  return response.parsed_output;
}
