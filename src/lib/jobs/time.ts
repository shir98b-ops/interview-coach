/**
 * Interview times are entered and shown in Israel time, the app's audience.
 * They are stored in UTC, so calendars convert them correctly anywhere.
 */
export const APP_TIME_ZONE = "Asia/Jerusalem";

/** Minutes the zone is ahead of UTC at the given moment. */
function zoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return Math.round((asUtc - date.getTime()) / 60000);
}

/**
 * Turns a "2026-12-01T10:30" value from a date-time field, read as Israel
 * time, into a UTC date. Returns null for anything else.
 */
export function fromLocalInput(
  value: unknown,
  timeZone = APP_TIME_ZONE,
): Date | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  if (Number.isNaN(guess)) return null;
  // Correct by the zone's offset, then once more in case it changed (DST).
  let utc = guess - zoneOffsetMinutes(new Date(guess), timeZone) * 60000;
  utc = guess - zoneOffsetMinutes(new Date(utc), timeZone) * 60000;
  return new Date(utc);
}

/** The value a date-time field needs to show this moment in Israel time. */
export function toLocalInput(date: Date, timeZone = APP_TIME_ZONE): string {
  const shifted = new Date(
    date.getTime() + zoneOffsetMinutes(date, timeZone) * 60000,
  );
  return shifted.toISOString().slice(0, 16);
}

/** "יום שלישי, 1 בדצמבר · 10:30" */
export function formatInterviewTime(
  date: Date,
  timeZone = APP_TIME_ZONE,
): string {
  const day = new Intl.DateTimeFormat("he-IL", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  const time = new Intl.DateTimeFormat("he-IL", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${day} · ${time}`;
}

/** The calendar date in the zone, as "YYYY-MM-DD". */
function dayKey(date: Date, timeZone: string): string {
  return toLocalInput(date, timeZone).slice(0, 10);
}

/** Whole calendar days from now until the interview, in Israel time. */
export function daysUntil(
  date: Date,
  now: Date,
  timeZone = APP_TIME_ZONE,
): number {
  const a = Date.parse(dayKey(now, timeZone));
  const b = Date.parse(dayKey(date, timeZone));
  return Math.round((b - a) / 86400000);
}

/** "היום", "מחר", "בעוד 5 ימים" */
export function whenLabel(days: number): string {
  if (days < 0) return "עבר";
  if (days === 0) return "היום";
  if (days === 1) return "מחר";
  if (days === 2) return "מחרתיים";
  return `בעוד ${days} ימים`;
}
