import { describe, expect, it } from "vitest";
import {
  parseDifficulty,
  readTakeHomeFeedback,
  takeHomeScore,
  taskTypeFor,
  validateSubmission,
} from "./schema";

describe("taskTypeFor", () => {
  it("matches the kind of task to the role", () => {
    expect(taskTypeFor("Product Manager")).toMatch(/feature spec/);
    expect(taskTypeFor("Data Analyst")).toMatch(/data table/);
  });

  it("falls back to a general case for unknown roles", () => {
    expect(taskTypeFor("Chef")).toMatch(/business case/);
  });
});

describe("parseDifficulty", () => {
  it("defaults to medium", () => {
    expect(parseDifficulty("hard")).toBe("hard");
    expect(parseDifficulty("impossible")).toBe("medium");
    expect(parseDifficulty(null)).toBe("medium");
  });
});

describe("takeHomeScore", () => {
  it("turns the average rubric score into a score out of 100", () => {
    const all = (n: number) => ({
      understanding: n,
      solution: n,
      structure: n,
      actionability: n,
    });
    expect(takeHomeScore(all(5))).toBe(100);
    expect(takeHomeScore(all(3))).toBe(60);
  });
});

describe("readTakeHomeFeedback", () => {
  it("clamps scores and rejects malformed feedback", () => {
    const feedback = readTakeHomeFeedback({
      understanding: 9,
      solution: 0,
      structure: 3.4,
      actionability: 4,
      strengths: "Good",
      improvements: ["More data"],
      interviewQuestions: ["Why?"],
    });
    expect(feedback?.understanding).toBe(5);
    expect(feedback?.solution).toBe(1);
    expect(feedback?.structure).toBe(3);
    expect(readTakeHomeFeedback({ understanding: 3 })).toBeNull();
  });
});

describe("validateSubmission", () => {
  it("needs a real submission within the length limit", () => {
    expect(validateSubmission("short").ok).toBe(false);
    expect(validateSubmission("x".repeat(20000)).ok).toBe(false);
    expect(validateSubmission(`  ${"word ".repeat(20)}  `).ok).toBe(true);
  });
});
