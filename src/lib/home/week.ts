/**
 * This week, Sunday to Saturday in Israel time, with the days that had a
 * finished practice marked.
 */

const parts = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Jerusalem",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

const weekdayIndex: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const letters = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

/** The Israel calendar date of a moment, as a UTC midnight timestamp. */
function israelDay(date: Date): { day: number; weekday: number } {
  const p = Object.fromEntries(
    parts.formatToParts(date).map((x) => [x.type, x.value]),
  );
  return {
    day: Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day)),
    weekday: weekdayIndex[p.weekday] ?? 0,
  };
}

export interface WeekDay {
  letter: string;
  /** Day of the month. */
  date: number;
  practiced: boolean;
  today: boolean;
  future: boolean;
}

/** Practices a week that count as reaching the weekly goal. */
export const WEEKLY_GOAL = 5;

export function thisWeek(
  now: Date,
  finishedAt: Date[],
): { days: WeekDay[]; practices: number } {
  const today = israelDay(now);
  const start = today.day - today.weekday * 86_400_000;
  const end = start + 7 * 86_400_000;
  const inWeek = finishedAt
    .map((d) => israelDay(d).day)
    .filter((d) => d >= start && d < end);
  const practicedDays = new Set(inWeek);
  const days = letters.map((letter, i) => {
    const day = start + i * 86_400_000;
    return {
      letter,
      date: new Date(day).getUTCDate(),
      practiced: practicedDays.has(day),
      today: day === today.day,
      future: day > today.day,
    };
  });
  return { days, practices: inWeek.length };
}
