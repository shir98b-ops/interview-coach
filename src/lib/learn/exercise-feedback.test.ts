import { describe, expect, it } from "vitest";
import { readExerciseFeedback, scoreLabel } from "./exercise-feedback";

describe("readExerciseFeedback", () => {
  it("clamps the score to 1-5", () => {
    const feedback = readExerciseFeedback({
      score: 7.4,
      strengths: "a",
      improvements: "b",
      betterAnswer: "c",
    });
    expect(feedback?.score).toBe(5);
  });

  it("returns null for malformed feedback", () => {
    expect(readExerciseFeedback(null)).toBeNull();
    expect(readExerciseFeedback({ score: 3 })).toBeNull();
  });
});

describe("scoreLabel", () => {
  it("encourages at every level", () => {
    for (const score of [1, 2, 3, 4, 5]) expect(scoreLabel(score)).not.toBe("");
  });
});
