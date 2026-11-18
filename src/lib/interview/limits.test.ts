import { describe, expect, it } from "vitest";
import { limitMessage, usageStatus } from "./limits";

const now = new Date("2026-11-18T12:00:00Z");
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000);

describe("usageStatus", () => {
  it("counts only interviews from the last 24 hours", () => {
    expect(usageStatus([hoursAgo(1), hoursAgo(30)], now, 5)).toEqual({
      limit: 5,
      remaining: 4,
      hoursUntilNext: null,
    });
  });

  it("says when the next interview can start once the limit is reached", () => {
    const starts = [hoursAgo(20), hoursAgo(5), hoursAgo(4)];
    const status = usageStatus(starts, now, 3);
    expect(status).toEqual({ limit: 3, remaining: 0, hoursUntilNext: 4 });
    expect(limitMessage(status)).toContain("בעוד כ־4 שעות");
  });

  it("never reports less than an hour", () => {
    const status = usageStatus([hoursAgo(23.99)], now, 1);
    expect(status.hoursUntilNext).toBe(1);
  });
});
