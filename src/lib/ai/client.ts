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

/** Creates a client from the ANTHROPIC_API_KEY environment variable. */
export function createAiClient(): Anthropic {
  // Keys are plain ASCII. Pasting one from a right-to-left page can add
  // invisible direction marks or spaces, which break the request header.
  const apiKey = (process.env.ANTHROPIC_API_KEY ?? "").replace(
    /[^\x21-\x7e]/g,
    "",
  );
  if (!apiKey) throw new AiError("ANTHROPIC_API_KEY is not set", "config");
  return new Anthropic({ apiKey });
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
