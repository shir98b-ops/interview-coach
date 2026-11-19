import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/** A failure talking to the AI service, sorted into causes the user can act on. */
export class AiError extends Error {
  constructor(
    message: string,
    readonly reason: "config" | "auth" | "billing" | "unreadable" | "service",
    /** A short code shown to the user so a failure can be diagnosed. */
    readonly code: string = reason,
  ) {
    super(message);
  }
}

/** What an AI call is for, so its cost can be counted per feature. */
export type AiAction =
  | "resume.extract"
  | "resume.review"
  | "interview.questions"
  | "interview.score"
  | "lesson.score"
  | "take_home.write"
  | "take_home.score"
  | "job.extract"
  | "job.prep";

/**
 * Creates a client from the ANTHROPIC_API_KEY environment variable. With an
 * action, each call's token counts and cost are recorded for analytics.
 */
export function createAiClient(action?: AiAction): Anthropic {
  // Keys are plain ASCII. Pasting one from a right-to-left page can add
  // invisible direction marks or spaces, which break the request header.
  const apiKey = (process.env.ANTHROPIC_API_KEY ?? "").replace(
    /[^\x21-\x7e]/g,
    "",
  );
  if (!apiKey) throw new AiError("ANTHROPIC_API_KEY is not set", "config");
  const client = new Anthropic({ apiKey });
  if (action) recordUsageOf(client, action);
  return client;
}

/** Wraps messages.parse so every call reports the tokens it used. */
function recordUsageOf(client: Anthropic, action: AiAction) {
  const parse = client.messages.parse.bind(client.messages);
  client.messages.parse = (async (...args: Parameters<typeof parse>) => {
    const response = await parse(...args);
    // Loaded on use, so this file stays free of request-only imports.
    const { recordAiUsage } = await import("@/lib/analytics/record");
    recordAiUsage(action, response.model ?? args[0].model, response.usage);
    return response;
  }) as typeof parse;
}

export function toAiError(error: unknown): AiError {
  if (error instanceof AiError) return error;
  if (
    error instanceof Anthropic.AuthenticationError ||
    error instanceof Anthropic.PermissionDeniedError
  ) {
    return new AiError(
      error.message,
      "auth",
      `${error.status}, ${describeKey(process.env.ANTHROPIC_API_KEY ?? "")}`,
    );
  }
  if (error instanceof Anthropic.BadRequestError) {
    const billing = /credit|billing/i.test(error.message);
    return new AiError(
      error.message,
      billing ? "billing" : "unreadable",
      `${error.status}`,
    );
  }
  if (error instanceof Anthropic.APIError) {
    return new AiError(
      error.message,
      "service",
      `${error.status ?? "network"}`,
    );
  }
  return new AiError(
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
