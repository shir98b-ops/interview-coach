/**
 * How many practice interviews a user can start in any 24 hours. Each one
 * costs a few cents of AI usage, so the limit protects against surprise
 * bills without getting in the way of real practice.
 */
export const DAILY_INTERVIEW_LIMIT = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

/** The start of the rolling 24-hour window that the limit counts in. */
export function limitWindowStart(now: Date = new Date()): Date {
  return new Date(now.getTime() - DAY_MS);
}

export interface UsageStatus {
  /** The user's limit. Paid plans can get a higher one later. */
  limit: number;
  remaining: number;
  /** Whole hours until the next interview can start, when none remain. */
  hoursUntilNext: number | null;
}

/**
 * Works out the usage left from the start times of the interviews created
 * in the last 24 hours.
 */
export function usageStatus(
  recentStarts: Date[],
  now: Date = new Date(),
  limit: number = DAILY_INTERVIEW_LIMIT,
): UsageStatus {
  const windowStart = limitWindowStart(now).getTime();
  const inWindow = recentStarts
    .map((d) => d.getTime())
    .filter((t) => t > windowStart)
    .sort((a, b) => a - b);
  const remaining = Math.max(0, limit - inWindow.length);
  if (remaining > 0) return { limit, remaining, hoursUntilNext: null };

  // A slot frees up when the oldest interview in the window turns 24 hours old.
  const oldest = inWindow[inWindow.length - limit];
  const msLeft = oldest + DAY_MS - now.getTime();
  return {
    limit,
    remaining,
    hoursUntilNext: Math.max(1, Math.ceil(msLeft / 3_600_000)),
  };
}

export function limitMessage(status: UsageStatus): string {
  const hours = status.hoursUntilNext ?? 1;
  const wait = hours === 1 ? "בעוד כשעה" : `בעוד כ־${hours} שעות`;
  return `הגעת למגבלה של ${status.limit} תרגולים ביום. אפשר להתחיל תרגול חדש ${wait}.`;
}
