import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { resumeSchema, type ResumeData } from "./schema";

export class ExtractionError extends Error {
  constructor(
    message: string,
    readonly reason: "config" | "auth" | "billing" | "unreadable" | "service",
    /** A short code shown to the user so a failure can be diagnosed. */
    readonly code: string = reason,
  ) {
    super(message);
  }
}

const instructions = `Read the attached resume and extract the candidate's details.
Copy facts as written; do not invent anything. Leave a field empty when the
resume does not state it. Keep the resume's original language.`;

/** Sends a PDF resume to Claude and returns the structured details. */
export async function extractResume(pdf: ArrayBuffer): Promise<ResumeData> {
  // Keys are plain ASCII. Pasting one from a right-to-left page can add
  // invisible direction marks or spaces, which break the request header.
  const apiKey = (process.env.ANTHROPIC_API_KEY ?? "").replace(
    /[^\x21-\x7e]/g,
    "",
  );
  if (!apiKey) {
    throw new ExtractionError("ANTHROPIC_API_KEY is not set", "config");
  }
  const client = new Anthropic({ apiKey });

  let response;
  try {
    response = await client.messages.parse({
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
    throw toExtractionError(error);
  }

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new ExtractionError(
      `No parsed output (stop_reason: ${response.stop_reason})`,
      "unreadable",
    );
  }
  return response.parsed_output;
}

function toExtractionError(error: unknown): ExtractionError {
  if (
    error instanceof Anthropic.AuthenticationError ||
    error instanceof Anthropic.PermissionDeniedError
  ) {
    return new ExtractionError(
      error.message,
      "auth",
      `${error.status}, ${describeKey(process.env.ANTHROPIC_API_KEY ?? "")}`,
    );
  }
  if (error instanceof Anthropic.BadRequestError) {
    const billing = /credit|billing/i.test(error.message);
    return new ExtractionError(
      error.message,
      billing ? "billing" : "unreadable",
      `${error.status}`,
    );
  }
  if (error instanceof Anthropic.APIError) {
    return new ExtractionError(
      error.message,
      "service",
      `${error.status ?? "network"}`,
    );
  }
  return new ExtractionError(
    String(error),
    "service",
    error instanceof Error ? error.name : "unknown",
  );
}

/**
 * Describes the configured key's shape without revealing it, so a wrong
 * paste (the key name, a partial key, extra text) can be spotted.
 */
export function describeKey(raw: string): string {
  const key = raw.replace(/[^\x21-\x7e]/g, "");
  const prefix = key.startsWith("sk-ant-api03-")
    ? "starts correctly"
    : `starts with "${key.slice(0, 6)}"`;
  const removed = raw.length - key.length;
  return `key ${prefix}, ${key.length} characters${removed ? `, ${removed} hidden removed` : ""}`;
}
