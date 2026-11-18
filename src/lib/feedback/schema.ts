export const MAX_FEEDBACK_LENGTH = 2000;

export type FeedbackCheck =
  { ok: true; text: string } | { ok: false; error: string };

/** Checks a feedback message before it is saved. */
export function validateFeedback(value: unknown): FeedbackCheck {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length < 3) return { ok: false, error: "צריך לכתוב כמה מילים." };
  if (text.length > MAX_FEEDBACK_LENGTH) {
    return {
      ok: false,
      error: `המשוב ארוך מדי. עד ${MAX_FEEDBACK_LENGTH} תווים.`,
    };
  }
  return { ok: true, text };
}

/** Keeps only the path of the page the feedback came from. */
export function feedbackPage(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).pathname.slice(0, 200);
  } catch {
    return null;
  }
}
