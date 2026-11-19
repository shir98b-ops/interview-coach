import { describe, expect, it } from "vitest";
import {
  PREVIOUS_QUESTION_LIMIT,
  bankFor,
  behavioralThemes,
  commonQuestions,
  isTechnicalRole,
  matchRoleFamilies,
  previousQuestionList,
  sampleBank,
  systemDesignProblems,
  technicalTopics,
} from "./question-bank";

const ids = (title: string) => matchRoleFamilies(title).map((f) => f.id);

describe("matchRoleFamilies", () => {
  it("matches whole words in the role title", () => {
    expect(ids("Junior Product Manager")).toEqual(["product"]);
    expect(ids("Head of Marketing")).toEqual(["marketing", "management"]);
    expect(ids("Data Analyst")).toEqual(["data"]);
    expect(ids("Customer Success Specialist")).toEqual(["sales"]);
  });

  it("does not match parts of words", () => {
    // "pr" (public relations) must not match "product" or "project".
    expect(ids("Project Coordinator")).toEqual(["project"]);
  });

  it("returns nothing for an unknown role", () => {
    expect(ids("Chef")).toEqual([]);
  });
});

describe("bankFor", () => {
  it("always includes the common questions", () => {
    expect(bankFor("Chef")).toEqual(commonQuestions);
    expect(bankFor("Data Analyst").length).toBeGreaterThan(
      commonQuestions.length,
    );
  });

  it("adds management questions for the Manager level", () => {
    expect(bankFor("Chef", "Manager")).toContain(
      "How do you set goals for your team?",
    );
  });
});

describe("sampleBank", () => {
  const bank = ["a", "b", "c", "d", "e"];

  it("returns the requested number of distinct questions from the bank", () => {
    const sample = sampleBank(bank, 3);
    expect(sample).toHaveLength(3);
    expect(new Set(sample).size).toBe(3);
    for (const q of sample) expect(bank).toContain(q);
  });

  it("changes order with the random source", () => {
    const first = sampleBank(bank, 5, () => 0);
    const second = sampleBank(bank, 5, () => 0.99);
    expect(first).not.toEqual(second);
  });

  it("does not change the bank itself", () => {
    sampleBank(bank, 2);
    expect(bank).toEqual(["a", "b", "c", "d", "e"]);
  });
});

describe("previousQuestionList", () => {
  it("drops blanks and repeats, ignoring case and spacing", () => {
    expect(
      previousQuestionList([
        "Tell me about yourself.",
        "  tell me   about yourself. ",
        "",
        "Why this role?",
      ]),
    ).toEqual(["Tell me about yourself.", "Why this role?"]);
  });

  it("keeps at most the limit", () => {
    const many = Array.from(
      { length: PREVIOUS_QUESTION_LIMIT + 10 },
      (_, i) => `Question ${i}`,
    );
    expect(previousQuestionList(many)).toHaveLength(PREVIOUS_QUESTION_LIMIT);
  });
});

describe("isTechnicalRole", () => {
  it("is true for software roles", () => {
    expect(isTechnicalRole("Backend Developer")).toBe(true);
    expect(isTechnicalRole("Senior Software Engineer")).toBe(true);
    expect(isTechnicalRole("Data Engineer")).toBe(true);
  });
  it("is false for other roles", () => {
    expect(isTechnicalRole("Account Executive")).toBe(false);
    expect(isTechnicalRole("HR Business Partner")).toBe(false);
    expect(isTechnicalRole("Data Analyst")).toBe(false);
    expect(isTechnicalRole("Electrical Engineer")).toBe(false);
    expect(isTechnicalRole("Social Worker")).toBe(false);
  });
});

describe("behavioralThemes", () => {
  it("has enough distinct themes to vary many interviews", () => {
    expect(new Set(behavioralThemes).size).toBe(behavioralThemes.length);
    expect(behavioralThemes.length).toBeGreaterThanOrEqual(12);
  });
});

describe("technical banks", () => {
  it("have enough distinct entries to vary practice", () => {
    for (const list of [systemDesignProblems, technicalTopics]) {
      expect(new Set(list).size).toBe(list.length);
      expect(list.length).toBeGreaterThanOrEqual(15);
    }
  });
});
