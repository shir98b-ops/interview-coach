import { describe, expect, it } from "vitest";
import {
  clampScore,
  feedbackByPosition,
  overallScore,
  readFeedback,
} from "./feedback";

const item = (position: number, score = 4) => ({
  position,
  content: score,
  structure: score,
  clarity: score,
  seriousError: false,
  strengths: " Good example. ",
  improvements: "Add a result.",
  betterAnswer: "Situation, action, result.",
});

describe("clampScore", () => {
  it("rounds and keeps scores between 1 and 5", () => {
    expect(clampScore(3.6)).toBe(4);
    expect(clampScore(9)).toBe(5);
    expect(clampScore(0)).toBe(1);
    expect(clampScore(Number.NaN)).toBe(1);
  });
});

describe("feedbackByPosition", () => {
  it("maps feedback to each question and trims text", () => {
    const result = feedbackByPosition({ answers: [item(2), item(1)] }, [1, 2]);
    expect(result?.get(1)?.strengths).toBe("Good example.");
    expect(result?.size).toBe(2);
  });

  it("caps the scores of an answer with a serious professional mistake", () => {
    const wrong = { ...item(1, 4), content: 3, clarity: 5, seriousError: true };
    const result = feedbackByPosition({ answers: [wrong] }, [1])?.get(1);
    expect(result).toMatchObject({ content: 2, structure: 3, clarity: 3 });
  });

  it("returns null when a question has no feedback", () => {
    expect(
      feedbackByPosition({ answers: [item(1), item(7)] }, [1, 2]),
    ).toBeNull();
  });
});

describe("overallScore", () => {
  it("turns the average rubric score into a score out of 100", () => {
    const all4 = { content: 4, structure: 4, clarity: 4 };
    const all2 = { content: 2, structure: 2, clarity: 2 };
    expect(overallScore([all4, all2])).toBe(60);
    expect(overallScore([])).toBe(0);
  });
});

describe("readFeedback", () => {
  it("reads saved feedback and rejects malformed values", () => {
    expect(
      readFeedback({ content: 3, structure: 4, clarity: 5 })?.clarity,
    ).toBe(5);
    expect(readFeedback({ content: "3" })).toBeNull();
    expect(readFeedback(null)).toBeNull();
  });
});
