import { describe, expect, it } from "vitest";
import { MAX_FEEDBACK_LENGTH, feedbackPage, validateFeedback } from "./schema";

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
