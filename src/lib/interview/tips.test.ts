import { describe, expect, it } from "vitest";
import { answerTip } from "./tips";

describe("answerTip", () => {
  it("gives a tip for the question's kind", () => {
    expect(answerTip("design")).toContain("הנחות");
  });

  it("falls back to the story tip for unknown kinds", () => {
    expect(answerTip("something-new")).toBe(answerTip("behavioral"));
  });
});
