/**
 * The practice streak: how many days in a row, ending today or yesterday,
 * had at least one finished practice. Days follow Israel time, so a practice
 * at 1 AM counts for the day the person lives in, not the server's day.
 */

const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jerusalem",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** The Israel calendar day of a moment, as a whole number of days. */
function dayNumber(date: Date): number {
  return Math.round(Date.parse(dayFormat.format(date)) / 86_400_000);
}

export type Streak = {
  /** Days in a row with a practice. 0 when the streak is broken. */
  days: number;
  /** Whether today already has a practice. */
  practicedToday: boolean;
};

export function practiceStreak(finishedAt: Date[], now: Date): Streak {
  const days = new Set(finishedAt.map(dayNumber));
  const today = dayNumber(now);
  const practicedToday = days.has(today);
  // A streak stays alive until the end of the day after its last practice.
  let day = practicedToday ? today : today - 1;
  let count = 0;
  while (days.has(day)) {
    count += 1;
    day -= 1;
  }
  return { days: count, practicedToday };
}
