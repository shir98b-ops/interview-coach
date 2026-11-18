import type { CalendarEvent } from "./calendar";
import type { InterviewRow } from "./queries";
import { interviewKinds } from "./schema";

/** The calendar event for an interview. */
export function interviewEvent(interview: InterviewRow): CalendarEvent {
  const kind = interviewKinds[interview.kind];
  return {
    id: interview.id,
    title: `${kind}: ${interview.company}`,
    start: interview.startsAt,
    minutes: interview.minutes,
    details: [`${interview.title} · ${interview.company}`, interview.notes]
      .filter(Boolean)
      .join("\n\n"),
    location: interview.location,
  };
}
