import { describe, expect, it } from "vitest";
import { thisWeek } from "./week";

// Saturday 21 November 2026, noon in Israel.
const now = new Date("2026-11-21T10:00:00Z");

describe("thisWeek", () => {
  it("runs Sunday to Saturday with today last", () => {
    const { days } = thisWeek(now, []);
    expect(days.map((d) => d.date)).toEqual([15, 16, 17, 18, 19, 20, 21]);
    expect(days[6].today).toBe(true);
    expect(days[0].letter).toBe("א׳");
  });

  it("marks practiced days and counts this week's practices", () => {
    const { days, practices } = thisWeek(now, [
      new Date("2026-11-15T09:00:00Z"),
      new Date("2026-11-19T09:00:00Z"),
      new Date("2026-11-19T15:00:00Z"),
      new Date("2026-11-10T09:00:00Z"),
    ]);
    expect(days.filter((d) => d.practiced).map((d) => d.date)).toEqual([
      15, 19,
    ]);
    expect(practices).toBe(3);
  });

  it("uses Israel time for late-night practices", () => {
    // 22:30 UTC on Saturday the 14th is 00:30 on Sunday the 15th in Israel.
    const { days } = thisWeek(now, [new Date("2026-11-14T22:30:00Z")]);
    expect(days[0].practiced).toBe(true);
  });
});
