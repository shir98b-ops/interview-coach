import { describe, expect, it } from "vitest";
import {
  MAX_ANSWER_LENGTH,
  QUESTION_COUNT,
  normalizeQuestions,
  parseLanguage,
  modeLabel,
  parseMode,
  parseOrganizationType,
  validateAnswer,
} from "./schema";

describe("normalizeQuestions", () => {
  it("trims, drops blanks and keeps at most the question count", () => {
    const many = Array.from({ length: QUESTION_COUNT + 2 }, (_, i) => ({
      kind: "role" as const,
      text: ` Question ${i} `,
    }));
    const result = normalizeQuestions({
      questions: [{ kind: "behavioral", text: "  " }, ...many],
    });
    expect(result).toHaveLength(QUESTION_COUNT);
    expect(result[0]).toEqual({ kind: "role", text: "Question 0" });
  });
});

describe("validateAnswer", () => {
  it("accepts a trimmed answer", () => {
    expect(validateAnswer("  I led the launch. ")).toEqual({
      ok: true,
      text: "I led the launch.",
    });
  });

  it("rejects empty and overly long answers", () => {
    expect(validateAnswer("   ").ok).toBe(false);
    expect(validateAnswer(null).ok).toBe(false);
    expect(validateAnswer("a".repeat(MAX_ANSWER_LENGTH + 1)).ok).toBe(false);
  });
});

describe("parseLanguage", () => {
  it("accepts Hebrew and falls back to English", () => {
    expect(parseLanguage("he")).toBe("he");
    expect(parseLanguage("en")).toBe("en");
    expect(parseLanguage("fr")).toBe("en");
    expect(parseLanguage(null)).toBe("en");
  });
});

describe("parseMode", () => {
  it("accepts the professional and case modes", () => {
    expect(parseMode("professional")).toBe("professional");
    expect(parseMode("case")).toBe("case");
  });
  it("falls back to a general interview", () => {
    expect(parseMode("other")).toBe("general");
    expect(parseMode(null)).toBe("general");
  });
});

describe("modeLabel", () => {
  it("calls the case round system design for software roles", () => {
    expect(modeLabel("case", true)).toBe("תכנון מערכות");
    expect(modeLabel("case", false)).toBe("ניתוח מקרה");
    expect(modeLabel("general", true)).toBe("ראיון כללי");
  });
});

describe("parseOrganizationType", () => {
  it("accepts known types and falls back to any", () => {
    expect(parseOrganizationType("nonprofit")).toBe("nonprofit");
    expect(parseOrganizationType("toString")).toBe("any");
    expect(parseOrganizationType(undefined)).toBe("any");
  });
});
