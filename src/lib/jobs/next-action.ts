import type { JobStatus } from "./schema";
import { whenLabel } from "./time";

/**
 * The next thing to do for one job, shown in its row: get ready for its
 * next interview when one is booked, otherwise what its status calls for.
 */
export function jobNextAction(
  status: JobStatus,
  interview: { kindLabel: string; days: number } | null,
): string {
  if (interview) {
    return `להתכונן ל${interview.kindLabel}, ${whenLabel(interview.days)}`;
  }
  switch (status) {
    case "saved":
      return "להגיש מועמדות";
    case "applied":
      return "לחכות לתשובה ולהתאמן בינתיים";
    case "interviewing":
      return "להוסיף את הראיון הבא כשייקבע";
    case "offer":
      return "לעבור על ההצעה ולהחליט";
    default:
      return "";
  }
}
