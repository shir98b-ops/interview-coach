import { describe, expect, it } from "vitest";
import { readReview, reviewScore } from "./review-schema";

const valid = {
  impact: 2,
  relevance: 4,
  clarity: 3,
  completeness: 5,
  verdict: "Solid",
  strengths: ["Clear dates"],
  fixes: [{ issue: "Add numbers", before: "Led team", after: "Led 5 people" }],
  keywords: ["SQL"],
};

describe("readReview", () => {
  it("reads a valid review and clamps scores", () => {
    const review = readReview({ ...valid, impact: 0, clarity: 6.2 });
    expect(review?.impact).toBe(1);
    expect(review?.clarity).toBe(5);
    expect(review?.fixes[0].after).toBe("Led 5 people");
  });

  it("returns null for malformed reviews", () => {
    expect(readReview(null)).toBeNull();
    expect(readReview({ impact: 3 })).toBeNull();
  });
});

describe("reviewScore", () => {
  it("is the average rubric score out of 100", () => {
    expect(reviewScore(valid)).toBe(70);
    expect(
      reviewScore({ impact: 5, relevance: 5, clarity: 5, completeness: 5 }),
    ).toBe(100);
  });
});
