import { describe, expect, it } from "vitest";
import { practiceStreak } from "./streak";

// Noon in Israel on 21 November 2026 (UTC+2).
const now = new Date("2026-11-21T10:00:00Z");
const daysAgo = (n: number, hourUtc = 10) =>
  new Date(Date.UTC(2026, 10, 21 - n, hourUtc));

describe("practiceStreak", () => {
  it("is empty with no practices", () => {
    expect(practiceStreak([], now)).toEqual({ days: 0, practicedToday: false });
  });

  it("counts consecutive days ending today", () => {
    const dates = [daysAgo(0), daysAgo(1), daysAgo(1), daysAgo(2), daysAgo(4)];
    expect(practiceStreak(dates, now)).toEqual({
      days: 3,
      practicedToday: true,
    });
  });

  it("keeps yesterday's streak alive until today ends", () => {
    expect(practiceStreak([daysAgo(1), daysAgo(2)], now)).toEqual({
      days: 2,
      practicedToday: false,
    });
  });

  it("breaks after a missed day", () => {
    expect(practiceStreak([daysAgo(2), daysAgo(3)], now).days).toBe(0);
  });

  it("uses the Israel day, not the UTC day", () => {
    // 23:30 UTC on the 20th is 01:30 on the 21st in Israel.
    const lateNight = new Date("2026-11-20T23:30:00Z");
    expect(practiceStreak([lateNight], now).practicedToday).toBe(true);
  });
});
