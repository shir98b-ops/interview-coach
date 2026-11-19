import { APP_TIME_ZONE } from "@/lib/jobs/time";

/**
 * Small helpers that turn stored values into Hebrew text, so every page
 * shows dates, lengths of time and seniority the same way.
 */

/** "19.11.2026", in Israel time. The server runs in UTC, so without the
 * time zone a late evening in Israel would show the previous day. */
export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("he-IL", {
    timeZone: APP_TIME_ZONE,
  });
}

/** "45 דקות", "שעה", "שעה וחצי", "שעתיים", "3 שעות". */
export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} דקות`;
  if (minutes === 60) return "שעה";
  if (minutes === 90) return "שעה וחצי";
  if (minutes === 120) return "שעתיים";
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} שעות`;
  return `${Math.floor(hours)} שעות ו־${minutes % 60} דקות`;
}

/** Stored in English, because the AI and the question bank use them. */
export const seniorityLevels = [
  { value: "Entry level", label: "התחלתי" },
  { value: "Mid level", label: "ביניים" },
  { value: "Senior", label: "בכיר" },
  { value: "Manager", label: "ניהולי" },
] as const;

export function seniorityLabel(value: string): string {
  return seniorityLevels.find((s) => s.value === value)?.label ?? value;
}

/**
 * Replaces an English seniority level inside a saved title, such as
 * "Backend Developer (Mid level)", with its Hebrew label.
 */
export function localizeSeniority(text: string): string {
  return seniorityLevels.reduce(
    (result, s) => result.replace(`(${s.value})`, `(${s.label})`),
    text,
  );
}
