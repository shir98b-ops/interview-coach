import { describe, expect, it } from "vitest";
import {
  MAX_FEEDBACK_LENGTH,
  byPriority,
  feedbackPage,
  parseRating,
  ratingStats,
  readDigest,
  validateFeedback,
} from "./schema";

describe("validateFeedback", () => {
  it("accepts a short message and trims it", () => {
    expect(validateFeedback("  נהדר  ")).toEqual({ ok: true, text: "נהדר" });
  });

  it("rejects an empty message", () => {
    expect(validateFeedback("  ").ok).toBe(false);
    expect(validateFeedback(null).ok).toBe(false);
  });

  it("rejects a message that is too long", () => {
    expect(validateFeedback("א".repeat(MAX_FEEDBACK_LENGTH + 1)).ok).toBe(
      false,
    );
  });
});

describe("feedbackPage", () => {
  it("keeps only the path", () => {
    expect(feedbackPage("https://x.app/learn/star?a=1")).toBe("/learn/star");
  });

  it("returns null without a valid address", () => {
    expect(feedbackPage(null)).toBeNull();
    expect(feedbackPage("not a url")).toBeNull();
  });
});

describe("parseRating", () => {
  it("accepts whole numbers from 1 to 5", () => {
    expect(parseRating("4")).toBe(4);
    expect(parseRating(1)).toBe(1);
  });

  it("treats anything else as no rating", () => {
    for (const value of [null, "", "0", "6", "3.5", "abc"]) {
      expect(parseRating(value)).toBeNull();
    }
  });
});

describe("ratingStats", () => {
  it("averages only the rated messages", () => {
    const stats = ratingStats([
      { rating: 5 },
      { rating: 4 },
      { rating: null },
      { rating: 4 },
    ]);
    expect(stats).toEqual({ rated: 3, average: 4.3, spread: [0, 0, 0, 2, 1] });
  });

  it("has no average without ratings", () => {
    expect(ratingStats([{ rating: null }]).average).toBeNull();
  });
});

describe("byPriority", () => {
  const items = [
    { id: "a", created_at: "2026-11-19T10:00:00Z" },
    { id: "b", created_at: "2026-11-19T11:00:00Z" },
    { id: "c", created_at: "2026-11-19T12:00:00Z" },
  ];

  it("puts urgent messages first, newest first within a level", () => {
    const digest = readDigest({
      summary: "s",
      themes: [],
      items: [
        { id: "a", kind: "bug", priority: "high" },
        { id: "b", kind: "idea", priority: "low" },
        { id: "c", kind: "idea", priority: "low" },
      ],
    });
    expect(byPriority(items, digest).map((i) => i.id)).toEqual(["a", "c", "b"]);
  });

  it("keeps newest first when there is no summary", () => {
    expect(byPriority(items, null).map((i) => i.id)).toEqual(["c", "b", "a"]);
  });

  it("does not change the list it was given", () => {
    byPriority(items, null);
    expect(items[0].id).toBe("a");
  });
});

describe("readDigest", () => {
  it("rejects a summary with an unknown kind", () => {
    expect(
      readDigest({
        summary: "s",
        themes: [],
        items: [{ id: "a", kind: "rant", priority: "high" }],
      }),
    ).toBeNull();
  });
});
