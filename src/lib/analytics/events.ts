/**
 * The product events the app records. Each one says what a user did, never
 * what they wrote: props hold only short labels such as the input method.
 */
export const eventNames = [
  "signup",
  "resume_saved",
  "role_added",
  "interview_started",
  "answer_submitted",
  "interview_completed",
  "lesson_answered",
  "take_home_started",
  "take_home_submitted",
  "resume_reviewed",
  "job_added",
  "job_prep_created",
  "feedback_sent",
  "limit_reached",
] as const;

export type EventName = (typeof eventNames)[number];

/** Short labels only. Strings are cut so no free text can slip in. */
export type EventProps = Record<string, string | number | boolean | null>;

export function cleanProps(props: EventProps = {}): EventProps {
  const clean: EventProps = {};
  for (const [key, value] of Object.entries(props).slice(0, 10)) {
    clean[key.slice(0, 40)] =
      typeof value === "string" ? value.slice(0, 40) : value;
  }
  return clean;
}

export type AnswerMethod = "voice" | "text" | "code";

/** How an answer was given, from the hidden field the answer box sends. */
export function parseAnswerMethod(value: unknown): AnswerMethod {
  return value === "voice" || value === "code" ? value : "text";
}
