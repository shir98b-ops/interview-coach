import { describe, expect, it } from "vitest";
import { bankFor, commonQuestions, matchRoleFamilies } from "./question-bank";

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
